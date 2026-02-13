// src/templates/PalindromeTemplate.jsx

import { useState, useCallback } from 'react';
import { runTemplate } from '../pyodideLoader';
import { TemplateShell, PyInput, RunButton, OutputBox } from '../components/TemplateShell';

const PYTHON = `
def run(text):
    clean = ''.join(c.lower() for c in text if c.isalnum())
    if not clean:
        return "Enter some text"
    is_p = clean == clean[::-1]
    return f'"{text}" → {"✅ palindrome" if is_p else "❌ not a palindrome"}'
`;

export default function PalindromeTemplate({ pyReady }) {
  const [text, setText]     = useState('A man a plan a canal Panama');
  const [result, setResult] = useState(null);
  const [error, setError]   = useState(null);
  const [running, setRunning] = useState(false);

  const accent = '#38bdf8';

  const handleRun = useCallback(async () => {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const out = await runTemplate(PYTHON, [text]);
      setResult(out);
    } catch (e) {
      setError(e.message);
    } finally {
      setRunning(false);
    }
  }, [text]);

  return (
    <TemplateShell accent={accent} icon="🔁" title="Palindrome Checker" filename="PalindromeTemplate.jsx">
      <div style={{ marginBottom: 12 }}>
        <PyInput accent={accent} value={text} onChange={setText} placeholder="Enter text" />
      </div>
      <RunButton accent={accent} onClick={handleRun} running={running} disabled={!pyReady} />
      <OutputBox accent={accent} value={result} error={error} />
    </TemplateShell>
  );
}
