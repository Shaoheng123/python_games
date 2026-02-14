// src/templates/DiceTemplate.jsx
import { useState, useCallback } from "react";
import { runTemplate } from "../pyodideLoader";
import {
	TemplateShell,
	PyInput,
	RunButton,
	OutputBox,
} from "../components/TemplateShell";

const PYTHON = `
import js
import math

dice1 = math.floor(js.Math.random() * 6) + 1
dice2 = math.floor(js.Math.random() * 6) + 1
result = dice1 + dice2

def run(guess):
    guess = guess.lower().strip()
    if guess not in ("high", "low"):
        return "Type 'high' or 'low' only"
    if (result > 6 and guess == "high") or (result <= 6 and guess == "low"):
        return f"Correct! Rolled {dice1} + {dice2} = {result}"
    else:
        return f"Wrong! Rolled {dice1} + {dice2} = {result}"

`;

export default function DiceTemplate({ pyReady }) {
	const [guess, setGuess] = useState("");
	const [result, setResult] = useState(null);
	const [error, setError] = useState(null);
	const [running, setRunning] = useState(false);

	const accent = "#34d399";

	const handleRun = useCallback(async () => {
		setRunning(true);
		setError(null);
		setResult(null);
		try {
			const out = await runTemplate(PYTHON, [guess]);
			setResult(out);
		} catch (e) {
			setError(e.message);
		} finally {
			setRunning(false);
		}
	}, [guess]);

	return (
		<TemplateShell
			accent={accent}
			icon="🎲"
			title="Dice High or Low"
			filename="DiceTemplate.jsx"
		>
			<PyInput
				accent={accent}
				value={guess}
				onChange={setGuess}
				placeholder="Type 'high' or 'low'"
			/>
			<div style={{ marginTop: 12 }}>
				<RunButton
					accent={accent}
					onClick={handleRun}
					running={running}
					disabled={!pyReady}
				/>
			</div>
			<OutputBox accent={accent} value={result} error={error} />
		</TemplateShell>
	);
}
