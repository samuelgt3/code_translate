import Editor from "@monaco-editor/react";
import { response } from "express";
import Play from 'lucide-react'
import { useState } from "react";

const [output, setOutput] = useState("");
const LANGUAGE_OPTIONS = ["Python", "JavaScript", "TypeScript", "C++", "C#", "Rust", "Go", "Java"]
export function CodeEditor({ value, onChange, onLanguageChange, language, readOnly = false }) {
  return (
    <div className="relative">
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
      className = "absolute top-2 right-2 z-10 p-2 bg-emerald-600"
      onClick={async () => { const result = await fetch(api + 'runcode', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language, value })
    })
     const data = await result.json()
     setOutput(data);}
    }
      />
        <Editor
      height="60vh"
      language={language}
      value={value}
      onChange={(val) => onChange?.(val ?? "")}
      theme="vs-dark"
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        wordWrap: "on",
        scrollBeyondLastLine: false,
        automaticLayout: true,
        readOnly,
      }}
    />
    <Editor
    height="40vh"
    language="plaintext"
    value={output}
    options={{
        minimap: { enabled: false },
        fontSize: 14,
        wordWrap: "on",
        scrollBeyondLastLine: false,
        automaticLayout: true,
        readOnly: true,
    }}
    />
    </div>
    
  );
}