import { useEffect, useState } from 'react'
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
  const [initiated, setInitiated] = useState(false)
  const [history, setHistory] = useState({});

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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setTranslated(false)
    }
  };
  const resetSession = async() =>{
      const res = await fetch("http://localhost:3000/api/reset/", { 
      method: "POST", 
      headers: { "Content-Type": "application/json" },
      credentials: "include" 
    });
    
    }
  useEffect(()=> {
    
    const getHistory = async() => {
      const res = await fetch("http://localhost:3000/api/history/", { 
      method: "GET", 
      headers: { "Content-Type": "application/json" },
      credentials: "include" 
    });
    const data = await res.json();
    setHistory(data);
    
    setInitiated(true)
    }
    getHistory()
  })
  return (
    <div className='flex flex-col h-screen overflow-hidden'>
      <div className='flex justify-between w-full h-20 bg-deep-space-blue-800 shrink-0 border-gradient'>
        <button 
        onClick={()=>{resetSession()}}
        >
          <img src="Logo.png" alt="Logo"  className='h-full'/>
          
        </button>
        <div className='flex flex-row items-center ml-auto gap-4 pr-10'>
        <button
        className='px-2'
         onClick={()=>{window.location.href = "https://github.com/samuelgt3/code_translate.git"}}
        >
          <img src="github.png" alt="GitHub" className='h-14.5 text-black' />
          
        </button>
        <button
        onClick={()=>{window.location = "mailto:samueltadele878@gmail.com"}} 
        >
          <img src="email.png" alt="Email" className='h-10 right-5' />
        </button>
        </div>
      </div>
    <div className='grid grid-cols-[auto_auto] bg-deep-space-blue-950 min-h-0 h-full w-full p-0'>
    <div className=" h-fit p-4 m-10">
      <div className=" h-fit grid grid-cols-[1fr_auto_1fr] gap-4 min-h-0">
        <CodeEditor
          value={sourceCode}
          onChange={setSourceCode}
          language={sourceLang.toLowerCase()}
          onLanguageChange={setSourceLang}
        />
        <div className="flex justify-between">
          
        <button  disabled={loading}>
          {loading ? "Translating..." : <MoveRight className="flex items-center justify-center size-10 rounded-full  text-pink-900"
          onClick={handleTranslate}/>}
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
    <div className='h-full min-h-0'>
      {initiated && <ChatBar
      history={history.messages}/>}
    </div>
    </div>
    </div>
  );
}


export default App
