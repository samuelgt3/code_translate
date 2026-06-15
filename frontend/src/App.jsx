import { useState } from 'react'
import './App.css'


function App() {
  const [count, setCount] = useState(0)
  const [sourceCode, setSourceCode] = useState("")
  const [targetLang, setTargetLang] = useState("")
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
          language={toMonacoLang(sourceLang)}
        />
        <CodeEditor
          value={translatedCode}
          language={toMonacoLang(targetLang)}
          readOnly
        />
      </div>
    </div>
  );
}


export default App
