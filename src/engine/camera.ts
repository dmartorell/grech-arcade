export class Camera {
	x = 0;
	y = 0;
	private levelW = Number.POSITIVE_INFINITY;
	private levelH = Number.POSITIVE_INFINITY;
	private lerp = 0.1;

	constructor(
		private viewW: number,
		private viewH: number,
		private deadZoneW: number,
		private deadZoneH: number,
	) {}

	setLevelSize(w: number, h: number) {
		this.levelW = w;
		this.levelH = h;
	}

	follow(targetX: number, targetY: number) {
		const screenX = targetX - this.x;
		const screenY = targetY - this.y;

		const dzLeft = (this.viewW - this.deadZoneW) / 2;
		const dzRight = dzLeft + this.deadZoneW;
		const dzTop = (this.viewH - this.deadZoneH) / 2;
		const dzBottom = dzTop + this.deadZoneH;

		let idealX = this.x;
		let idealY = this.y;

		if (screenX < dzLeft) idealX = targetX - dzLeft;
		if (screenX > dzRight) idealX = targetX - dzRight;
		if (screenY < dzTop) idealY = targetY - dzTop;
		if (screenY > dzBottom) idealY = targetY - dzBottom;

		this.x += (idealX - this.x) * this.lerp;
		this.y += (idealY - this.y) * this.lerp;

		this.x = Math.max(0, Math.min(this.x, this.levelW - this.viewW));
		this.y = Math.max(0, Math.min(this.y, this.levelH - this.viewH));
	}
}
