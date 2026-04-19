import { Camera } from "../engine/camera";
import type { Game } from "../engine/game";
import type { Scene } from "../engine/scene-manager";
import { Player } from "../entities/player";
import type { LevelData } from "../levels/test-level";
import { COLORS, INTERNAL_HEIGHT, INTERNAL_WIDTH, TILE_SIZE } from "../utils/constants";

export class LevelScene implements Scene {
	private camera!: Camera;
	private level!: LevelData;
	private lives = 3;
	private player!: Player;
	private score = 0;

	constructor(
		private game: Game,
		private levelData: LevelData,
	) {}

	enter() {
		this.level = this.levelData;
		this.player = new Player(this.level.spawnX, this.level.spawnY);
		this.camera = new Camera(INTERNAL_WIDTH, INTERNAL_HEIGHT, 80, 50);
		this.camera.setLevelSize(this.level.width * TILE_SIZE, this.level.height * TILE_SIZE);
	}

	update() {
		const isSolid = (tx: number, ty: number): boolean => {
			if (tx < 0 || tx >= this.level.width || ty < 0 || ty >= this.level.height) return false;
			return this.level.terrain[ty * this.level.width + tx] !== 0;
		};

		this.player.update(this.game.input, isSolid);
		this.camera.follow(this.player.x + this.player.w / 2, this.player.y + this.player.h / 2);

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
