// src/templates/AddTemplate.jsx
// ─────────────────────────────────────────────────────────────
// Self-contained template: owns its Python code + its own UI.
// App.jsx loads this lazily:
//   const AddTemplate = lazy(() => import('./templates/AddTemplate'))
// ─────────────────────────────────────────────────────────────

import { useState, useCallback } from 'react';
import { runTemplate } from '../pyodideLoader';
import { TemplateShell, PyInput, RunButton, OutputBox } from '../components/TemplateShell';

// ── Embedded Python ──────────────────────────────────────────
const PYTHON = `
def run(a, b):
    return a + b
`;

// ── React Component ──────────────────────────────────────────
export default function AddTemplate({ pyReady }) {
  const [a, setA]           = useState('12');
  const [b, setB]           = useState('30');
  const [result, setResult] = useState(null);
  const [error, setError]   = useState(null);
  const [running, setRunning] = useState(false);

  const accent = '#34d399';

  const handleRun = useCallback(async () => {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const out = await runTemplate(PYTHON, [parseFloat(a) || 0, parseFloat(b) || 0]);
      setResult(out);
    } catch (e) {
      setError(e.message);
    } finally {
      setRunning(false);
    }
  }, [a, b]);

  return (
    <TemplateShell accent={accent} icon="＋" title="Add Two Numbers" filename="AddTemplate.jsx">
      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <PyInput accent={accent} value={a} onChange={setA} placeholder="a" type="number" />
        <PyInput accent={accent} value={b} onChange={setB} placeholder="b" type="number" />
      </div>
      <RunButton accent={accent} onClick={handleRun} running={running} disabled={!pyReady} />
      <OutputBox accent={accent} value={result} error={error} />
    </TemplateShell>
  );
}
