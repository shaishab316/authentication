'use client';
import React, { useState, useEffect, useRef } from 'react';
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
	QrCode,
	X,
	Camera,
	Scan,
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
	const [showScanner, setShowScanner] = useState(false);
	const [scanError, setScanError] = useState('');
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		const stored = authService.getStoredAuth();
		if (!stored) {
			router.push('/');
		}
	}, [router]);

	useEffect(() => {
		return () => {
			stopScanning();
		};
	}, []);

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

	const parseOtpAuthUri = (uri: string) => {
		try {
			const url = new URL(uri);
			if (url.protocol !== 'otpauth:') {
				throw new Error('Invalid OTP URI');
			}

			const type = url.host;
			if (type !== 'totp') {
				throw new Error('Only TOTP is supported');
			}

			const label = decodeURIComponent(url.pathname.substring(1));
			const params = new URLSearchParams(url.search);

			const secret = params.get('secret');
			if (!secret) {
				throw new Error('Secret not found in QR code');
			}

			const issuer = params.get('issuer') || label.split(':')[0] || 'Unknown';
			const accountName = label.includes(':') ? label.split(':')[1] : label;
			const period = params.get('period') || '30';

			return {
				name: accountName,
				issuer: issuer,
				secret: secret,
				period: period,
			};
		} catch (error: any) {
			throw new Error(error.message || 'Failed to parse QR code');
		}
	};

	const startScanning = async () => {
		setScanError('');
		setShowScanner(true);

		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: 'environment' },
			});

			if (videoRef.current) {
				videoRef.current.srcObject = stream;
				streamRef.current = stream;

				// Wait for video to be ready
				videoRef.current.onloadedmetadata = () => {
					videoRef.current?.play();
					scanQRCode();
				};
			}
		} catch (error) {
			setScanError('Camera access denied. Please enable camera permissions.');
			setShowScanner(false);
		}
	};

	const stopScanning = () => {
		if (scanIntervalRef.current) {
			clearInterval(scanIntervalRef.current);
			scanIntervalRef.current = null;
		}

		if (streamRef.current) {
			streamRef.current.getTracks().forEach((track) => track.stop());
			streamRef.current = null;
		}

		if (videoRef.current) {
			videoRef.current.srcObject = null;
		}

		setShowScanner(false);
	};

	const scanQRCode = () => {
		if (scanIntervalRef.current) {
			clearInterval(scanIntervalRef.current);
		}

		scanIntervalRef.current = setInterval(() => {
			if (
				videoRef.current &&
				canvasRef.current &&
				videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA
			) {
				const canvas = canvasRef.current;
				const video = videoRef.current;
				const ctx = canvas.getContext('2d');

				if (!ctx) return;

				canvas.width = video.videoWidth;
				canvas.height = video.videoHeight;
				ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

				const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
				const code = jsQR(
					imageData.data,
					imageData.width,
					imageData.height
				) as any;

				if (code && code.data) {
					try {
						const accountData = parseOtpAuthUri(code.data);
						setNewAccount({
							...newAccount,
							...accountData,
						});
						stopScanning();
					} catch (error: any) {
						setScanError(error.message);
					}
				}
			}
		}, 300);
	};

	// Simple QR code detection (you can replace with a proper library)
	const jsQR = (data: Uint8ClampedArray, width: number, height: number) => {
		// This is a placeholder - in production, use jsQR library or similar
		// For now, we'll return null to demonstrate the UI

		console.log(data);
		return null;
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
				<div className='md:mb-8 flex items-center justify-between'>
					<Button
						variant='ghost'
						onClick={() => router.push('/')}
						disabled={isLoading}
						className='mb-6 -ml-2 hover:bg-white/50 rounded-xl transition-all duration-200'
					>
						<ArrowLeft className='w-5 h-5 mr-2' />
						Back
					</Button>
					<Button
						onClick={startScanning}
						disabled={isLoading}
						className='mb-6 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95'
					>
						<QrCode className='w-5 h-5 mr-2' />
						Scan QR Code
					</Button>
				</div>

				{/* QR Scanner Modal */}
				{showScanner && (
					<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-300'>
						<div className='relative w-full h-full max-w-2xl max-h-[90vh] m-4'>
							{/* Close Button */}
							<Button
								onClick={stopScanning}
								variant='ghost'
								size='sm'
								className='absolute top-4 right-4 z-10 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-full w-12 h-12 p-0 transition-all duration-200'
							>
								<X className='w-6 h-6' />
							</Button>

							{/* Scanner Container */}
							<div className='relative w-full h-full rounded-3xl overflow-hidden bg-black shadow-2xl border-4 border-white/20'>
								{/* Video Feed */}
								<video
									ref={videoRef}
									autoPlay
									playsInline
									muted
									className='w-full h-full object-cover'
								/>
								<canvas ref={canvasRef} className='hidden' />

								{/* Scanning Overlay */}
								<div className='absolute inset-0 pointer-events-none'>
									{/* Corner Borders */}
									<div className='absolute top-1/4 left-1/4 w-1/2 h-1/2'>
										{/* Top-left */}
										<div className='absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-blue-500 rounded-tl-2xl animate-pulse' />
										{/* Top-right */}
										<div
											className='absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-blue-500 rounded-tr-2xl animate-pulse'
											style={{ animationDelay: '0.2s' }}
										/>
										{/* Bottom-left */}
										<div
											className='absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-blue-500 rounded-bl-2xl animate-pulse'
											style={{ animationDelay: '0.4s' }}
										/>
										{/* Bottom-right */}
										<div
											className='absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-blue-500 rounded-br-2xl animate-pulse'
											style={{ animationDelay: '0.6s' }}
										/>

										{/* Scanning Line */}
										<div className='absolute inset-0 overflow-hidden'>
											<div className='absolute w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-scan-line' />
										</div>
									</div>

									{/* Grid Overlay */}
									<div className='absolute inset-0 opacity-20'>
										<div
											className='absolute inset-0'
											style={{
												backgroundImage: `linear-gradient(to right, rgba(59, 130, 246, 0.3) 1px, transparent 1px),
											                  linear-gradient(to bottom, rgba(59, 130, 246, 0.3) 1px, transparent 1px)`,
												backgroundSize: '30px 30px',
											}}
										/>
									</div>
								</div>

								{/* Instructions */}
								<div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-8'>
									<div className='text-center space-y-3'>
										<div className='flex items-center justify-center gap-2 text-white'>
											<Scan className='w-6 h-6 animate-pulse' />
											<p className='text-lg font-bold'>
												Scanning for QR Code...
											</p>
										</div>
										<p className='text-sm text-gray-300'>
											Position the QR code within the frame
										</p>
										{scanError && (
											<div className='bg-red-500/20 backdrop-blur-md border border-red-500/50 rounded-xl p-3 text-red-200 text-sm animate-in slide-in-from-bottom duration-300'>
												<AlertCircle className='w-4 h-4 inline mr-2' />
												{scanError}
											</div>
										)}
									</div>
								</div>

								{/* Camera Icon Animation */}
								<div className='absolute top-8 left-1/2 -translate-x-1/2 bg-blue-500/20 backdrop-blur-md rounded-full p-4 animate-bounce'>
									<Camera className='w-8 h-8 text-blue-400' />
								</div>
							</div>
						</div>
					</div>
				)}

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
