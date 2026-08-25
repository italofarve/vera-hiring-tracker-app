import { Router, type Request, type Response } from "express";
import multer from "multer";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { db } from "@workspace/db";
import { candidatesTable, positionsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { ObjectStorageService, ObjectNotFoundError } from "../lib/objectStorage";
import { extractPdfTextWithOcr } from "../lib/pdfOcr";
import { openai } from "@workspace/integrations-openai-ai-server";
import { gemini } from "@workspace/integrations-gemini-ai-server";
import mammoth from "mammoth";
// pdf-parse is CJS-only; use require at runtime (globalThis.require is set by the build banner)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pdfParseImport = (globalThis as any).require("pdf-parse");
const pdfParse: (buf: Buffer) => Promise<{ text: string }> = pdfParseImport.default || pdfParseImport;

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });
const objectStorage = new ObjectStorageService();
const cvStorageProvider = process.env.CV_STORAGE_PROVIDER || "object-storage";
const localCvStorageDir = process.env.LOCAL_CV_STORAGE_DIR || "/app/uploads";
const cvOcrFallbackEnabled = (process.env.CV_OCR_FALLBACK_ENABLED || "false").toLowerCase() === "true";
const cvOcrMinTextLength = Number(process.env.CV_OCR_MIN_TEXT_LENGTH || 40);
const cvOcrTimeoutMs = Number(process.env.CV_OCR_TIMEOUT_MS || 15000);
const cvOcrLang = process.env.CV_OCR_LANG || "eng";
const cvOcrMaxPages = Number(process.env.CV_OCR_MAX_PAGES || 5);

function getUploadExtension(file: Express.Multer.File): string {
  const byName = extname(file.originalname || "").toLowerCase();
  if (byName) return byName;

  if (file.mimetype.includes("pdf")) return ".pdf";
  if (file.mimetype.includes("wordprocessingml")) return ".docx";
  if (file.mimetype.includes("msword")) return ".doc";
  if (file.mimetype.includes("text/plain")) return ".txt";
  return ".bin";
}

function isLocalCvPath(path: string): boolean {
  return path.startsWith("local://");
}

function resolveLocalCvPath(path: string): string {
  return join(localCvStorageDir, path.replace(/^local:\/\//, ""));
}

router.post("/candidates/:id/cv", upload.single("cv"), async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid candidate id" }); return; }

  if (!req.file) { res.status(400).json({ error: "No file provided" }); return; }

  const [candidate] = await db.select().from(candidatesTable).where(eq(candidatesTable.id, id));
  if (!candidate) { res.status(404).json({ error: "Candidate not found" }); return; }

  let cvPath: string;
  if (cvStorageProvider === "local") {
    const ext = getUploadExtension(req.file);
    const fileName = `candidate-${id}-${Date.now()}${ext}`;
    const localPath = join(localCvStorageDir, fileName);
    await mkdir(localCvStorageDir, { recursive: true });
    await writeFile(localPath, req.file.buffer);
    cvPath = `local://${fileName}`;
  } else {
    const fullPath = await objectStorage.uploadObject(req.file.buffer, req.file.mimetype);
    cvPath = objectStorage.normalizeObjectEntityPath(fullPath);
  }

  await db.update(candidatesTable).set({ cvPath, resumeUrl: cvPath }).where(eq(candidatesTable.id, id));

  res.json({ cvPath, message: "CV uploaded successfully" });
});

router.get("/candidates/:id/cv-text", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid candidate id" }); return; }

  const [candidate] = await db.select({ cvPath: candidatesTable.cvPath }).from(candidatesTable).where(eq(candidatesTable.id, id));
  if (!candidate) { res.status(404).json({ error: "Candidate not found" }); return; }

  if (!candidate.cvPath) {
    res.status(404).json({ error: "No CV file on record for this candidate" });
    return;
  }

  let fileBuffer: Buffer;
  let contentType = "";
  if (isLocalCvPath(candidate.cvPath)) {
    try {
      const localPath = resolveLocalCvPath(candidate.cvPath);
      fileBuffer = await readFile(localPath);
    } catch {
      res.status(404).json({ error: "CV file not found in local storage" });
      return;
    }
  } else {
    let objectFile;
    try {
      objectFile = await objectStorage.getObjectEntityFile(candidate.cvPath);
    } catch (err) {
      if (err instanceof ObjectNotFoundError) {
        res.status(404).json({ error: "CV file not found in storage" });
      } else {
        res.status(500).json({ error: "Failed to access CV file" });
      }
      return;
    }

    [fileBuffer] = await objectFile.download();
    const [metadata] = await objectFile.getMetadata();
    contentType = (metadata.contentType as string) || "";
  }

  let text = "";
  let ocrAttempted = false;
  let ocrFailureReason = "";

  console.log(`[DEBUG] Extracting text. Content-Type: ${contentType}, Path: ${candidate.cvPath}`);

  if (contentType.includes("pdf") || candidate.cvPath.toLowerCase().endsWith(".pdf")) {
    if (process.env.AI_PROVIDER === "gemini" && gemini) {
      console.log("[DEBUG] Identified as PDF. Using Gemini for direct text extraction...");
      try {
        const prompt = "Extract all text from this CV document. Return only the extracted text, no commentary.";
        text = await gemini.analyzeCV(prompt, fileBuffer, contentType);
        console.log(`[DEBUG] Gemini extraction success. Text length: ${text.length}`);
        ocrAttempted = true;
      } catch (geminiErr) {
        console.error("[DEBUG] Gemini extraction FAILED:", geminiErr);
        res.status(500).json({ error: "IA failed to extract text from PDF." });
        return;
      }
    } else {
      console.log("[DEBUG] Identified as PDF. Starting pdf-parse (legacy)...");
      try {
        const parsed = await pdfParse(fileBuffer);
        text = parsed.text;
        console.log(`[DEBUG] pdf-parse success. Text length: ${text.length}`);
      } catch (err) {
        console.error("[DEBUG] pdf-parse FAILED:", err);
      }

      const normalizedPdfText = text.replace(/\s+/g, " ").trim();
      const shouldRunOcrFallback = cvOcrFallbackEnabled && (text.length < cvOcrMinTextLength);

      if (shouldRunOcrFallback) {
        ocrAttempted = true;
        try {
          const ocrResult = await extractPdfTextWithOcr(fileBuffer, {
            lang: cvOcrLang,
            maxPages: cvOcrMaxPages,
            timeoutMs: cvOcrTimeoutMs,
          });
          if (ocrResult.text.length > normalizedPdfText.length) {
            text = ocrResult.text;
          }
        } catch (err) {
          console.error("[DEBUG] OCR FAILED:", err);
        }
      }
    }

    if (!text && !ocrAttempted) {
      res.status(422).json({ error: "Could not extract text from PDF." });
      return;
    }
  } else if (
    contentType.includes("wordprocessingml") ||
    contentType.includes("msword") ||
    candidate.cvPath.toLowerCase().endsWith(".docx") ||
    candidate.cvPath.toLowerCase().endsWith(".doc")
  ) {
    try {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      text = result.value;
    } catch {
      res.status(422).json({ error: "Could not extract text from Word document." });
      return;
    }
  } else {
    text = fileBuffer.toString("utf-8");
  }

  text = text.replace(/\s+/g, " ").trim();

  if (text.length < 20) {
    const ocrHint = ocrAttempted
      ? ` OCR was attempted${ocrFailureReason ? ` but failed: ${ocrFailureReason}` : " but did not find readable text"}.`
      : "";
    res.status(422).json({ error: `The CV file appears to be empty or image-based. Please paste the text manually.${ocrHint}` });
    return;
  }

  res.json({ text });
});

router.post("/candidates/:id/analyze-cv", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid candidate id" }); return; }

  const [candidate] = await db.select().from(candidatesTable).where(eq(candidatesTable.id, id));
  if (!candidate) { res.status(404).json({ error: "Candidate not found" }); return; }

  const cvText = req.body?.cvText as string | undefined;
  if (!cvText || cvText.trim().length < 20) {
    res.status(400).json({ error: "No CV text provided for analysis" });
    return;
  }

  let position: typeof positionsTable.$inferSelect | undefined;
  if (candidate.positionId != null) {
    [position] = await db
      .select()
      .from(positionsTable)
      .where(eq(positionsTable.id, candidate.positionId));
  }

  const positionBlock = position
    ? `You are evaluating this candidate FOR THIS SPECIFIC POSITION:

POSITION TITLE: ${position.title}
DEPARTMENT: ${position.department}
LOCATION: ${position.location}
TYPE: ${position.type}
DESCRIPTION: ${position.description ?? "(no description provided)"}

Your job is to assess HOW WELL THE CANDIDATE'S CV MATCHES THIS POSITION'S REQUIREMENTS, not to give a generic financial-services assessment.`
    : `You are evaluating this candidate for a generic role at Vera (a global financial institution). The candidate has no specific position assigned, so assess overall fit for the financial services sector.`;

  const fitFieldsBlock = position
    ? `  "fitForPosition": "High | Medium | Low",
  "matchScore": number between 0 and 100 (0 = no match at all, 100 = perfect match for THIS position),
  "matchingSkills": ["skills from the CV that DIRECTLY match the position requirements"],
  "missingSkills": ["requirements of the position that are NOT visible in the CV"],
  "reasoning": "2-3 sentence explanation of why the candidate matches (or not) THIS position",`
    : `  "fitForPosition": "High | Medium | Low",
  "matchScore": number between 0 and 100,
  "matchingSkills": ["general strengths relevant to financial services"],
  "missingSkills": ["gaps relevant to financial services"],
  "reasoning": "2-3 sentence explanation focused on financial services fit",`;

  const prompt = `You are an expert HR recruiter at Vera, a global financial institution. Analyze the following CV and provide a structured assessment in JSON format.

${positionBlock}

CV Content:
${cvText.slice(0, 8000)}

Respond with a JSON object (no markdown, no code fences) with these fields:
{
  "summary": "2-3 sentence executive summary of the candidate",
  "yearsExperience": number or null,
  "topSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "education": "highest education level and field",
  "languages": ["language1", "language2"],
  "strengths": ["strength1", "strength2", "strength3"],
  "areasToExplore": ["area1", "area2"],
${fitFieldsBlock}
  "recommendedNextStep": "string"
}`;

  let analysisRaw = "";

  if (gemini) {
    // Si tenemos texto suficiente, usamos el análisis de texto directo (mucho más rápido).
    // Solo si el texto es escaso o nulo, recurrimos a cargar el binario para análisis multimodal (PDF visual).
    let fileBuffer: Buffer | undefined;
    let mimeType: string | undefined;

    const hasSufficientText = cvText && cvText.trim().length >= 40;

    if (!hasSufficientText && candidate.cvPath) {
      try {
        if (isLocalCvPath(candidate.cvPath)) {
          fileBuffer = await readFile(resolveLocalCvPath(candidate.cvPath));
        } else {
          const objectFile = await objectStorage.getObjectEntityFile(candidate.cvPath);
          [fileBuffer] = await objectFile.download();
        }
        mimeType = candidate.cvPath.toLowerCase().endsWith(".pdf") ? "application/pdf" : undefined;
      } catch (err) {
        console.warn("Failed to load CV file for Gemini multimodal analysis fallback", err);
      }
    }

    analysisRaw = await gemini.analyzeCV(prompt, fileBuffer, mimeType);
  } else {
    // Fallback a OpenAI (solo texto)
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_completion_tokens: 1500,
    });
    analysisRaw = completion.choices[0]?.message?.content ?? "{}";
  }

  const raw = analysisRaw;
  let analysis: Record<string, unknown>;
  try {
    const cleanedRaw = raw
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    analysis = JSON.parse(cleanedRaw);
  } catch {
    analysis = { summary: raw };
  }

  const analysisStr = JSON.stringify(analysis);
  await db.update(candidatesTable).set({ cvAnalysis: analysisStr }).where(eq(candidatesTable.id, id));

  res.json({ analysis });
});

router.get("/candidates/:id/cv-analysis", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid candidate id" }); return; }

  const [candidate] = await db.select({ cvAnalysis: candidatesTable.cvAnalysis, cvPath: candidatesTable.cvPath }).from(candidatesTable).where(eq(candidatesTable.id, id));
  if (!candidate) { res.status(404).json({ error: "Candidate not found" }); return; }

  const analysis = candidate.cvAnalysis ? JSON.parse(candidate.cvAnalysis) : null;
  res.json({ analysis, cvPath: candidate.cvPath });
});

export default router;
