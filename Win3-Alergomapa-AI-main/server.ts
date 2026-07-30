import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API routes
  app.post("/api/scan-food", async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      return res.status(400).json({ error: "Chybí platný GEMINI_API_KEY v souboru .env" });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const { image, allergens, profileName } = req.body;

      if (!image || !allergens) {
        return res.status(400).json({ error: "Chybí obrázek nebo alergeny." });
      }

      const base64Data = image.split(',')[1];
      const mimeType = image.split(',')[0].split(':')[1].split(';')[0];

      const systemInstruction = `Jsi expert na analýzu složení potravin a alergie.
Tvým úkolem je zkontrolovat složení potraviny z obrázku vůči seznamu alergenů.
Sledované alergeny pro tohoto uživatele: ${allergens.join(", ")}.

Postup:
1. Přečti pečlivě složení potraviny z obrázku (včetně "může obsahovat stopy").
2. Zkontroluj, zda se některý ze sledovaných alergenů nachází ve složení. Hledej i skryté názvy a e-kódy (např. syrovátka pro mléko, lecitin, kasein, E-kódy zvířecího původu apod.).
3. Rozhodni, zda je potravina pro uživatele bezpečná.

Odpověz striktně a výhradně platným JSON objektem v tomto formátu (bez markdown bloku, čistý JSON):
{
  "safe": boolean,
  "foundAllergens": ["seznam", "nalezených", "alergenů"],
  "reasoning": "Vysvětlení, proč je to nebezpečné (co se našlo pod jakým názvem) nebo bezpečné.",
  "extractedIngredients": "Přesný text složení, který jsi z obrázku přečetl"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: mimeType
                }
              },
              { text: "Zanalyzuj toto složení." }
            ]
          }
        ],
        config: { 
          systemInstruction,
          responseMimeType: "application/json"
        }
      });

      if (response && response.text) {
        try {
          const cleanText = response.text.replace(/\`\`\`json\n/g, '').replace(/\`\`\`/g, '').trim();
          const result = JSON.parse(cleanText);
          res.json({ result });
        } catch (parseError) {
          console.error("JSON parse error:", response.text);
          res.status(500).json({ error: "AI vrátilo nečitelný formát." });
        }
      } else {
        res.status(500).json({ error: "AI nevrátilo žádnou odpověď." });
      }

    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || "Interní chyba serveru" });
    }
  });

  app.post("/api/chat", async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      return res.status(400).json({ 
        error: "Chybí platný GEMINI_API_KEY v souboru .env" 
      });
    }

    try {
      const clientReferer = req.headers?.referer || req.headers?.origin || process.env.APP_URL || 'http://localhost:3000/';

      const ai = new GoogleGenAI({ 
        apiKey,
        httpOptions: {
          headers: {
            'Referer': clientReferer
          }
        }
      });

      const { messages, context } = req.body || {};
      
      const systemInstruction = `Jsi asistent v aplikaci AlergoMapa, která radí rodičům a uživatelům ohledně alergií (pyly, potraviny, zvířata, roztoče) a sleduje kvalitu ovzduší.
Odpovídej stručně, empaticky, srozumitelně a výhradně v češtině.
V kontextu máš k dispozici informace o celém rodinném týmu (profily dětí/členů rodiny, jejich konkrétní pylové i osobní alergeny jako potraviny či zvířata, výsledky krevních testů IgE pro dané alergeny (třída 0-6, kde vyšší = silnější alergie) a aktuální pylovou situaci).
Když se rodič ptá na své děti (např. "co balit Adamovi", "je dnešek bezpečný pro Elišku"), zohledni přesně alergie daného dítěte, jejich závažnost (podle krevních testů, pokud jsou zadány) a dej praktická doporučení.

Tady jsou data z kontextu aplikace:
${context ? JSON.stringify(context, null, 2) : "Žádná data z kontextu"}
`;

      const formattedMessages = (messages || []).map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      let replyText = "";
      const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
      let lastError: any = null;

      for (const modelName of modelsToTry) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: formattedMessages,
            config: { systemInstruction }
          });
          if (response && response.text) {
            replyText = response.text;
            break;
          }
        } catch (err: any) {
          console.warn(`Model ${modelName} failed:`, err.message);
          lastError = err;
        }
      }

      if (!replyText) {
        throw lastError || new Error("Žádný AI model nevytvořil odpověď.");
      }

      res.json({ reply: replyText });
    } catch (error: any) {
      console.error("Error calling Gemini API:", error);
      res.status(500).json({ error: error.message || "Nepodařilo se vygenerovat odpověď." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
