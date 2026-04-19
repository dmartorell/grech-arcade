import type { Game } from "../engine/game";
import type { Scene } from "../engine/scene-manager";
import { COLORS, INTERNAL_WIDTH } from "../utils/constants";

const LEVEL_NAMES = ["Suelo", "Barra de equilibrio", "Barras asimetricas", "Salto de potro"];

export class LevelSelectScene implements Scene {
	private selected = 0;

	constructor(
		private game: Game,
		private levelsCompleted: boolean[],
		private onSelect: (levelIndex: number) => void,
	) {}

	enter() {
		this.selected = 0;
	}

	update() {
		if (this.game.input.justPressed("ArrowDown") || this.game.input.justPressed("ArrowRight")) {
			this.selected = Math.min(3, this.selected + 1);
		}
		if (this.game.input.justPressed("ArrowUp") || this.game.input.justPressed("ArrowLeft")) {
			this.selected = Math.max(0, this.selected - 1);
		}

		if (this.game.input.justPressed("Space") || this.game.input.justPressed("Enter")) {
			if (this.isUnlocked(this.selected)) {
				this.onSelect(this.selected);
			}
		}
	}

	private isUnlocked(index: number): boolean {
		if (index === 0) return true;
		return this.levelsCompleted[index - 1] ?? false;
	}

	render() {
		const r = this.game.renderer;
		r.clear(COLORS.bg);

		r.drawText("SELECT LEVEL", INTERNAL_WIDTH / 2, 20, COLORS.text, 14, "center");

		for (let i = 0; i < 4; i++) {
			const y = 60 + i * 40;
			const unlocked = this.isUnlocked(i);
			const selected = i === this.selected;
			const color = !unlocked ? "#555" : selected ? COLORS.player : COLORS.text;
			const prefix = selected ? "> " : "  ";
			const suffix = !unlocked ? " [LOCKED]" : this.levelsCompleted[i] ? " [DONE]" : "";

			r.drawText(`${prefix}${i + 1}. ${LEVEL_NAMES[i]}${suffix}`, 40, y, color, 10);
		}
	}

	exit() {}
}
