import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { messages, context } = req.body || {};
    
    const systemInstruction = `Jsi asistent v aplikaci AlergoMapa, která radí rodičům a uživatelům ohledně alergií (pyly, potraviny, zvířata, roztoče) a sleduje kvalitu ovzduší.
Odpovídej stručně, empaticky, srozumitelně a výhradně v češtině.
V kontextu máš k dispozici informace o celém rodinném týmu (profily dětí/členů rodiny, jejich konkrétní pylové i osobní alergeny jako potraviny či zvířata a aktuální pylovou situaci).
Když se rodič ptá na své děti (např. "co balit Adamovi", "je dnešek bezpečný pro Elišku"), zohledni přesně alergie daného dítěte a dej praktická doporučení.

Tady jsou data z kontextu aplikace:
${context ? JSON.stringify(context, null, 2) : "Žádná data z kontextu"}
`;

    const formattedMessages = (messages || []).map((msg: any) => ({
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

    return res.status(200).json({ reply: response.text });
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return res.status(500).json({ error: "Nepodařilo se vygenerovat odpověď." });
  }
}
