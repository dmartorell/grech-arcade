import { Game } from "./engine/game";
import { testLevel, testLevelObjects } from "./levels/test-level";
import { GameOverScene } from "./scenes/game-over";
import { LevelScene } from "./scenes/level";
import { LevelSelectScene } from "./scenes/level-select";
import { ReceptionScene } from "./scenes/reception";
import type { ReceptionResult } from "./scenes/reception";
import { ScoreScene } from "./scenes/score";
import { TitleScene } from "./scenes/title";
import { Storage } from "./utils/storage";

const canvas = document.getElementById("game") as HTMLCanvasElement;
const game = new Game(canvas);
const storage = new Storage();

let currentLevelIndex = 0;
let lastLevelScore = 0;
let lastReceptionResult: ReceptionResult = "miss";
let sessionScore = 0;

const LEVEL_UNLOCKS: string[][] = [
	["lateral", "voltereta"],
	["equilibrio", "spagat"],
	["puente", "rondada"],
	["paloma"],
];

const saveData = storage.load();

const title = new TitleScene(game, () => {
	game.scenes.switchTo("level-select");
});

const levelSelect = new LevelSelectScene(game, saveData.levelsCompleted, (index) => {
	currentLevelIndex = index;
	lastLevelScore = 0;
	game.scenes.switchTo("level");
});

const level = new LevelScene(game, testLevel, testLevelObjects, (score) => {
	lastLevelScore = score;
	game.scenes.switchTo("reception");
});

const reception = new ReceptionScene(game, currentLevelIndex, (result) => {
	lastReceptionResult = result;
	game.scenes.switchTo("score");
});

const score = new ScoreScene(
	game,
	() => ({
		baseScore: lastLevelScore,
		levelIndex: currentLevelIndex,
		receptionResult: lastReceptionResult,
		timeBonus: 0,
		unlockedMoves: LEVEL_UNLOCKS[currentLevelIndex] ?? [],
	}),
	(totalScore) => {
		sessionScore += totalScore;
		saveData.levelsCompleted[currentLevelIndex] = true;
		storage.save(saveData);

		const allDone = saveData.levelsCompleted.every((c) => c);
		if (allDone) {
			game.scenes.switchTo("game-over");
		} else {
			game.scenes.switchTo("level-select");
		}
	},
);

const gameOver = new GameOverScene(
	game,
	() => sessionScore,
	storage,
	() => {
		sessionScore = 0;
		game.scenes.switchTo("title");
	},
);

game.scenes.register("game-over", gameOver);
game.scenes.register("level", level);
game.scenes.register("level-select", levelSelect);
game.scenes.register("reception", reception);
game.scenes.register("score", score);
game.scenes.register("title", title);

game.start("title");
