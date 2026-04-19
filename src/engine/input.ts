export class Input {
	private keys: Set<string> = new Set();
	private pressed: Set<string> = new Set();
	private released: Set<string> = new Set();

	isDown(key: string): boolean {
		return this.keys.has(key);
	}

	justPressed(key: string): boolean {
		return this.pressed.has(key);
	}

	justReleased(key: string): boolean {
		return this.released.has(key);
	}

	handleKeyDown(key: string) {
		if (!this.keys.has(key)) {
			this.pressed.add(key);
		}
		this.keys.add(key);
	}

	handleKeyUp(key: string) {
		this.keys.delete(key);
		this.released.add(key);
	}

	update() {
		this.pressed.clear();
		this.released.clear();
	}

	bind(target: EventTarget) {
		target.addEventListener("keydown", (e) => {
			const ke = e as KeyboardEvent;
			ke.preventDefault();
			this.handleKeyDown(ke.code);
		});
		target.addEventListener("keyup", (e) => {
			const ke = e as KeyboardEvent;
			this.handleKeyUp(ke.code);
		});
	}
}
