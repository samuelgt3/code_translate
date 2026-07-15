import { useState, useEffect } from "react";
import { Send } from "lucide-react";
  
const api = "http://localhost:3000/api/";

export default function ChatBar(){
    const [input, setInput] = useState("")
    const [isLoading, setLoading] = useState(false)
    const [history, setHistory] = useState([]);

useEffect(() => {
  const fetchHistory = async () => {
    const res = await fetch("http://localhost:3000/api/history/", { 
      method: "GET", 
      headers: { "Content-Type": "application/json" },
      credentials: "include" 
    });
    const data = await res.json();
    setHistory(data);
  };
  fetchHistory();
}, []);
    const handleSubmit = async(msg) =>{
      setLoading()
        const response = await fetch(api+"chat/", {
            method: "POST",
            credentials: "include",
            body: msg
        })
        const result = await response.json()
        let hist = history
        hist.push({ role: "user", content: msg });
        hist.push({ role: "assistant", content: result });
        setHistory(hist)
        setInput("")
        
}
    return <div className="flex flex-col overflow-hidden bg-slate-900 border-l border-slate-700 h-full w-[30vh]">
  <div className="px-8 py-6 border-t border-slate-800/30">
  <div className="flex-1 ">
    {history.length === 0 ? (
            <div className="flex flex-col overflow-y-auto px-8 py-6">
              <span>Ask a Question</span>
            </div> ) : (
            <div style={{ 
              margin: '0 auto'
            }}>
              {history.map((message, index) => (
                <div key={index} style={{ 
                  display: 'flex',
                  justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: '2rem'
                }}>
                  <div style={{
                    borderRadius: '1.5rem',
                    padding: '1rem 1.5rem',
                    backgroundColor: message.role === 'user' ? 'rgba(147, 51, 234, 0.9)' : 'rgba(30, 41, 59, 0.5)',
                    color: message.role === 'user' ? '#ffffff' : '#e2e8f0'
                  }}>
                    <p style={{ 
                      whiteSpace: 'pre-wrap',
                      fontSize: '1rem',
                      lineHeight: '1.625',
                      margin: 0
                    }}>{message.content}</p>
                  </div>
                </div>
                
              ))}
              </div>)}
  </div>
<div className="mt-auto max-w-4xl mx-auto mb-0 bg-slate-800 border border-slate-700 rounded-full focus-within:border-purple-500 transition-colors">
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit(e)}
          placeholder="Type something..."
          disabled={isLoading}
          className="w-full box-border text-base rounded-full py-5 pl-7 pr-16 bg-slate-800/50 backdrop-blur-sm text-white text-sm outline-none"
        />
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || isLoading}
          className={`absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-3 border-none flex items-center justify-center text-white transition-colors
            ${!input.trim() || isLoading
              ? 'bg-slate-700 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700 cursor-pointer'}`}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</div>
}