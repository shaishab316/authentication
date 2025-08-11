import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Account from '@/models/Account';
import { encrypt, decrypt } from '@/lib/crypto';
import { verifyToken } from '@/lib/jwt';

// Middleware to protect routes
const authenticate = async (req: Request) => {
	const authHeader = req.headers.get('Authorization');
	const token = authHeader?.split(' ')[1];

	if (!token) {
		return {
			authenticated: false,
			response: NextResponse.json(
				{ message: 'No token provided' },
				{ status: 401 }
			),
		};
	}

	const decoded = verifyToken(token);
	if (!decoded || typeof decoded === 'string') {
		return {
			authenticated: false,
			response: NextResponse.json(
				{ message: 'Invalid token' },
				{ status: 403 }
			),
		};
	}

	return { authenticated: true, userId: decoded.userId };
};

export async function GET(req: Request) {
	const authResult = await authenticate(req);
	if (!authResult.authenticated) {
		return authResult.response;
	}

	await dbConnect();
	try {
		const accounts = await Account.find({ userId: authResult.userId });
		// Decrypt secrets before sending to client
		const decryptedAccounts = accounts
			.map((account) => ({
				...account.toObject(),
				secret: decrypt(account.secret),
			}))
			.filter((account) => account.secret !== '');
		return NextResponse.json(decryptedAccounts, { status: 200 });
	} catch (error) {
		console.error('Error fetching accounts:', error);
		return NextResponse.json(
			{ message: 'Failed to fetch accounts' },
			{ status: 500 }
		);
	}
}

export async function POST(req: Request) {
	const authResult = await authenticate(req);
	if (!authResult.authenticated) {
		return authResult.response;
	}

	await dbConnect();
	try {
		const body = await req.json();
		const { name, issuer, secret, tags } = body;

		// Encrypt secret before saving
		const encryptedSecret = encrypt(secret);

		const newAccount = await Account.create({
			userId: authResult.userId,
			name,
			issuer,
			secret: encryptedSecret,
			tags,
		});
		// Decrypt the secret for the response, as the client expects it decrypted
		const responseAccount = newAccount.toObject();
		responseAccount.secret = decrypt(responseAccount.secret);

		return NextResponse.json(responseAccount, { status: 201 });
	} catch (error) {
		console.error('Error adding account:', error);
		return NextResponse.json(
			{ message: 'Failed to add account' },
			{ status: 500 }
		);
	}
}

export async function DELETE(req: Request) {
	const authResult = await authenticate(req);
	if (!authResult.authenticated) {
		return authResult.response;
	}

	await dbConnect();
	try {
		const { searchParams } = new URL(req.url);
		const id = searchParams.get('id');

		if (!id) {
			return NextResponse.json(
				{ message: 'Account ID is required' },
				{ status: 400 }
			);
		}

		const deletedAccount = await Account.findOneAndDelete({
			_id: id,
			userId: authResult.userId,
		});

		if (!deletedAccount) {
			return NextResponse.json(
				{ message: 'Account not found or not authorized' },
				{ status: 404 }
			);
		}

		return NextResponse.json(
			{ message: 'Account deleted successfully' },
			{ status: 200 }
		);
	} catch (error) {
		console.error('Error deleting account:', error);
		return NextResponse.json(
			{ message: 'Failed to delete account' },
			{ status: 500 }
		);
	}
}
