export interface AudioManager {
	playMusic(track: string): void;
	stopMusic(): void;
	playSfx(name: string): void;
	setMusicVolume(v: number): void;
	setSfxVolume(v: number): void;
}

export class AudioStub implements AudioManager {
	playMusic(_track: string) {}
	stopMusic() {}
	playSfx(_name: string) {}
	setMusicVolume(_v: number) {}
	setSfxVolume(_v: number) {}
}
