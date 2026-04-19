import type { Game } from "../engine/game";
import type { Scene } from "../engine/scene-manager";
import { COLORS, INTERNAL_WIDTH } from "../utils/constants";
import type { ReceptionResult } from "./reception";

export interface ScoreData {
	baseScore: number;
	levelIndex: number;
	receptionResult: ReceptionResult;
	timeBonus: number;
	unlockedMoves: string[];
}

const RECEPTION_BONUS: Record<ReceptionResult, number> = {
	good: 1000,
	miss: 0,
	perfect: 2000,
};

export class ScoreScene implements Scene {
	private data!: ScoreData;
	private totalScore = 0;

	constructor(
		private game: Game,
		private getData: () => ScoreData,
		private onContinue: (totalScore: number) => void,
	) {}

	enter() {
		this.data = this.getData();
		this.totalScore =
			this.data.baseScore + this.data.timeBonus + RECEPTION_BONUS[this.data.receptionResult];
	}

	update() {
		if (this.game.input.justPressed("Space") || this.game.input.justPressed("Enter")) {
			this.onContinue(this.totalScore);
		}
	}

	render() {
		const r = this.game.renderer;
		r.clear(COLORS.bg);

		const LEVEL_NAMES = ["Suelo", "Barra de equilibrio", "Barras asimetricas", "Salto de potro"];
		r.drawText(
			`LEVEL ${this.data.levelIndex + 1}: ${LEVEL_NAMES[this.data.levelIndex]}`,
			INTERNAL_WIDTH / 2,
			20,
			COLORS.text,
			12,
			"center",
		);

		r.drawText(`Score: ${this.data.baseScore}`, 60, 60, COLORS.text, 10);
		r.drawText(`Time bonus: ${this.data.timeBonus}`, 60, 80, COLORS.text, 10);
		r.drawText(
			`Reception: ${this.data.receptionResult.toUpperCase()} (+${RECEPTION_BONUS[this.data.receptionResult]})`,
			60,
			100,
			COLORS.text,
			10,
		);
		r.drawText(`TOTAL: ${this.totalScore}`, 60, 130, COLORS.player, 14);

		if (this.data.unlockedMoves.length > 0) {
			r.drawText("NEW MOVES UNLOCKED!", INTERNAL_WIDTH / 2, 160, "#ffd700", 10, "center");
			for (let i = 0; i < this.data.unlockedMoves.length; i++) {
				r.drawText(
					`+ ${this.data.unlockedMoves[i]}`,
					INTERNAL_WIDTH / 2,
					178 + i * 14,
					"#6f6",
					8,
					"center",
				);
			}
		}

		r.drawText("PRESS SPACE TO CONTINUE", INTERNAL_WIDTH / 2, 210, "#888", 8, "center");
	}

	exit() {}
}
