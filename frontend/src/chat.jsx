import { useState, useEffect } from "react";
import { Send } from "lucide-react";
import Markdown from "react-markdown";
  
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
    const handleSubmit = async() =>{
      setLoading(true)
      setInput("")
      let hist = history
      hist.push({ role: "user", content: input });
      setHistory(hist)
      try{
        const response = await fetch(api+"chat/", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({message:input})
            
        })
      const result = await response.json()
        hist.push({ role: "assistant", content: result });
        setHistory(hist)
    }catch(err){
          console.log(err)
        }
        
       setLoading(false)
        
}
    return <div 
    className="flex flex-col h-screen w-[25vw] bg-slate-900 border-l border-slate-700">
  <div className="flex-1 overflow-y-auto px-8 py-6 border-t border-slate-800/30">
    {history.map((message, index) => (
      <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
        <div
          className={`p-3 rounded-xl max-w-[85%] break-words overflow-hidden whitespace-pre-wrap text-xs ${message.role === 'user' ? 'bg-white': 'bg-black'}`}
          style={{
            backgroundColor: message.role === 'user' ? 'rgba(147, 51, 234, 0.9)' : 'rgba(30, 41, 59, 0.5)',
            color: message.role === 'user' ? '#ffffff' : '#e2e8f0'
          }}
        >
          <Markdown>{message.content}</Markdown>
        </div>
      </div>
    ))}
  </div>
  <div className="shrink-0 px-4 pb-4">
    <div className="bg-slate-800 border border-slate-700 rounded-full focus-within:border-green-500 transition-colors">
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
          placeholder="Ask a question"
          disabled={isLoading}
          className="w-full box-border text-base rounded-full py-5 pl-7 pr-16 bg-slate-800/50 backdrop-blur-sm text-white text-sm outline-none"/>
        <button
          onClick={() => handleSubmit()}
          disabled={!input.trim() || isLoading}
          className={`absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-3 border-none flex items-center justify-center text-white transition-colors
            ${!input.trim() || isLoading ? 'bg-slate-700 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 cursor-pointer'}`}>
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</div>
}