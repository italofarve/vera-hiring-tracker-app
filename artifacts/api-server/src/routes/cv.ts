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
import mammoth from "mammoth";
// pdf-parse is CJS-only; use require at runtime (globalThis.require is set by the build banner)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pdfParse: (buf: Buffer) => Promise<{ text: string }> = (globalThis as any).require("pdf-parse");

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
    const uploadUrl = await objectStorage.getObjectEntityUploadURL();

    const gcsResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": req.file.mimetype },
      body: req.file.buffer,
    });

    if (!gcsResponse.ok) {
      res.status(500).json({ error: "Failed to upload to storage" });
      return;
    }

    cvPath = objectStorage.normalizeObjectEntityPath(uploadUrl.split("?")[0]);
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

  if (contentType.includes("pdf") || candidate.cvPath.toLowerCase().endsWith(".pdf")) {
    let pdfParseFailed = false;
    try {
      const parsed = await pdfParse(fileBuffer);
      text = parsed.text;
    } catch {
      pdfParseFailed = true;
    }

    const normalizedPdfText = text.replace(/\s+/g, " ").trim();
    const shouldRunOcrFallback =
      cvOcrFallbackEnabled && (pdfParseFailed || normalizedPdfText.length < cvOcrMinTextLength);

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
        ocrFailureReason = err instanceof Error ? err.message : "unknown OCR error";
        if (pdfParseFailed) {
          res.status(422).json({
            error:
              `Could not extract text from PDF. The file may be image-based or corrupted. OCR fallback failed: ${ocrFailureReason}`,
          });
          return;
        }
      }
    } else if (pdfParseFailed) {
      res.status(422).json({ error: "Could not extract text from PDF. The file may be image-based or corrupted." });
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

  const completion = await openai.chat.completions.create({
    model: "gpt-5.1",
    messages: [{ role: "user", content: prompt }],
    max_completion_tokens: 1500,
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  let analysis: Record<string, unknown>;
  try {
    analysis = JSON.parse(raw);
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
