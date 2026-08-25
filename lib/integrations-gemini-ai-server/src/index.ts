import { VertexAI, type GenerateContentRequest } from "@google-cloud/vertexai";

export interface GeminiAnalysisOptions {
  project?: string;
  location?: string;
  model?: string;
}

export class GeminiAIClient {
  private vertexAI: VertexAI;
  private model: string;

  constructor(options: GeminiAnalysisOptions = {}) {
    // VertexAI usará automáticamente Application Default Credentials (ADC)
    // El proyecto y la localización se pueden inyectar o leer del entorno.
    this.vertexAI = new VertexAI({
      project: options.project || process.env.GOOGLE_CLOUD_PROJECT || "",
      location: options.location || process.env.GOOGLE_CLOUD_LOCATION || "us-central1",
    });
    this.model = options.model || process.env.GEMINI_MODEL || "gemini-2.5-flash";
  }

  /**
   * Analiza un CV usando Vertex AI (Multimodal).
   */
  async analyzeCV(
    prompt: string,
    fileBuffer?: Buffer,
    mimeType?: string
  ): Promise<string> {
    const generativeModel = this.vertexAI.getGenerativeModel({
      model: this.model,
    });

    const request: GenerateContentRequest = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    };

    if (fileBuffer && mimeType) {
      request.contents[0].parts.push({
        inlineData: {
          data: fileBuffer.toString("base64"),
          mimeType: mimeType,
        },
      });
    }

    const result = await generativeModel.generateContent(request);
    const response = await result.response;
    
    // Extraer el texto de la respuesta
    const candidates = response.candidates || [];
    const firstCandidate = candidates[0];
    const content = firstCandidate?.content;
    const parts = content?.parts || [];
    return parts.map(p => p.text).join("");
  }
}

// Inicialización automática
export const gemini = new GeminiAIClient();
