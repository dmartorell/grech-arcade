import type { CollectibleType } from "../entities/collectible";
import type { ObstacleConfig } from "../entities/obstacle";
import { TILE_SIZE } from "../utils/constants";

export interface LevelData {
	height: number;
	spawnX: number;
	spawnY: number;
	terrain: number[];
	tileSize: number;
	width: number;
}

export interface LevelObjectData {
	collectibles: { type: CollectibleType; x: number; y: number }[];
	obstacles: ObstacleConfig[];
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

export const testLevelObjects: LevelObjectData = {
	collectibles: [
		{ type: "gold", x: 4 * TILE_SIZE, y: (H - 3) * TILE_SIZE },
		{ type: "silver", x: 12 * TILE_SIZE, y: (H - 5) * TILE_SIZE },
		{ type: "bronze", x: 20 * TILE_SIZE, y: (H - 5) * TILE_SIZE },
		{ type: "cup", x: 30 * TILE_SIZE, y: (H - 4) * TILE_SIZE },
		{ type: "trophy", x: 44 * TILE_SIZE, y: (H - 5) * TILE_SIZE },
	],
	obstacles: [
		{ h: TILE_SIZE, mobile: false, w: TILE_SIZE, x: 7 * TILE_SIZE, y: (H - 2) * TILE_SIZE },
		{
			h: TILE_SIZE,
			mobile: true,
			moveRangeX: 3 * TILE_SIZE,
			moveSpeed: 50,
			w: TILE_SIZE,
			x: 24 * TILE_SIZE,
			y: (H - 2) * TILE_SIZE,
		},
	],
};
