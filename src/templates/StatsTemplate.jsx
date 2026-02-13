// src/templates/StatsTemplate.jsx

import { useState, useCallback } from 'react';
import { runTemplate } from '../pyodideLoader';
import { TemplateShell, PyInput, RunButton, OutputBox } from '../components/TemplateShell';

const PYTHON = `
def run(nums_str):
    nums = [float(x.strip()) for x in nums_str.split(",") if x.strip()]
    if not nums:
        return "Provide at least one number"
    n    = len(nums)
    mean = sum(nums) / n
    var  = sum((x - mean)**2 for x in nums) / n
    return (f"n={n}  mean={mean:.2f}  "
            f"std={var**0.5:.2f}  "
            f"min={min(nums):.2f}  max={max(nums):.2f}")
`;

export default function StatsTemplate({ pyReady }) {
  const [nums, setNums]     = useState('4, 8, 15, 16, 23, 42');
  const [result, setResult] = useState(null);
  const [error, setError]   = useState(null);
  const [running, setRunning] = useState(false);

  const accent = '#f472b6';

  const handleRun = useCallback(async () => {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const out = await runTemplate(PYTHON, [nums]);
      setResult(out);
    } catch (e) {
      setError(e.message);
    } finally {
      setRunning(false);
    }
  }, [nums]);

  return (
    <TemplateShell accent={accent} icon="📊" title="Descriptive Stats" filename="StatsTemplate.jsx">
      <div style={{ marginBottom: 12 }}>
        <PyInput accent={accent} value={nums} onChange={setNums} placeholder="Comma-separated numbers" />
      </div>
      <RunButton accent={accent} onClick={handleRun} running={running} disabled={!pyReady} />
      <OutputBox accent={accent} value={result} error={error} />
    </TemplateShell>
  );
}
