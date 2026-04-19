const STORAGE_KEY = "grech-arcade";

export interface SaveData {
	equippedCosmetics: {
		hair: string;
		outfit: string;
	};
	highScores: { initials: string; score: number }[];
	levelsCompleted: boolean[];
	unlockedCosmetics: string[];
}

export function defaultSaveData(): SaveData {
	return {
		equippedCosmetics: { hair: "default", outfit: "default" },
		highScores: [],
		levelsCompleted: [false, false, false, false],
		unlockedCosmetics: [],
	};
}

export class Storage {
	constructor(private backend: globalThis.Storage = localStorage) {}

	load(): SaveData {
		const raw = this.backend.getItem(STORAGE_KEY);
		if (!raw) return defaultSaveData();
		try {
			return JSON.parse(raw) as SaveData;
		} catch {
			return defaultSaveData();
		}
	}

	save(data: SaveData) {
		this.backend.setItem(STORAGE_KEY, JSON.stringify(data));
	}

	addHighScore(data: SaveData, initials: string, score: number) {
		data.highScores.push({ initials, score });
		data.highScores.sort((a, b) => b.score - a.score);
		data.highScores = data.highScores.slice(0, 10);
	}
}
