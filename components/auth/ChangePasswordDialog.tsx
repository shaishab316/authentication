import React, { useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface ChangePasswordDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	userToken: string | null;
	onLogout: () => void;
}

export const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({
	open,
	onOpenChange,
	userToken,
	onLogout,
}) => {
	const [oldPassword, setOldPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmNewPassword, setConfirmNewPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const { toast } = useToast();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError('');

		if (newPassword !== confirmNewPassword) {
			setError('New passwords do not match');
			setLoading(false);
			return;
		}

		if (newPassword.length < 8) {
			setError('New password must be at least 8 characters long');
			setLoading(false);
			return;
		}

		try {
			const response = await fetch('/api/auth/change-password', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${userToken}`,
				},
				body: JSON.stringify({ oldPassword, newPassword }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Failed to change password');
			}

			toast({
				title: 'Password Changed',
				description: data.message,
			});
			onOpenChange(false);
			setOldPassword('');
			setNewPassword('');
			setConfirmNewPassword('');
		} catch (error: any) {
			setError(error.message);
			toast({
				title: 'Error',
				description: error.message,
				variant: 'destructive',
			});
			if (
				error.message === 'Invalid token' ||
				error.message === 'No token provided'
			) {
				onLogout();
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='rounded-2xl'>
				<DialogHeader>
					<DialogTitle>Change Password</DialogTitle>
					<DialogDescription>
						Enter your current password and choose a new one.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className='space-y-4'>
					<div>
						<Label htmlFor='old-password'>Current Password</Label>
						<Input
							id='old-password'
							type='password'
							placeholder='Enter current password'
							value={oldPassword}
							onChange={(e) => setOldPassword(e.target.value)}
							required
							className='rounded-xl'
						/>
					</div>
					<div>
						<Label htmlFor='new-password'>New Password</Label>
						<Input
							id='new-password'
							type='password'
							placeholder='Enter new password'
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
							required
							className='rounded-xl'
						/>
					</div>
					<div>
						<Label htmlFor='confirm-password'>Confirm New Password</Label>
						<Input
							id='confirm-password'
							type='password'
							placeholder='Confirm new password'
							value={confirmNewPassword}
							onChange={(e) => setConfirmNewPassword(e.target.value)}
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
						{loading ? 'Changing...' : 'Change Password'}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
};
