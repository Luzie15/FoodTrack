export interface ProductAnalyseResult {
  productName: string | null;
  expiryDate: string | null; // Format YYYY-MM-DD
  category: 'Kühlschrank' | 'Speisekammer' | 'Gefrierfach' | 'Obst & Gemüse';
}

export interface ExpiryAnalyseResult {
  expiryDate: string | null; // Format YYYY-MM-DD
}

function getApiKey() {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) {
    throw new Error("VITE_GEMINI_API_KEY fehlt. Bitte trage den Schlüssel in .env.local ein.");
  }
  return key;
}

async function geminiVisionCall(base64Image: string, systemPrompt: string, responseSchema: any) {
  const key = getApiKey();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;

  // Entferne Data-URL-Präfix falls vorhanden
  const base64Data = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

  const payload = {
    contents: [
      {
        parts: [
          { text: "Analysiere das Bild und antworte strikt im gewünschten JSON-Format." },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: base64Data
            }
          }
        ]
      }
    ],
    system_instruction: {
      parts: [{ text: systemPrompt }]
    },
    generationConfig: {
      temperature: 0.1, // Sehr präzise & analytisch
      responseMimeType: "application/json",
      responseSchema: responseSchema
    }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Gemini API Error:", errorText);
    throw new Error(`Cloud-Anfrage fehlgeschlagen: ${res.statusText}`);
  }

  const data = await res.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!rawText) throw new Error("Die KI hat keine lesbare Antwort geliefert.");
  
  try {
    return JSON.parse(rawText);
  } catch (err) {
    throw new Error("Fehlerhaftes KI-Format (kein valides JSON).");
  }
}

/**
 * Scannt ein Foto speziell nach Produktnamen und MHD.
 */
export async function analyzeProductImage(base64Image: string): Promise<ProductAnalyseResult> {
  const systemPrompt = `
Du bist eine smarte KI für eine Lebensmittel-Vorratskammer. Der Nutzer fotografiert ein Lebensmittel (Verpackung, Etikett, MHD).
Deine Aufgabe:
1. 'productName': Finde den passenden, kurzen Produktnamen (z.B. "Gut&Günstig Vollmilch 3.5%" oder "Maggi Fix Bolognese"). Wenn unbekannt, setze null.
2. 'expiryDate': Suche nach einem Ablaufdatum (MHD / "mindestens haltbar bis" / "Exp."). Es steht oft am Rand, am Deckel oder klein gedruckt herum. Wandle es zwingend in das Format "YYYY-MM-DD" um (z.B. 12.08.2026 -> "2026-08-12"). Falls das Jahr fehlt (z.B. 12.08.), nimm das aktuelle oder nächste logische Jahr. Findest du keines, setze null.
3. 'category': Sortiere es in EINE der exakt erlaubten Kategorien ein: "Kühlschrank" | "Speisekammer" | "Gefrierfach" | "Obst & Gemüse".
Antworte AUSSCHLIESSLICH mit diesen 3 Feldern als JSON.
  `;

  const schema = {
    type: "OBJECT",
    properties: {
      productName: { type: "STRING", nullable: true },
      expiryDate: { type: "STRING", nullable: true },
      category: {
        type: "STRING",
        enum: ["Kühlschrank", "Speisekammer", "Gefrierfach", "Obst & Gemüse"]
      }
    },
    required: ["category"] // productName/expiryDate kann null sein
  };

  return geminiVisionCall(base64Image, systemPrompt, schema);
}

/**
 * Zieht AUSSCHLIESSLICH ein Haltbarkeitsdatum aus einem Nahaufnahme-Foto.
 */
export async function analyzeExpiryDateImage(base64Image: string): Promise<ExpiryAnalyseResult> {
  const systemPrompt = `
Du extrahierst aus diesem Bild nur ein Ablaufdatum (Mindesthaltbarkeitsdatum / MHD).
Der User hat oft nur den Deckel oder Bodenrand fotografiert.
Suche nach Datumsmustern. Formatiere den Fund strikt nach "YYYY-MM-DD".
Beispiele:
- "14.10.25" -> "2025-10-14"
- "01/26" -> "2026-01-01"
Wenn du absolut kein Datum erkennen kannst, setze es auf null.
  `;

  const schema = {
    type: "OBJECT",
    properties: {
      expiryDate: { type: "STRING", nullable: true }
    }
  };

  return geminiVisionCall(base64Image, systemPrompt, schema);
}
