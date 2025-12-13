import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield } from 'lucide-react';
import { toast } from 'react-toastify';
import { ForgotPasswordDialog } from './ForgotPasswordDialog';

interface AuthScreenProps {
	onLogin: (token: string, username: string) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
	const [isLoginMode, setIsLoginMode] = useState(true);
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [isForgotPasswordDialogOpen, setIsForgotPasswordDialogOpen] =
		useState(false);
	const handleAuth = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError('');

		const endpoint = isLoginMode ? '/api/auth/login' : '/api/auth/register';

		try {
			const response = await fetch(endpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ username, password }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Authentication failed');
			}

			onLogin(data.token, username);
			setUsername('');
			setPassword('');
			toast.success(`Welcome, ${data.username || username}!`);
		} catch (error: any) {
			setError(error.message);
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
			<Card className='w-full max-w-md rounded-3xl border-0 shadow-2xl bg-white/90 backdrop-blur-sm'>
				<CardContent className='p-8 text-center'>
					<div className='mb-8'>
						<div className='w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
							<Shield className='w-10 h-10 text-blue-600' />
						</div>
						<h1 className='text-2xl font-bold text-gray-900 mb-2'>
							Secure Authenticator
						</h1>
						<p className='text-gray-600'>
							Protect your accounts with secure authentication
						</p>
					</div>

					<form onSubmit={handleAuth} className='space-y-4'>
						<div>
							<Label htmlFor='username'>Username</Label>
							<Input
								id='username'
								type='text'
								placeholder='Enter your username'
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								required
								className='rounded-xl'
							/>
						</div>
						<div>
							<Label htmlFor='password'>Password</Label>
							<Input
								id='password'
								type='password'
								placeholder='Enter your password'
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								className='rounded-xl'
							/>
						</div>
						{error && <p className='text-red-500 text-sm'>{error}</p>}
						<Button
							type='submit'
							disabled={loading}
							className='w-full h-12 rounded-2xl text-base font-medium'
						>
							{loading ? 'Processing...' : isLoginMode ? 'Login' : 'Register'}
						</Button>
						<Button
							type='button'
							variant='outline'
							onClick={() => setIsLoginMode(!isLoginMode)}
							className='w-full h-12 rounded-2xl text-base font-medium'
						>
							{isLoginMode
								? 'Need an account? Register'
								: 'Already have an account? Login'}
						</Button>
					</form>

					<ForgotPasswordDialog
						open={isForgotPasswordDialogOpen}
						onOpenChange={setIsForgotPasswordDialogOpen}
					/>
				</CardContent>
			</Card>
		</div>
	);
};
