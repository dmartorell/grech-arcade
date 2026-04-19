import { Game } from "./engine/game";
import { testLevel } from "./levels/test-level";
import { LevelScene } from "./scenes/level";

const canvas = document.getElementById("game") as HTMLCanvasElement;
const game = new Game(canvas);

const levelScene = new LevelScene(game, testLevel);
game.scenes.register("level", levelScene);
game.start("level");
