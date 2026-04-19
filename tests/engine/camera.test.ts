import { describe, expect, test, beforeEach } from "bun:test";
import { Camera } from "../../src/engine/camera";

describe("Camera", () => {
	let cam: Camera;

	beforeEach(() => {
		cam = new Camera(400, 225, 60, 40);
	});

	test("starts at 0,0", () => {
		expect(cam.x).toBe(0);
		expect(cam.y).toBe(0);
	});

	test("does not move when target is inside dead zone", () => {
		cam.follow(200, 112);
		expect(cam.x).toBe(0);
		expect(cam.y).toBe(0);
	});

	test("moves when target exits dead zone horizontally", () => {
		cam.follow(300, 112);
		cam.follow(300, 112);
		cam.follow(300, 112);
		expect(cam.x).toBeGreaterThan(0);
	});

	test("clamps to level bounds", () => {
		cam.setLevelSize(800, 450);
		cam.follow(700, 400);
		for (let i = 0; i < 200; i++) cam.follow(700, 400);
		expect(cam.x).toBeLessThanOrEqual(400);
		expect(cam.y).toBeLessThanOrEqual(225);
	});

	test("never goes negative", () => {
		cam.follow(-100, -100);
		for (let i = 0; i < 200; i++) cam.follow(-100, -100);
		expect(cam.x).toBeGreaterThanOrEqual(0);
		expect(cam.y).toBeGreaterThanOrEqual(0);
	});
});
