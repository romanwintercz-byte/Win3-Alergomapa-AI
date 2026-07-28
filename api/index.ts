import express from "express";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// Vercel serverless function pro chat
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
V kontextu máš k dispozici informace o celém rodinném týmu (profily dětí/členů rodiny, jejich konkrétní pylové i osobní alergeny jako potraviny či zvířata a aktuální pylovou situaci).
Když se rodič ptá na své děti (např. "co balit Adamovi", "je dnešek bezpečný pro Elišku"), zohledni přesně alergie daného dítěte a dej praktická doporučení.

Tady jsou data z kontextu aplikace:
${context ? JSON.stringify(context, null, 2) : "Žádná data z kontextu"}`;

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

export default app;
