import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { sendMail } from '@/lib/sentmail';

// Helper to generate a random 8-character password
function generateRandomPassword(length = 8): string {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	let result = '';
	const charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

export async function POST(req: Request) {
	await dbConnect();
	try {
		const { username } = await req.json();

		if (!username) {
			return NextResponse.json(
				{ message: 'Username is required' },
				{ status: 400 }
			);
		}

		const user = await User.findOne({ username });
		if (!user) {
			// For security, always return a generic message even if user not found
			return NextResponse.json(
				{
					message:
						'If an account with that username exists, a new password has been sent.',
				},
				{ status: 200 }
			);
		}

		const newPassword = '123456';
		const hashedPassword = await bcrypt.hash(newPassword, 10);

		user.password = hashedPassword;
		await user.save();

		try {
			await sendMail({
				to: user.username,
				subject: 'Your 2FA Authenticator password has been reset',
				html: `<p>Your new password is: <strong>${newPassword}</strong></p>`,
			});
		} catch (error) {
			console.error('Error sending email:', error);
		}

		return NextResponse.json(
			{
				message:
					'If an account with that username exists, a new password has been sent to your registered email (check console for demo).',
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error('Error during forgot password:', error);
		return NextResponse.json(
			{ message: 'Failed to process forgot password request.' },
			{ status: 500 }
		);
	}
}
