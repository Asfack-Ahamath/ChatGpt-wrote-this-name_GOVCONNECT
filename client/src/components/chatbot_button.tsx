import { MessageCircle } from "lucide-react";
import { useState } from "react";

export const ChatbotButton = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>(
    []
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages([...messages, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input }),
      });
      const data = await response.json();
      const botMessage = {
        sender: "bot",
        text: data.answer || "Sorry, I could not process your request.",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Error connecting to chatbot." },
      ]);
    }
    setLoading(false);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 transition-colors"
      >
        <MessageCircle size={28} />
      </button>

      {/* Chatbot Panel */}
      {open && (
        <div className="fixed bottom-20 right-6 w-80 h-96 bg-white rounded-xl shadow-xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-primary-600 text-white p-3 flex justify-between items-center">
            <span className="font-semibold">GovConnect Assistant</span>
            <button onClick={() => setOpen(false)} className="text-white">
              ✕
            </button>
          </div>

          {/* Chat Window */}
          <div className="flex-1 p-4 overflow-y-auto text-gray-700">
            {messages.map((msg, index) => (
              <p
                key={index}
                className={`text-sm mb-2 ${
                  msg.sender === "user"
                    ? "text-right text-blue-600"
                    : "text-left text-gray-700"
                }`}
              >
                {msg.text}
              </p>
            ))}
            {loading && <p className="text-gray-500 text-sm">Thinking...</p>}
          </div>

          {/* Input */}
          <div className="p-3 border-t flex">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              onClick={handleSend}
              className="ml-2 bg-primary-600 text-white px-3 rounded-lg hover:bg-primary-700"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};
