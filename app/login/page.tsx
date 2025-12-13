'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield } from 'lucide-react';
import { toast } from 'react-toastify';
import { authService } from '@/services/authService';
import { ForgotPasswordDialog } from '@/components/auth/ForgotPasswordDialog';

export default function LoginPage() {
	const router = useRouter();
	const [isLoginMode, setIsLoginMode] = useState(true);
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [isForgotPasswordDialogOpen, setIsForgotPasswordDialogOpen] =
		useState(false);

	useEffect(() => {
		// If already authenticated, redirect to home
		const stored = authService.getStoredAuth();
		if (stored) {
			router.push('/');
		}
	}, [router]);

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

			// Store auth data
			authService.storeAuth(data.token, username);

			setUsername('');
			setPassword('');
			toast.success(`Welcome, ${data.username || username}!`);

			// Redirect to home page
			router.push('/');
		} catch (error: any) {
			setError(error.message);
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='md:min-h-screen relative overflow-hidden bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 md:flex md:items-center md:justify-center md:p-4'>
			{/* Animated Grid Background */}
			<div className='absolute inset-0 opacity-30'>
				<div
					className='absolute inset-0'
					style={{
						backgroundImage: `linear-gradient(to right, #e5e7eb 1px, transparent 1px),
					                  linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)`,
						backgroundSize: '40px 40px',
						animation: 'gridMove 20s linear infinite',
					}}
				/>
				{/* Gradient Overlay */}
				<div className='absolute inset-0 bg-linear-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5' />
			</div>

			{/* Floating Orbs */}
			<div className='absolute top-1/4 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse' />
			<div
				className='absolute bottom-1/4 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse'
				style={{ animationDelay: '1s' }}
			/>
			<div
				className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-400/10 rounded-full blur-3xl animate-pulse'
				style={{ animationDelay: '0.5s' }}
			/>

			{/* Content */}
			<Card className='w-full md:max-w-md md:rounded-3xl border-0 shadow-2xl bg-white/80 backdrop-blur-xl relative z-10 overflow-hidden group hover:shadow-[0_20px_70px_rgba(139,92,246,0.3)] transition-all duration-500'>
				{/* Animated border effect */}
				<div className='absolute inset-0 rounded-3xl bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl' />
				<div className='absolute inset-px rounded-3xl bg-white/90 backdrop-blur-xl' />

				<CardContent className='relative z-10 p-8 sm:p-10 text-center'>
					<div className='mb-8'>
						<div className='relative mx-auto mb-6 w-fit'>
							{/* Rotating ring effect */}
							<div
								className='absolute inset-0 rounded-full bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 animate-spin'
								style={{ animationDuration: '3s' }}
							/>
							<div className='relative w-20 h-20 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform duration-500 m-[6px]'>
								<Shield className='w-10 h-10 text-white' />
							</div>
						</div>
						<h1 className='text-3xl sm:text-4xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3'>
							Secure Authenticator
						</h1>
						<p className='text-gray-600 text-sm sm:text-base'>
							Protect your accounts with secure authentication
						</p>
					</div>

					<form onSubmit={handleAuth} className='space-y-5'>
						<div className='text-left space-y-2 group'>
							<Label
								htmlFor='username'
								className='text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors duration-200'
							>
								Username
							</Label>
							<div className='relative'>
								<Input
									id='username'
									type='text'
									placeholder='Enter your username'
									value={username}
									onChange={(e) => setUsername(e.target.value)}
									required
									className='rounded-2xl h-14 text-base pl-4 pr-4 bg-white/50 backdrop-blur-sm border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 shadow-sm hover:shadow-md'
								/>
							</div>
						</div>
						<div className='text-left space-y-2 group'>
							<Label
								htmlFor='password'
								className='text-sm font-semibold text-gray-700 group-hover:text-purple-600 transition-colors duration-200'
							>
								Password
							</Label>
							<div className='relative'>
								<Input
									id='password'
									type='password'
									placeholder='Enter your password'
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									className='rounded-2xl h-14 text-base pl-4 pr-4 bg-white/50 backdrop-blur-sm border-2 border-gray-200 hover:border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 shadow-sm hover:shadow-md'
								/>
							</div>
						</div>
						{error && (
							<div className='bg-red-50 border-2 border-red-200 rounded-2xl p-4 text-sm text-red-700 animate-in slide-in-from-top duration-300 shadow-sm'>
								{error}
							</div>
						)}
						<Button
							type='submit'
							disabled={loading}
							className='relative w-full h-14 rounded-2xl text-base font-bold bg-linear-to-r from-blue-500 via-purple-600 to-pink-600 text-white hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden group'
						>
							{/* Shine effect */}
							<div className='absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000' />
							<span className='relative z-10'>
								{loading ? 'Processing...' : isLoginMode ? 'Login' : 'Register'}
							</span>
						</Button>
						<Button
							type='button'
							variant='outline'
							onClick={() => {
								setIsLoginMode(!isLoginMode);
								setError('');
							}}
							className='w-full h-14 rounded-2xl text-base font-semibold bg-white/50 backdrop-blur-sm hover:bg-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md'
						>
							{isLoginMode
								? 'Need an account? Register'
								: 'Already have an account? Login'}
						</Button>
					</form>

					{isLoginMode && (
						<Button
							type='button'
							variant='link'
							onClick={() => setIsForgotPasswordDialogOpen(true)}
							className='mt-6 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200 hover:underline'
						>
							Forgot your password?
						</Button>
					)}

					<ForgotPasswordDialog
						open={isForgotPasswordDialogOpen}
						onOpenChange={setIsForgotPasswordDialogOpen}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
