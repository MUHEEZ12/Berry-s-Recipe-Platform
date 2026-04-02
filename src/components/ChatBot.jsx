import React from "react";
import { useState } from "react";
import "./Chatbot.css";

function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! I’m Berry AI Chef 🍳. Ask me about recipes!" }
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;

    setMessages([...messages, { sender: "user", text: input }]);
    setInput("");

    // Fake AI response (UI only)
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { sender: "bot", text: "Nice choice! I can suggest recipes, ingredients, or cooking tips 😊" }
      ]);
    }, 800);
  };

  return (
    <>
      {/* Floating Button */}
      <div className="chatbot-btn" onClick={() => setOpen(!open)}>
        🤖
      </div>

      {/* Chat Window */}
      {open && (
        <div className="chatbot-box">
          <div className="chatbot-header">
            Berry AI Chef 🍓
            <span onClick={() => setOpen(false)}>✖</span>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
          </div>

          <div className="chatbot-input">
            <input
              type="text"
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </>
  );
}

export default Chatbot;
