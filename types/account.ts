export interface Account {
	_id: string;
	name: string;
	issuer: string;
	secret: string;
	tags: string[];
	period?: number; // TOTP time period in seconds (default: 30)
}

export interface CodeData {
	current: string;
	timeRemaining: number;
	progress: number;
}
