import { COLORS, INTERNAL_HEIGHT, INTERNAL_WIDTH } from "./utils/constants";

const canvas = document.getElementById("game") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

canvas.width = INTERNAL_WIDTH;
canvas.height = INTERNAL_HEIGHT;

function resize() {
	const scaleX = Math.floor(window.innerWidth / INTERNAL_WIDTH);
	const scaleY = Math.floor(window.innerHeight / INTERNAL_HEIGHT);
	const scale = Math.max(1, Math.min(scaleX, scaleY));
	canvas.style.width = `${INTERNAL_WIDTH * scale}px`;
	canvas.style.height = `${INTERNAL_HEIGHT * scale}px`;
}

window.addEventListener("resize", resize);
resize();

ctx.imageSmoothingEnabled = false;
ctx.fillStyle = COLORS.bg;
ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);

ctx.fillStyle = COLORS.text;
ctx.font = "16px monospace";
ctx.textAlign = "center";
ctx.fillText("GRECH ARCADE", INTERNAL_WIDTH / 2, INTERNAL_HEIGHT / 2);
