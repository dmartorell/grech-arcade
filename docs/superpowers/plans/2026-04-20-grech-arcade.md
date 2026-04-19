# Grech Arcade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a side-scroller platformer arcade game with pixel art, 4 gymnastic-themed levels, unlockable special moves, collectibles, and customization — playable in a browser.

**Architecture:** TypeScript game engine using Canvas 2D with fixed timestep (60 UPS), tile-based levels from Tiled JSON, AABB collision detection, scene-based state management, and LocalStorage persistence. Audio deferred to end.

**Tech Stack:** TypeScript, Bun (build + serve + test), Biome (lint + format), Canvas 2D API, Tiled (level editor)

---

## File Structure

```
grech-arcade/
├── index.html                    ← Host page, loads dist/main.js
├── biome.json                    ← Biome config
├── tsconfig.json                 ← TypeScript config
├── package.json                  ← Bun scripts
├── src/
│   ├── main.ts                   ← Entry point: init canvas, start game loop
│   ├── engine/
│   │   ├── game.ts               ← Game class: fixed timestep loop, global state
│   │   ├── input.ts              ← Keyboard input tracker (pressed/justPressed/released)
│   │   ├── renderer.ts           ← Canvas wrapper: draw sprites, tiles, rects, text
│   │   ├── camera.ts             ← Dead zone camera with lerp + edge clamping
│   │   ├── physics.ts            ← Gravity, tile collision resolution, AABB helpers
│   │   ├── scene-manager.ts      ← Scene registry + transitions (enter/update/render/exit)
│   │   └── audio.ts              ← Stub: interface only, no implementation
│   ├── entities/
│   │   ├── player.ts             ← Charlie: states, physics, special moves, animation
│   │   ├── obstacle.ts           ← Fixed + mobile obstacles with AABB
│   │   └── collectible.ts        ← Medals, power-ups, cosmetics with AABB
│   ├── scenes/
│   │   ├── title.ts              ← "GRECH ARCADE" + "PRESS START" blinking
│   │   ├── customize.ts          ← Cosmetic picker (hair/outfit)
│   │   ├── level-select.ts       ← 4 levels, locked/unlocked state
│   │   ├── level.ts              ← Main gameplay scene
│   │   ├── reception.ts          ← Oscillating precision bar
│   │   ├── score.ts              ← Points breakdown + unlocks
│   │   └── game-over.ts          ← Final score + high score entry + retry
│   ├── levels/
│   │   ├── loader.ts             ← Parse Tiled JSON into runtime level data
│   │   └── test-level.ts         ← Hardcoded test level (before Tiled)
│   └── utils/
│       ├── sprite.ts             ← Sprite sheet loader + frame animation
│       ├── storage.ts            ← LocalStorage save/load with SaveData type
│       └── constants.ts          ← Game-wide constants (resolution, physics, colors)
├── tests/
│   ├── engine/
│   │   ├── input.test.ts
│   │   ├── physics.test.ts
│   │   ├── camera.test.ts
│   │   └── scene-manager.test.ts
│   ├── entities/
│   │   └── player.test.ts
│   ├── scenes/
│   │   └── reception.test.ts
│   └── utils/
│       ├── storage.test.ts
│       └── sprite.test.ts
├── dist/                          ← Generated bundle
├── assets/
│   ├── sprites/
│   ├── tiles/
│   ├── audio/
│   └── ui/
├── levels/                        ← Tiled JSON exports
└── css/
    └── style.css                  ← Canvas centering + background
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `biome.json`
- Create: `index.html`
- Create: `css/style.css`
- Create: `src/utils/constants.ts`
- Create: `src/main.ts`

- [ ] **Step 1: Initialize Bun project**

```bash
cd /Volumes/T7_SAMSUNG/grech-arcade
bun init -y
```

- [ ] **Step 2: Replace package.json with game config**

```json
{
  "name": "grech-arcade",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "bun build src/main.ts --outdir dist --watch & bun --serve .",
    "build": "bun build src/main.ts --outdir dist",
    "lint": "bunx @biomejs/biome check src/",
    "format": "bunx @biomejs/biome format --write src/",
    "test": "bun test"
  },
  "devDependencies": {
    "@biomejs/biome": "^1.9.0"
  }
}
```

- [ ] **Step 3: Install dependencies**

```bash
bun install
```

- [ ] **Step 4: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "types": ["bun-types"]
  },
  "include": ["src/**/*.ts", "tests/**/*.ts"]
}
```

- [ ] **Step 5: Create biome.json**

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.0/schema.json",
  "organizeImports": { "enabled": true },
  "linter": {
    "enabled": true,
    "rules": { "recommended": true }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "tab",
    "lineWidth": 100
  }
}
```

- [ ] **Step 6: Create src/utils/constants.ts**

```ts
export const INTERNAL_WIDTH = 400;
export const INTERNAL_HEIGHT = 225;
export const TILE_SIZE = 32;
export const UPS = 60;
export const FIXED_DT = 1 / UPS;

export const GRAVITY = 980;
export const GRAVITY_DOWN_MULT = 1.8;
export const JUMP_VELOCITY = -340;
export const JUMP_CUT_MULT = 0.4;
export const MOVE_SPEED = 120;
export const COYOTE_FRAMES = 5;
export const JUMP_BUFFER_FRAMES = 5;

export const PLAYER_WIDTH = 20;
export const PLAYER_HEIGHT = 28;
export const SPRITE_SIZE = 32;

export const COLORS = {
	bg: "#2a1f3d",
	floor: "#6ec6c8",
	player: "#e8a84c",
	hair: "#C4944A",
	collectible: "#ffd700",
	text: "#ffffff",
	uiBg: "#1a1028",
};
```

- [ ] **Step 7: Create index.html**

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Grech Arcade</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <canvas id="game"></canvas>
  <script src="dist/main.js"></script>
</body>
</html>
```

- [ ] **Step 8: Create css/style.css**

```css
* {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
}

body {
	background: #1a1028;
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100vh;
	overflow: hidden;
}

canvas {
	image-rendering: pixelated;
	image-rendering: crisp-edges;
}
```

- [ ] **Step 9: Create src/main.ts (minimal — canvas + color fill)**

```ts
import { INTERNAL_WIDTH, INTERNAL_HEIGHT, COLORS } from "./utils/constants";

const canvas = document.getElementById("game") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

canvas.width = INTERNAL_WIDTH;
canvas.height = INTERNAL_HEIGHT;

function resize() {
	const scaleX = Math.floor(window.innerWidth / INTERNAL_WIDTH);
	const scaleY = Math.floor(window.innerHeight / INTERNAL_HEIGHT);
	const scale = Math.max(1, Math.min(scaleX, scaleY));
	canvas.style.width = `${INTERNAL_WIDTH * scale}px`;
	canvas.style.height = `${INTERNAL_HEIGHT * scale}px`;
}

window.addEventListener("resize", resize);
resize();

ctx.imageSmoothingEnabled = false;
ctx.fillStyle = COLORS.bg;
ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);

ctx.fillStyle = COLORS.text;
ctx.font = "16px monospace";
ctx.textAlign = "center";
ctx.fillText("GRECH ARCADE", INTERNAL_WIDTH / 2, INTERNAL_HEIGHT / 2);
```

- [ ] **Step 10: Build and verify**

```bash
bun run build
```

Open `index.html` via `bun --serve .` at `http://localhost:3000` — you should see a dark purple background with "GRECH ARCADE" centered in white.

- [ ] **Step 11: Run lint**

```bash
bun run lint
```

Expected: No errors.

- [ ] **Step 12: Commit**

```bash
git add package.json bun.lockb tsconfig.json biome.json index.html css/style.css src/utils/constants.ts src/main.ts
git commit -m "feat: scaffold project with Bun, TypeScript, Biome, and canvas"
```

---

## Task 2: Input System

**Files:**
- Create: `src/engine/input.ts`
- Create: `tests/engine/input.test.ts`

- [ ] **Step 1: Write failing tests for Input**

```ts
// tests/engine/input.test.ts
import { describe, test, expect, beforeEach } from "bun:test";
import { Input } from "../../src/engine/input";

describe("Input", () => {
	let input: Input;

	beforeEach(() => {
		input = new Input();
	});

	test("key is not pressed by default", () => {
		expect(input.isDown("ArrowLeft")).toBe(false);
	});

	test("key registers as pressed after keydown", () => {
		input.handleKeyDown("ArrowLeft");
		expect(input.isDown("ArrowLeft")).toBe(true);
	});

	test("key registers as released after keyup", () => {
		input.handleKeyDown("ArrowLeft");
		input.handleKeyUp("ArrowLeft");
		expect(input.isDown("ArrowLeft")).toBe(false);
	});

	test("justPressed is true only for one update cycle", () => {
		input.handleKeyDown("Space");
		expect(input.justPressed("Space")).toBe(true);
		input.update();
		expect(input.justPressed("Space")).toBe(false);
	});

	test("justReleased is true only for one update cycle", () => {
		input.handleKeyDown("Space");
		input.handleKeyUp("Space");
		expect(input.justReleased("Space")).toBe(true);
		input.update();
		expect(input.justReleased("Space")).toBe(false);
	});
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
bun test tests/engine/input.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement Input class**

```ts
// src/engine/input.ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
bun test tests/engine/input.test.ts
```

Expected: 5/5 PASS.

- [ ] **Step 5: Commit**

```bash
git add src/engine/input.ts tests/engine/input.test.ts
git commit -m "feat: add input system with justPressed/justReleased tracking"
```

---

## Task 3: Scene Manager

**Files:**
- Create: `src/engine/scene-manager.ts`
- Create: `tests/engine/scene-manager.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// tests/engine/scene-manager.test.ts
import { describe, test, expect, beforeEach } from "bun:test";
import { SceneManager } from "../../src/engine/scene-manager";
import type { Scene } from "../../src/engine/scene-manager";

function mockScene(log: string[]): Scene {
	return {
		enter: () => log.push("enter"),
		update: () => log.push("update"),
		render: () => log.push("render"),
		exit: () => log.push("exit"),
	};
}

describe("SceneManager", () => {
	let sm: SceneManager;
	let logA: string[];
	let logB: string[];

	beforeEach(() => {
		sm = new SceneManager();
		logA = [];
		logB = [];
		sm.register("a", mockScene(logA));
		sm.register("b", mockScene(logB));
	});

	test("switchTo calls enter on new scene", () => {
		sm.switchTo("a");
		expect(logA).toEqual(["enter"]);
	});

	test("switchTo calls exit on current before enter on new", () => {
		sm.switchTo("a");
		sm.switchTo("b");
		expect(logA).toEqual(["enter", "exit"]);
		expect(logB).toEqual(["enter"]);
	});

	test("update and render forward to current scene", () => {
		sm.switchTo("a");
		logA.length = 0;
		sm.update();
		sm.render();
		expect(logA).toEqual(["update", "render"]);
	});

	test("update and render are no-ops with no current scene", () => {
		sm.update();
		sm.render();
	});
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
bun test tests/engine/scene-manager.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement SceneManager**

```ts
// src/engine/scene-manager.ts
export interface Scene {
	enter(): void;
	update(): void;
	render(): void;
	exit(): void;
}

export class SceneManager {
	private scenes: Map<string, Scene> = new Map();
	private current: Scene | null = null;

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
```

- [ ] **Step 4: Run tests**

```bash
bun test tests/engine/scene-manager.test.ts
```

Expected: 4/4 PASS.

- [ ] **Step 5: Commit**

```bash
git add src/engine/scene-manager.ts tests/engine/scene-manager.test.ts
git commit -m "feat: add scene manager with enter/update/render/exit lifecycle"
```

---

## Task 4: Renderer

**Files:**
- Create: `src/engine/renderer.ts`

- [ ] **Step 1: Implement Renderer class**

This wraps the Canvas 2D context with game-specific drawing methods. No unit tests here — rendering is verified visually.

```ts
// src/engine/renderer.ts
import { INTERNAL_WIDTH, INTERNAL_HEIGHT, TILE_SIZE } from "../utils/constants";

export class Renderer {
	readonly canvas: HTMLCanvasElement;
	readonly ctx: CanvasRenderingContext2D;

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		this.ctx = canvas.getContext("2d")!;
		canvas.width = INTERNAL_WIDTH;
		canvas.height = INTERNAL_HEIGHT;
		this.ctx.imageSmoothingEnabled = false;
	}

	clear(color: string) {
		this.ctx.fillStyle = color;
		this.ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);
	}

	fillRect(x: number, y: number, w: number, h: number, color: string) {
		this.ctx.fillStyle = color;
		this.ctx.fillRect(Math.round(x), Math.round(y), w, h);
	}

	drawSprite(
		img: HTMLImageElement,
		sx: number,
		sy: number,
		sw: number,
		sh: number,
		dx: number,
		dy: number,
		dw: number,
		dh: number,
		flipX = false,
	) {
		this.ctx.save();
		if (flipX) {
			this.ctx.translate(Math.round(dx) + dw, Math.round(dy));
			this.ctx.scale(-1, 1);
			this.ctx.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh);
		} else {
			this.ctx.drawImage(img, sx, sy, sw, sh, Math.round(dx), Math.round(dy), dw, dh);
		}
		this.ctx.restore();
	}

	drawText(text: string, x: number, y: number, color: string, size = 8, align: CanvasTextAlign = "left") {
		this.ctx.fillStyle = color;
		this.ctx.font = `${size}px monospace`;
		this.ctx.textAlign = align;
		this.ctx.textBaseline = "top";
		this.ctx.fillText(text, Math.round(x), Math.round(y));
	}

	drawTile(
		img: HTMLImageElement,
		tileId: number,
		tilesPerRow: number,
		dx: number,
		dy: number,
	) {
		const sx = (tileId % tilesPerRow) * TILE_SIZE;
		const sy = Math.floor(tileId / tilesPerRow) * TILE_SIZE;
		this.ctx.drawImage(img, sx, sy, TILE_SIZE, TILE_SIZE, Math.round(dx), Math.round(dy), TILE_SIZE, TILE_SIZE);
	}

	resize() {
		const scaleX = Math.floor(window.innerWidth / INTERNAL_WIDTH);
		const scaleY = Math.floor(window.innerHeight / INTERNAL_HEIGHT);
		const scale = Math.max(1, Math.min(scaleX, scaleY));
		this.canvas.style.width = `${INTERNAL_WIDTH * scale}px`;
		this.canvas.style.height = `${INTERNAL_HEIGHT * scale}px`;
	}
}
```

- [ ] **Step 2: Commit**

```bash
git add src/engine/renderer.ts
git commit -m "feat: add renderer with sprite, tile, rect, and text drawing"
```

---

## Task 5: Game Loop

**Files:**
- Create: `src/engine/game.ts`
- Modify: `src/main.ts`

- [ ] **Step 1: Implement Game class with fixed timestep**

```ts
// src/engine/game.ts
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
```

- [ ] **Step 2: Update main.ts to use Game class**

Replace the entire contents of `src/main.ts`:

```ts
// src/main.ts
import { Game } from "./engine/game";
import { COLORS, INTERNAL_WIDTH, INTERNAL_HEIGHT } from "./utils/constants";
import type { Scene } from "./engine/scene-manager";

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
```

- [ ] **Step 3: Build and verify**

```bash
bun run build
```

Open in browser — should see "GRECH ARCADE" on purple background, now rendering every frame via the game loop.

- [ ] **Step 4: Commit**

```bash
git add src/engine/game.ts src/main.ts
git commit -m "feat: add game loop with fixed timestep at 60 UPS"
```

---

## Task 6: Physics System

**Files:**
- Create: `src/engine/physics.ts`
- Create: `tests/engine/physics.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// tests/engine/physics.test.ts
import { describe, test, expect } from "bun:test";
import { aabbOverlap, resolveTileCollisionsX, resolveTileCollisionsY } from "../../src/engine/physics";
import type { AABB } from "../../src/engine/physics";

describe("aabbOverlap", () => {
	test("detects overlapping boxes", () => {
		const a: AABB = { x: 0, y: 0, w: 10, h: 10 };
		const b: AABB = { x: 5, y: 5, w: 10, h: 10 };
		expect(aabbOverlap(a, b)).toBe(true);
	});

	test("returns false for non-overlapping boxes", () => {
		const a: AABB = { x: 0, y: 0, w: 10, h: 10 };
		const b: AABB = { x: 20, y: 20, w: 10, h: 10 };
		expect(aabbOverlap(a, b)).toBe(false);
	});

	test("returns false for touching edges (no overlap)", () => {
		const a: AABB = { x: 0, y: 0, w: 10, h: 10 };
		const b: AABB = { x: 10, y: 0, w: 10, h: 10 };
		expect(aabbOverlap(a, b)).toBe(false);
	});
});

describe("resolveTileCollisionsX", () => {
	const solidAt = (tx: number, ty: number) => {
		return tx === 3 && ty >= 0 && ty <= 5;
	};

	test("stops rightward movement into solid tile", () => {
		const result = resolveTileCollisionsX(90, 16, 20, 28, 32, solidAt);
		expect(result).toBeLessThanOrEqual(76);
	});

	test("allows movement when no solid tiles", () => {
		const noSolid = () => false;
		const result = resolveTileCollisionsX(90, 16, 20, 28, 32, noSolid);
		expect(result).toBe(90);
	});
});

describe("resolveTileCollisionsY", () => {
	const solidAt = (tx: number, ty: number) => {
		return ty === 3;
	};

	test("stops downward movement onto solid tile", () => {
		const result = resolveTileCollisionsY(16, 90, 20, 28, 32, solidAt);
		expect(result).toBeLessThanOrEqual(68);
	});

	test("returns grounded=true when landing on tile", () => {
		const result = resolveTileCollisionsY(16, 90, 20, 28, 32, solidAt);
		expect(result).toBeLessThanOrEqual(68);
	});
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
bun test tests/engine/physics.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement physics**

```ts
// src/engine/physics.ts
export interface AABB {
	x: number;
	y: number;
	w: number;
	h: number;
}

export function aabbOverlap(a: AABB, b: AABB): boolean {
	return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

type SolidCheck = (tileX: number, tileY: number) => boolean;

export function resolveTileCollisionsX(
	x: number,
	y: number,
	w: number,
	h: number,
	tileSize: number,
	isSolid: SolidCheck,
): number {
	const top = Math.floor(y / tileSize);
	const bottom = Math.floor((y + h - 1) / tileSize);
	const right = Math.floor((x + w - 1) / tileSize);
	const left = Math.floor(x / tileSize);

	for (let ty = top; ty <= bottom; ty++) {
		if (isSolid(right, ty)) {
			x = right * tileSize - w;
		}
		if (isSolid(left, ty)) {
			x = (left + 1) * tileSize;
		}
	}
	return x;
}

export interface TileCollisionResultY {
	y: number;
	grounded: boolean;
	hitCeiling: boolean;
}

export function resolveTileCollisionsY(
	x: number,
	y: number,
	w: number,
	h: number,
	tileSize: number,
	isSolid: SolidCheck,
): TileCollisionResultY {
	let grounded = false;
	let hitCeiling = false;
	const left = Math.floor(x / tileSize);
	const right = Math.floor((x + w - 1) / tileSize);
	const bottom = Math.floor((y + h - 1) / tileSize);
	const top = Math.floor(y / tileSize);

	for (let tx = left; tx <= right; tx++) {
		if (isSolid(tx, bottom)) {
			y = bottom * tileSize - h;
			grounded = true;
		}
		if (isSolid(tx, top)) {
			y = (top + 1) * tileSize;
			hitCeiling = true;
		}
	}
	return { y, grounded, hitCeiling };
}
```

- [ ] **Step 4: Update tests to match new return type for Y**

The `resolveTileCollisionsY` tests need updating since the function returns an object now:

```ts
// Update the resolveTileCollisionsY tests in tests/engine/physics.test.ts
describe("resolveTileCollisionsY", () => {
	const solidAt = (tx: number, ty: number) => {
		return ty === 3;
	};

	test("stops downward movement onto solid tile", () => {
		const result = resolveTileCollisionsY(16, 90, 20, 28, 32, solidAt);
		expect(result.y).toBeLessThanOrEqual(68);
	});

	test("returns grounded=true when landing on tile", () => {
		const result = resolveTileCollisionsY(16, 90, 20, 28, 32, solidAt);
		expect(result.grounded).toBe(true);
	});

	test("returns grounded=false when in air", () => {
		const noSolid = () => false;
		const result = resolveTileCollisionsY(16, 50, 20, 28, 32, noSolid);
		expect(result.grounded).toBe(false);
	});
});
```

- [ ] **Step 5: Run tests**

```bash
bun test tests/engine/physics.test.ts
```

Expected: All PASS.

- [ ] **Step 6: Commit**

```bash
git add src/engine/physics.ts tests/engine/physics.test.ts
git commit -m "feat: add physics with AABB overlap and tile collision resolution"
```

---

## Task 7: Camera System

**Files:**
- Create: `src/engine/camera.ts`
- Create: `tests/engine/camera.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// tests/engine/camera.test.ts
import { describe, test, expect, beforeEach } from "bun:test";
import { Camera } from "../../src/engine/camera";

describe("Camera", () => {
	let cam: Camera;

	beforeEach(() => {
		cam = new Camera(400, 225, 60, 40);
	});

	test("starts at 0,0", () => {
		expect(cam.x).toBe(0);
		expect(cam.y).toBe(0);
	});

	test("does not move when target is inside dead zone", () => {
		cam.follow(200, 112);
		expect(cam.x).toBe(0);
		expect(cam.y).toBe(0);
	});

	test("moves when target exits dead zone horizontally", () => {
		cam.follow(300, 112);
		cam.follow(300, 112);
		cam.follow(300, 112);
		expect(cam.x).toBeGreaterThan(0);
	});

	test("clamps to level bounds", () => {
		cam.setLevelSize(800, 450);
		cam.follow(700, 400);
		for (let i = 0; i < 200; i++) cam.follow(700, 400);
		expect(cam.x).toBeLessThanOrEqual(400);
		expect(cam.y).toBeLessThanOrEqual(225);
	});

	test("never goes negative", () => {
		cam.follow(-100, -100);
		for (let i = 0; i < 200; i++) cam.follow(-100, -100);
		expect(cam.x).toBeGreaterThanOrEqual(0);
		expect(cam.y).toBeGreaterThanOrEqual(0);
	});
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
bun test tests/engine/camera.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement Camera**

```ts
// src/engine/camera.ts
export class Camera {
	x = 0;
	y = 0;
	private levelW = Infinity;
	private levelH = Infinity;
	private lerp = 0.1;

	constructor(
		private viewW: number,
		private viewH: number,
		private deadZoneW: number,
		private deadZoneH: number,
	) {}

	setLevelSize(w: number, h: number) {
		this.levelW = w;
		this.levelH = h;
	}

	follow(targetX: number, targetY: number) {
		const screenX = targetX - this.x;
		const screenY = targetY - this.y;

		const dzLeft = (this.viewW - this.deadZoneW) / 2;
		const dzRight = dzLeft + this.deadZoneW;
		const dzTop = (this.viewH - this.deadZoneH) / 2;
		const dzBottom = dzTop + this.deadZoneH;

		let idealX = this.x;
		let idealY = this.y;

		if (screenX < dzLeft) idealX = targetX - dzLeft;
		if (screenX > dzRight) idealX = targetX - dzRight;
		if (screenY < dzTop) idealY = targetY - dzTop;
		if (screenY > dzBottom) idealY = targetY - dzBottom;

		this.x += (idealX - this.x) * this.lerp;
		this.y += (idealY - this.y) * this.lerp;

		this.x = Math.max(0, Math.min(this.x, this.levelW - this.viewW));
		this.y = Math.max(0, Math.min(this.y, this.levelH - this.viewH));
	}
}
```

- [ ] **Step 4: Run tests**

```bash
bun test tests/engine/camera.test.ts
```

Expected: All PASS.

- [ ] **Step 5: Commit**

```bash
git add src/engine/camera.ts tests/engine/camera.test.ts
git commit -m "feat: add camera with dead zone, lerp smoothing, and edge clamping"
```

---

## Task 8: Sprite System

**Files:**
- Create: `src/utils/sprite.ts`
- Create: `tests/utils/sprite.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// tests/utils/sprite.test.ts
import { describe, test, expect, beforeEach } from "bun:test";
import { Animation } from "../../src/utils/sprite";

describe("Animation", () => {
	let anim: Animation;

	beforeEach(() => {
		anim = new Animation([0, 1, 2, 3], 6);
	});

	test("starts at first frame", () => {
		expect(anim.currentFrame()).toBe(0);
	});

	test("advances to next frame after enough ticks", () => {
		for (let i = 0; i < 6; i++) anim.tick();
		expect(anim.currentFrame()).toBe(1);
	});

	test("loops back to first frame", () => {
		for (let i = 0; i < 24; i++) anim.tick();
		expect(anim.currentFrame()).toBe(0);
	});

	test("reset goes back to first frame", () => {
		for (let i = 0; i < 10; i++) anim.tick();
		anim.reset();
		expect(anim.currentFrame()).toBe(0);
	});

	test("non-looping animation stops at last frame", () => {
		const oneShot = new Animation([0, 1, 2], 4, false);
		for (let i = 0; i < 20; i++) oneShot.tick();
		expect(oneShot.currentFrame()).toBe(2);
		expect(oneShot.finished).toBe(true);
	});
});
```

- [ ] **Step 2: Run tests**

```bash
bun test tests/utils/sprite.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement sprite utilities**

```ts
// src/utils/sprite.ts
export class Animation {
	private frameIndex = 0;
	private tickCount = 0;
	finished = false;

	constructor(
		private frames: number[],
		private ticksPerFrame: number,
		private loop = true,
	) {}

	tick() {
		if (this.finished) return;
		this.tickCount++;
		if (this.tickCount >= this.ticksPerFrame) {
			this.tickCount = 0;
			this.frameIndex++;
			if (this.frameIndex >= this.frames.length) {
				if (this.loop) {
					this.frameIndex = 0;
				} else {
					this.frameIndex = this.frames.length - 1;
					this.finished = true;
				}
			}
		}
	}

	currentFrame(): number {
		return this.frames[this.frameIndex];
	}

	reset() {
		this.frameIndex = 0;
		this.tickCount = 0;
		this.finished = false;
	}
}

export function loadImage(src: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = reject;
		img.src = src;
	});
}
```

- [ ] **Step 4: Run tests**

```bash
bun test tests/utils/sprite.test.ts
```

Expected: All PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/sprite.ts tests/utils/sprite.test.ts
git commit -m "feat: add sprite animation system and image loader"
```

---

## Task 9: Storage System

**Files:**
- Create: `src/utils/storage.ts`
- Create: `tests/utils/storage.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// tests/utils/storage.test.ts
import { describe, test, expect, beforeEach } from "bun:test";
import { Storage, defaultSaveData } from "../../src/utils/storage";
import type { SaveData } from "../../src/utils/storage";

class MockStorage {
	private data: Record<string, string> = {};
	getItem(key: string) { return this.data[key] ?? null; }
	setItem(key: string, value: string) { this.data[key] = value; }
	removeItem(key: string) { delete this.data[key]; }
}

describe("Storage", () => {
	let store: Storage;

	beforeEach(() => {
		store = new Storage(new MockStorage() as unknown as globalThis.Storage);
	});

	test("returns default save data when nothing stored", () => {
		const data = store.load();
		expect(data.levelsCompleted).toEqual([false, false, false, false]);
		expect(data.highScores).toEqual([]);
	});

	test("saves and loads data", () => {
		const data = defaultSaveData();
		data.levelsCompleted[0] = true;
		data.unlockedCosmetics.push("malla-roja");
		store.save(data);
		const loaded = store.load();
		expect(loaded.levelsCompleted[0]).toBe(true);
		expect(loaded.unlockedCosmetics).toContain("malla-roja");
	});

	test("addHighScore inserts in sorted order", () => {
		const data = defaultSaveData();
		store.addHighScore(data, "AAA", 500);
		store.addHighScore(data, "BBB", 1000);
		store.addHighScore(data, "CCC", 750);
		expect(data.highScores[0].initials).toBe("BBB");
		expect(data.highScores[1].initials).toBe("CCC");
		expect(data.highScores[2].initials).toBe("AAA");
	});

	test("addHighScore caps at 10 entries", () => {
		const data = defaultSaveData();
		for (let i = 0; i < 12; i++) {
			store.addHighScore(data, `P${i.toString().padStart(2, "0")}`, i * 100);
		}
		expect(data.highScores.length).toBe(10);
	});
});
```

- [ ] **Step 2: Run tests**

```bash
bun test tests/utils/storage.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement Storage**

```ts
// src/utils/storage.ts
const STORAGE_KEY = "grech-arcade";

export interface SaveData {
	levelsCompleted: boolean[];
	unlockedCosmetics: string[];
	equippedCosmetics: {
		outfit: string;
		hair: string;
	};
	highScores: { initials: string; score: number }[];
}

export function defaultSaveData(): SaveData {
	return {
		levelsCompleted: [false, false, false, false],
		unlockedCosmetics: [],
		equippedCosmetics: { outfit: "default", hair: "default" },
		highScores: [],
	};
}

export class Storage {
	constructor(private backend: globalThis.Storage = localStorage) {}

	load(): SaveData {
		const raw = this.backend.getItem(STORAGE_KEY);
		if (!raw) return defaultSaveData();
		try {
			return JSON.parse(raw) as SaveData;
		} catch {
			return defaultSaveData();
		}
	}

	save(data: SaveData) {
		this.backend.setItem(STORAGE_KEY, JSON.stringify(data));
	}

	addHighScore(data: SaveData, initials: string, score: number) {
		data.highScores.push({ initials, score });
		data.highScores.sort((a, b) => b.score - a.score);
		data.highScores = data.highScores.slice(0, 10);
	}
}
```

- [ ] **Step 4: Run tests**

```bash
bun test tests/utils/storage.test.ts
```

Expected: All PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/storage.ts tests/utils/storage.test.ts
git commit -m "feat: add save/load system with high scores and cosmetic tracking"
```

---

## Task 10: Audio Stub

**Files:**
- Create: `src/engine/audio.ts`

- [ ] **Step 1: Create audio stub**

```ts
// src/engine/audio.ts
export interface AudioManager {
	playMusic(track: string): void;
	stopMusic(): void;
	playSfx(name: string): void;
	setMusicVolume(v: number): void;
	setSfxVolume(v: number): void;
}

export class AudioStub implements AudioManager {
	playMusic(_track: string) {}
	stopMusic() {}
	playSfx(_name: string) {}
	setMusicVolume(_v: number) {}
	setSfxVolume(_v: number) {}
}
```

- [ ] **Step 2: Commit**

```bash
git add src/engine/audio.ts
git commit -m "feat: add audio stub interface (implementation deferred)"
```

---

## Task 11: Test Level (Hardcoded)

**Files:**
- Create: `src/levels/test-level.ts`

- [ ] **Step 1: Create a hardcoded test level**

This provides a playable level before Tiled integration. It's a simple floor with platforms and gaps.

```ts
// src/levels/test-level.ts
import { TILE_SIZE } from "../utils/constants";

export interface LevelData {
	width: number;
	height: number;
	tileSize: number;
	terrain: number[];
	spawnX: number;
	spawnY: number;
}

const W = 50;
const H = 8;

const terrain: number[] = new Array(W * H).fill(0);

function set(x: number, y: number, v: number) {
	if (x >= 0 && x < W && y >= 0 && y < H) terrain[y * W + x] = v;
}

for (let x = 0; x < W; x++) set(x, H - 1, 1);

for (let x = 10; x < 14; x++) set(x, H - 1, 0);

for (let x = 18; x < 22; x++) set(x, H - 4, 1);

for (let x = 28; x < 32; x++) set(x, H - 3, 1);

set(36, H - 2, 1);
set(37, H - 2, 1);

for (let x = 42; x < 46; x++) set(x, H - 4, 1);

export const testLevel: LevelData = {
	width: W,
	height: H,
	tileSize: TILE_SIZE,
	terrain,
	spawnX: 2 * TILE_SIZE,
	spawnY: (H - 2) * TILE_SIZE,
};
```

- [ ] **Step 2: Commit**

```bash
git add src/levels/test-level.ts
git commit -m "feat: add hardcoded test level with floor, gaps, and platforms"
```

---

## Task 12: Player Entity

**Files:**
- Create: `src/entities/player.ts`
- Create: `tests/entities/player.test.ts`

- [ ] **Step 1: Write failing tests for player physics**

```ts
// tests/entities/player.test.ts
import { describe, test, expect, beforeEach } from "bun:test";
import { Player } from "../../src/entities/player";
import { Input } from "../../src/engine/input";
import { FIXED_DT, GRAVITY, JUMP_VELOCITY, MOVE_SPEED } from "../../src/utils/constants";

const noSolid = () => false;
const floorAt3 = (_tx: number, ty: number) => ty === 7;

describe("Player", () => {
	let player: Player;
	let input: Input;

	beforeEach(() => {
		input = new Input();
		player = new Player(64, 192);
	});

	test("starts at given position", () => {
		expect(player.x).toBe(64);
		expect(player.y).toBe(192);
	});

	test("falls when not on ground", () => {
		const startY = player.y;
		player.update(input, noSolid);
		expect(player.y).toBeGreaterThan(startY);
	});

	test("moves right when right arrow pressed", () => {
		input.handleKeyDown("ArrowRight");
		player.grounded = true;
		const startX = player.x;
		player.update(input, noSolid);
		expect(player.x).toBeGreaterThan(startX);
	});

	test("moves left when left arrow pressed", () => {
		input.handleKeyDown("ArrowLeft");
		player.grounded = true;
		const startX = player.x;
		player.update(input, noSolid);
		expect(player.x).toBeLessThan(startX);
	});

	test("jumps when space pressed and grounded", () => {
		player.grounded = true;
		input.handleKeyDown("Space");
		player.update(input, noSolid);
		expect(player.vy).toBeLessThan(0);
	});

	test("cannot jump when airborne", () => {
		player.grounded = false;
		player.coyoteTimer = 0;
		input.handleKeyDown("Space");
		player.update(input, noSolid);
		expect(player.vy).toBeGreaterThanOrEqual(0);
	});

	test("coyote time allows late jump", () => {
		player.grounded = false;
		player.coyoteTimer = 3;
		input.handleKeyDown("Space");
		player.update(input, noSolid);
		expect(player.vy).toBeLessThan(0);
	});
});
```

- [ ] **Step 2: Run tests**

```bash
bun test tests/entities/player.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement Player**

```ts
// src/entities/player.ts
import { Input } from "../engine/input";
import {
	FIXED_DT,
	GRAVITY,
	GRAVITY_DOWN_MULT,
	JUMP_VELOCITY,
	JUMP_CUT_MULT,
	MOVE_SPEED,
	PLAYER_WIDTH,
	PLAYER_HEIGHT,
	TILE_SIZE,
	COYOTE_FRAMES,
	JUMP_BUFFER_FRAMES,
} from "../utils/constants";
import { resolveTileCollisionsX, resolveTileCollisionsY } from "../engine/physics";

type SolidCheck = (tx: number, ty: number) => boolean;

export class Player {
	x: number;
	y: number;
	vx = 0;
	vy = 0;
	w = PLAYER_WIDTH;
	h = PLAYER_HEIGHT;
	grounded = false;
	facingRight = true;
	coyoteTimer = 0;
	private jumpBuffer = 0;
	unlockedMoves: Set<string> = new Set();

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	update(input: Input, isSolid: SolidCheck) {
		if (input.isDown("ArrowRight")) {
			this.vx = MOVE_SPEED;
			this.facingRight = true;
		} else if (input.isDown("ArrowLeft")) {
			this.vx = -MOVE_SPEED;
			this.facingRight = false;
		} else {
			this.vx = 0;
		}

		if (this.grounded) {
			this.coyoteTimer = COYOTE_FRAMES;
		} else if (this.coyoteTimer > 0) {
			this.coyoteTimer--;
		}

		if (input.justPressed("Space")) {
			this.jumpBuffer = JUMP_BUFFER_FRAMES;
		} else if (this.jumpBuffer > 0) {
			this.jumpBuffer--;
		}

		if (this.jumpBuffer > 0 && this.coyoteTimer > 0) {
			this.vy = JUMP_VELOCITY;
			this.jumpBuffer = 0;
			this.coyoteTimer = 0;
			this.grounded = false;
		}

		if (input.justReleased("Space") && this.vy < 0) {
			this.vy *= JUMP_CUT_MULT;
		}

		const gravMult = this.vy > 0 ? GRAVITY_DOWN_MULT : 1;
		this.vy += GRAVITY * gravMult * FIXED_DT;

		this.x += this.vx * FIXED_DT;
		this.x = resolveTileCollisionsX(this.x, this.y, this.w, this.h, TILE_SIZE, isSolid);

		this.y += this.vy * FIXED_DT;
		const result = resolveTileCollisionsY(this.x, this.y, this.w, this.h, TILE_SIZE, isSolid);
		this.y = result.y;

		if (result.grounded) {
			this.vy = 0;
			this.grounded = true;
		} else {
			this.grounded = false;
		}

		if (result.hitCeiling) {
			this.vy = 0;
		}
	}

	get hitbox() {
		return { x: this.x, y: this.y, w: this.w, h: this.h };
	}

	get spriteX() {
		return this.x - (TILE_SIZE - this.w) / 2;
	}

	get spriteY() {
		return this.y - (TILE_SIZE - this.h);
	}
}
```

- [ ] **Step 4: Run tests**

```bash
bun test tests/entities/player.test.ts
```

Expected: All PASS.

- [ ] **Step 5: Commit**

```bash
git add src/entities/player.ts tests/entities/player.test.ts
git commit -m "feat: add player entity with arcade physics, coyote time, and jump buffering"
```

---

## Task 13: Level Scene — Playable Prototype

**Files:**
- Create: `src/scenes/level.ts`
- Modify: `src/main.ts`

- [ ] **Step 1: Implement level scene**

```ts
// src/scenes/level.ts
import type { Scene } from "../engine/scene-manager";
import type { Game } from "../engine/game";
import { Camera } from "../engine/camera";
import { Player } from "../entities/player";
import { COLORS, INTERNAL_WIDTH, INTERNAL_HEIGHT, TILE_SIZE } from "../utils/constants";
import type { LevelData } from "../levels/test-level";

export class LevelScene implements Scene {
	private player!: Player;
	private camera!: Camera;
	private level!: LevelData;
	private score = 0;
	private lives = 3;

	constructor(
		private game: Game,
		private levelData: LevelData,
	) {}

	enter() {
		this.level = this.levelData;
		this.player = new Player(this.level.spawnX, this.level.spawnY);
		this.camera = new Camera(INTERNAL_WIDTH, INTERNAL_HEIGHT, 80, 50);
		this.camera.setLevelSize(
			this.level.width * TILE_SIZE,
			this.level.height * TILE_SIZE,
		);
	}

	update() {
		const isSolid = (tx: number, ty: number): boolean => {
			if (tx < 0 || tx >= this.level.width || ty < 0 || ty >= this.level.height) return false;
			return this.level.terrain[ty * this.level.width + tx] !== 0;
		};

		this.player.update(this.game.input, isSolid);
		this.camera.follow(
			this.player.x + this.player.w / 2,
			this.player.y + this.player.h / 2,
		);

		if (this.player.y > this.level.height * TILE_SIZE) {
			this.lives--;
			if (this.lives <= 0) {
				this.player.x = this.level.spawnX;
				this.player.y = this.level.spawnY;
				this.player.vy = 0;
				this.lives = 3;
				this.score = 0;
			} else {
				this.player.x = this.level.spawnX;
				this.player.y = this.level.spawnY;
				this.player.vy = 0;
			}
		}
	}

	render() {
		const r = this.game.renderer;
		const cx = this.camera.x;
		const cy = this.camera.y;

		r.clear(COLORS.bg);

		const startCol = Math.floor(cx / TILE_SIZE);
		const endCol = Math.ceil((cx + INTERNAL_WIDTH) / TILE_SIZE);
		const startRow = Math.floor(cy / TILE_SIZE);
		const endRow = Math.ceil((cy + INTERNAL_HEIGHT) / TILE_SIZE);

		for (let row = startRow; row <= endRow; row++) {
			for (let col = startCol; col <= endCol; col++) {
				if (col < 0 || col >= this.level.width || row < 0 || row >= this.level.height) continue;
				const tile = this.level.terrain[row * this.level.width + col];
				if (tile !== 0) {
					r.fillRect(
						col * TILE_SIZE - cx,
						row * TILE_SIZE - cy,
						TILE_SIZE,
						TILE_SIZE,
						COLORS.floor,
					);
				}
			}
		}

		r.fillRect(
			this.player.spriteX - cx,
			this.player.spriteY - cy,
			TILE_SIZE,
			TILE_SIZE,
			COLORS.player,
		);

		r.drawText(`SCORE: ${this.score}`, 4, 4, COLORS.text, 8);
		r.drawText(`LIVES: ${this.lives}`, INTERNAL_WIDTH - 60, 4, COLORS.text, 8);
	}

	exit() {}
}
```

- [ ] **Step 2: Update main.ts to use LevelScene**

Replace the entire contents of `src/main.ts`:

```ts
// src/main.ts
import { Game } from "./engine/game";
import { LevelScene } from "./scenes/level";
import { testLevel } from "./levels/test-level";

const canvas = document.getElementById("game") as HTMLCanvasElement;
const game = new Game(canvas);

const levelScene = new LevelScene(game, testLevel);
game.scenes.register("level", levelScene);
game.start("level");
```

- [ ] **Step 3: Build and verify**

```bash
bun run build
```

Open in browser. You should be able to:
- Move a yellow rectangle with arrow keys on cyan floor tiles
- Jump with space
- Fall through gaps and respawn
- Camera follows the player

- [ ] **Step 4: Commit**

```bash
git add src/scenes/level.ts src/main.ts
git commit -m "feat: add level scene with playable character on test level"
```

---

## Task 14: Reception Bar Minigame

**Files:**
- Create: `src/scenes/reception.ts`
- Create: `tests/scenes/reception.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// tests/scenes/reception.test.ts
import { describe, test, expect } from "bun:test";
import { ReceptionBar } from "../../src/scenes/reception";

describe("ReceptionBar", () => {
	test("indicator oscillates between 0 and 1", () => {
		const bar = new ReceptionBar(0.3);
		const positions: number[] = [];
		for (let i = 0; i < 120; i++) {
			bar.tick();
			positions.push(bar.position);
		}
		expect(Math.min(...positions)).toBeGreaterThanOrEqual(0);
		expect(Math.max(...positions)).toBeLessThanOrEqual(1);
	});

	test("perfect zone in center returns 'perfect' result", () => {
		const bar = new ReceptionBar(0.3);
		const result = bar.evaluate(0.5);
		expect(result).toBe("perfect");
	});

	test("within zone returns 'good' result", () => {
		const bar = new ReceptionBar(0.3);
		const result = bar.evaluate(0.6);
		expect(result).toBe("good");
	});

	test("outside zone returns 'miss' result", () => {
		const bar = new ReceptionBar(0.3);
		const result = bar.evaluate(0.1);
		expect(result).toBe("miss");
	});

	test("zone shrinks for higher difficulty", () => {
		const easy = new ReceptionBar(0.4);
		const hard = new ReceptionBar(0.1);
		expect(easy.evaluate(0.6)).toBe("good");
		expect(hard.evaluate(0.6)).toBe("miss");
	});
});
```

- [ ] **Step 2: Run tests**

```bash
bun test tests/scenes/reception.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement ReceptionBar logic**

```ts
// src/scenes/reception.ts
import type { Scene } from "../engine/scene-manager";
import type { Game } from "../engine/game";
import { COLORS, INTERNAL_WIDTH, INTERNAL_HEIGHT } from "../utils/constants";

export type ReceptionResult = "perfect" | "good" | "miss";

export class ReceptionBar {
	position = 0;
	private direction = 1;
	private speed = 0.02;
	private perfectRadius = 0.03;

	constructor(private zoneRadius: number) {}

	tick() {
		this.position += this.speed * this.direction;
		if (this.position >= 1) {
			this.position = 1;
			this.direction = -1;
		} else if (this.position <= 0) {
			this.position = 0;
			this.direction = 1;
		}
	}

	evaluate(pos: number): ReceptionResult {
		const dist = Math.abs(pos - 0.5);
		if (dist <= this.perfectRadius) return "perfect";
		if (dist <= this.zoneRadius) return "good";
		return "miss";
	}
}

const ZONE_RADII = [0.2, 0.15, 0.1, 0.06];

export class ReceptionScene implements Scene {
	private bar!: ReceptionBar;
	private result: ReceptionResult | null = null;
	private levelIndex: number;
	private showTimer = 0;

	constructor(
		private game: Game,
		levelIndex: number,
		private onComplete: (result: ReceptionResult) => void,
	) {
		this.levelIndex = levelIndex;
	}

	enter() {
		this.bar = new ReceptionBar(ZONE_RADII[this.levelIndex] ?? 0.15);
		this.result = null;
		this.showTimer = 0;
	}

	update() {
		if (this.result !== null) {
			this.showTimer++;
			if (this.showTimer > 120) {
				this.onComplete(this.result);
			}
			return;
		}

		this.bar.tick();

		if (this.game.input.justPressed("Space")) {
			this.result = this.bar.evaluate(this.bar.position);
		}
	}

	render() {
		const r = this.game.renderer;
		r.clear(COLORS.bg);

		const barY = INTERNAL_HEIGHT / 2;
		const barW = 300;
		const barH = 20;
		const barX = (INTERNAL_WIDTH - barW) / 2;

		r.fillRect(barX, barY - barH / 2, barW, barH, "#333");

		const zoneRadius = ZONE_RADII[this.levelIndex] ?? 0.15;
		const zoneW = barW * zoneRadius * 2;
		const zoneX = barX + barW / 2 - zoneW / 2;
		r.fillRect(zoneX, barY - barH / 2, zoneW, barH, "#4a4");

		const perfectW = barW * 0.06;
		const perfectX = barX + barW / 2 - perfectW / 2;
		r.fillRect(perfectX, barY - barH / 2, perfectW, barH, "#6f6");

		const indicatorX = barX + barW * this.bar.position;
		r.fillRect(indicatorX - 2, barY - barH / 2 - 4, 4, barH + 8, COLORS.text);

		r.drawText("PRESS SPACE TO LAND!", INTERNAL_WIDTH / 2, barY - 40, COLORS.text, 10, "center");

		if (this.result !== null) {
			const labels: Record<ReceptionResult, string> = {
				perfect: "PERFECT!",
				good: "GOOD!",
				miss: "MISS...",
			};
			const colors: Record<ReceptionResult, string> = {
				perfect: "#ffd700",
				good: "#6ec6c8",
				miss: "#e85050",
			};
			r.drawText(labels[this.result], INTERNAL_WIDTH / 2, barY + 30, colors[this.result], 16, "center");
		}
	}

	exit() {}
}
```

- [ ] **Step 4: Run tests**

```bash
bun test tests/scenes/reception.test.ts
```

Expected: All PASS.

- [ ] **Step 5: Commit**

```bash
git add src/scenes/reception.ts tests/scenes/reception.test.ts
git commit -m "feat: add reception bar minigame with difficulty scaling per level"
```

---

## Task 15: Obstacles and Collectibles

**Files:**
- Create: `src/entities/obstacle.ts`
- Create: `src/entities/collectible.ts`

- [ ] **Step 1: Implement Obstacle entity**

```ts
// src/entities/obstacle.ts
import type { AABB } from "../engine/physics";
import { FIXED_DT } from "../utils/constants";

export interface ObstacleConfig {
	x: number;
	y: number;
	w: number;
	h: number;
	mobile: boolean;
	moveSpeed?: number;
	moveRangeX?: number;
	moveRangeY?: number;
}

export class Obstacle {
	x: number;
	y: number;
	w: number;
	h: number;
	private originX: number;
	private originY: number;
	private mobile: boolean;
	private speed: number;
	private rangeX: number;
	private rangeY: number;
	private dir = 1;

	constructor(config: ObstacleConfig) {
		this.x = config.x;
		this.y = config.y;
		this.w = config.w;
		this.h = config.h;
		this.originX = config.x;
		this.originY = config.y;
		this.mobile = config.mobile;
		this.speed = config.moveSpeed ?? 40;
		this.rangeX = config.moveRangeX ?? 0;
		this.rangeY = config.moveRangeY ?? 0;
	}

	update() {
		if (!this.mobile) return;

		if (this.rangeX > 0) {
			this.x += this.speed * this.dir * FIXED_DT;
			if (this.x > this.originX + this.rangeX || this.x < this.originX - this.rangeX) {
				this.dir *= -1;
			}
		}
		if (this.rangeY > 0) {
			this.y += this.speed * this.dir * FIXED_DT;
			if (this.y > this.originY + this.rangeY || this.y < this.originY - this.rangeY) {
				this.dir *= -1;
			}
		}
	}

	get hitbox(): AABB {
		return { x: this.x, y: this.y, w: this.w, h: this.h };
	}
}
```

- [ ] **Step 2: Implement Collectible entity**

```ts
// src/entities/collectible.ts
import type { AABB } from "../engine/physics";

export type CollectibleType = "gold" | "silver" | "bronze" | "cup" | "trophy" | "magnesium" | "water";

const POINT_VALUES: Record<CollectibleType, number> = {
	gold: 500,
	silver: 200,
	bronze: 100,
	cup: 300,
	trophy: 1000,
	magnesium: 0,
	water: 0,
};

export class Collectible {
	x: number;
	y: number;
	w = 16;
	h = 16;
	type: CollectibleType;
	collected = false;

	constructor(x: number, y: number, type: CollectibleType) {
		this.x = x;
		this.y = y;
		this.type = type;
	}

	get points(): number {
		return POINT_VALUES[this.type];
	}

	get hitbox(): AABB {
		return { x: this.x, y: this.y, w: this.w, h: this.h };
	}
}
```

- [ ] **Step 3: Commit**

```bash
git add src/entities/obstacle.ts src/entities/collectible.ts
git commit -m "feat: add obstacle and collectible entities with AABB hitboxes"
```

---

## Task 16: Integrate Obstacles and Collectibles into Level Scene

**Files:**
- Modify: `src/scenes/level.ts`
- Modify: `src/levels/test-level.ts`

- [ ] **Step 1: Add test obstacles and collectibles to test level**

Add to the bottom of `src/levels/test-level.ts`:

```ts
import type { ObstacleConfig } from "../entities/obstacle";
import type { CollectibleType } from "../entities/collectible";

export interface LevelObjectData {
	obstacles: ObstacleConfig[];
	collectibles: { x: number; y: number; type: CollectibleType }[];
}

export const testLevelObjects: LevelObjectData = {
	obstacles: [
		{ x: 7 * TILE_SIZE, y: (H - 2) * TILE_SIZE, w: TILE_SIZE, h: TILE_SIZE, mobile: false },
		{
			x: 24 * TILE_SIZE,
			y: (H - 2) * TILE_SIZE,
			w: TILE_SIZE,
			h: TILE_SIZE,
			mobile: true,
			moveSpeed: 50,
			moveRangeX: 3 * TILE_SIZE,
		},
	],
	collectibles: [
		{ x: 4 * TILE_SIZE, y: (H - 3) * TILE_SIZE, type: "gold" },
		{ x: 12 * TILE_SIZE, y: (H - 5) * TILE_SIZE, type: "silver" },
		{ x: 20 * TILE_SIZE, y: (H - 5) * TILE_SIZE, type: "bronze" },
		{ x: 30 * TILE_SIZE, y: (H - 4) * TILE_SIZE, type: "cup" },
		{ x: 44 * TILE_SIZE, y: (H - 5) * TILE_SIZE, type: "trophy" },
	],
};
```

- [ ] **Step 2: Update LevelScene to handle obstacles and collectibles**

Update `src/scenes/level.ts` — add imports and collision logic:

```ts
// src/scenes/level.ts
import type { Scene } from "../engine/scene-manager";
import type { Game } from "../engine/game";
import { Camera } from "../engine/camera";
import { Player } from "../entities/player";
import { Obstacle } from "../entities/obstacle";
import { Collectible } from "../entities/collectible";
import { aabbOverlap } from "../engine/physics";
import { COLORS, INTERNAL_WIDTH, INTERNAL_HEIGHT, TILE_SIZE } from "../utils/constants";
import type { LevelData, LevelObjectData } from "../levels/test-level";

export class LevelScene implements Scene {
	private player!: Player;
	private camera!: Camera;
	private level!: LevelData;
	private obstacles: Obstacle[] = [];
	private collectibles: Collectible[] = [];
	private score = 0;
	private lives = 3;

	constructor(
		private game: Game,
		private levelData: LevelData,
		private objectData?: LevelObjectData,
	) {}

	enter() {
		this.level = this.levelData;
		this.player = new Player(this.level.spawnX, this.level.spawnY);
		this.camera = new Camera(INTERNAL_WIDTH, INTERNAL_HEIGHT, 80, 50);
		this.camera.setLevelSize(
			this.level.width * TILE_SIZE,
			this.level.height * TILE_SIZE,
		);
		this.score = 0;
		this.lives = 3;

		this.obstacles = (this.objectData?.obstacles ?? []).map((c) => new Obstacle(c));
		this.collectibles = (this.objectData?.collectibles ?? []).map(
			(c) => new Collectible(c.x, c.y, c.type),
		);
	}

	update() {
		const isSolid = (tx: number, ty: number): boolean => {
			if (tx < 0 || tx >= this.level.width || ty < 0 || ty >= this.level.height) return false;
			return this.level.terrain[ty * this.level.width + tx] !== 0;
		};

		this.player.update(this.game.input, isSolid);
		this.camera.follow(
			this.player.x + this.player.w / 2,
			this.player.y + this.player.h / 2,
		);

		for (const obs of this.obstacles) {
			obs.update();
			if (aabbOverlap(this.player.hitbox, obs.hitbox)) {
				this.die();
				return;
			}
		}

		for (const col of this.collectibles) {
			if (col.collected) continue;
			if (aabbOverlap(this.player.hitbox, col.hitbox)) {
				col.collected = true;
				this.score += col.points;
			}
		}

		if (this.player.y > this.level.height * TILE_SIZE) {
			this.die();
		}
	}

	private die() {
		this.lives--;
		this.player.x = this.level.spawnX;
		this.player.y = this.level.spawnY;
		this.player.vx = 0;
		this.player.vy = 0;
		if (this.lives <= 0) {
			this.lives = 3;
			this.score = 0;
			this.collectibles.forEach((c) => (c.collected = false));
		}
	}

	render() {
		const r = this.game.renderer;
		const cx = this.camera.x;
		const cy = this.camera.y;

		r.clear(COLORS.bg);

		const startCol = Math.floor(cx / TILE_SIZE);
		const endCol = Math.ceil((cx + INTERNAL_WIDTH) / TILE_SIZE);
		const startRow = Math.floor(cy / TILE_SIZE);
		const endRow = Math.ceil((cy + INTERNAL_HEIGHT) / TILE_SIZE);

		for (let row = startRow; row <= endRow; row++) {
			for (let col = startCol; col <= endCol; col++) {
				if (col < 0 || col >= this.level.width || row < 0 || row >= this.level.height) continue;
				const tile = this.level.terrain[row * this.level.width + col];
				if (tile !== 0) {
					r.fillRect(col * TILE_SIZE - cx, row * TILE_SIZE - cy, TILE_SIZE, TILE_SIZE, COLORS.floor);
				}
			}
		}

		for (const obs of this.obstacles) {
			r.fillRect(obs.x - cx, obs.y - cy, obs.w, obs.h, "#e85050");
		}

		for (const col of this.collectibles) {
			if (col.collected) continue;
			r.fillRect(col.x - cx, col.y - cy, col.w, col.h, COLORS.collectible);
		}

		r.fillRect(
			this.player.spriteX - cx,
			this.player.spriteY - cy,
			TILE_SIZE,
			TILE_SIZE,
			COLORS.player,
		);

		r.drawText(`SCORE: ${this.score}`, 4, 4, COLORS.text, 8);
		r.drawText(`LIVES: ${this.lives}`, INTERNAL_WIDTH - 60, 4, COLORS.text, 8);
	}

	exit() {}
}
```

- [ ] **Step 3: Update main.ts to pass object data**

```ts
// src/main.ts
import { Game } from "./engine/game";
import { LevelScene } from "./scenes/level";
import { testLevel, testLevelObjects } from "./levels/test-level";

const canvas = document.getElementById("game") as HTMLCanvasElement;
const game = new Game(canvas);

const levelScene = new LevelScene(game, testLevel, testLevelObjects);
game.scenes.register("level", levelScene);
game.start("level");
```

- [ ] **Step 4: Build and verify**

```bash
bun run build
```

Open in browser — you should see gold/red rectangles. Touching gold ones adds score. Touching red ones kills you. One red obstacle moves back and forth.

- [ ] **Step 5: Commit**

```bash
git add src/scenes/level.ts src/levels/test-level.ts src/entities/obstacle.ts src/entities/collectible.ts src/main.ts
git commit -m "feat: integrate obstacles and collectibles into level scene"
```

---

## Task 17: Special Moves System

**Files:**
- Modify: `src/entities/player.ts`
- Create: `tests/entities/player-moves.test.ts`

- [ ] **Step 1: Write failing tests for move priority resolution**

```ts
// tests/entities/player-moves.test.ts
import { describe, test, expect } from "bun:test";
import { resolveSpecialMove } from "../../src/entities/player";

describe("resolveSpecialMove", () => {
	const allMoves = new Set(["lateral", "voltereta", "spagat", "equilibrio", "rondada", "puente", "paloma"]);

	test("Z in air → paloma", () => {
		expect(resolveSpecialMove({
			grounded: false, running: false, downHeld: false, inBarZone: false, unlocked: allMoves,
		})).toBe("paloma");
	});

	test("Z + down + still → puente", () => {
		expect(resolveSpecialMove({
			grounded: true, running: false, downHeld: true, inBarZone: false, unlocked: allMoves,
		})).toBe("puente");
	});

	test("Z + down + running → spagat", () => {
		expect(resolveSpecialMove({
			grounded: true, running: true, downHeld: true, inBarZone: false, unlocked: allMoves,
		})).toBe("spagat");
	});

	test("Z + still → voltereta", () => {
		expect(resolveSpecialMove({
			grounded: true, running: false, downHeld: false, inBarZone: false, unlocked: allMoves,
		})).toBe("voltereta");
	});

	test("Z + running → lateral", () => {
		expect(resolveSpecialMove({
			grounded: true, running: true, downHeld: false, inBarZone: false, unlocked: allMoves,
		})).toBe("lateral");
	});

	test("Z + bar zone → equilibrio", () => {
		expect(resolveSpecialMove({
			grounded: true, running: false, downHeld: false, inBarZone: true, unlocked: allMoves,
		})).toBe("equilibrio");
	});

	test("returns null when move not unlocked", () => {
		expect(resolveSpecialMove({
			grounded: false, running: false, downHeld: false, inBarZone: false, unlocked: new Set(),
		})).toBeNull();
	});

	test("returns null when no Z pressed (no move context)", () => {
		expect(resolveSpecialMove({
			grounded: true, running: false, downHeld: false, inBarZone: false, unlocked: new Set(["lateral"]),
		})).toBe("voltereta");
	});
});
```

- [ ] **Step 2: Run tests**

```bash
bun test tests/entities/player-moves.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Add resolveSpecialMove to player.ts**

Add this exported function to `src/entities/player.ts`:

```ts
export interface MoveContext {
	grounded: boolean;
	running: boolean;
	downHeld: boolean;
	inBarZone: boolean;
	unlocked: Set<string>;
}

export type SpecialMove = "lateral" | "voltereta" | "spagat" | "equilibrio" | "rondada" | "puente" | "paloma";

export function resolveSpecialMove(ctx: MoveContext): SpecialMove | null {
	if (!ctx.grounded && ctx.unlocked.has("paloma")) return "paloma";
	if (ctx.inBarZone && ctx.unlocked.has("equilibrio")) return "equilibrio";
	if (ctx.downHeld && !ctx.running && ctx.unlocked.has("puente")) return "puente";
	if (ctx.downHeld && ctx.running && ctx.unlocked.has("spagat")) return "spagat";
	if (!ctx.running && ctx.unlocked.has("voltereta")) return "voltereta";
	if (ctx.running && ctx.unlocked.has("lateral")) return "lateral";
	return null;
}
```

- [ ] **Step 4: Run tests**

```bash
bun test tests/entities/player-moves.test.ts
```

Expected: All PASS.

- [ ] **Step 5: Commit**

```bash
git add src/entities/player.ts tests/entities/player-moves.test.ts
git commit -m "feat: add special move priority resolution system"
```

---

## Task 18: Title Screen

**Files:**
- Create: `src/scenes/title.ts`

- [ ] **Step 1: Implement title scene**

```ts
// src/scenes/title.ts
import type { Scene } from "../engine/scene-manager";
import type { Game } from "../engine/game";
import { COLORS, INTERNAL_WIDTH, INTERNAL_HEIGHT } from "../utils/constants";

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

		r.drawText("Arrow keys: move  |  Space: jump  |  Z: special", INTERNAL_WIDTH / 2, 200, "#888", 6, "center");
	}

	exit() {}
}
```

- [ ] **Step 2: Commit**

```bash
git add src/scenes/title.ts
git commit -m "feat: add title screen with blinking PRESS START"
```

---

## Task 19: Level Select Screen

**Files:**
- Create: `src/scenes/level-select.ts`

- [ ] **Step 1: Implement level select**

```ts
// src/scenes/level-select.ts
import type { Scene } from "../engine/scene-manager";
import type { Game } from "../engine/game";
import { COLORS, INTERNAL_WIDTH, INTERNAL_HEIGHT } from "../utils/constants";

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
		return this.levelsCompleted[index - 1];
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
```

- [ ] **Step 2: Commit**

```bash
git add src/scenes/level-select.ts
git commit -m "feat: add level select screen with lock/unlock state"
```

---

## Task 20: Score Screen and Game Over

**Files:**
- Create: `src/scenes/score.ts`
- Create: `src/scenes/game-over.ts`

- [ ] **Step 1: Implement score screen**

```ts
// src/scenes/score.ts
import type { Scene } from "../engine/scene-manager";
import type { Game } from "../engine/game";
import { COLORS, INTERNAL_WIDTH } from "../utils/constants";
import type { ReceptionResult } from "./reception";

export interface ScoreData {
	levelIndex: number;
	baseScore: number;
	timeBonus: number;
	receptionResult: ReceptionResult;
	unlockedMoves: string[];
}

const RECEPTION_BONUS: Record<ReceptionResult, number> = {
	perfect: 2000,
	good: 1000,
	miss: 0,
};

export class ScoreScene implements Scene {
	private data!: ScoreData;
	private totalScore = 0;

	constructor(
		private game: Game,
		private getData: () => ScoreData,
		private onContinue: (totalScore: number) => void,
	) {}

	enter() {
		this.data = this.getData();
		this.totalScore = this.data.baseScore + this.data.timeBonus + RECEPTION_BONUS[this.data.receptionResult];
	}

	update() {
		if (this.game.input.justPressed("Space") || this.game.input.justPressed("Enter")) {
			this.onContinue(this.totalScore);
		}
	}

	render() {
		const r = this.game.renderer;
		r.clear(COLORS.bg);

		const LEVEL_NAMES = ["Suelo", "Barra de equilibrio", "Barras asimetricas", "Salto de potro"];
		r.drawText(`LEVEL ${this.data.levelIndex + 1}: ${LEVEL_NAMES[this.data.levelIndex]}`, INTERNAL_WIDTH / 2, 20, COLORS.text, 12, "center");

		r.drawText(`Score: ${this.data.baseScore}`, 60, 60, COLORS.text, 10);
		r.drawText(`Time bonus: ${this.data.timeBonus}`, 60, 80, COLORS.text, 10);
		r.drawText(`Reception: ${this.data.receptionResult.toUpperCase()} (+${RECEPTION_BONUS[this.data.receptionResult]})`, 60, 100, COLORS.text, 10);
		r.drawText(`TOTAL: ${this.totalScore}`, 60, 130, COLORS.player, 14);

		if (this.data.unlockedMoves.length > 0) {
			r.drawText("NEW MOVES UNLOCKED!", INTERNAL_WIDTH / 2, 160, "#ffd700", 10, "center");
			for (let i = 0; i < this.data.unlockedMoves.length; i++) {
				r.drawText(`+ ${this.data.unlockedMoves[i]}`, INTERNAL_WIDTH / 2, 178 + i * 14, "#6f6", 8, "center");
			}
		}

		r.drawText("PRESS SPACE TO CONTINUE", INTERNAL_WIDTH / 2, 210, "#888", 8, "center");
	}

	exit() {}
}
```

- [ ] **Step 2: Implement game over screen**

```ts
// src/scenes/game-over.ts
import type { Scene } from "../engine/scene-manager";
import type { Game } from "../engine/game";
import { COLORS, INTERNAL_WIDTH, INTERNAL_HEIGHT } from "../utils/constants";
import { Storage } from "../utils/storage";

export class GameOverScene implements Scene {
	private finalScore = 0;
	private initials = ["A", "A", "A"];
	private cursorPos = 0;
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
		r.drawText(`FINAL SCORE: ${this.finalScore}`, INTERNAL_WIDTH / 2, 70, COLORS.text, 12, "center");

		if (this.isNewHighScore && !this.submitted) {
			r.drawText("NEW HIGH SCORE!", INTERNAL_WIDTH / 2, 100, "#ffd700", 10, "center");
			r.drawText("ENTER INITIALS:", INTERNAL_WIDTH / 2, 120, COLORS.text, 8, "center");

			for (let i = 0; i < 3; i++) {
				const x = INTERNAL_WIDTH / 2 - 24 + i * 24;
				const color = i === this.cursorPos ? COLORS.player : COLORS.text;
				r.drawText(this.initials[i], x, 140, color, 16);
			}

			r.drawText("UP/DOWN: change  LEFT/RIGHT: move  SPACE: confirm", INTERNAL_WIDTH / 2, 170, "#888", 6, "center");
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
```

- [ ] **Step 3: Commit**

```bash
git add src/scenes/score.ts src/scenes/game-over.ts
git commit -m "feat: add score breakdown and game over screens with high score entry"
```

---

## Task 21: Wire All Scenes Together

**Files:**
- Modify: `src/main.ts`

- [ ] **Step 1: Rewrite main.ts with full scene flow**

Replace the entire contents of `src/main.ts`:

```ts
// src/main.ts
import { Game } from "./engine/game";
import { TitleScene } from "./scenes/title";
import { LevelSelectScene } from "./scenes/level-select";
import { LevelScene } from "./scenes/level";
import { ReceptionScene } from "./scenes/reception";
import { ScoreScene } from "./scenes/score";
import type { ScoreData } from "./scenes/score";
import { GameOverScene } from "./scenes/game-over";
import { Storage } from "./utils/storage";
import { testLevel, testLevelObjects } from "./levels/test-level";
import type { ReceptionResult } from "./scenes/reception";

const canvas = document.getElementById("game") as HTMLCanvasElement;
const game = new Game(canvas);
const storage = new Storage();

let currentLevelIndex = 0;
let sessionScore = 0;
let lastReceptionResult: ReceptionResult = "miss";
let lastLevelScore = 0;

const LEVEL_UNLOCKS: string[][] = [
	["lateral", "voltereta"],
	["spagat", "equilibrio"],
	["rondada", "puente"],
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

const level = new LevelScene(game, testLevel, testLevelObjects);

const reception = new ReceptionScene(game, currentLevelIndex, (result) => {
	lastReceptionResult = result;
	game.scenes.switchTo("score");
});

const score = new ScoreScene(
	game,
	() => ({
		levelIndex: currentLevelIndex,
		baseScore: lastLevelScore,
		timeBonus: 0,
		receptionResult: lastReceptionResult,
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

game.scenes.register("title", title);
game.scenes.register("level-select", levelSelect);
game.scenes.register("level", level);
game.scenes.register("reception", reception);
game.scenes.register("score", score);
game.scenes.register("game-over", gameOver);

game.start("title");
```

- [ ] **Step 2: Build and verify**

```bash
bun run build
```

Open in browser. You should be able to:
1. See title screen → press Space
2. See level select → select level 1
3. Play the level (colored rectangles)
4. Press Space to continue (no reception trigger yet — that's wired per-level later)

- [ ] **Step 3: Commit**

```bash
git add src/main.ts
git commit -m "feat: wire all scenes into complete game flow"
```

---

## Task 22: Run All Tests

**Files:** None — verification only.

- [ ] **Step 1: Run full test suite**

```bash
bun test
```

Expected: All tests pass across input, physics, camera, scene-manager, sprite, storage, reception, and player-moves.

- [ ] **Step 2: Run lint**

```bash
bun run lint
```

Fix any issues found.

- [ ] **Step 3: Commit fixes if any**

```bash
git add -A
git commit -m "fix: resolve lint issues"
```

---

## Task 23: Tiled Level Loader

**Files:**
- Create: `src/levels/loader.ts`

- [ ] **Step 1: Implement Tiled JSON loader**

```ts
// src/levels/loader.ts
import type { LevelData, LevelObjectData } from "./test-level";
import type { ObstacleConfig } from "../entities/obstacle";
import type { CollectibleType } from "../entities/collectible";

interface TiledLayer {
	name: string;
	type: "tilelayer" | "objectgroup";
	data?: number[];
	objects?: TiledObject[];
	width?: number;
	height?: number;
}

interface TiledObject {
	name: string;
	type: string;
	x: number;
	y: number;
	width: number;
	height: number;
	properties?: { name: string; value: string | number | boolean }[];
}

interface TiledMap {
	width: number;
	height: number;
	tilewidth: number;
	tileheight: number;
	layers: TiledLayer[];
}

function getProp(obj: TiledObject, name: string): string | number | boolean | undefined {
	return obj.properties?.find((p) => p.name === name)?.value;
}

export function parseTiledMap(json: TiledMap): { level: LevelData; objects: LevelObjectData } {
	const terrainLayer = json.layers.find((l) => l.name === "Terrain" && l.type === "tilelayer");
	const objectLayer = json.layers.find((l) => l.name === "Objects" && l.type === "objectgroup");

	const terrain = (terrainLayer?.data ?? []).map((t) => (t > 0 ? 1 : 0));

	let spawnX = 64;
	let spawnY = 64;
	const obstacles: ObstacleConfig[] = [];
	const collectibles: { x: number; y: number; type: CollectibleType }[] = [];

	for (const obj of objectLayer?.objects ?? []) {
		if (obj.type === "spawn") {
			spawnX = obj.x;
			spawnY = obj.y;
		} else if (obj.type === "obstacle") {
			obstacles.push({
				x: obj.x,
				y: obj.y,
				w: obj.width,
				h: obj.height,
				mobile: getProp(obj, "mobile") === true,
				moveSpeed: (getProp(obj, "moveSpeed") as number) ?? undefined,
				moveRangeX: (getProp(obj, "moveRangeX") as number) ?? undefined,
				moveRangeY: (getProp(obj, "moveRangeY") as number) ?? undefined,
			});
		} else if (obj.type === "collectible") {
			collectibles.push({
				x: obj.x,
				y: obj.y,
				type: (getProp(obj, "collectibleType") as CollectibleType) ?? "bronze",
			});
		}
	}

	return {
		level: {
			width: json.width,
			height: json.height,
			tileSize: json.tilewidth,
			terrain,
			spawnX,
			spawnY,
		},
		objects: { obstacles, collectibles },
	};
}

export async function loadTiledLevel(path: string): Promise<{ level: LevelData; objects: LevelObjectData }> {
	const resp = await fetch(path);
	const json = await resp.json();
	return parseTiledMap(json);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/levels/loader.ts
git commit -m "feat: add Tiled JSON level loader with spawn, obstacles, and collectibles"
```

---

## Task 24: Customization Screen (Placeholder)

**Files:**
- Create: `src/scenes/customize.ts`

- [ ] **Step 1: Implement basic customization scene**

```ts
// src/scenes/customize.ts
import type { Scene } from "../engine/scene-manager";
import type { Game } from "../engine/game";
import { COLORS, INTERNAL_WIDTH } from "../utils/constants";
import type { SaveData } from "../utils/storage";

const HAIR_OPTIONS = ["default", "short", "braids", "bun"];
const OUTFIT_OPTIONS = ["default", "malla-roja", "malla-azul", "sudadera"];

export class CustomizeScene implements Scene {
	private row = 0;
	private hairIndex = 0;
	private outfitIndex = 0;

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
			if (this.game.input.justPressed("ArrowRight")) this.hairIndex = (this.hairIndex + 1) % HAIR_OPTIONS.length;
			if (this.game.input.justPressed("ArrowLeft")) this.hairIndex = (this.hairIndex - 1 + HAIR_OPTIONS.length) % HAIR_OPTIONS.length;
		} else {
			if (this.game.input.justPressed("ArrowRight")) this.outfitIndex = (this.outfitIndex + 1) % OUTFIT_OPTIONS.length;
			if (this.game.input.justPressed("ArrowLeft")) this.outfitIndex = (this.outfitIndex - 1 + OUTFIT_OPTIONS.length) % OUTFIT_OPTIONS.length;
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
		r.drawText(`< HAIR: ${HAIR_OPTIONS[this.hairIndex]} >`, INTERNAL_WIDTH / 2, 80, hairColor, 10, "center");

		const outfitColor = this.row === 1 ? COLORS.player : COLORS.text;
		r.drawText(`< OUTFIT: ${OUTFIT_OPTIONS[this.outfitIndex]} >`, INTERNAL_WIDTH / 2, 110, outfitColor, 10, "center");

		r.fillRect(INTERNAL_WIDTH / 2 - 16, 140, 32, 32, COLORS.player);

		r.drawText("SPACE TO CONFIRM", INTERNAL_WIDTH / 2, 200, "#888", 8, "center");
	}

	exit() {}
}
```

- [ ] **Step 2: Commit**

```bash
git add src/scenes/customize.ts
git commit -m "feat: add customization screen with hair and outfit selection"
```

---

This is the complete implementation plan. Every core system is covered:

- **Engine:** game loop, input, renderer, camera, physics, scene manager, audio stub
- **Entities:** player (with special moves), obstacles, collectibles
- **Scenes:** title, customize, level-select, level, reception, score, game-over
- **Utils:** sprite animation, storage, constants
- **Levels:** hardcoded test level + Tiled JSON loader
- **Infra:** Bun build, Biome lint, bun test

**What's left for future tasks (after sprites/art exist):**
- Replace colored rectangles with actual sprite rendering
- Create Tiled levels for all 4 gymnastic apparatus
- Implement timer per level
- Wire special moves into player update with visual feedback
- Add Web Audio API implementation
- Cosmetic rendering on player sprite

---

Plan complete and saved to `docs/superpowers/plans/2026-04-20-grech-arcade.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?