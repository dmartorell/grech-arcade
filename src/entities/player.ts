import type { Input } from "../engine/input";
import { resolveTileCollisionsX, resolveTileCollisionsY } from "../engine/physics";
import {
	COYOTE_FRAMES,
	FIXED_DT,
	GRAVITY,
	GRAVITY_DOWN_MULT,
	JUMP_BUFFER_FRAMES,
	JUMP_CUT_MULT,
	JUMP_VELOCITY,
	MOVE_SPEED,
	PLAYER_HEIGHT,
	PLAYER_WIDTH,
	TILE_SIZE,
} from "../utils/constants";

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

export interface MoveContext {
	downHeld: boolean;
	grounded: boolean;
	inBarZone: boolean;
	running: boolean;
	unlocked: Set<string>;
}

export type SpecialMove =
	| "equilibrio"
	| "lateral"
	| "paloma"
	| "puente"
	| "rondada"
	| "spagat"
	| "voltereta";

export function resolveSpecialMove(ctx: MoveContext): SpecialMove | null {
	if (!ctx.grounded && ctx.unlocked.has("paloma")) return "paloma";
	if (ctx.inBarZone && ctx.unlocked.has("equilibrio")) return "equilibrio";
	if (ctx.downHeld && !ctx.running && ctx.unlocked.has("puente")) return "puente";
	if (ctx.downHeld && ctx.running && ctx.unlocked.has("spagat")) return "spagat";
	if (!ctx.running && ctx.unlocked.has("voltereta")) return "voltereta";
	if (ctx.running && ctx.unlocked.has("lateral")) return "lateral";
	return null;
}
