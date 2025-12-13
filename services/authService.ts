class AuthService {
	private baseUrl = '/api/auth';

	async login(username: string, password: string) {
		const response = await fetch(`${this.baseUrl}/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username, password }),
		});
		const data = await response.json();
		if (!response.ok) throw new Error(data.message || 'Login failed');
		return data;
	}

	async register(username: string, password: string) {
		const response = await fetch(`${this.baseUrl}/register`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username, password }),
		});
		const data = await response.json();
		if (!response.ok) throw new Error(data.message || 'Registration failed');
		return data;
	}

	getStoredAuth() {
		if (typeof window === 'undefined') return null;
		const token = localStorage.getItem('user-token');
		const username = localStorage.getItem('username');
		return token && username ? { token, username } : null;
	}

	storeAuth(token: string, username: string) {
		localStorage.setItem('user-token', token);
		localStorage.setItem('username', username);
	}

	clearAuth() {
		localStorage.removeItem('user-token');
		localStorage.removeItem('username');
	}
}

export const authService = new AuthService();
