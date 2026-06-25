import { useState } from 'react'
import './App.css'
import  CodeEditor  from './editors'

const handleTranslate = async () => {
  const [loading, setLoading] = useState(false);
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
    }
  };

function App() {
  const [sourceCode, setSourceCode] = useState("")
  const [targetLang, setTargetLang] = useState("Python")
  const [sourceLang, setSourceLang] = useState("Python")
  const [translatedCode, setTranslatedCode] = useState("");
  const [loading, setLoading] = useState(false);
  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        {/* language selectors here */}
        <button onClick={handleTranslate} disabled={loading}>
          {loading ? "Translating..." : "Translate"}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CodeEditor
          value={sourceCode}
          onChange={setSourceCode}
          language={sourceLang.toLowerCase()}
          onLanguageChange={setSourceLang}
        />
        <CodeEditor
          value={translatedCode}
          language={targetLang.toLowerCase()}
          onLanguageChange={setTargetLang}
          readOnly
        />
      </div>
    </div>
  );
}


export default App
