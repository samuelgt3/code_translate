import { Editor } from "@monaco-editor/react";
import { Play } from 'lucide-react'
import { useState } from "react";
import { Select } from 'radix-ui'
import { ChevronDown } from 'lucide-react'

const api = "https://codetranslate.uk/api/"
const languages = ["Python", "JavaScript", "TypeScript", "C++", "C#", "Rust", "Go", "Java"]

export default function CodeEditor({ value, onChange, onLanguageChange, language, readOnly = false }) {
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  
  
  const runCode = async () => {
    setRunning(true);
    const files = [{ content: value }];
    try {
      const result = await fetch(api + 'runcode/', {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, files })
      });
      const data = await result.json();
      setOutput(data.output);
    } catch (err) {
      setOutput(`Error: ${err.message}`);
    } finally {
      setRunning(false);
    }
  };

  return (
   <div className="flex flex-col h-full min-h-0 rounded-lg overflow-hidden border border-zinc-800 bg-[#09090B]">
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800">
        <Select.Root
          value={language}
          onValueChange={(value) => onLanguageChange(value)}
        >
          <Select.Trigger className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700 text-sm font-medium text-zinc-100 transition-colors focus:outline-none focus:ring-1 focus:ring-rose-500">
            <Select.Value />
            <Select.Icon>
              <ChevronDown className="size-3.5 text-zinc-400" />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content className="bg-zinc-900 border border-zinc-700 rounded-md text-white shadow-lg overflow-hidden z-50">
              <Select.Viewport className="p-1 font-medium tracking-tight text-sm text-slate-100">
                {languages.map(lang => (
                  <Select.Item
                    key={lang}
                    value={lang.toLowerCase()}
                    className="px-3 py-1.5 rounded outline-none cursor-pointer data-[highlighted]:bg-rose-500/20 data-[highlighted]:text-rose-200"
                  >
                    <Select.ItemText>{lang}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>

        <button
          onClick={runCode}
          disabled={running}
          aria-label="Run code"
          className="flex items-center justify-center size-8 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="size-4 fill-current" />
        </button>
      </div>

      <div className="flex-1 min-h-0 relative">
        <Editor
          height="100%"
          language={language}
          value={value}
          onChange={(val) => onChange?.(val ?? "")}
          theme="slate-dark"
          beforeMount={(monaco) => {
            monaco.editor.defineTheme('slate-dark', {
              base: 'vs-dark',
              inherit: true,
              rules: [],
              colors: {
                'editor.background': '#18181B',
                'editor.lineHighlightBackground': '#27272A',
                'editorLineNumber.foreground': '#71717A',
                'editorLineNumber.activeForeground': '#A1A1AA',
                'editorCursor.foreground': '#F43F5E',
                'editor.selectionBackground': '#3F3F46',
                'editorGutter.background': '#18181B',
              }
            });
          }}
          options={{
            lineNumbersMinChars: 3,
            lineDecorationsWidth: 5,
            glyphMargin: false,
            minimap: { enabled: false },
            fontSize: 13,
            wordWrap: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            readOnly,
            padding: { top: 16, left: 4 }
          }}
        />
      </div>

      <pre className="shrink-0 bg-black text-left text-xs text-[#d4d4d4] font-mono h-[20vh] overflow-y-auto p-4 m-0 border-t border-zinc-800">
        {output}
      </pre>
    </div>
  );
}