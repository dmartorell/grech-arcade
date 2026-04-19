import { FIXED_DT } from "../utils/constants";
import { Input } from "./input";
import { Renderer } from "./renderer";
import { SceneManager } from "./scene-manager";

export class Game {
	readonly input: Input;
	readonly renderer: Renderer;
	readonly scenes: SceneManager;
	private accumulator = 0;
	private lastTime = 0;
	private running = false;

	constructor(canvas: HTMLCanvasElement) {
		this.input = new Input();
		this.renderer = new Renderer(canvas);
		this.scenes = new SceneManager();
		this.input.bind(window);
		window.addEventListener("resize", () => this.renderer.resize());
		this.renderer.resize();
	}

	start(initialScene: string) {
		this.scenes.switchTo(initialScene);
		this.running = true;
		this.lastTime = performance.now();
		requestAnimationFrame((t) => this.loop(t));
	}

	private loop(time: number) {
		if (!this.running) return;

		const dt = Math.min((time - this.lastTime) / 1000, 0.1);
		this.lastTime = time;
		this.accumulator += dt;

		while (this.accumulator >= FIXED_DT) {
			this.scenes.update();
			this.input.update();
			this.accumulator -= FIXED_DT;
		}

		this.scenes.render();
		requestAnimationFrame((t) => this.loop(t));
	}
}
