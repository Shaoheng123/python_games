// src/templates/FibTemplate.jsx

import { useState, useCallback } from 'react';
import { runTemplate } from '../pyodideLoader';
import { TemplateShell, PyInput, RunButton, OutputBox } from '../components/TemplateShell';

const PYTHON = `
def run(n):
    n = int(n)
    if n <= 0:
        return "Enter a positive integer"
    a, b, seq = 0, 1, []
    for _ in range(n):
        seq.append(a)
        a, b = b, a + b
    return ", ".join(str(x) for x in seq)
`;

export default function FibTemplate({ pyReady }) {
  const [n, setN]           = useState('12');
  const [result, setResult] = useState(null);
  const [error, setError]   = useState(null);
  const [running, setRunning] = useState(false);

  const accent = '#818cf8';

  const handleRun = useCallback(async () => {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const out = await runTemplate(PYTHON, [parseInt(n) || 10]);
      setResult(out);
    } catch (e) {
      setError(e.message);
    } finally {
      setRunning(false);
    }
  }, [n]);

  return (
    <TemplateShell accent={accent} icon="🌀" title="Fibonacci Sequence" filename="FibTemplate.jsx">
      <div style={{ marginBottom: 12 }}>
        <PyInput accent={accent} value={n} onChange={setN} placeholder="Number of terms" type="number" />
      </div>
      <RunButton accent={accent} onClick={handleRun} running={running} disabled={!pyReady} />
      <OutputBox accent={accent} value={result} error={error} />
    </TemplateShell>
  );
}
