import type { Game } from "../engine/game";
import type { Scene } from "../engine/scene-manager";
import { COLORS, INTERNAL_WIDTH } from "../utils/constants";

export class TitleScene implements Scene {
	private blinkTimer = 0;
	private showText = true;

	constructor(
		private game: Game,
		private onStart: () => void,
	) {}

	enter() {
		this.blinkTimer = 0;
		this.showText = true;
	}

	update() {
		this.blinkTimer++;
		if (this.blinkTimer >= 30) {
			this.blinkTimer = 0;
			this.showText = !this.showText;
		}

		if (this.game.input.justPressed("Space") || this.game.input.justPressed("Enter")) {
			this.onStart();
		}
	}

	render() {
		const r = this.game.renderer;
		r.clear(COLORS.bg);

		r.drawText("GRECH ARCADE", INTERNAL_WIDTH / 2, 70, COLORS.player, 24, "center");

		if (this.showText) {
			r.drawText("PRESS START", INTERNAL_WIDTH / 2, 150, COLORS.text, 10, "center");
		}

		r.drawText(
			"Arrow keys: move  |  Space: jump  |  Z: special",
			INTERNAL_WIDTH / 2,
			200,
			"#888",
			6,
			"center",
		);
	}

	exit() {}
}
