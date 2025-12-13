'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	ArrowLeft,
	AlertCircle,
	CheckCircle2,
	Loader2,
	Plus,
} from 'lucide-react';
import { TOTP } from 'totp-generator';
import { accountService } from '@/services/accountService';
import { authService } from '@/services/authService';

export default function AddAccountPage() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [newAccount, setNewAccount] = useState({
		name: '',
		issuer: '',
		secret: '',
		tags: '',
		period: '30',
	});
	const [errors, setErrors] = useState({
		name: '',
		secret: '',
		general: '',
	});
	const [touched, setTouched] = useState({
		name: false,
		secret: false,
		issuer: false,
	});

	useEffect(() => {
		const stored = authService.getStoredAuth();
		if (!stored) {
			router.push('/');
		}
	}, [router]);

	const validateField = (field: 'name' | 'secret', value: string) => {
		let error = '';

		if (field === 'name') {
			if (!value.trim()) {
				error = 'Account identifier is required';
			} else if (value.length < 3) {
				error = 'Account name must be at least 3 characters';
			}
		}

		if (field === 'secret') {
			if (!value.trim()) {
				error = 'Secret key is required';
			} else {
				try {
					const cleanSecret = value.replace(/\s/g, '').toUpperCase();
					TOTP.generate(cleanSecret);
				} catch (error) {
					error = 'Invalid secret key format (must be base32)';
				}
			}
		}

		setErrors((prev) => ({ ...prev, [field]: error }));
		return error === '';
	};

	const validateForm = () => {
		const nameValid = validateField('name', newAccount.name);
		const secretValid = validateField('secret', newAccount.secret);
		return nameValid && secretValid;
	};

	const handleAdd = async () => {
		setTouched({ name: true, secret: true, issuer: true });

		if (!validateForm()) {
			return;
		}

		setIsLoading(true);
		setErrors((prev) => ({ ...prev, general: '' }));

		const tags = newAccount.tags
			.split(',')
			.map((tag) => tag.trim())
			.filter((tag) => tag.length > 0);

		const accountData = {
			name: newAccount.name,
			issuer: newAccount.issuer || 'Unknown',
			secret: newAccount.secret.replace(/\s/g, '').toUpperCase(),
			tags,
			period: parseInt(newAccount.period) || 30,
		};

		try {
			const stored = authService.getStoredAuth();
			if (!stored) {
				throw new Error('Not authenticated');
			}

			await accountService.addAccount(accountData, stored.token);
			setIsSuccess(true);

			// Show success state briefly before redirecting
			setTimeout(() => {
				router.push('/');
			}, 1500);
		} catch (error) {
			setErrors((prev) => ({
				...prev,
				general: 'Failed to add account. Please try again.',
			}));
			setIsLoading(false);
		}
	};

	const handleFieldChange = (field: keyof typeof newAccount, value: string) => {
		setNewAccount((prev) => ({ ...prev, [field]: value }));

		// Real-time validation for touched fields
		if (
			touched[field as keyof typeof touched] &&
			(field === 'name' || field === 'secret')
		) {
			validateField(field, value);
		}
	};

	const handleBlur = (field: 'name' | 'secret' | 'issuer') => {
		setTouched((prev) => ({ ...prev, [field]: true }));

		if (field === 'name' || field === 'secret') {
			validateField(field, newAccount[field]);
		}
	};

	if (isSuccess) {
		return (
			<div className='min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4'>
				<div className='max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center animate-in zoom-in duration-500'>
					<div className='mx-auto w-20 h-20 bg-linear-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg mb-6'>
						<CheckCircle2 className='w-10 h-10 text-white' />
					</div>
					<h1 className='text-3xl font-bold text-gray-900 mb-3'>
						Account Added!
					</h1>
					<p className='text-gray-600'>
						Your account has been added successfully
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 p-4'>
			<div className='max-w-2xl mx-auto pt-6 sm:pt-12 pb-8'>
				{/* Header */}
				<div className='md:mb-8'>
					<Button
						variant='ghost'
						onClick={() => router.push('/')}
						disabled={isLoading}
						className='mb-6 -ml-2 hover:bg-white/50 rounded-xl transition-all duration-200'
					>
						<ArrowLeft className='w-5 h-5 mr-2' />
						Back
					</Button>
				</div>

				{/* Form */}
				<div className='bg-white rounded-3xl shadow-lg p-6 sm:p-8'>
					<div className='space-y-5 sm:space-y-6'>
						{/* General Error Alert */}
						{errors.general && (
							<div className='bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 animate-in slide-in-from-top duration-300'>
								<AlertCircle className='w-5 h-5 text-red-500 mt-0.5 shrink-0' />
								<p className='text-sm text-red-700'>{errors.general}</p>
							</div>
						)}

						{/* Issuer Field */}
						<div className='space-y-2'>
							<Label
								htmlFor='issuer'
								className='text-sm sm:text-base font-medium flex items-center gap-2'
							>
								Service
								<span className='text-xs text-gray-400'>(optional)</span>
							</Label>
							<Input
								id='issuer'
								placeholder='Google, GitHub, etc.'
								value={newAccount.issuer}
								onChange={(e) => handleFieldChange('issuer', e.target.value)}
								onBlur={() => handleBlur('issuer')}
								disabled={isLoading}
								className='rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent h-12 text-base'
							/>
						</div>

						{/* Account Name Field */}
						<div className='space-y-2'>
							<Label
								htmlFor='name'
								className='text-sm sm:text-base font-medium flex items-center gap-2'
							>
								Account
								<span className='text-xs text-red-500'>*</span>
							</Label>
							<div className='relative'>
								<Input
									id='name'
									placeholder='your@email.com'
									value={newAccount.name}
									onChange={(e) => handleFieldChange('name', e.target.value)}
									onBlur={() => handleBlur('name')}
									disabled={isLoading}
									className={`rounded-xl transition-all duration-200 h-12 pr-12 text-base ${
										errors.name && touched.name
											? 'border-red-400 focus:ring-red-400 focus:border-red-400 bg-red-50'
											: 'focus:ring-2 focus:ring-blue-400 focus:border-transparent'
									}`}
								/>
								{errors.name && touched.name && (
									<AlertCircle className='absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500 animate-in zoom-in duration-200' />
								)}
							</div>
							{errors.name && touched.name && (
								<p className='text-xs sm:text-sm text-red-600 flex items-center gap-1.5 animate-in slide-in-from-top duration-200'>
									<span className='inline-block w-1.5 h-1.5 bg-red-600 rounded-full'></span>
									{errors.name}
								</p>
							)}
						</div>

						{/* Secret Key Field */}
						<div className='space-y-2'>
							<Label
								htmlFor='secret'
								className='text-sm sm:text-base font-medium flex items-center gap-2'
							>
								Secret Key
								<span className='text-xs text-red-500'>*</span>
							</Label>
							<div className='relative'>
								<Input
									id='secret'
									placeholder='JBSWY3DPEHPK3PXP'
									value={newAccount.secret}
									onChange={(e) => handleFieldChange('secret', e.target.value)}
									onBlur={() => handleBlur('secret')}
									disabled={isLoading}
									className={`font-mono rounded-xl transition-all duration-200 h-12 pr-12 text-sm sm:text-base ${
										errors.secret && touched.secret
											? 'border-red-400 focus:ring-red-400 focus:border-red-400 bg-red-50'
											: 'focus:ring-2 focus:ring-blue-400 focus:border-transparent'
									}`}
								/>
								{errors.secret && touched.secret && (
									<AlertCircle className='absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500 animate-in zoom-in duration-200' />
								)}
							</div>
							{errors.secret && touched.secret && (
								<p className='text-xs sm:text-sm text-red-600 flex items-center gap-1.5 animate-in slide-in-from-top duration-200'>
									<span className='inline-block w-1.5 h-1.5 bg-red-600 rounded-full'></span>
									{errors.secret}
								</p>
							)}
						</div>

						{/* Tags Field */}
						<div className='space-y-2'>
							<Label
								htmlFor='tags'
								className='text-sm sm:text-base font-medium flex items-center gap-2'
							>
								Tags
								<span className='text-xs text-gray-400'>(optional)</span>
							</Label>
							<Input
								id='tags'
								placeholder='work, personal, company-name'
								value={newAccount.tags}
								onChange={(e) => handleFieldChange('tags', e.target.value)}
								disabled={isLoading}
								className='rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent h-12 text-base'
							/>
							<p className='text-xs sm:text-sm text-gray-500 flex items-start gap-1.5'>
								<span className='inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5'></span>
								Separate tags with commas to organize your accounts
							</p>
						</div>

						{/* Period Field */}
						<div className='space-y-2'>
							<Label
								htmlFor='period'
								className='text-sm sm:text-base font-medium flex items-center gap-2'
							>
								Time Period (seconds)
								<span className='text-xs text-gray-400'>(optional)</span>
							</Label>
							<Input
								id='period'
								type='number'
								placeholder='30'
								value={newAccount.period}
								onChange={(e) => handleFieldChange('period', e.target.value)}
								disabled={isLoading}
								min='15'
								max='120'
								className='rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent h-12 text-base'
							/>
							<p className='text-xs sm:text-sm text-gray-500 flex items-start gap-1.5'>
								<span className='inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5'></span>
								Most services use 30 seconds (default: 30, range: 15-120)
							</p>
						</div>
					</div>

					{/* Action Buttons */}
					<div className='flex flex-col sm:flex-row gap-3 mt-8'>
						<Button
							variant='outline'
							onClick={() => router.push('/')}
							disabled={isLoading}
							className='rounded-xl hover:bg-gray-100 transition-all duration-200 hover:scale-105 active:scale-95 flex-1 h-12 text-base font-medium'
						>
							Cancel
						</Button>
						<Button
							onClick={handleAdd}
							disabled={isLoading || !!errors.name || !!errors.secret}
							className='rounded-xl bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 hover:scale-105 active:scale-95 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex-1 h-12 text-base'
						>
							{isLoading ? (
								<>
									<Loader2 className='w-5 h-5 mr-2 animate-spin' />
									Adding...
								</>
							) : (
								<>
									<Plus className='w-5 h-5 mr-2' />
									Add Account
								</>
							)}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
