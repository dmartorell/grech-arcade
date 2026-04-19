export interface AABB {
	x: number;
	y: number;
	w: number;
	h: number;
}

export function aabbOverlap(a: AABB, b: AABB): boolean {
	return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

type SolidCheck = (tileX: number, tileY: number) => boolean;

export function resolveTileCollisionsX(
	x: number,
	y: number,
	w: number,
	h: number,
	tileSize: number,
	isSolid: SolidCheck,
): number {
	const top = Math.floor(y / tileSize);
	const bottom = Math.floor((y + h - 1) / tileSize);
	const right = Math.floor((x + w - 1) / tileSize);
	const left = Math.floor(x / tileSize);
	let resolvedX = x;

	for (let ty = top; ty <= bottom; ty++) {
		if (isSolid(right, ty)) {
			resolvedX = right * tileSize - w;
		}
		if (isSolid(left, ty)) {
			resolvedX = (left + 1) * tileSize;
		}
	}
	return resolvedX;
}

export interface TileCollisionResultY {
	y: number;
	grounded: boolean;
	hitCeiling: boolean;
}

export function resolveTileCollisionsY(
	x: number,
	y: number,
	w: number,
	h: number,
	tileSize: number,
	isSolid: SolidCheck,
): TileCollisionResultY {
	let grounded = false;
	let hitCeiling = false;
	const left = Math.floor(x / tileSize);
	const right = Math.floor((x + w - 1) / tileSize);
	const bottom = Math.floor((y + h - 1) / tileSize);
	const top = Math.floor(y / tileSize);
	let resolvedY = y;

	for (let tx = left; tx <= right; tx++) {
		if (isSolid(tx, bottom)) {
			resolvedY = bottom * tileSize - h;
			grounded = true;
		}
		if (isSolid(tx, top)) {
			resolvedY = (top + 1) * tileSize;
			hitCeiling = true;
		}
	}
	return { y: resolvedY, grounded, hitCeiling };
}
