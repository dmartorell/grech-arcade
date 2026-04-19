import { describe, expect, test, beforeEach } from "bun:test";
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
