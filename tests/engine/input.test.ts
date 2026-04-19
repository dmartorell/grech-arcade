import { beforeEach, describe, expect, test } from "bun:test";
import { Input } from "../../src/engine/input";

describe("Input", () => {
	let input: Input;

	beforeEach(() => {
		input = new Input();
	});

	test("key is not pressed by default", () => {
		expect(input.isDown("ArrowLeft")).toBe(false);
	});

	test("key registers as pressed after keydown", () => {
		input.handleKeyDown("ArrowLeft");
		expect(input.isDown("ArrowLeft")).toBe(true);
	});

	test("key registers as released after keyup", () => {
		input.handleKeyDown("ArrowLeft");
		input.handleKeyUp("ArrowLeft");
		expect(input.isDown("ArrowLeft")).toBe(false);
	});

	test("justPressed is true only for one update cycle", () => {
		input.handleKeyDown("Space");
		expect(input.justPressed("Space")).toBe(true);
		input.update();
		expect(input.justPressed("Space")).toBe(false);
	});

	test("justReleased is true only for one update cycle", () => {
		input.handleKeyDown("Space");
		input.handleKeyUp("Space");
		expect(input.justReleased("Space")).toBe(true);
		input.update();
		expect(input.justReleased("Space")).toBe(false);
	});
});
