import { describe, expect, test } from "bun:test";
import { ReceptionBar } from "../../src/scenes/reception";

describe("ReceptionBar", () => {
	test("indicator oscillates between 0 and 1", () => {
		const bar = new ReceptionBar(0.3);
		const positions: number[] = [];
		for (let i = 0; i < 120; i++) {
			bar.tick();
			positions.push(bar.position);
		}
		expect(Math.min(...positions)).toBeGreaterThanOrEqual(0);
		expect(Math.max(...positions)).toBeLessThanOrEqual(1);
	});

	test("perfect zone in center returns 'perfect' result", () => {
		const bar = new ReceptionBar(0.3);
		const result = bar.evaluate(0.5);
		expect(result).toBe("perfect");
	});

	test("within zone returns 'good' result", () => {
		const bar = new ReceptionBar(0.3);
		const result = bar.evaluate(0.6);
		expect(result).toBe("good");
	});

	test("outside zone returns 'miss' result", () => {
		const bar = new ReceptionBar(0.3);
		const result = bar.evaluate(0.1);
		expect(result).toBe("miss");
	});

	test("zone shrinks for higher difficulty", () => {
		const easy = new ReceptionBar(0.4);
		const hard = new ReceptionBar(0.1);
		expect(easy.evaluate(0.6)).toBe("good");
		expect(hard.evaluate(0.6)).toBe("miss");
	});
});
