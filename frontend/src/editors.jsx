import {Editor} from "@monaco-editor/react";
import {Play} from 'lucide-react'
import { useState } from "react";


const api = "http://localhost:3000/api/";
const LANGUAGE_OPTIONS = ["Python", "JavaScript", "TypeScript", "C++", "C#", "Rust", "Go", "Java"]

export default function CodeEditor({ value, onChange, onLanguageChange, language, readOnly = false }) {
    const [output, setOutput] = useState("");
  return (
    <div className="relative">
        <div className="flex">
        <select 
        value={language}
        onChange={(e) => onLanguageChange(e.target.value)}
        className="mb-2 p-1 rounded bg-zinc-800 text-white"
      >
        {LANGUAGE_OPTIONS.map((lang) => (
          <option key={lang} value={lang.toLowerCase()}>
            {lang}
          </option>
        ))}
      </select>
      <Play 
      className = "absolute top-2 right-2 z-10 p-2 bg-emerald-600 size-10"
      onClick={async () => { const result = await fetch(api + 'runcode', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language, value })
    })
     const data = await result.json()
     setOutput(data);}
    }
      />
      </div>
        <Editor
      height="50vh"
      language={language}
      value={value}
      onChange={(val) => onChange?.(val ?? "")}
      theme="vs-dark"
      options={{
        minimap: { enabled: false },
        fontSize: 10,
        wordWrap: "on",
        scrollBeyondLastLine: false,
        automaticLayout: true,
        readOnly,
      }}
    />
    <Editor
    height="20vh"
    language="plaintext"
    value={output}
    options={{
        minimap: { enabled: false },
        fontSize: 10,
        wordWrap: "on",
        scrollBeyondLastLine: false,
        automaticLayout: true,
        readOnly: true,
    }}
    />
    </div>
    
  );
}