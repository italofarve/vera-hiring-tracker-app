import { execFile } from "node:child_process";
import { mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

type OcrOptions = {
  lang: string;
  maxPages: number;
  timeoutMs: number;
};

type OcrResult = {
  text: string;
  pagesProcessed: number;
  elapsedMs: number;
};

function runCommand(
  command: string,
  args: string[],
  timeoutMs: number,
): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(
      command,
      args,
      { timeout: timeoutMs, maxBuffer: 1024 * 1024 * 10 },
      (err, stdout, stderr) => {
        if (err) {
          reject(new Error(`${command} failed: ${stderr || err.message}`));
          return;
        }
        resolve(stdout);
      },
    );
  });
}

export async function extractPdfTextWithOcr(
  pdfBuffer: Buffer,
  options: OcrOptions,
): Promise<OcrResult> {
  const startedAt = Date.now();
  const tempDir = await mkdtemp(join(tmpdir(), "vera-cv-ocr-"));
  const inputPdf = join(tempDir, "input.pdf");
  const imagePrefix = join(tempDir, "page");

  try {
    await writeFile(inputPdf, pdfBuffer);

    await runCommand(
      "pdftoppm",
      ["-f", "1", "-l", String(options.maxPages), "-png", inputPdf, imagePrefix],
      options.timeoutMs,
    );

    const files = (await readdir(tempDir))
      .filter((name) => name.startsWith("page-") && name.endsWith(".png"))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    if (files.length === 0) {
      throw new Error("No rasterized pages produced for OCR.");
    }

    const chunks: string[] = [];
    for (const imageName of files) {
      const imagePath = join(tempDir, imageName);
      const text = await runCommand(
        "tesseract",
        [imagePath, "stdout", "-l", options.lang, "--psm", "6"],
        options.timeoutMs,
      );
      chunks.push(text.trim());
    }

    const text = chunks.join("\n").replace(/\s+/g, " ").trim();
    const elapsedMs = Date.now() - startedAt;

    return { text, pagesProcessed: files.length, elapsedMs };
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}
