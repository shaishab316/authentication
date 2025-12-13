import { useState, useEffect } from 'react';
import type { Account } from '@/types/account';
import { toast } from 'react-toastify';

export const useAccounts = (
	isAuthenticated: boolean,
	userToken: string | null,
	onLogout: () => void
) => {
	const [accounts, setAccounts] = useState<Account[]>([]);

	const fetchAccounts = async (token: string) => {
		try {
			const response = await fetch('/api/accounts', {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			if (!response.ok) {
				throw new Error('Failed to fetch accounts');
			}
			const data: Account[] = await response.json();
			setAccounts(data);
		} catch (error) {
			console.error('Error fetching accounts:', error);
			toast.error('Failed to load accounts. Please log in again.');
			onLogout();
		}
	};

	useEffect(() => {
		if (isAuthenticated && userToken) {
			fetchAccounts(userToken);
		} else {
			setAccounts([]);
		}
	}, [isAuthenticated, userToken]);

	const addAccount = async (accountData: {
		name: string;
		issuer: string;
		secret: string;
		tags: string[];
	}) => {
		try {
			const response = await fetch('/api/accounts', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${userToken}`,
				},
				body: JSON.stringify(accountData),
			});

			if (!response.ok) {
				throw new Error('Failed to add account');
			}

			const addedAccount: Account = await response.json();
			setAccounts((prev) => [...prev, addedAccount]);
			return addedAccount;
		} catch (error) {
			console.error('Error adding account:', error);
			throw error;
		}
	};

	const removeAccount = async (id: string) => {
		try {
			const response = await fetch(`/api/accounts?id=${id}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${userToken}`,
				},
			});

			if (!response.ok) {
				throw new Error('Failed to delete account');
			}

			setAccounts((prev) => prev.filter((account) => account._id !== id));
		} catch (error) {
			console.error('Error removing account:', error);
			throw error;
		}
	};

	return {
		accounts,
		addAccount,
		removeAccount,
	};
};
