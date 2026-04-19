import { describe, expect, test } from "bun:test";
import type { AABB } from "../../src/engine/physics";
import { aabbOverlap, resolveTileCollisionsX, resolveTileCollisionsY } from "../../src/engine/physics";

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
	const solidAt = (_tx: number, ty: number) => {
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
