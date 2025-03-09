import { useState, useEffect } from "react";

const socket = new WebSocket("ws://localhost:3001"); // Connect to WebSocket server

export default function Game() {
  const [word, setWord] = useState("condescending"); // Sample word
  const [sentence, setSentence] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    socket.onopen = () => {
      console.log("✅ WebSocket connection established!");
    };

    socket.onmessage = (event) => {
      console.log("📩 Message received:", event.data);
      const data = JSON.parse(event.data);
      if (data.result) {
        setResult(data.result);
      }
    };

    socket.onerror = (error) => {
      console.error("❌ WebSocket error:", error);
    };

    socket.onclose = () => {
      console.warn("⚠️ WebSocket connection closed!");
    };
  }, []);

  const submitSentence = () => {
    if (sentence.trim() === "") return;
    console.log("📤 Sending:", { word, sentence });
    socket.send(JSON.stringify({ word, sentence })); // Send user input to server
    setSentence("");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-2xl font-bold">Word Battle</h1>
      <p className="mt-2">Use the word: <strong>{word}</strong> in a sentence</p>
      <input
        type="text"
        className="mt-4 p-2 text-white w-80 border border-gray-300 rounded"
        placeholder="Type your sentence..."
        value={sentence}
        onChange={(e) => setSentence(e.target.value)}
      />
      <button
        className="mt-2 px-4 py-2 bg-blue-500 rounded hover:bg-blue-700"
        onClick={submitSentence}
      >
        Submit
      </button>
      {result && <p className="mt-4 text-xl">{result}</p>}
    </div>
  );
}