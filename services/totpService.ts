import { TOTP } from 'totp-generator';
import type { Account, CodeData } from '@/types/account';

class TotpService {
	async generateCode(secret: string): Promise<string> {
		try {
			const { otp } = await TOTP.generate(secret);

			return otp;
		} catch (error) {
			console.error('Error generating TOTP:', error);
			return '------';
		}
	}

	generateCodes(accounts: Account[]): { [key: string]: CodeData } {
		const codes: { [key: string]: CodeData } = {};
		const now = Math.floor(Date.now() / 1000);
		const timeRemaining = 30 - (now % 30);
		const progress = (timeRemaining / 30) * 100;

		accounts.forEach(async (account) => {
			const current = await this.generateCode(account.secret);
			codes[account._id] = { current, timeRemaining, progress };
		});

		return codes;
	}

	validateSecret(secret: string): boolean {
		try {
			this.generateCode(secret);
			return true;
		} catch {
			return false;
		}
	}
}

export const totpService = new TotpService();
