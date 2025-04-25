export class Timer {
	private name: string;
	private startTime: number | null = null;
	private endTime: number | null = null;
	private duration: number | null = null;
	private timeSamples = 0;
	private timeTotal = 0;
	private timeAvg = 0;

	constructor(name: string = 'Unnamed Timer') {
		this.name = name;
	}

	resetTimes(): void {
		this.timeSamples = 0;
		this.timeTotal = 0;
		this.timeAvg = 0;
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

		this.timeSamples++;
		this.timeTotal += this.duration;
		this.timeAvg = this.timeTotal / this.timeSamples;

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

	getTimeSamples(): number {
		return this.timeSamples;
	}

	getTimeTotal(): number {
		return this.timeTotal;
	}

	getTimeAvg(): number {
		return this.timeAvg;
	}
}
