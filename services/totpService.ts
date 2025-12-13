import { TOTP } from 'totp-generator';
import type { Account, CodeData } from '@/types/account';

class TotpService {
	async generateCode(secret: string, period: number = 30): Promise<string> {
		try {
			const { otp } = await TOTP.generate(secret, { period });

			return otp;
		} catch (error) {
			console.error('Error generating TOTP:', error);
			return '------';
		}
	}

	generateCodes(accounts: Account[]): { [key: string]: CodeData } {
		const codes: { [key: string]: CodeData } = {};
		const now = Math.floor(Date.now() / 1000);

		accounts.forEach(async (account) => {
			const period = account.period || 30;
			const timeRemaining = period - (now % period);
			const progress = (timeRemaining / period) * 100;
			const current = await this.generateCode(account.secret, period);
			codes[account._id] = { current, timeRemaining, progress };
		});

		return codes;
	}

	validateSecret(secret: string, period: number = 30): boolean {
		try {
			this.generateCode(secret, period);
			return true;
		} catch {
			return false;
		}
	}
}

export const totpService = new TotpService();
