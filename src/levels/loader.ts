import type { CollectibleType } from "../entities/collectible";
import type { ObstacleConfig } from "../entities/obstacle";
import type { LevelData, LevelObjectData } from "./test-level";

interface TiledLayer {
	data?: number[];
	height?: number;
	name: string;
	objects?: TiledObject[];
	type: "objectgroup" | "tilelayer";
	width?: number;
}

interface TiledMap {
	height: number;
	layers: TiledLayer[];
	tileheight: number;
	tilewidth: number;
	width: number;
}

interface TiledObject {
	height: number;
	name: string;
	properties?: { name: string; value: boolean | number | string }[];
	type: string;
	width: number;
	x: number;
	y: number;
}

function getProp(obj: TiledObject, name: string): boolean | number | string | undefined {
	return obj.properties?.find((p) => p.name === name)?.value;
}

export function parseTiledMap(json: TiledMap): { level: LevelData; objects: LevelObjectData } {
	const terrainLayer = json.layers.find((l) => l.name === "Terrain" && l.type === "tilelayer");
	const objectLayer = json.layers.find((l) => l.name === "Objects" && l.type === "objectgroup");

	const terrain = (terrainLayer?.data ?? []).map((t) => (t > 0 ? 1 : 0));

	let spawnX = 64;
	let spawnY = 64;
	const obstacles: ObstacleConfig[] = [];
	const collectibles: { type: CollectibleType; x: number; y: number }[] = [];

	for (const obj of objectLayer?.objects ?? []) {
		if (obj.type === "spawn") {
			spawnX = obj.x;
			spawnY = obj.y;
		} else if (obj.type === "obstacle") {
			obstacles.push({
				h: obj.height,
				mobile: getProp(obj, "mobile") === true,
				moveRangeX: (getProp(obj, "moveRangeX") as number) ?? undefined,
				moveRangeY: (getProp(obj, "moveRangeY") as number) ?? undefined,
				moveSpeed: (getProp(obj, "moveSpeed") as number) ?? undefined,
				w: obj.width,
				x: obj.x,
				y: obj.y,
			});
		} else if (obj.type === "collectible") {
			collectibles.push({
				type: (getProp(obj, "collectibleType") as CollectibleType) ?? "bronze",
				x: obj.x,
				y: obj.y,
			});
		}
	}

	return {
		level: {
			height: json.height,
			spawnX,
			spawnY,
			terrain,
			tileSize: json.tilewidth,
			width: json.width,
		},
		objects: { collectibles, obstacles },
	};
}

export async function loadTiledLevel(
	path: string,
): Promise<{ level: LevelData; objects: LevelObjectData }> {
	const resp = await fetch(path);
	const json = (await resp.json()) as TiledMap;
	return parseTiledMap(json);
}
