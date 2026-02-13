// src/pyodideLoader.js
// ─────────────────────────────────────────────────────────────
// Loads Pyodide once and exposes runTemplate() for all templates.
// Every template calls runTemplate(pythonCode, args) — nothing else.
// ─────────────────────────────────────────────────────────────

let _pyodide = null;
let _loadPromise = null;

/**
 * Initialise Pyodide once. Safe to call from multiple components
 * simultaneously — they all await the same promise.
 *
 * @param {(status: 'loading'|'ready'|'error') => void} onStatus
 */
export async function initPyodide(onStatus) {
  if (_pyodide) return _pyodide;
  if (_loadPromise) return _loadPromise;

  _loadPromise = (async () => {
    onStatus?.('loading');

    // Inject the Pyodide CDN script once
    await new Promise((resolve, reject) => {
      if (document.getElementById('__pyodide_cdn')) { resolve(); return; }
      const script = document.createElement('script');
      script.id  = '__pyodide_cdn';
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';
      script.onload  = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });

    _pyodide = await window.loadPyodide();
    onStatus?.('ready');
    return _pyodide;
  })();

  return _loadPromise;
}

/**
 * Run an embedded Python template string with the given arguments.
 * The Python code must define a top-level `run()` function.
 *
 * @param {string}  pythonCode  - Full Python source (defines run())
 * @param {Array}   args        - Arguments forwarded to run()
 * @returns {Promise<string>}
 */
export async function runTemplate(pythonCode, args = []) {
  if (!_pyodide) throw new Error('Pyodide is not loaded yet.');

  // Define run() in Pyodide's global scope
  _pyodide.runPython(pythonCode);

  // Marshal JS args → Python-safe literal string
  const argsStr = args
    .map(a => typeof a === 'string' ? `"""${a.replace(/"""/g, '')}"""` : a)
    .join(', ');

  return String(_pyodide.runPython(`run(${argsStr})`));
}
