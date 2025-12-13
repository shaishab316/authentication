import React, { useState, useMemo } from 'react';
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
import {
	Eye,
	EyeOff,
	Check,
	X,
	Lock,
	KeyRound,
	ShieldCheck,
} from 'lucide-react';
import { toast } from 'react-toastify';

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
	const [showOldPassword, setShowOldPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [focusedField, setFocusedField] = useState<string | null>(null);

	const passwordStrength = useMemo(() => {
		if (!newPassword) return { score: 0, label: '', color: '' };
		let score = 0;
		if (newPassword.length >= 8) score++;
		if (newPassword.length >= 12) score++;
		if (/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword)) score++;
		if (/\d/.test(newPassword)) score++;
		if (/[^a-zA-Z0-9]/.test(newPassword)) score++;

		if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' };
		if (score <= 3) return { score, label: 'Medium', color: 'bg-yellow-500' };
		if (score <= 4) return { score, label: 'Strong', color: 'bg-green-500' };
		return { score, label: 'Very Strong', color: 'bg-emerald-500' };
	}, [newPassword]);

	const requirements = useMemo(
		() => [
			{ met: newPassword.length >= 8, text: 'At least 8 characters' },
			{
				met: /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword),
				text: 'Upper & lowercase',
			},
			{ met: /\d/.test(newPassword), text: 'Contains number' },
			{ met: /[^a-zA-Z0-9]/.test(newPassword), text: 'Special character' },
		],
		[newPassword]
	);

	const passwordsMatch =
		newPassword && confirmNewPassword && newPassword === confirmNewPassword;

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

			toast.success('Password Changed');

			onOpenChange(false);
			setOldPassword('');
			setNewPassword('');
			setConfirmNewPassword('');
		} catch (error: any) {
			setError(error.message);
			toast.error(error.message);
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
			<DialogContent className='rounded-3xl border-2 max-w-md'>
				<DialogHeader className='space-y-3'>
					<div className='mx-auto w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center'>
						<KeyRound className='w-7 h-7 text-white' />
					</div>
					<DialogTitle className='text-2xl text-center'>
						Change Password
					</DialogTitle>
					<DialogDescription className='text-center'>
						Secure your account with a strong password
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className='space-y-5 mt-4'>
					{/* Current Password */}
					<div className='space-y-2'>
						<Label
							htmlFor='old-password'
							className='flex items-center gap-2 text-sm font-medium'
						>
							<Lock className='w-4 h-4' />
							Current Password
						</Label>
						<div className='relative group'>
							<Input
								id='old-password'
								type={showOldPassword ? 'text' : 'password'}
								placeholder='Enter current password'
								value={oldPassword}
								onChange={(e) => setOldPassword(e.target.value)}
								onFocus={() => setFocusedField('old')}
								onBlur={() => setFocusedField(null)}
								required
								className={`rounded-xl pr-10 transition-all duration-200 ${
									focusedField === 'old'
										? 'ring-2 ring-blue-400 border-blue-400'
										: ''
								}`}
							/>
							<button
								type='button'
								onClick={() => setShowOldPassword(!showOldPassword)}
								className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
							>
								{showOldPassword ? (
									<EyeOff className='w-4 h-4' />
								) : (
									<Eye className='w-4 h-4' />
								)}
							</button>
						</div>
					</div>

					{/* New Password */}
					<div className='space-y-2'>
						<Label
							htmlFor='new-password'
							className='flex items-center gap-2 text-sm font-medium'
						>
							<ShieldCheck className='w-4 h-4' />
							New Password
						</Label>
						<div className='relative group'>
							<Input
								id='new-password'
								type={showNewPassword ? 'text' : 'password'}
								placeholder='Enter new password'
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								onFocus={() => setFocusedField('new')}
								onBlur={() => setFocusedField(null)}
								required
								className={`rounded-xl pr-10 transition-all duration-200 ${
									focusedField === 'new'
										? 'ring-2 ring-blue-400 border-blue-400'
										: ''
								}`}
							/>
							<button
								type='button'
								onClick={() => setShowNewPassword(!showNewPassword)}
								className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
							>
								{showNewPassword ? (
									<EyeOff className='w-4 h-4' />
								) : (
									<Eye className='w-4 h-4' />
								)}
							</button>
						</div>

						{/* Password Strength Indicator */}
						{newPassword && (
							<div className='space-y-2 animate-in fade-in slide-in-from-top-2 duration-300'>
								<div className='flex items-center justify-between text-xs'>
									<span className='text-gray-600'>Password strength:</span>
									<span
										className={`font-semibold ${
											passwordStrength.score <= 2
												? 'text-red-600'
												: passwordStrength.score <= 3
												? 'text-yellow-600'
												: 'text-green-600'
										}`}
									>
										{passwordStrength.label}
									</span>
								</div>
								<div className='flex gap-1'>
									{[1, 2, 3, 4, 5].map((i) => (
										<div
											key={i}
											className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
												i <= passwordStrength.score
													? passwordStrength.color
													: 'bg-gray-200'
											}`}
										/>
									))}
								</div>
								<div className='grid grid-cols-2 gap-2 mt-3'>
									{requirements.map((req, idx) => (
										<div
											key={idx}
											className={`flex items-center gap-1.5 text-xs transition-all duration-200 ${
												req.met ? 'text-green-600' : 'text-gray-400'
											}`}
										>
											{req.met ? (
												<Check className='w-3.5 h-3.5 animate-in zoom-in duration-200' />
											) : (
												<X className='w-3.5 h-3.5' />
											)}
											<span>{req.text}</span>
										</div>
									))}
								</div>
							</div>
						)}
					</div>

					{/* Confirm Password */}
					<div className='space-y-2'>
						<Label
							htmlFor='confirm-password'
							className='flex items-center gap-2 text-sm font-medium'
						>
							<ShieldCheck className='w-4 h-4' />
							Confirm New Password
						</Label>
						<div className='relative group'>
							<Input
								id='confirm-password'
								type={showConfirmPassword ? 'text' : 'password'}
								placeholder='Confirm new password'
								value={confirmNewPassword}
								onChange={(e) => setConfirmNewPassword(e.target.value)}
								onFocus={() => setFocusedField('confirm')}
								onBlur={() => setFocusedField(null)}
								required
								className={`rounded-xl pr-10 transition-all duration-200 ${
									focusedField === 'confirm'
										? 'ring-2 ring-blue-400 border-blue-400'
										: ''
								} ${
									confirmNewPassword && passwordsMatch
										? 'border-green-500'
										: confirmNewPassword && !passwordsMatch
										? 'border-red-500'
										: ''
								}`}
							/>
							<button
								type='button'
								onClick={() => setShowConfirmPassword(!showConfirmPassword)}
								className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
							>
								{showConfirmPassword ? (
									<EyeOff className='w-4 h-4' />
								) : (
									<Eye className='w-4 h-4' />
								)}
							</button>
							{confirmNewPassword && (
								<div className='absolute right-10 top-1/2 -translate-y-1/2'>
									{passwordsMatch ? (
										<Check className='w-4 h-4 text-green-500 animate-in zoom-in duration-200' />
									) : (
										<X className='w-4 h-4 text-red-500' />
									)}
								</div>
							)}
						</div>
						{confirmNewPassword && !passwordsMatch && (
							<p className='text-xs text-red-500 animate-in slide-in-from-top-1 duration-200'>
								Passwords do not match
							</p>
						)}
					</div>

					{error && (
						<div className='p-3 rounded-xl bg-red-50 border border-red-200 animate-in slide-in-from-top-2 duration-200'>
							<p className='text-red-600 text-sm flex items-center gap-2'>
								<X className='w-4 h-4' />
								{error}
							</p>
						</div>
					)}

					<Button
						type='submit'
						disabled={loading || !passwordsMatch || passwordStrength.score < 2}
						className='w-full rounded-xl h-11 font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
					>
						{loading ? (
							<span className='flex items-center gap-2'>
								<div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
								Changing...
							</span>
						) : (
							<span className='flex items-center gap-2'>
								<Lock className='w-4 h-4' />
								Change Password
							</span>
						)}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
};
