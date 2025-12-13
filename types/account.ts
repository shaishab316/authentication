export interface Account {
	_id: string;
	name: string;
	issuer: string;
	secret: string;
	tags: string[];
}

export interface CodeData {
	current: string;
	timeRemaining: number;
	progress: number;
}
