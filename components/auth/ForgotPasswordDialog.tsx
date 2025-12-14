import React, { useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

interface ForgotPasswordDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export const ForgotPasswordDialog: React.FC<ForgotPasswordDialogProps> = ({
	open,
	onOpenChange,
}) => {
	const [username, setUsername] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError('');
		setSuccess(false);

		try {
			const response = await fetch('/api/auth/forgot-password', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ username }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Failed to reset password');
			}

			setSuccess(true);
			setTimeout(() => {
				onOpenChange(false);
				setUsername('');
				setSuccess(false);
			}, 2000);
		} catch (error: any) {
			setError(error.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='rounded-3xl border-0 shadow-2xl bg-white/95 backdrop-blur-xl max-w-md overflow-hidden'>
				{/* Animated background gradient */}
				<div className='absolute inset-0 bg-linear-to-br from-pink-50 via-purple-50 to-blue-50 opacity-60' />
				<div className='absolute top-0 right-0 w-40 h-40 bg-linear-to-br from-pink-400/20 to-purple-400/20 rounded-full blur-3xl' />
				<div className='absolute bottom-0 left-0 w-40 h-40 bg-linear-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl' />

				<div className='relative z-10'>
					<DialogHeader className='text-center space-y-3 pb-6'>
						<div className='mx-auto w-fit relative mb-2'>
							{/* Rotating gradient ring */}
							<div
								className='absolute inset-0 rounded-full bg-linear-to-r from-pink-500 via-purple-500 to-blue-500 animate-spin'
								style={{ animationDuration: '3s' }}
							/>
							<div className='relative w-16 h-16 bg-linear-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl m-[4px] group-hover:scale-110 transition-transform duration-500'>
								<KeyRound className='w-8 h-8 text-white' />
							</div>
						</div>
						<DialogTitle className='text-2xl sm:text-3xl font-bold bg-linear-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent'>
							Reset Password
						</DialogTitle>
						<DialogDescription className='text-gray-600 text-sm sm:text-base flex items-center justify-center gap-2'>
							<Sparkles className='w-4 h-4 text-purple-500' />
							Enter your username to receive reset instructions
						</DialogDescription>
					</DialogHeader>

					{success ? (
						<div className='py-8 text-center space-y-4 animate-in zoom-in duration-500'>
							<div className='mx-auto w-20 h-20 bg-linear-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-xl animate-bounce'>
								<CheckCircle2 className='w-10 h-10 text-white' />
							</div>
							<p className='text-lg font-semibold bg-linear-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent'>
								Your new Password is{' '}
								<span className='text-indigo-600 font-bold'>123456</span>
							</p>
						</div>
					) : (
						<form onSubmit={handleSubmit} className='space-y-6'>
							<div className='space-y-2 group'>
								<Label
									htmlFor='forgot-username'
									className='text-sm font-semibold text-gray-700 group-hover:text-purple-600 transition-colors duration-200 flex items-center gap-2'
								>
									<div className='w-1.5 h-1.5 rounded-full bg-purple-500 group-hover:scale-150 transition-transform duration-200' />
									Username
								</Label>
								<div className='relative'>
									<Input
										id='forgot-username'
										type='text'
										placeholder='Enter your username'
										value={username}
										onChange={(e) => setUsername(e.target.value)}
										required
										className='rounded-2xl h-14 text-base pl-4 pr-4 bg-white/70 backdrop-blur-sm border-2 border-gray-200 hover:border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 shadow-sm hover:shadow-md'
									/>
									<div className='absolute inset-0 rounded-2xl bg-linear-to-r from-pink-500/0 via-purple-500/0 to-blue-500/0 group-hover:from-pink-500/5 group-hover:via-purple-500/5 group-hover:to-blue-500/5 transition-all duration-500 pointer-events-none' />
								</div>
							</div>

							{error && (
								<div className='bg-linear-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-4 text-sm text-red-700 animate-in slide-in-from-top duration-300 shadow-sm flex items-start gap-3'>
									<AlertCircle className='w-5 h-5 flex-shrink-0 mt-0.5' />
									<span>{error}</span>
								</div>
							)}

							<div className='space-y-3 pt-2'>
								<Button
									type='submit'
									disabled={loading}
									className='relative w-full h-14 rounded-2xl text-base font-bold bg-linear-to-r from-pink-500 via-purple-600 to-blue-600 text-white hover:from-pink-600 hover:via-purple-700 hover:to-blue-700 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden group'
								>
									{/* Shine effect */}
									<div className='absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000' />
									<span className='relative z-10 flex items-center justify-center gap-2'>
										{loading ? (
											<>
												<div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin' />
												Sending...
											</>
										) : (
											<>
												<KeyRound className='w-5 h-5' />
												Send Reset Link
											</>
										)}
									</span>
								</Button>

								<Button
									type='button'
									variant='outline'
									onClick={() => onOpenChange(false)}
									disabled={loading}
									className='w-full h-12 rounded-2xl text-base font-semibold bg-white/50 backdrop-blur-sm hover:bg-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md'
								>
									Cancel
								</Button>
							</div>
						</form>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
};
