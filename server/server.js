import { WebSocketServer } from "ws";
import { config } from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

config(); // Load .env variables

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = gemini.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

const PORT = process.env.PORT || 3001;
const wss = new WebSocketServer({ port: PORT }, () => {
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
});

wss.on("connection", (ws) => {
  console.log("✅ New player connected");

  ws.on("message", async (message) => {
    try {
      console.log("📩 Received from client:", message);
      const { word, sentence } = JSON.parse(message);

      if (!word || !sentence) {
        ws.send(JSON.stringify({ result: "Invalid input received." }));
        return;
      }

      console.log(`🔎 Evaluating sentence for word: ${word}`);

      // Send sentence to Gemini API
      const result = await model.generateContent({
        contents: [{ 
          role: "user", 
          parts: [{ text: `Evaluate the following sentence using the word '${word}'. \nRespond ONLY with either "Correct" or "Incorrect". Nothing else. \nSentence: "${sentence}"` }] 
        }],
      });

      const verdict = result.response?.candidates?.[0]?.content?.parts?.[0]?.text.trim() || "Couldn't process response";
      console.log(`✅ Verdict: ${verdict}`);

      // Compare against "Correct" and "Incorrect"
      let isCorrect = verdict === "Correct";

      // Send correct verdict to user
      ws.send(JSON.stringify({ result: isCorrect ? "You win!" : "You lost!" }));
    } catch (error) {
      console.error("❌ Error processing message:", error);
      ws.send(JSON.stringify({ result: "Error evaluating sentence." }));
    }
  });

  ws.on("close", () => {
    console.log("⚠️ Player disconnected");
  });
});
