import { INTERNAL_HEIGHT, INTERNAL_WIDTH, TILE_SIZE } from "../utils/constants";

export class Renderer {
	readonly canvas: HTMLCanvasElement;
	readonly ctx: CanvasRenderingContext2D;

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
		canvas.width = INTERNAL_WIDTH;
		canvas.height = INTERNAL_HEIGHT;
		this.ctx.imageSmoothingEnabled = false;
	}

	clear(color: string) {
		this.ctx.fillStyle = color;
		this.ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);
	}

	fillRect(x: number, y: number, w: number, h: number, color: string) {
		this.ctx.fillStyle = color;
		this.ctx.fillRect(Math.round(x), Math.round(y), w, h);
	}

	drawSprite(
		img: HTMLImageElement,
		sx: number,
		sy: number,
		sw: number,
		sh: number,
		dx: number,
		dy: number,
		dw: number,
		dh: number,
		flipX = false,
	) {
		this.ctx.save();
		if (flipX) {
			this.ctx.translate(Math.round(dx) + dw, Math.round(dy));
			this.ctx.scale(-1, 1);
			this.ctx.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh);
		} else {
			this.ctx.drawImage(img, sx, sy, sw, sh, Math.round(dx), Math.round(dy), dw, dh);
		}
		this.ctx.restore();
	}

	drawText(
		text: string,
		x: number,
		y: number,
		color: string,
		size = 8,
		align: CanvasTextAlign = "left",
	) {
		this.ctx.fillStyle = color;
		this.ctx.font = `${size}px monospace`;
		this.ctx.textAlign = align;
		this.ctx.textBaseline = "top";
		this.ctx.fillText(text, Math.round(x), Math.round(y));
	}

	drawTile(img: HTMLImageElement, tileId: number, tilesPerRow: number, dx: number, dy: number) {
		const sx = (tileId % tilesPerRow) * TILE_SIZE;
		const sy = Math.floor(tileId / tilesPerRow) * TILE_SIZE;
		this.ctx.drawImage(
			img,
			sx,
			sy,
			TILE_SIZE,
			TILE_SIZE,
			Math.round(dx),
			Math.round(dy),
			TILE_SIZE,
			TILE_SIZE,
		);
	}

	resize() {
		const scaleX = Math.floor(window.innerWidth / INTERNAL_WIDTH);
		const scaleY = Math.floor(window.innerHeight / INTERNAL_HEIGHT);
		const scale = Math.max(1, Math.min(scaleX, scaleY));
		this.canvas.style.width = `${INTERNAL_WIDTH * scale}px`;
		this.canvas.style.height = `${INTERNAL_HEIGHT * scale}px`;
	}
}
