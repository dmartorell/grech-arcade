import type { Game } from "../engine/game";
import type { Scene } from "../engine/scene-manager";
import { COLORS, INTERNAL_WIDTH } from "../utils/constants";
import type { SaveData } from "../utils/storage";

const HAIR_OPTIONS = ["braids", "bun", "default", "short"];
const OUTFIT_OPTIONS = ["default", "malla-azul", "malla-roja", "sudadera"];

export class CustomizeScene implements Scene {
	private hairIndex = 0;
	private outfitIndex = 0;
	private row = 0;

	constructor(
		private game: Game,
		private saveData: SaveData,
		private onDone: () => void,
	) {}

	enter() {
		this.row = 0;
		this.hairIndex = Math.max(0, HAIR_OPTIONS.indexOf(this.saveData.equippedCosmetics.hair));
		this.outfitIndex = Math.max(0, OUTFIT_OPTIONS.indexOf(this.saveData.equippedCosmetics.outfit));
	}

	update() {
		if (this.game.input.justPressed("ArrowUp")) this.row = Math.max(0, this.row - 1);
		if (this.game.input.justPressed("ArrowDown")) this.row = Math.min(1, this.row + 1);

		if (this.row === 0) {
			if (this.game.input.justPressed("ArrowRight"))
				this.hairIndex = (this.hairIndex + 1) % HAIR_OPTIONS.length;
			if (this.game.input.justPressed("ArrowLeft"))
				this.hairIndex = (this.hairIndex - 1 + HAIR_OPTIONS.length) % HAIR_OPTIONS.length;
		} else {
			if (this.game.input.justPressed("ArrowRight"))
				this.outfitIndex = (this.outfitIndex + 1) % OUTFIT_OPTIONS.length;
			if (this.game.input.justPressed("ArrowLeft"))
				this.outfitIndex = (this.outfitIndex - 1 + OUTFIT_OPTIONS.length) % OUTFIT_OPTIONS.length;
		}

		if (this.game.input.justPressed("Space") || this.game.input.justPressed("Enter")) {
			this.saveData.equippedCosmetics.hair = HAIR_OPTIONS[this.hairIndex];
			this.saveData.equippedCosmetics.outfit = OUTFIT_OPTIONS[this.outfitIndex];
			this.onDone();
		}
	}

	render() {
		const r = this.game.renderer;
		r.clear(COLORS.bg);

		r.drawText("CUSTOMIZE CHARLIE", INTERNAL_WIDTH / 2, 20, COLORS.text, 12, "center");

		const hairColor = this.row === 0 ? COLORS.player : COLORS.text;
		r.drawText(
			`< HAIR: ${HAIR_OPTIONS[this.hairIndex]} >`,
			INTERNAL_WIDTH / 2,
			80,
			hairColor,
			10,
			"center",
		);

		const outfitColor = this.row === 1 ? COLORS.player : COLORS.text;
		r.drawText(
			`< OUTFIT: ${OUTFIT_OPTIONS[this.outfitIndex]} >`,
			INTERNAL_WIDTH / 2,
			110,
			outfitColor,
			10,
			"center",
		);

		r.fillRect(INTERNAL_WIDTH / 2 - 16, 140, 32, 32, COLORS.player);

		r.drawText("SPACE TO CONFIRM", INTERNAL_WIDTH / 2, 200, "#888", 8, "center");
	}

	exit() {}
}
