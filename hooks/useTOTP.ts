import { useState, useEffect } from 'react';
import type { Account } from './useAccounts';
import { TOTP } from 'totp-generator';

export interface CodeData {
	current: string;
	timeRemaining: number;
	progress: number;
}

export const useTOTP = (accounts: Account[], isAuthenticated: boolean) => {
	const [codes, setCodes] = useState<{ [key: string]: CodeData }>({});

	useEffect(() => {
		if (!isAuthenticated) return;

		const updateCodes = () => {
			const newCodes: { [key: string]: CodeData } = {};
			const now = Math.floor(Date.now() / 1000);
			const timeRemaining = 30 - (now % 30);
			const progress = (timeRemaining / 30) * 100;

			accounts.forEach(async (account) => {
				try {
					const { otp } = await TOTP.generate(account.secret);
					newCodes[account._id] = {
						current: otp,
						timeRemaining,
						progress,
					};
				} catch (error) {
					console.error(`Error generating TOTP for ${account.name}:`, error);
					newCodes[account._id] = {
						current: '------',
						timeRemaining,
						progress,
					};
				}
			});
			setCodes(newCodes);
		};

		updateCodes();
		const interval = setInterval(updateCodes, 1000);
		return () => clearInterval(interval);
	}, [accounts, isAuthenticated]);

	return codes;
};
