import { describe, expect, test, beforeEach } from "bun:test";
import { Player } from "../../src/entities/player";
import { Input } from "../../src/engine/input";

const noSolid = () => false;
const floorAt7 = (_tx: number, ty: number) => ty === 7;

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
