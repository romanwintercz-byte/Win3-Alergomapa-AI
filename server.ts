import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, context } = req.body;
      
      const systemInstruction = `Jsi asistent v aplikaci AlergoMapa, která radí uživatelům ohledně alergií (pyly, potraviny, zvířata) a sleduje kvalitu ovzduší.
Odpovídej stručně, empaticky a v češtině. Zohledni aktuální kontext uživatele (jeho sledované alergeny a aktuální polohu/data, pokud jsou poskytnuta).
Vyhni se příliš dlouhým medicínským textům, ale buď přesný ohledně zkřížených alergií a doporučení.
Tady jsou data z kontextu aplikace:
${context ? JSON.stringify(context, null, 2) : "Žádná data z kontextu"}
`;

      const formattedMessages = messages.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: formattedMessages,
        config: {
          systemInstruction,
        }
      });

      res.json({ reply: response.text });
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      res.status(500).json({ error: "Nepodařilo se vygenerovat odpověď." });
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
