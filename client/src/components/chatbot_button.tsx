import { MessageCircle } from 'lucide-react';
import { useState } from 'react';

export const ChatbotButton = () => {
  const [open, setOpen] = useState(false);

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
            <button onClick={() => setOpen(false)} className="text-white">✕</button>
          </div>

          {/* Chat Window (placeholder for now) */}
          <div className="flex-1 p-4 overflow-y-auto text-gray-700">
            <p className="text-sm">Hi! How can I help you today?</p>
          </div>

          {/* Input */}
          <div className="p-3 border-t">
            <input
              type="text"
              placeholder="Type your message..."
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      )}
    </>
  );
};
