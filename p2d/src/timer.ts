export class Timer {
	private name: string;
	private startTime: number | null = null;
	private endTime: number | null = null;
	private duration: number | null = null;

	constructor(name: string = 'Unnamed Timer') {
		this.name = name;
	}

	start(): void {
		this.startTime = performance.now();
		this.endTime = null;
		this.duration = null;
	}

	stop(): number | undefined {
		if (!this.startTime) {
			return undefined;
		}
		this.endTime = performance.now();
		this.duration = this.endTime - this.startTime;
		return this.duration;
	}

	getDuration(): number | null {
		if (this.duration !== null) {
			return this.duration;
		} else if (this.startTime && !this.endTime) {
			return performance.now() - this.startTime;
		} else {
			return null;
		}
	}
}
