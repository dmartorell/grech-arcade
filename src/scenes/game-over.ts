import type { Game } from "../engine/game";
import type { Scene } from "../engine/scene-manager";
import { COLORS, INTERNAL_WIDTH } from "../utils/constants";
import type { Storage } from "../utils/storage";

export class GameOverScene implements Scene {
	private cursorPos = 0;
	private finalScore = 0;
	private initials = ["A", "A", "A"];
	private isNewHighScore = false;
	private submitted = false;

	constructor(
		private game: Game,
		private getScore: () => number,
		private storage: Storage,
		private onRetry: () => void,
	) {}

	enter() {
		this.finalScore = this.getScore();
		this.initials = ["A", "A", "A"];
		this.cursorPos = 0;
		this.submitted = false;

		const data = this.storage.load();
		this.isNewHighScore =
			data.highScores.length < 10 || this.finalScore > (data.highScores.at(-1)?.score ?? 0);
	}

	update() {
		if (this.submitted) {
			if (this.game.input.justPressed("Space") || this.game.input.justPressed("Enter")) {
				this.onRetry();
			}
			return;
		}

		if (!this.isNewHighScore) {
			if (this.game.input.justPressed("Space") || this.game.input.justPressed("Enter")) {
				this.onRetry();
			}
			return;
		}

		if (this.game.input.justPressed("ArrowUp")) {
			const code = this.initials[this.cursorPos].charCodeAt(0);
			this.initials[this.cursorPos] = String.fromCharCode(code >= 90 ? 65 : code + 1);
		}
		if (this.game.input.justPressed("ArrowDown")) {
			const code = this.initials[this.cursorPos].charCodeAt(0);
			this.initials[this.cursorPos] = String.fromCharCode(code <= 65 ? 90 : code - 1);
		}
		if (this.game.input.justPressed("ArrowRight")) {
			this.cursorPos = Math.min(2, this.cursorPos + 1);
		}
		if (this.game.input.justPressed("ArrowLeft")) {
			this.cursorPos = Math.max(0, this.cursorPos - 1);
		}

		if (this.game.input.justPressed("Enter") || this.game.input.justPressed("Space")) {
			const data = this.storage.load();
			this.storage.addHighScore(data, this.initials.join(""), this.finalScore);
			this.storage.save(data);
			this.submitted = true;
		}
	}

	render() {
		const r = this.game.renderer;
		r.clear(COLORS.bg);

		r.drawText("GAME OVER", INTERNAL_WIDTH / 2, 30, COLORS.player, 20, "center");
		r.drawText(
			`FINAL SCORE: ${this.finalScore}`,
			INTERNAL_WIDTH / 2,
			70,
			COLORS.text,
			12,
			"center",
		);

		if (this.isNewHighScore && !this.submitted) {
			r.drawText("NEW HIGH SCORE!", INTERNAL_WIDTH / 2, 100, "#ffd700", 10, "center");
			r.drawText("ENTER INITIALS:", INTERNAL_WIDTH / 2, 120, COLORS.text, 8, "center");

			for (let i = 0; i < 3; i++) {
				const x = INTERNAL_WIDTH / 2 - 24 + i * 24;
				const color = i === this.cursorPos ? COLORS.player : COLORS.text;
				r.drawText(this.initials[i], x, 140, color, 16);
			}

			r.drawText(
				"UP/DOWN: change  LEFT/RIGHT: move  SPACE: confirm",
				INTERNAL_WIDTH / 2,
				170,
				"#888",
				6,
				"center",
			);
		} else {
			const data = this.storage.load();
			r.drawText("HIGH SCORES", INTERNAL_WIDTH / 2, 100, COLORS.text, 10, "center");
			for (let i = 0; i < Math.min(data.highScores.length, 10); i++) {
				const entry = data.highScores[i];
				r.drawText(
					`${(i + 1).toString().padStart(2, " ")}. ${entry.initials} - ${entry.score}`,
					INTERNAL_WIDTH / 2,
					118 + i * 12,
					i === 0 ? "#ffd700" : COLORS.text,
					8,
					"center",
				);
			}

			r.drawText("OTRA VEZ? PRESS SPACE", INTERNAL_WIDTH / 2, 210, "#888", 8, "center");
		}
	}

	exit() {}
}
