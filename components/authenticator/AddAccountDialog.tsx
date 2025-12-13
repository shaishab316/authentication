import React, { useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { TOTP } from 'totp-generator';

interface AddAccountDialogProps {
	onAdd: (accountData: {
		name: string;
		issuer: string;
		secret: string;
		tags: string[];
	}) => Promise<any>;
}

export const AddAccountDialog: React.FC<AddAccountDialogProps> = ({
	onAdd,
}) => {
	const [open, setOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [newAccount, setNewAccount] = useState({
		name: '',
		issuer: '',
		secret: '',
		tags: '',
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
		};

		try {
			await onAdd(accountData);
			setIsSuccess(true);

			// Show success state briefly before closing
			setTimeout(() => {
				setNewAccount({ name: '', issuer: '', secret: '', tags: '' });
				setErrors({ name: '', secret: '', general: '' });
				setTouched({ name: false, secret: false, issuer: false });
				setIsSuccess(false);
				setOpen(false);
			}, 1000);
		} catch (error) {
			setErrors((prev) => ({
				...prev,
				general: 'Failed to add account. Please try again.',
			}));
		} finally {
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

	const handleDialogChange = (isOpen: boolean) => {
		setOpen(isOpen);
		if (!isOpen) {
			// Reset form when closing
			setTimeout(() => {
				setNewAccount({ name: '', issuer: '', secret: '', tags: '' });
				setErrors({ name: '', secret: '', general: '' });
				setTouched({ name: false, secret: false, issuer: false });
				setIsSuccess(false);
			}, 200);
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleDialogChange}>
			<DialogTrigger asChild>
				<Button className='w-fit h-12 sm:h-12 text-sm sm:text-base font-medium fixed bottom-4 right-4 sm:bottom-10 sm:right-10 px-3 sm:px-4 py-2 rounded-2xl border-2 border-gray-200 text-black bg-white hover:bg-white hover:border-blue-300 hover:shadow-lg group flex justify-center items-center gap-2 overflow-hidden transition-all duration-300 z-50'>
					<Plus className='size-5 transition-transform duration-300 group-hover:rotate-90' />
					<span className='hidden sm:group-hover:inline-block'>
						Add Account
					</span>
				</Button>
			</DialogTrigger>
			<DialogContent className='max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-2xl'>
				<DialogHeader className='space-y-2 sm:space-y-3'>
					<div
						className={`mx-auto w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 ${
							isSuccess
								? 'bg-gradient-to-br from-green-500 to-emerald-600 scale-110'
								: 'bg-gradient-to-br from-blue-500 to-purple-600'
						}`}
					>
						{isSuccess ? (
							<CheckCircle2 className='w-6 h-6 sm:w-7 sm:h-7 text-white animate-in zoom-in duration-300' />
						) : (
							<Plus className='w-6 h-6 sm:w-7 sm:h-7 text-white' />
						)}
					</div>
					<DialogTitle className='text-xl sm:text-2xl text-center'>
						{isSuccess ? 'Account Added!' : 'Add Account'}
					</DialogTitle>
					<DialogDescription className='text-center text-sm sm:text-base px-2'>
						{isSuccess
							? 'Your account has been added successfully'
							: 'Enter your account details to generate TOTP codes'}
					</DialogDescription>
				</DialogHeader>

				{!isSuccess && (
					<>
						<div className='space-y-4 sm:space-y-5 mt-3 sm:mt-4'>
							{/* General Error Alert */}
							{errors.general && (
								<div className='bg-red-50 border border-red-200 rounded-xl p-2.5 sm:p-3 flex items-start gap-2 sm:gap-3 animate-in slide-in-from-top duration-300'>
									<AlertCircle className='w-4 h-4 sm:w-5 sm:h-5 text-red-500 mt-0.5 shrink-0' />
									<p className='text-xs sm:text-sm text-red-700'>
										{errors.general}
									</p>
								</div>
							)}

							{/* Issuer Field */}
							<div className='space-y-1.5 sm:space-y-2'>
								<Label
									htmlFor='issuer'
									className='text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2'
								>
									Service
									<span className='text-[10px] sm:text-xs text-gray-400'>
										(optional)
									</span>
								</Label>
								<Input
									id='issuer'
									placeholder='Google, GitHub, etc.'
									value={newAccount.issuer}
									onChange={(e) => handleFieldChange('issuer', e.target.value)}
									onBlur={() => handleBlur('issuer')}
									disabled={isLoading}
									className='rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent h-10 sm:h-11 text-sm sm:text-base'
								/>
							</div>

							{/* Account Name Field */}
							<div className='space-y-1.5 sm:space-y-2'>
								<Label
									htmlFor='name'
									className='text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2'
								>
									Account
									<span className='text-[10px] sm:text-xs text-red-500'>*</span>
								</Label>
								<div className='relative'>
									<Input
										id='name'
										placeholder='your@email.com'
										value={newAccount.name}
										onChange={(e) => handleFieldChange('name', e.target.value)}
										onBlur={() => handleBlur('name')}
										disabled={isLoading}
										className={`rounded-xl transition-all duration-200 h-10 sm:h-11 pr-10 text-sm sm:text-base ${
											errors.name && touched.name
												? 'border-red-400 focus:ring-red-400 focus:border-red-400 bg-red-50'
												: 'focus:ring-2 focus:ring-blue-400 focus:border-transparent'
										}`}
									/>
									{errors.name && touched.name && (
										<AlertCircle className='absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-red-500 animate-in zoom-in duration-200' />
									)}
								</div>
								{errors.name && touched.name && (
									<p className='text-[11px] sm:text-xs text-red-600 flex items-center gap-1 animate-in slide-in-from-top duration-200'>
										<span className='inline-block w-1 h-1 bg-red-600 rounded-full'></span>
										{errors.name}
									</p>
								)}
							</div>

							{/* Secret Key Field */}
							<div className='space-y-1.5 sm:space-y-2'>
								<Label
									htmlFor='secret'
									className='text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2'
								>
									Secret Key
									<span className='text-[10px] sm:text-xs text-red-500'>*</span>
								</Label>
								<div className='relative'>
									<Input
										id='secret'
										placeholder='JBSWY3DPEHPK3PXP'
										value={newAccount.secret}
										onChange={(e) =>
											handleFieldChange('secret', e.target.value)
										}
										onBlur={() => handleBlur('secret')}
										disabled={isLoading}
										className={`font-mono rounded-xl transition-all duration-200 h-10 sm:h-11 pr-10 text-xs sm:text-sm ${
											errors.secret && touched.secret
												? 'border-red-400 focus:ring-red-400 focus:border-red-400 bg-red-50'
												: 'focus:ring-2 focus:ring-blue-400 focus:border-transparent'
										}`}
									/>
									{errors.secret && touched.secret && (
										<AlertCircle className='absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-red-500 animate-in zoom-in duration-200' />
									)}
								</div>
								{errors.secret && touched.secret && (
									<p className='text-[11px] sm:text-xs text-red-600 flex items-center gap-1 animate-in slide-in-from-top duration-200'>
										<span className='inline-block w-1 h-1 bg-red-600 rounded-full'></span>
										{errors.secret}
									</p>
								)}
							</div>

							{/* Tags Field */}
							<div className='space-y-1.5 sm:space-y-2'>
								<Label
									htmlFor='tags'
									className='text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2'
								>
									Tags
									<span className='text-[10px] sm:text-xs text-gray-400'>
										(optional)
									</span>
								</Label>
								<Input
									id='tags'
									placeholder='work, personal, company-name'
									value={newAccount.tags}
									onChange={(e) => handleFieldChange('tags', e.target.value)}
									disabled={isLoading}
									className='rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent h-10 sm:h-11 text-sm sm:text-base'
								/>
								<p className='text-[11px] sm:text-xs text-gray-500 flex items-start gap-1.5'>
									<span className='inline-block w-1 h-1 bg-gray-400 rounded-full mt-1'></span>
									Separate tags with commas to organize your accounts
								</p>
							</div>
						</div>

						<DialogFooter className='gap-2 mt-4 sm:mt-6 flex-col sm:flex-row'>
							<Button
								variant='outline'
								onClick={() => handleDialogChange(false)}
								disabled={isLoading}
								className='rounded-xl hover:bg-gray-100 transition-all duration-200 hover:scale-105 active:scale-95 flex-1 w-full h-10 sm:h-11 text-sm sm:text-base'
							>
								Cancel
							</Button>
							<Button
								onClick={handleAdd}
								disabled={isLoading || !!errors.name || !!errors.secret}
								className='rounded-xl bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 hover:scale-105 active:scale-95 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex-1 w-full h-10 sm:h-11 text-sm sm:text-base'
							>
								{isLoading ? (
									<>
										<Loader2 className='w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 animate-spin' />
										Adding...
									</>
								) : (
									<>
										<Plus className='w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2' />
										Add Account
									</>
								)}
							</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
};
