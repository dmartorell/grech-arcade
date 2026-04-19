import { Game } from "./engine/game";
import type { Scene } from "./engine/scene-manager";
import { COLORS, INTERNAL_HEIGHT, INTERNAL_WIDTH } from "./utils/constants";

const canvas = document.getElementById("game") as HTMLCanvasElement;
const game = new Game(canvas);

const placeholder: Scene = {
	enter() {},
	update() {},
	render() {
		game.renderer.clear(COLORS.bg);
		game.renderer.drawText(
			"GRECH ARCADE",
			INTERNAL_WIDTH / 2,
			INTERNAL_HEIGHT / 2 - 8,
			COLORS.text,
			16,
			"center",
		);
	},
	exit() {},
};

game.scenes.register("placeholder", placeholder);
game.start("placeholder");
