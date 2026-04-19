import { describe, test, expect, beforeEach } from "bun:test";
import { SceneManager } from "../../src/engine/scene-manager";
import type { Scene } from "../../src/engine/scene-manager";

function mockScene(log: string[]): Scene {
	return {
		enter: () => log.push("enter"),
		update: () => log.push("update"),
		render: () => log.push("render"),
		exit: () => log.push("exit"),
	};
}

describe("SceneManager", () => {
	let sm: SceneManager;
	let logA: string[];
	let logB: string[];

	beforeEach(() => {
		sm = new SceneManager();
		logA = [];
		logB = [];
		sm.register("a", mockScene(logA));
		sm.register("b", mockScene(logB));
	});

	test("switchTo calls enter on new scene", () => {
		sm.switchTo("a");
		expect(logA).toEqual(["enter"]);
	});

	test("switchTo calls exit on current before enter on new", () => {
		sm.switchTo("a");
		sm.switchTo("b");
		expect(logA).toEqual(["enter", "exit"]);
		expect(logB).toEqual(["enter"]);
	});

	test("update and render forward to current scene", () => {
		sm.switchTo("a");
		logA.length = 0;
		sm.update();
		sm.render();
		expect(logA).toEqual(["update", "render"]);
	});

	test("update and render are no-ops with no current scene", () => {
		sm.update();
		sm.render();
	});
});
