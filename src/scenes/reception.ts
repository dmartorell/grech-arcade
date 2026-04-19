import type { Game } from "../engine/game";
import type { Scene } from "../engine/scene-manager";
import { COLORS, INTERNAL_HEIGHT, INTERNAL_WIDTH } from "../utils/constants";

export type ReceptionResult = "good" | "miss" | "perfect";

export class ReceptionBar {
	position = 0;
	private direction = 1;
	private perfectRadius = 0.03;
	private speed = 0.02;

	constructor(private zoneRadius: number) {}

	tick() {
		this.position += this.speed * this.direction;
		if (this.position >= 1) {
			this.position = 1;
			this.direction = -1;
		} else if (this.position <= 0) {
			this.position = 0;
			this.direction = 1;
		}
	}

	evaluate(pos: number): ReceptionResult {
		const dist = Math.round(Math.abs(pos - 0.5) * 1e9) / 1e9;
		if (dist <= this.perfectRadius) return "perfect";
		if (dist < this.zoneRadius) return "good";
		return "miss";
	}
}

const ZONE_RADII = [0.2, 0.15, 0.1, 0.06];

export class ReceptionScene implements Scene {
	private bar!: ReceptionBar;
	private result: ReceptionResult | null = null;
	private levelIndex: number;
	private showTimer = 0;

	constructor(
		private game: Game,
		levelIndex: number,
		private onComplete: (result: ReceptionResult) => void,
	) {
		this.levelIndex = levelIndex;
	}

	enter() {
		this.bar = new ReceptionBar(ZONE_RADII[this.levelIndex] ?? 0.15);
		this.result = null;
		this.showTimer = 0;
	}

	update() {
		if (this.result !== null) {
			this.showTimer++;
			if (this.showTimer > 120) {
				this.onComplete(this.result);
			}
			return;
		}

		this.bar.tick();

		if (this.game.input.justPressed("Space")) {
			this.result = this.bar.evaluate(this.bar.position);
		}
	}

	render() {
		const r = this.game.renderer;
		r.clear(COLORS.bg);

		const barH = 20;
		const barW = 300;
		const barX = (INTERNAL_WIDTH - barW) / 2;
		const barY = INTERNAL_HEIGHT / 2;

		r.fillRect(barX, barY - barH / 2, barW, barH, "#333");

		const zoneRadius = ZONE_RADII[this.levelIndex] ?? 0.15;
		const zoneW = barW * zoneRadius * 2;
		const zoneX = barX + barW / 2 - zoneW / 2;
		r.fillRect(zoneX, barY - barH / 2, zoneW, barH, "#4a4");

		const perfectW = barW * 0.06;
		const perfectX = barX + barW / 2 - perfectW / 2;
		r.fillRect(perfectX, barY - barH / 2, perfectW, barH, "#6f6");

		const indicatorX = barX + barW * this.bar.position;
		r.fillRect(indicatorX - 2, barY - barH / 2 - 4, 4, barH + 8, COLORS.text);

		r.drawText("PRESS SPACE TO LAND!", INTERNAL_WIDTH / 2, barY - 40, COLORS.text, 10, "center");

		if (this.result !== null) {
			const labels: Record<ReceptionResult, string> = {
				good: "GOOD!",
				miss: "MISS...",
				perfect: "PERFECT!",
			};
			const colors: Record<ReceptionResult, string> = {
				good: "#6ec6c8",
				miss: "#e85050",
				perfect: "#ffd700",
			};
			r.drawText(
				labels[this.result],
				INTERNAL_WIDTH / 2,
				barY + 30,
				colors[this.result],
				16,
				"center",
			);
		}
	}

	exit() {}
}
