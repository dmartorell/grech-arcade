export class Animation {
	private frameIndex = 0;
	private tickCount = 0;
	finished = false;

	constructor(
		private frames: number[],
		private ticksPerFrame: number,
		private loop = true,
	) {}

	tick() {
		if (this.finished) return;
		this.tickCount++;
		if (this.tickCount >= this.ticksPerFrame) {
			this.tickCount = 0;
			this.frameIndex++;
			if (this.frameIndex >= this.frames.length) {
				if (this.loop) {
					this.frameIndex = 0;
				} else {
					this.frameIndex = this.frames.length - 1;
					this.finished = true;
				}
			}
		}
	}

	currentFrame(): number {
		return this.frames[this.frameIndex];
	}

	reset() {
		this.frameIndex = 0;
		this.tickCount = 0;
		this.finished = false;
	}
}

export function loadImage(src: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = reject;
		img.src = src;
	});
}
