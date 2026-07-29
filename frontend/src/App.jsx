import { useEffect, useState } from 'react'
import './App.css'
import CodeEditor from './editors'
import ChatBar from './chat'
import { MoveRight } from 'lucide-react'

function App() {
  const [targetLang, setTargetLang] = useState("Javascript")
  const [sourceLang, setSourceLang] = useState("Python")
  const [loading, setLoading] = useState(false);
  const [translated, setTranslated] = useState(true)
  const [initiated, setInitiated] = useState(false)
  const [history, setHistory] = useState({});
  const [sourceCode, setSourceCode] = useState('')
  const [translatedCode, setTranslatedCode] = useState('');
  const [chatKey, setChatKey] = useState(0)
  const [resetKey, setResetKey] = useState(0)

  const handleTranslate = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/translate/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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

  const resetSession =  () => {
     fetch("http://localhost:3000/api/reset/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include"
    });
  }

  useEffect(() => {
    const getHistory = async () => {
      const res = await fetch("http://localhost:3000/api/history/", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
      const data = await res.json();
      setHistory(data);
      if (data.originalCode) {
        setSourceCode(data.originalCode);
      }
      
      setInitiated(true)
    }
    getHistory()
  }, []);

  return (
    <div className='flex flex-col h-screen overflow-hidden'>
      <div className='flex justify-between w-full h-20 bg-deep-space-blue-800 shrink-0 border-b'>
        <button onClick={() => { 
          setSourceCode("")
          setTranslatedCode("")
          setTranslated(true)
          setChatKey(k => k+1)
          setResetKey(k=> k+1)
          resetSession() }}>
          <img src="Logo.png" alt="Logo" className='h-full py-2 px-5' />
        </button>
        <div className='flex flex-row items-center ml-auto gap-4 pr-10'>
          <button
            className='px-2'
            onClick={() => { window.location.href = "https://github.com/samuelgt3/code_translate.git" }}
          >
            <img src="github.png" alt="GitHub" className='h-14.5 text-black' />
          </button>
          <button onClick={() => { window.location = "mailto:samueltadele878@gmail.com" }}>
            <img src="email.png" alt="Email" className='h-10 right-5' />
          </button>
        </div>
      </div>

      <div className='grid grid-cols-[1fr_auto] bg-deep-space-blue-900 min-h-0 h-full w-full p-0'>
        <div className="h-full min-h-0 p-10">
          <div className="h-full min-h-0 grid grid-cols-[1fr_auto_1fr] gap-4">
            <div className="min-h-0">
              {initiated && <CodeEditor
                key={`src-${resetKey}`}
                value={sourceCode}
                onChange={setSourceCode}
                language={sourceLang.toLowerCase()}
                onLanguageChange={setSourceLang}
              />}
            </div>

            <div className="flex items-center justify-center">
              <button
                disabled={loading}
                onClick={handleTranslate}
                className="flex items-center justify-center size-10 rounded-full text-bg2 disabled:text-grey disabled:cursor-not-allowed"
              >
                {loading ? "..." : <MoveRight className="size-15" />}
              </button>
            </div>

            <div className="min-h-0">
              {initiated && <CodeEditor
                key={`trgt-${resetKey}`}
                value={translatedCode}
                language={targetLang.toLowerCase()}
                onLanguageChange={setTargetLang}
                readOnly={translated}
              />}
            </div>
          </div>
        </div>

        <div className='h-full min-h-0'>
          {initiated && <ChatBar key={chatKey} />}
        </div>
      </div>
    </div>
  );
}

export default App