// src/components/TemplateShell.jsx
// Shared card shell used by every template component.

import { useState } from 'react';

export function TemplateShell({ accent, icon, title, filename, children }) {
  return (
    <div style={{
      background: '#0b1120',
      border: `1px solid ${accent}35`,
      borderRadius: 18,
      overflow: 'hidden',
      boxShadow: `0 4px 40px ${accent}12`,
      fontFamily: "'Sora', sans-serif",
    }}>
      {/* File-tab header */}
      <div style={{
        background: '#080e1c',
        borderBottom: `1px solid ${accent}25`,
        padding: '10px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <span style={{
          fontSize: 20,
          background: `${accent}18`,
          borderRadius: 8,
          width: 36, height: 36,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `1px solid ${accent}30`,
          flexShrink: 0,
        }}>{icon}</span>
        <div>
          <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 14 }}>{title}</div>
          <div style={{ color: accent, fontSize: 11, fontFamily: "'Fira Code', monospace", opacity: 0.8 }}>
            {filename}
          </div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <span style={{
            fontSize: 10, color: accent,
            background: `${accent}15`,
            border: `1px solid ${accent}30`,
            borderRadius: 5, padding: '2px 8px',
            fontFamily: "'Fira Code', monospace",
            letterSpacing: 1,
          }}>TEMPLATE</span>
        </div>
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );
}

export function PyInput({ accent, value, onChange, placeholder, type = 'text' }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: '100%', boxSizing: 'border-box',
        background: '#111827',
        border: `1px solid ${focused ? accent : '#1f2937'}`,
        borderRadius: 9,
        padding: '9px 13px',
        color: '#e2e8f0',
        fontSize: 14,
        fontFamily: "'Fira Code', monospace",
        outline: 'none',
        transition: 'border-color 0.15s',
      }}
    />
  );
}

export function RunButton({ accent, onClick, running, disabled }) {
  const [hovered, setHovered] = useState(false);
  const active = !running && !disabled;
  return (
    <button
      onClick={onClick}
      disabled={!active}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        padding: '10px 0',
        borderRadius: 9,
        border: 'none',
        background: active ? (hovered ? accent : `${accent}cc`) : '#1f2937',
        color: active ? '#080e1c' : '#4b5563',
        fontWeight: 800,
        fontSize: 13,
        fontFamily: "'Sora', sans-serif",
        letterSpacing: 0.5,
        cursor: active ? 'pointer' : 'not-allowed',
        transition: 'background 0.15s',
      }}
    >
      {running ? '⏳  Running…' : disabled ? '⏳  Loading Python…' : '▶  Run'}
    </button>
  );
}

export function OutputBox({ accent, value, error }) {
  if (value === null && !error) return null;
  return (
    <div style={{
      marginTop: 12,
      background: error ? '#1a0a0a' : '#070d1a',
      border: `1px solid ${error ? '#ef444440' : accent + '40'}`,
      borderRadius: 9,
      padding: '10px 14px',
      fontFamily: "'Fira Code', monospace",
      fontSize: 13,
      color: error ? '#f87171' : accent,
      lineHeight: 1.7,
      wordBreak: 'break-word',
    }}>
      <span style={{ opacity: 0.45, fontSize: 11, marginRight: 6 }}>output →</span>
      {error || value}
    </div>
  );
}
