export interface Scene {
	enter(): void;
	update(): void;
	render(): void;
	exit(): void;
}

export class SceneManager {
	private current: Scene | null = null;
	private scenes: Map<string, Scene> = new Map();

	register(name: string, scene: Scene) {
		this.scenes.set(name, scene);
	}

	switchTo(name: string) {
		const next = this.scenes.get(name);
		if (!next) throw new Error(`Scene "${name}" not registered`);
		this.current?.exit();
		this.current = next;
		this.current.enter();
	}

	update() {
		this.current?.update();
	}

	render() {
		this.current?.render();
	}
}
