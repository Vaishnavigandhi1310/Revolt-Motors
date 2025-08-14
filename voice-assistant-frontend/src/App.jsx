
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

// Connect to backend
const socket = io("http://localhost:5000"); // change URL if backend is elsewhere

export default function App() {
  const [messages, setMessages] = useState([]); // { from: 'me' | 'ai', text }
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  // ---- Helpers ----
  const speak = (text) => {
    window.speechSynthesis.cancel(); // stop any ongoing TTS
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  };

  const addMessage = (from, text) =>
    setMessages((prev) => [...prev, { from, text }]);

  // ---- Socket events ----
  useEffect(() => {
    socket.on("connect", () => console.log("✅ Connected:", socket.id));

    socket.on("ai-reply", ({ text }) => {
      addMessage("ai", text);
      speak(text);
    });

    return () => {
      socket.off("connect");
      socket.off("ai-reply");
    };
  }, []);

  // ---- Speech Recognition setup ----
  const setupRecognition = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("Your browser does not support Speech Recognition.");
      return null;
    }

    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.continuous = true;

    rec.onresult = (event) => {
      const last = event.results[event.results.length - 1];
      const transcript = last[0].transcript;
      if (last.isFinal) {
        addMessage("me", transcript);
        socket.emit("user-transcript", transcript);
      }
    };

    rec.onerror = (e) => {
      console.error("STT error:", e);
      setListening(false);
    };

    rec.onend = () => setListening(false);

    return rec;
  };

  const startListening = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {}
    if (!recognitionRef.current) {
      recognitionRef.current = setupRecognition();
      if (!recognitionRef.current) return;
    }
    window.speechSynthesis.cancel();
    recognitionRef.current.start();
    setListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  // ---- Render ----
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#111",
        color: "#eee",
        padding: 32,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1 style={{ fontSize: 48, marginBottom: 24 }}>
        🎤 Revolt Motors Chatbot
      </h1>

      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        {!listening ? (
          <button
            onClick={startListening}
            style={btnStyle("#6ee7b7", "#065f46")}
          >
            Start Talking
          </button>
        ) : (
          <button
            onClick={stopListening}
            style={btnStyle("#fca5a5", "#7f1d1d")}
          >
            Stop
          </button>
        )}
      </div>

      <div style={{ maxWidth: 720 }}>
        {messages.map((m, i) => (
          <p key={i} style={{ lineHeight: 1.6 }}>
            <strong>{m.from === "me" ? "You" : "AI"}:</strong> {m.text}
          </p>
        ))}
      </div>
    </div>
  );
}

// ---- Button style helper ----
function btnStyle(bg = "#fff", border = "#000") {
  return {
    background: bg,
    color: "#111",
    border: `2px solid ${border}`,
    padding: "12px 18px",
    fontSize: 18,
    borderRadius: 12,
    cursor: "pointer",
  };
}
