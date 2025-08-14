import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => res.send("Voice Assistant Backend Running 🚀"));

// --- Gemini setup (text model) ---
if (!process.env.GEMINI_API_KEY) {
  console.warn("⚠️ GEMINI_API_KEY missing in .env");
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const modelNames = ["gemini-1.5-flash", "gemini-1.5-pro"]; // fallback order
let model = null;

async function initModel() {
  for (const name of modelNames) {
    try {
      const m = genAI.getGenerativeModel({
  model: name,
  systemInstruction:
    "You are a friendly AI assistant. You only talk about Revolt Motors. \
If asked about any other topic, politely say: 'I only provide information about Revolt Motors.' \
Always be concise and helpful.",
  generationConfig: { temperature: 0.7 },
});

      // quick ping so we fail fast if bad model
      await m.generateContent("hello");
      model = m;
      console.log(`✅ Gemini model ready: ${name}`);
      return;
    } catch (e) {
      console.log(`❌ Failed model ${name}:`, e?.message || e);
    }
  }
  throw new Error("No Gemini model could be initialized");
}

initModel().catch((e) => {
  console.error("Gemini init error:", e?.message || e);
});

// --- Simple per-socket queue to avoid 429s ---
function createQueue(delayMs = 800) {
  let busy = false;
  const q = [];
  const push = (fn) =>
    new Promise((resolve, reject) => {
      q.push({ fn, resolve, reject });
      pump();
    });
  async function pump() {
    if (busy) return;
    const job = q.shift();
    if (!job) return;
    busy = true;
    try {
      const r = await job.fn();
      job.resolve(r);
    } catch (err) {
      job.reject(err);
    } finally {
      setTimeout(() => {
        busy = false;
        pump();
      }, delayMs);
    }
  }
  return { push };
}

// --- Socket.IO ---
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  const queue = createQueue();

  // Old demo path still supported
  socket.on("audio-chunk", () => {
    // we’re not doing server STT in this build; ignore raw audio
  });

  // ✅ New path: receive browser transcript and reply with Gemini
  socket.on("user-transcript", async (text) => {
    if (!text || !text.trim()) return;
    try {
      const result = await queue.push(async () => {
        if (!model) throw new Error("Model not initialized");
        const r = await model.generateContent(text);
        return r.response.text();
      });
      socket.emit("ai-reply", { text: result });
    } catch (err) {
      const msg =
        err?.message ||
        "I hit a snag processing that. Please try again in a moment.";
      socket.emit("ai-reply", { text: msg });
    }
  });

  socket.on("disconnect", () =>
    console.log("Client disconnected:", socket.id)
  );
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
