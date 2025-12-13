import type { Account } from '@/types/account';

class AccountService {
	private baseUrl = '/api/accounts';

	async fetchAccounts(token: string): Promise<Account[]> {
		const response = await fetch(this.baseUrl, {
			headers: { Authorization: `Bearer ${token}` },
		});
		if (!response.ok) throw new Error('Failed to fetch accounts');
		return response.json();
	}

	async addAccount(
		accountData: Omit<Account, '_id'>,
		token: string
	): Promise<Account> {
		const response = await fetch(this.baseUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(accountData),
		});
		if (!response.ok) throw new Error('Failed to add account');
		return response.json();
	}

	async removeAccount(id: string, token: string): Promise<void> {
		const response = await fetch(`${this.baseUrl}?id=${id}`, {
			method: 'DELETE',
			headers: { Authorization: `Bearer ${token}` },
		});
		if (!response.ok) throw new Error('Failed to delete account');
	}
}

export const accountService = new AccountService();
