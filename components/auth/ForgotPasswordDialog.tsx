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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError('');

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

			onOpenChange(false);
			setUsername('');
		} catch (error: any) {
			setError(error.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='rounded-2xl'>
				<DialogHeader>
					<DialogTitle>Reset Password</DialogTitle>
					<DialogDescription>
						Enter your username to receive password reset instructions.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className='space-y-4'>
					<div>
						<Label htmlFor='forgot-username'>Username</Label>
						<Input
							id='forgot-username'
							type='text'
							placeholder='Enter your username'
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							required
							className='rounded-xl'
						/>
					</div>
					{error && <p className='text-red-500 text-sm'>{error}</p>}
					<Button
						type='submit'
						disabled={loading}
						className='w-full rounded-xl'
					>
						{loading ? 'Sending...' : 'Reset Password'}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
};
