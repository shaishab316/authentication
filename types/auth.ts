export interface AuthState {
	isAuthenticated: boolean;
	userToken: string | null;
	currentUsername: string | null;
}

export interface LoginCredentials {
	username: string;
	password: string;
}
