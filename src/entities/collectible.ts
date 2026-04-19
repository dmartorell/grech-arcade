import type { AABB } from "../engine/physics";

export type CollectibleType =
	| "bronze"
	| "cup"
	| "gold"
	| "magnesium"
	| "silver"
	| "trophy"
	| "water";

const POINT_VALUES: Record<CollectibleType, number> = {
	bronze: 100,
	cup: 300,
	gold: 500,
	magnesium: 0,
	silver: 200,
	trophy: 1000,
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
