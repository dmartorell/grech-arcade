import { Camera } from "../engine/camera";
import type { Game } from "../engine/game";
import { aabbOverlap } from "../engine/physics";
import type { Scene } from "../engine/scene-manager";
import { Collectible } from "../entities/collectible";
import { Obstacle } from "../entities/obstacle";
import { Player } from "../entities/player";
import type { LevelData, LevelObjectData } from "../levels/test-level";
import { COLORS, INTERNAL_HEIGHT, INTERNAL_WIDTH, TILE_SIZE } from "../utils/constants";

export class LevelScene implements Scene {
	private camera!: Camera;
	private collectibles: Collectible[] = [];
	private level!: LevelData;
	private lives = 3;
	private obstacles: Obstacle[] = [];
	private player!: Player;
	private score = 0;

	constructor(
		private game: Game,
		private levelData: LevelData,
		private objectData?: LevelObjectData,
	) {}

	enter() {
		this.level = this.levelData;
		this.player = new Player(this.level.spawnX, this.level.spawnY);
		this.camera = new Camera(INTERNAL_WIDTH, INTERNAL_HEIGHT, 80, 50);
		this.camera.setLevelSize(this.level.width * TILE_SIZE, this.level.height * TILE_SIZE);
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
		this.camera.follow(this.player.x + this.player.w / 2, this.player.y + this.player.h / 2);

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
			for (const c of this.collectibles) c.collected = false;
		}
	}

	render() {
		const r = this.game.renderer;
		const cx = this.camera.x;
		const cy = this.camera.y;

		r.clear(COLORS.bg);

		const endCol = Math.ceil((cx + INTERNAL_WIDTH) / TILE_SIZE);
		const endRow = Math.ceil((cy + INTERNAL_HEIGHT) / TILE_SIZE);
		const startCol = Math.floor(cx / TILE_SIZE);
		const startRow = Math.floor(cy / TILE_SIZE);

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
