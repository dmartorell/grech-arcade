import { describe, expect, test } from "bun:test";
import { resolveSpecialMove } from "../../src/entities/player";

describe("resolveSpecialMove", () => {
	const allMoves = new Set(["equilibrio", "lateral", "paloma", "puente", "rondada", "spagat", "voltereta"]);

	test("Z in air → paloma", () => {
		expect(resolveSpecialMove({
			downHeld: false, grounded: false, inBarZone: false, running: false, unlocked: allMoves,
		})).toBe("paloma");
	});

	test("Z + down + still → puente", () => {
		expect(resolveSpecialMove({
			downHeld: true, grounded: true, inBarZone: false, running: false, unlocked: allMoves,
		})).toBe("puente");
	});

	test("Z + down + running → spagat", () => {
		expect(resolveSpecialMove({
			downHeld: true, grounded: true, inBarZone: false, running: true, unlocked: allMoves,
		})).toBe("spagat");
	});

	test("Z + still → voltereta", () => {
		expect(resolveSpecialMove({
			downHeld: false, grounded: true, inBarZone: false, running: false, unlocked: allMoves,
		})).toBe("voltereta");
	});

	test("Z + running → lateral", () => {
		expect(resolveSpecialMove({
			downHeld: false, grounded: true, inBarZone: false, running: true, unlocked: allMoves,
		})).toBe("lateral");
	});

	test("Z + bar zone → equilibrio", () => {
		expect(resolveSpecialMove({
			downHeld: false, grounded: true, inBarZone: true, running: false, unlocked: allMoves,
		})).toBe("equilibrio");
	});

	test("returns null when move not unlocked", () => {
		expect(resolveSpecialMove({
			downHeld: false, grounded: false, inBarZone: false, running: false, unlocked: new Set(),
		})).toBeNull();
	});
});
