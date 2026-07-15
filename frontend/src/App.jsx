import { useState } from 'react'
import './App.css'
import  CodeEditor  from './editors'
import ChatBar from './chat'
import { MoveRight } from 'lucide-react'


function App() {
  
  const [sourceCode, setSourceCode] = useState("")
  const [targetLang, setTargetLang] = useState("Javascript")
  const [sourceLang, setSourceLang] = useState("Python")
  const [translatedCode, setTranslatedCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [translated, setTranslated] = useState(true)
  const handleTranslate = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/translate/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ src: sourceLang, target: targetLang, code: sourceCode }),
      });
      const data = await res.json();
      setTranslatedCode(data.content ?? "");
      console.log(translatedCode)
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setTranslated(false)
    }
  };
  return (
    <div className='grid grid-cols-[auto_auto] bg-pink-100 h-screen w-full justify-between'>
    <div className="bg-slate-400 rounded-xl shadow-2xl shadow-black/40 p-4 border border-slate-700/50 bg-slate-500 rounded m-10">
      <div className="grid grid-cols-[1fr_auto_1fr] gap-4">
        <CodeEditor
          value={sourceCode}
          onChange={setSourceCode}
          language={sourceLang.toLowerCase()}
          onLanguageChange={setSourceLang}
        />
        <div className="flex justify-between">
          
        <button onClick={handleTranslate} disabled={loading}>
          {loading ? "Translating..." : <MoveRight />}
        </button>
      </div>

        <CodeEditor
          value={translatedCode}
          language={targetLang.toLowerCase()}
          onLanguageChange={setTargetLang}
          readOnly={translated}
        />
      </div>
    </div>
    <div>
      <ChatBar/>
    </div>
    </div>
  );
}


export default App
