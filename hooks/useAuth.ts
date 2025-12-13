import { useState, useEffect } from 'react';

export const useAuth = () => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [userToken, setUserToken] = useState<string | null>(null);
	const [currentUsername, setCurrentUsername] = useState<string | null>(null);

	useEffect(() => {
		const token = localStorage.getItem('user-token');
		const username = localStorage.getItem('username');
		if (token && username) {
			setUserToken(token);
			setCurrentUsername(username);
			setIsAuthenticated(true);
		} else {
			setIsAuthenticated(false);
		}
	}, []);

	const login = (token: string, username: string) => {
		localStorage.setItem('user-token', token);
		localStorage.setItem('username', username);
		setUserToken(token);
		setCurrentUsername(username);
		setIsAuthenticated(true);
	};

	const logout = () => {
		setIsAuthenticated(false);
		setUserToken(null);
		setCurrentUsername(null);
		localStorage.removeItem('user-token');
		localStorage.removeItem('username');
	};

	return {
		isAuthenticated,
		userToken,
		currentUsername,
		login,
		logout,
	};
};
