import {Editor} from "@monaco-editor/react";
import {Play} from 'lucide-react'
import { useState } from "react";
import {Select} from 'radix-ui'

const api = "http://localhost:3000/api/";
const languages = ["Python", "JavaScript", "TypeScript", "C++", "C#", "Rust", "Go", "Java"]

export default function CodeEditor({ value, onChange, onLanguageChange, language, readOnly = false }) {
    const [output, setOutput] = useState("");
  return (
    <div className="relative min-h-0">
        <div className="border-b  border-slate-700 flex mb-5 bg-[#09090B] pt-4 px-4 pb-2 items-center justify-between rounded">
        <Select.Root value={language}
        onValueChange={(value) => {console.log(value, language); onLanguageChange(value)}} >        
        <Select.Trigger className="flex items-center justify-between px-2 py-1 rounded focus:outline-none  bg-deep-space-blue-800">    
          <Select.Value />   
          <Select.Icon />   
        </Select.Trigger>
        <Select.Portal className="bg-grey-900 p-2">      
          <Select.Content className= "bg-zinc-900 border border-zinc-700 rounded-md text-white ">   
            <Select.Viewport className="bg-grey-900 font-semibold tracking-tight text-slate-100">
              {languages.map(lang => (
          <Select.Item key={lang} value={lang.toLowerCase()}>
            <Select.ItemText>{lang}</Select.ItemText>
          </Select.Item>
        ))}
        </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
      <Play
      className = " z-10 p-2 size-10 fill-bg2"
      onClick={async () => { const files= [{"content": value}]
         try{const result = await fetch(api + 'runcode/', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language, files })
    })
     const data = await result.json()
     setOutput(data.output);} 
     catch(err){console.error(err.message)}}
    }
    color="emerald"
      />
      </div>
      <div className="overflow-hidden flex-1 rounded min-h-0 border border-slate-800">
        <Editor
      height="50vh"
      //width="60vh"
      language={language}
      value={value}
      onChange={(val) => onChange?.(val ?? "")}
      theme="slate-dark"
      beforeMount={(monaco) => {monaco.editor.defineTheme('slate-dark', {
  base: 'vs-dark',
  inherit: true,
  rules: [],
  colors: {
  'editor.background': '#09090B',        // zinc-950
  'editor.lineHighlightBackground': '#18181B',
  'editorLineNumber.foreground': '#52525B',
  'editorLineNumber.activeForeground': '#A1A1AA',
  'editorCursor.foreground': '#E11D48',  // rose-600
  'editor.selectionBackground': '#27272A',
  'editorGutter.background': '#09090B',
}
});}}
      options={{
        lineNumbersMinChars: 3,
        lineDecorationsWidth: 5, 
        glyphMargin: false,          
        minimap: { enabled: false },
        fontSize: 10,
        wordWrap: "on",
        scrollBeyondLastLine: false,
        automaticLayout: true,
        readOnly,
        padding: { top: 16, left: 4 }
      }}
    />
    {<pre className="bg-black text-left text-xs text-[#d4d4d4] font-mono h-[20vh] overflow-y-auto p-4 m-0 ">{output}</pre>}
    </div>
    </div>
    
  );
}