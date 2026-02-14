// src/templates/HangmanTemplate.jsx
import { useState, useCallback } from "react";
import { runTemplate } from "../pyodideLoader";
import {
	TemplateShell,
	PyInput,
	RunButton,
	OutputBox,
} from "../components/TemplateShell";

// ── Python: initialise game ──────────────────────────────────
const PYTHON_INIT = `
import json

def run(secretword):
    secretword = list(secretword.lower().strip())
    wordbar = ["_"] * len(secretword)
    return json.dumps({
        "secretword": secretword,
        "wordbar": wordbar,
        "wrongguess": [],
        "count": 0,
        "ended": False,
        "message": "Game started! Guess a letter.",
        "won": False,
    })
`;

// ── Python: process one guess ────────────────────────────────
const PYTHON_GUESS = `
import json

def run(state_json, wordguess):
    state     = json.loads(state_json)
    secretword = state["secretword"]
    wordbar    = state["wordbar"]
    wrongguess = state["wrongguess"]
    count      = state["count"]
    ended      = state["ended"]
    message    = ""
    won        = False

    wordguess = wordguess.lower().strip()

    if ended:
        return json.dumps({**state, "message": "Game is already over."})

    if len(wordguess) != 1:
        return json.dumps({**state, "message": "One letter at a time!"})

    if wordguess in secretword:
        indices = [i for i, c in enumerate(secretword) if c == wordguess]
        for i in indices:
            wordbar[i] = wordguess
        message = f"'{wordguess}' is in the word!"
    else:
        if wordguess not in wrongguess:
            wrongguess.append(wordguess)
            count += 1
        message = f"'{wordguess}' is not in the word."

    max_wrong = len(secretword) + 1

    if wordbar == secretword:
        message = f"You win! The word was '{''.join(secretword)}'"
        ended = True
        won = True
    elif count >= max_wrong:
        message = f"You lose! The word was '{''.join(secretword)}'"
        ended = True

    return json.dumps({
        "secretword": secretword,
        "wordbar": wordbar,
        "wrongguess": wrongguess,
        "count": count,
        "ended": ended,
        "message": message,
        "won": won,
    })
`;

const accent = "#a78bfa";

export default function HangmanTemplate({ pyReady }) {
	const [phase, setPhase] = useState("setup"); // "setup" | "playing"
	const [secretInput, setSecretInput] = useState("");
	const [guessInput, setGuessInput] = useState("");
	const [gameState, setGameState] = useState(null);
	const [error, setError] = useState(null);
	const [running, setRunning] = useState(false);

	// ── Start game ─────────────────────────────────────────────
	const handleStart = useCallback(async () => {
		if (!secretInput.trim()) return;
		setRunning(true);
		setError(null);
		try {
			const raw = await runTemplate(PYTHON_INIT, [secretInput.trim()]);
			const state = JSON.parse(raw);
			setGameState(state);
			setPhase("playing");
		} catch (e) {
			setError(e.message);
		} finally {
			setRunning(false);
		}
	}, [secretInput]);

	// ── Submit a guess ─────────────────────────────────────────
	const handleGuess = useCallback(async () => {
		if (!guessInput.trim() || !gameState) return;
		setRunning(true);
		setError(null);
		try {
			const raw = await runTemplate(PYTHON_GUESS, [
				JSON.stringify(gameState),
				guessInput.trim(),
			]);
			const newState = JSON.parse(raw);
			setGameState(newState);
			setGuessInput("");
		} catch (e) {
			setError(e.message);
		} finally {
			setRunning(false);
		}
	}, [guessInput, gameState]);

	// ── Reset ──────────────────────────────────────────────────
	const handleReset = () => {
		setPhase("setup");
		setSecretInput("");
		setGuessInput("");
		setGameState(null);
		setError(null);
	};

	// ── Render helpers ─────────────────────────────────────────
	const renderWordBar = () => {
		if (!gameState) return null;
		return (
			<div
				style={{
					display: "flex",
					gap: 8,
					justifyContent: "center",
					flexWrap: "wrap",
					margin: "16px 0",
				}}
			>
				{gameState.wordbar.map((ch, i) => (
					<div
						key={i}
						style={{
							width: 32,
							height: 40,
							borderBottom: `2px solid ${accent}`,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							color: ch === "_" ? "transparent" : accent,
							fontFamily: "'Fira Code', monospace",
							fontSize: 20,
							fontWeight: 700,
							textTransform: "uppercase",
							transition: "color 0.2s",
						}}
					>
						{ch === "_" ? "_" : ch}
					</div>
				))}
			</div>
		);
	};

	const renderWrongGuesses = () => {
		if (!gameState || gameState.wrongguess.length === 0) return null;
		const max = gameState.secretword.length + 1;
		return (
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: 12,
				}}
			>
				<div
					style={{
						fontFamily: "'Fira Code', monospace",
						fontSize: 12,
						color: "#f87171",
					}}
				>
					Wrong: {gameState.wrongguess.join(", ")}
				</div>
				<div
					style={{
						fontFamily: "'Fira Code', monospace",
						fontSize: 12,
						color: "#64748b",
					}}
				>
					{gameState.count}/{max} mistakes
				</div>
			</div>
		);
	};

	return (
		<TemplateShell
			accent={accent}
			icon="🎯"
			title="Hangman"
			filename="HangmanTemplate.jsx"
		>
			{phase === "setup" ? (
				// ── Setup phase ──────────────────────────────────────
				<div>
					<div
						style={{
							fontSize: 11,
							color: "#64748b",
							fontFamily: "'Fira Code', monospace",
							letterSpacing: 1,
							textTransform: "uppercase",
							marginBottom: 8,
						}}
					>
						Choose a secret word
					</div>
					<PyInput
						accent={accent}
						value={secretInput}
						onChange={setSecretInput}
						placeholder="Enter secret word…"
					/>
					<div style={{ marginTop: 12 }}>
						<RunButton
							accent={accent}
							onClick={handleStart}
							running={running}
							disabled={!pyReady}
						/>
					</div>
					<OutputBox accent={accent} value={null} error={error} />
				</div>
			) : (
				// ── Playing phase ─────────────────────────────────────
				<div>
					{renderWordBar()}
					{renderWrongGuesses()}

					{/* Message */}
					{gameState?.message && (
						<div
							style={{
								textAlign: "center",
								marginBottom: 14,
								fontFamily: "'Fira Code', monospace",
								fontSize: 13,
								color: gameState.won
									? "#34d399"
									: gameState.ended
										? "#f87171"
										: "#94a3b8",
							}}
						>
							{gameState.message}
						</div>
					)}

					{/* Guess input — hidden when game over */}
					{!gameState?.ended && (
						<>
							<PyInput
								accent={accent}
								value={guessInput}
								onChange={setGuessInput}
								placeholder="Guess a letter…"
							/>
							<div style={{ marginTop: 12 }}>
								<RunButton
									accent={accent}
									onClick={handleGuess}
									running={running}
									disabled={!pyReady}
								/>
							</div>
						</>
					)}

					{/* Reset button */}
					<button
						onClick={handleReset}
						style={{
							marginTop: 12,
							width: "100%",
							padding: "9px 0",
							borderRadius: 9,
							border: `1px solid ${accent}30`,
							background: "transparent",
							color: accent,
							fontFamily: "'Sora', sans-serif",
							fontSize: 12,
							fontWeight: 600,
							cursor: "pointer",
							opacity: 0.7,
							letterSpacing: 0.5,
						}}
					>
						↺ New Game
					</button>

					<OutputBox accent={accent} value={null} error={error} />
				</div>
			)}
		</TemplateShell>
	);
}
