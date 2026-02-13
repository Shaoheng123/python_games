// src/templates/GreetTemplate.jsx

import { useState, useCallback } from 'react';
import { runTemplate } from '../pyodideLoader';
import { TemplateShell, PyInput, RunButton, OutputBox } from '../components/TemplateShell';

const PYTHON = `
def run(name):
    return f"Hello, {name}! Welcome to browser Python 🐍"
`;

export default function GreetTemplate({ pyReady }) {
  const [name, setName]     = useState('Ada Lovelace');
  const [result, setResult] = useState(null);
  const [error, setError]   = useState(null);
  const [running, setRunning] = useState(false);

  const accent = '#fbbf24';

  const handleRun = useCallback(async () => {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const out = await runTemplate(PYTHON, [name]);
      setResult(out);
    } catch (e) {
      setError(e.message);
    } finally {
      setRunning(false);
    }
  }, [name]);

  return (
    <TemplateShell accent={accent} icon="👋" title="Greeter" filename="GreetTemplate.jsx">
      <div style={{ marginBottom: 12 }}>
        <PyInput accent={accent} value={name} onChange={setName} placeholder="Enter a name" />
      </div>
      <RunButton accent={accent} onClick={handleRun} running={running} disabled={!pyReady} />
      <OutputBox accent={accent} value={result} error={error} />
    </TemplateShell>
  );
}
