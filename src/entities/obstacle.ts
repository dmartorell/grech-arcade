import type { AABB } from "../engine/physics";
import { FIXED_DT } from "../utils/constants";

export interface ObstacleConfig {
	h: number;
	mobile: boolean;
	moveRangeX?: number;
	moveRangeY?: number;
	moveSpeed?: number;
	w: number;
	x: number;
	y: number;
}

export class Obstacle {
	x: number;
	y: number;
	w: number;
	h: number;
	private dir = 1;
	private mobile: boolean;
	private originX: number;
	private originY: number;
	private rangeX: number;
	private rangeY: number;
	private speed: number;

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
