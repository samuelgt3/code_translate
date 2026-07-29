import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import Markdown from "react-markdown";

const api = "http://localhost:3000/api/";

export default function ChatBar() {
  const [input, setInput] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchHistory = async () => {
      const res = await fetch(api + "history/", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
      const data = await res.json();
      setHistory(data.messages ?? []);
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [history, isLoading]);

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = { role: "user", content: input };
    setHistory(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    try {
      const response = await fetch(api + "chat/", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content })
      });
      const result = await response.json();
      const assistantContent = typeof result === "string" ? result : (result.message ?? result.content ?? "");
      setHistory(prev => [...prev, { role: "assistant", content: assistantContent }]);
    } catch (err) {
      setHistory(prev => [...prev, { role: "assistant", content: "Something went wrong — try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-0 flex flex-col h-full w-[25vw] bg-chatbar border-l border-slate-700">
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-6 py-6 border-t border-slate-800/30">
        {history.map((message, index) => message.content && (
          <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
            <div
              className={`p-4 rounded-xl max-w-[90%] break-words overflow-hidden whitespace-pre-wrap text-xs leading-relaxed text-white ${
                message.role === 'user'
                  ? 'bg-sky-900/60 border border-sky-800/50'
                  : 'bg-rose-950/40 border border-rose-900/40'
              }`}
            >
              <Markdown>{message.content}</Markdown>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-900/40 flex gap-1">
              <span className="size-1.5 rounded-full bg-rose-400 animate-bounce [animation-delay:-0.3s]" />
              <span className="size-1.5 rounded-full bg-rose-400 animate-bounce [animation-delay:-0.15s]" />
              <span className="size-1.5 rounded-full bg-rose-400 animate-bounce" />
            </div>
          </div>
        )}
      </div>
      <div className="shrink-0 p-4 bg-deep-space-blue-900 border-white">
        <div className="bg-slate-800 border border-slate-700 rounded-full focus-within:border-rose-700 transition-colors">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
              placeholder="Ask a question"
              disabled={isLoading}
              className="w-full box-border text-base rounded-full py-5 pl-7 pr-16 bg-slate-800/50 backdrop-blur-sm text-white text-sm outline-none"
            />
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-3 border-none flex items-center justify-center text-white transition-colors
                ${!input.trim() || isLoading ? 'bg-slate-700 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-500 cursor-pointer'}`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}