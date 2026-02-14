// src/App.jsx
// ─────────────────────────────────────────────────────────────
// Lazy-loads each template only when the user clicks it.
// To add a new template: create the file, add one entry to REGISTRY.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { initPyodide } from "./pyodideLoader";

// ── Lazy imports — each file is only loaded when first clicked ──
const DicerollTemplate = lazy(() => import("./templates/DicerollTemplate"));
const HangmanTemplate = lazy(() => import("./templates/HangmanTemplate"));
const GreetTemplate = lazy(() => import("./templates/GreetTemplate"));
const StatsTemplate = lazy(() => import("./templates/StatsTemplate"));
const FibTemplate = lazy(() => import("./templates/FibTemplate"));
const PalindromeTemplate = lazy(() => import("./templates/PalindromeTemplate"));

// ── Registry — add new templates here ──────────────────────────
const REGISTRY = [
	{
		id: "hangman",
		label: "Hangman",
		icon: "🟫",
		accent: "#34d399",
		Component: HangmanTemplate,
	},
	{
		id: "add",
		label: "Add",
		icon: "＋",
		accent: "#34d399",
		Component: DicerollTemplate,
	},
	{
		id: "greet",
		label: "Greeter",
		icon: "👋",
		accent: "#fbbf24",
		Component: GreetTemplate,
	},
	{
		id: "stats",
		label: "Stats",
		icon: "📊",
		accent: "#f472b6",
		Component: StatsTemplate,
	},
	{
		id: "fibonacci",
		label: "Fibonacci",
		icon: "🌀",
		accent: "#818cf8",
		Component: FibTemplate,
	},
	{
		id: "palindrome",
		label: "Palindrome",
		icon: "🔁",
		accent: "#38bdf8",
		Component: PalindromeTemplate,
	},
];

// ── StatusPill ──────────────────────────────────────────────────
function StatusPill({ status }) {
	const map = {
		idle: { label: "Idle", color: "#4b5563" },
		loading: { label: "Loading Python…", color: "#38bdf8" },
		ready: { label: "Python Ready", color: "#34d399" },
		error: { label: "Error", color: "#f87171" },
	};
	const { label, color } = map[status] || map.idle;
	return (
		<div
			style={{
				display: "inline-flex",
				alignItems: "center",
				gap: 6,
				background: `${color}14`,
				border: `1px solid ${color}35`,
				borderRadius: 20,
				padding: "4px 12px",
				fontSize: 11,
				color,
				fontFamily: "'Fira Code', monospace",
			}}
		>
			<span
				style={{
					width: 6,
					height: 6,
					borderRadius: "50%",
					background: color,
					boxShadow: `0 0 6px ${color}`,
					animation: status === "loading" ? "blink 1s infinite" : "none",
				}}
			/>
			{label}
		</div>
	);
}

// ── App ──────────────────────────────────────────────────────────
export default function App() {
	const [pyStatus, setPyStatus] = useState("idle");
	const [activeId, setActiveId] = useState(null);
	// Track which template ids have been mounted at least once
	const [loaded, setLoaded] = useState({});

	// Start loading Pyodide immediately in the background
	useEffect(() => {
		initPyodide(setPyStatus).catch(() => setPyStatus("error"));
	}, []);

	const handleSelect = useCallback((id) => {
		setActiveId(id);
		// Mark as loaded — triggers the lazy import + keeps component alive
		setLoaded((prev) => ({ ...prev, [id]: true }));
	}, []);

	const pyReady = pyStatus === "ready";

	return (
		<>
			<style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Fira+Code:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; }
        body { background: #060b14; }
        @keyframes blink  { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes slideIn{ from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
        input::placeholder { color: #374151; }
        ::-webkit-scrollbar       { width: 5px; }
        ::-webkit-scrollbar-track { background: #080e1c; }
        ::-webkit-scrollbar-thumb { background: #1f2937; border-radius: 3px; }
      `}</style>

			<div
				style={{
					display: "flex",
					height: "100vh",
					background: "#060b14",
					color: "#e2e8f0",
					fontFamily: "'Sora', sans-serif",
					overflow: "hidden",
				}}
			>
				{/* ── Sidebar ──────────────────────────────────────── */}
				<aside
					style={{
						width: 220,
						background: "#080e1c",
						borderRight: "1px solid #0f1f35",
						display: "flex",
						flexDirection: "column",
						flexShrink: 0,
					}}
				>
					{/* Branding */}
					<div
						style={{
							padding: "22px 18px 16px",
							borderBottom: "1px solid #0f1f35",
						}}
					>
						<div
							style={{
								fontWeight: 800,
								fontSize: 15,
								background: "linear-gradient(120deg, #e2e8f0, #38bdf8)",
								WebkitBackgroundClip: "text",
								WebkitTextFillColor: "transparent",
								marginBottom: 8,
							}}
						>
							🐍 PyTemplates
						</div>
						<StatusPill status={pyStatus} />
					</div>

					{/* Section label */}
					<div
						style={{
							padding: "14px 18px 6px",
							fontSize: 10,
							color: "#374151",
							fontFamily: "'Fira Code', monospace",
							letterSpacing: 1.5,
							textTransform: "uppercase",
						}}
					>
						Templates
					</div>

					{/* Nav links */}
					<nav style={{ flex: 1, overflowY: "auto" }}>
						{REGISTRY.map(({ id, label, icon, accent }) => {
							const isActive = activeId === id;
							const isLoaded = !!loaded[id];
							return (
								<button
									key={id}
									onClick={() => handleSelect(id)}
									style={{
										display: "flex",
										alignItems: "center",
										gap: 10,
										width: "100%",
										padding: "11px 18px",
										border: "none",
										background: isActive ? `${accent}12` : "transparent",
										borderLeft: isActive
											? `3px solid ${accent}`
											: "3px solid transparent",
										color: isActive ? accent : "#6b7280",
										cursor: "pointer",
										fontSize: 13,
										fontWeight: isActive ? 700 : 400,
										fontFamily: "'Sora', sans-serif",
										textAlign: "left",
										transition: "all 0.15s",
									}}
									onMouseEnter={(e) => {
										if (!isActive) e.currentTarget.style.background = "#0f1f35";
									}}
									onMouseLeave={(e) => {
										if (!isActive)
											e.currentTarget.style.background = "transparent";
									}}
								>
									<span style={{ fontSize: 16 }}>{icon}</span>
									<span style={{ flex: 1 }}>{label}</span>
									{/* Small dot = component is loaded in memory */}
									{isLoaded && (
										<span
											style={{
												width: 5,
												height: 5,
												borderRadius: "50%",
												background: accent,
												opacity: 0.6,
											}}
										/>
									)}
								</button>
							);
						})}
					</nav>

					<div
						style={{
							padding: "14px 18px",
							borderTop: "1px solid #0f1f35",
							fontSize: 10,
							color: "#1f2937",
							fontFamily: "'Fira Code', monospace",
							lineHeight: 1.6,
						}}
					>
						Each template lazy-loads
						<br />
						on first click only.
					</div>
				</aside>

				{/* ── Main panel ───────────────────────────────────── */}
				<main
					style={{
						flex: 1,
						overflowY: "auto",
						padding: "36px 40px",
					}}
				>
					{/* Empty state */}
					{activeId === null && (
						<div
							style={{
								height: "100%",
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								justifyContent: "center",
								gap: 12,
								color: "#1f2937",
								textAlign: "center",
							}}
						>
							<div style={{ fontSize: 48 }}>🐍</div>
							<div style={{ fontWeight: 700, fontSize: 17, color: "#374151" }}>
								Select a template from the sidebar
							</div>
							<div
								style={{
									fontFamily: "'Fira Code', monospace",
									fontSize: 12,
									color: "#111827",
									lineHeight: 1.9,
								}}
							>
								Each component mounts on first click
								<br />
								and stays cached for the session.
							</div>
						</div>
					)}

					{/* Render all loaded templates — hide inactive ones so state persists */}
					{REGISTRY.map(({ id, Component }) => {
						if (!loaded[id]) return null; // not yet loaded — don't even mount
						return (
							<div
								key={id}
								style={{
									display: activeId === id ? "block" : "none",
									maxWidth: 520,
									animation: "slideIn 0.25s ease",
								}}
							>
								<Suspense
									fallback={
										<div
											style={{
												color: "#374151",
												fontFamily: "'Fira Code', monospace",
												fontSize: 13,
											}}
										>
											Loading…
										</div>
									}
								>
									<Component pyReady={pyReady} />
								</Suspense>
							</div>
						);
					})}
				</main>
			</div>
		</>
	);
}
