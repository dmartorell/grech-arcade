import { beforeEach, describe, expect, test } from "bun:test";
import type { SaveData } from "../../src/utils/storage";
import { Storage, defaultSaveData } from "../../src/utils/storage";

class MockStorage {
	private data: Record<string, string> = {};
	getItem(key: string) { return this.data[key] ?? null; }
	setItem(key: string, value: string) { this.data[key] = value; }
	removeItem(key: string) { delete this.data[key]; }
}

describe("Storage", () => {
	let store: Storage;

	beforeEach(() => {
		store = new Storage(new MockStorage() as unknown as globalThis.Storage);
	});

	test("returns default save data when nothing stored", () => {
		const data = store.load();
		expect(data.levelsCompleted).toEqual([false, false, false, false]);
		expect(data.highScores).toEqual([]);
	});

	test("saves and loads data", () => {
		const data = defaultSaveData();
		data.levelsCompleted[0] = true;
		data.unlockedCosmetics.push("malla-roja");
		store.save(data);
		const loaded = store.load();
		expect(loaded.levelsCompleted[0]).toBe(true);
		expect(loaded.unlockedCosmetics).toContain("malla-roja");
	});

	test("addHighScore inserts in sorted order", () => {
		const data = defaultSaveData();
		store.addHighScore(data, "AAA", 500);
		store.addHighScore(data, "BBB", 1000);
		store.addHighScore(data, "CCC", 750);
		expect(data.highScores[0].initials).toBe("BBB");
		expect(data.highScores[1].initials).toBe("CCC");
		expect(data.highScores[2].initials).toBe("AAA");
	});

	test("addHighScore caps at 10 entries", () => {
		const data = defaultSaveData();
		for (let i = 0; i < 12; i++) {
			store.addHighScore(data, `P${i.toString().padStart(2, "0")}`, i * 100);
		}
		expect(data.highScores.length).toBe(10);
	});
});
