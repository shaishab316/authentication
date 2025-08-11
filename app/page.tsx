'use client';

import type React from 'react';

import { useState, useEffect, useMemo } from 'react';
import { TOTP } from 'totp-generator';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import {
	Plus,
	Shield,
	Trash2,
	Fingerprint,
	Lock,
	Unlock,
	AlertCircle,
	Search,
	X,
	Tag,
	UserIcon,
	KeyRound,
	LogOut,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getDisplacementFilter } from '@/components/ui/LiquidGlass';

interface Account {
	_id: string; // MongoDB's default ID
	name: string;
	issuer: string;
	secret: string; // This will be decrypted on the client
	tags: string[];
}

interface CodeData {
	current: string;
	timeRemaining: number;
	progress: number;
}

export default function AuthenticatorApp() {
	const [accounts, setAccounts] = useState<Account[]>([]);
	const [codes, setCodes] = useState<{ [key: string]: CodeData }>({});
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isAuthenticating, setIsAuthenticating] = useState(false);
	const [hasCredential, setHasCredential] = useState(false);
	const [webAuthnSupported, setWebAuthnSupported] = useState(false);
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [newAccount, setNewAccount] = useState({
		name: '',
		issuer: '',
		secret: '',
		tags: '',
	});

	// Auth state
	const [isLoginMode, setIsLoginMode] = useState(true);
	const [authUsername, setAuthUsername] = useState('');
	const [authPassword, setAuthPassword] = useState('');
	const [authLoading, setAuthLoading] = useState(false);
	const [authError, setAuthError] = useState('');
	const [userToken, setUserToken] = useState<string | null>(null);
	const [currentUsername, setCurrentUsername] = useState<string | null>(null);

	// Forgot Password State
	const [isForgotPasswordDialogOpen, setIsForgotPasswordDialogOpen] =
		useState(false);
	const [forgotPasswordUsername, setForgotPasswordUsername] = useState('');
	const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
	const [forgotPasswordError, setForgotPasswordError] = useState('');

	// Change Password State
	const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] =
		useState(false);
	const [oldPassword, setOldPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmNewPassword, setConfirmNewPassword] = useState('');
	const [changePasswordLoading, setChangePasswordLoading] = useState(false);
	const [changePasswordError, setChangePasswordError] = useState('');

	const { toast } = useToast();

	// Check WebAuthn support and existing credentials
	useEffect(() => {
		const checkWebAuthnSupport = async () => {
			if (!window.isSecureContext) {
				console.log('WebAuthn requires secure context (HTTPS)');
				setWebAuthnSupported(false); // Explicitly set to false
				return;
			}

			if (!window.PublicKeyCredential) {
				console.log('WebAuthn not supported');
				setWebAuthnSupported(false); // Explicitly set to false
				return;
			}

			try {
				const available =
					await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
				if (!available) {
					console.log('Platform authenticator not available');
					setWebAuthnSupported(false); // Explicitly set to false
					return;
				}

				setWebAuthnSupported(true);

				const credentialId = localStorage.getItem('webauthn-credential-id');
				if (credentialId) {
					setHasCredential(true);
				}
			} catch (error) {
				console.log('Error checking WebAuthn support:', error);
				setWebAuthnSupported(false); // Explicitly set to false
			}
		};

		checkWebAuthnSupport();
	}, []);

	// Check for existing user token on mount
	useEffect(() => {
		const token = localStorage.getItem('user-token');
		const username = localStorage.getItem('username');
		if (token && username) {
			setUserToken(token);
			setCurrentUsername(username);
			setIsAuthenticated(true);
		} else {
			// If no token, ensure we are not authenticated
			setIsAuthenticated(false);
		}
	}, []);

	// Fetch accounts from MongoDB API when authenticated
	const fetchAccounts = async (token: string) => {
		try {
			const response = await fetch('/api/accounts', {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			if (!response.ok) {
				throw new Error('Failed to fetch accounts');
			}
			const data: Account[] = await response.json();
			setAccounts(data);
		} catch (error) {
			console.error('Error fetching accounts:', error);
			toast({
				title: 'Error',
				description:
					'Failed to load accounts from database. Please log in again.',
				variant: 'destructive',
			});
			// Force logout if token is invalid or expired
			handleLogout();
		}
	};

	useEffect(() => {
		if (isAuthenticated && userToken) {
			fetchAccounts(userToken);
		}
	}, [isAuthenticated, userToken]);

	// Generate TOTP codes and update timer
	useEffect(() => {
		if (!isAuthenticated) return;

		const updateCodes = () => {
			const newCodes: { [key: string]: CodeData } = {};
			const now = Math.floor(Date.now() / 1000);
			const timeRemaining = 30 - (now % 30);
			const progress = (timeRemaining / 30) * 100;

			accounts.forEach((account) => {
				try {
					const { otp } = TOTP.generate(account.secret);
					newCodes[account._id] = {
						current: otp,
						timeRemaining,
						progress,
					};
				} catch (error) {
					console.error(`Error generating TOTP for ${account.name}:`, error);
					newCodes[account._id] = {
						current: '------',
						timeRemaining,
						progress,
					};
				}
			});
			setCodes(newCodes);
		};

		updateCodes();
		const interval = setInterval(updateCodes, 1000);
		return () => clearInterval(interval);
	}, [accounts, isAuthenticated]);

	// Filter accounts based on search query
	const filteredAccounts = useMemo(() => {
		if (!searchQuery.trim()) return accounts;

		const query = searchQuery.toLowerCase().trim();

		return accounts.filter((account) => {
			if (query.startsWith('org:')) {
				const orgQuery = query.substring(4).trim();
				return account.tags.some((tag) => tag.toLowerCase().includes(orgQuery));
			}

			if (query.startsWith('tag:')) {
				const tagQuery = query.substring(4).trim();
				return account.tags.some((tag) => tag.toLowerCase().includes(tagQuery));
			}

			return (
				account.name.toLowerCase().includes(query) ||
				account.issuer.toLowerCase().includes(query) ||
				account.tags.some((tag) => tag.toLowerCase().includes(query))
			);
		});
	}, [accounts, searchQuery]);

	// Get all unique tags for suggestions
	const allTags = useMemo(() => {
		const tagSet = new Set<string>();
		accounts.forEach((account) => {
			account.tags.forEach((tag) => tagSet.add(tag));
		});
		return Array.from(tagSet).sort();
	}, [accounts]);

	const generateRandomBytes = (length: number): Uint8Array => {
		return crypto.getRandomValues(new Uint8Array(length));
	};

	const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
		const bytes = new Uint8Array(buffer);
		let binary = '';
		for (let i = 0; i < bytes.byteLength; i++) {
			binary += String.fromCharCode(bytes[i]);
		}
		return btoa(binary);
	};

	const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
		const binary = atob(base64);
		const bytes = new Uint8Array(binary.length);
		for (let i = 0; i < binary.length; i++) {
			bytes[i] = binary.charCodeAt(i);
		}
		return bytes.buffer;
	};

	const setupFingerprint = async () => {
		if (!webAuthnSupported) {
			toast({
				title: 'Not Available',
				description:
					'Biometric authentication is not available in this environment',
				variant: 'destructive',
			});
			return;
		}

		setIsAuthenticating(true);

		try {
			const challenge = generateRandomBytes(32);
			const userId = generateRandomBytes(32); // This userId should ideally come from your backend user ID

			const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions =
				{
					challenge,
					rp: {
						name: 'TOTP Authenticator',
						id:
							window.location.hostname === 'localhost'
								? 'localhost'
								: window.location.hostname,
					},
					user: {
						id: userId,
						name: currentUsername || 'user@authenticator.app', // Use current username
						displayName: currentUsername || 'Authenticator User',
					},
					pubKeyCredParams: [
						{ alg: -7, type: 'public-key' },
						{ alg: -35, type: 'public-key' },
						{ alg: -36, type: 'public-key' },
						{ alg: -257, type: 'public-key' },
						{ alg: -258, type: 'public-key' },
						{ alg: -259, type: 'public-key' },
					],
					authenticatorSelection: {
						authenticatorAttachment: 'platform',
						userVerification: 'preferred',
						requireResidentKey: false,
					},
					timeout: 60000,
					attestation: 'none',
				};

			const credential = (await navigator.credentials.create({
				publicKey: publicKeyCredentialCreationOptions,
			})) as PublicKeyCredential;

			if (credential) {
				const credentialId = arrayBufferToBase64(credential.rawId);
				localStorage.setItem('webauthn-credential-id', credentialId);
				localStorage.setItem('webauthn-user-id', arrayBufferToBase64(userId));

				setHasCredential(true);
				setIsAuthenticated(true); // Authenticate after setup

				toast({
					title: 'Setup Complete',
					description: 'Biometric authentication has been set up successfully',
				});
			}
		} catch (error: any) {
			console.error('WebAuthn registration failed:', error);

			let errorMessage = 'Failed to set up biometric authentication';

			if (error.name === 'NotSupportedError') {
				errorMessage =
					'Biometric authentication is not supported on this device';
			} else if (error.name === 'SecurityError') {
				errorMessage = "Security error: Please ensure you're using HTTPS";
			} else if (error.name === 'NotAllowedError') {
				errorMessage = 'Permission denied or operation cancelled';
			} else if (error.name === 'InvalidStateError') {
				errorMessage = 'Authenticator is already registered';
			} else if (error.message?.includes('feature is not enabled')) {
				errorMessage = 'Biometric features are not enabled in this environment';
			}

			toast({
				title: 'Setup Failed',
				description: errorMessage,
				variant: 'destructive',
			});

			// Allow access even if setup fails, but don't set hasCredential
			setIsAuthenticated(true);
		} finally {
			setIsAuthenticating(false);
		}
	};

	const authenticateWithFingerprint = async () => {
		if (!webAuthnSupported) {
			toast({
				title: 'Not Available',
				description:
					'Biometric authentication is not available in this environment',
				variant: 'destructive',
			});
			setIsAuthenticated(true);
			return;
		}

		setIsAuthenticating(true);

		try {
			const credentialId = localStorage.getItem('webauthn-credential-id');
			if (!credentialId) {
				toast({
					title: 'No Credentials',
					description: 'Please set up biometric authentication first',
					variant: 'destructive',
				});
				setIsAuthenticated(true);
				return;
			}

			const challenge = generateRandomBytes(32);

			const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions =
				{
					challenge,
					allowCredentials: [
						{
							id: base64ToArrayBuffer(credentialId),
							type: 'public-key',
						},
					],
					userVerification: 'preferred',
					timeout: 60000,
				};

			const assertion = await navigator.credentials.get({
				publicKey: publicKeyCredentialRequestOptions,
			});

			if (assertion) {
				setIsAuthenticated(true);
				toast({
					title: 'Welcome Back',
					description: 'Authentication successful!',
				});
			}
		} catch (error: any) {
			console.error('WebAuthn authentication failed:', error);

			let errorMessage = 'Authentication failed';

			if (error.name === 'NotAllowedError') {
				errorMessage = 'Authentication was cancelled or timed out';
			} else if (error.name === 'SecurityError') {
				errorMessage = 'Security error occurred during authentication';
			}

			toast({
				title: 'Authentication Failed',
				description: errorMessage,
				variant: 'destructive',
			});

			// Allow access even if authentication fails
			setIsAuthenticated(true);
		} finally {
			setIsAuthenticating(false);
		}
	};

	const resetFingerprint = () => {
		localStorage.removeItem('webauthn-credential-id');
		localStorage.removeItem('webauthn-user-id');
		setHasCredential(false);
		// After resetting fingerprint, user needs to log in again or set up new fingerprint
		setIsAuthenticated(false);
		setUserToken(null);
		setCurrentUsername(null);
		localStorage.removeItem('user-token');
		localStorage.removeItem('username');
		setAccounts([]); // Clear accounts on logout
		toast({
			title: 'Reset Complete',
			description: 'Biometric authentication has been reset. Please log in.',
		});
	};

	const handleAuth = async (e: React.FormEvent) => {
		e.preventDefault();
		setAuthLoading(true);
		setAuthError('');

		const endpoint = isLoginMode ? '/api/auth/login' : '/api/auth/register';

		try {
			const response = await fetch(endpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					username: authUsername,
					password: authPassword,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Authentication failed');
			}

			localStorage.setItem('user-token', data.token);
			localStorage.setItem('username', authUsername);
			setUserToken(data.token);
			setCurrentUsername(authUsername);
			setIsAuthenticated(true);
			setAuthUsername('');
			setAuthPassword('');
			toast({
				title: isLoginMode ? 'Login Successful' : 'Registration Successful',
				description: `Welcome, ${data.username || authUsername}!`,
			});
		} catch (error: any) {
			setAuthError(error.message);
			toast({
				title: 'Authentication Error',
				description: error.message,
				variant: 'destructive',
			});
		} finally {
			setAuthLoading(false);
		}
	};

	const handleLogout = () => {
		setIsAuthenticated(false);
		setUserToken(null);
		setCurrentUsername(null);
		localStorage.removeItem('user-token');
		localStorage.removeItem('username');
		setAccounts([]); // Clear accounts on logout
		toast({
			title: 'Logged Out',
			description: 'You have been successfully logged out.',
		});
	};

	const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setForgotPasswordLoading(true);
		setForgotPasswordError('');

		try {
			const response = await fetch('/api/auth/forgot-password', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ username: forgotPasswordUsername }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Failed to reset password');
			}

			toast({
				title: 'Password Reset Initiated',
				description: data.message,
			});
			setIsForgotPasswordDialogOpen(false);
			setForgotPasswordUsername('');
		} catch (error: any) {
			setForgotPasswordError(error.message);
			toast({
				title: 'Error',
				description: error.message,
				variant: 'destructive',
			});
		} finally {
			setForgotPasswordLoading(false);
		}
	};

	const handleChangePasswordSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setChangePasswordLoading(true);
		setChangePasswordError('');

		if (newPassword !== confirmNewPassword) {
			setChangePasswordError('New passwords do not match');
			setChangePasswordLoading(false);
			return;
		}

		if (newPassword.length < 8) {
			setChangePasswordError('New password must be at least 8 characters long');
			setChangePasswordLoading(false);
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
			setIsChangePasswordDialogOpen(false);
			setOldPassword('');
			setNewPassword('');
			setConfirmNewPassword('');
		} catch (error: any) {
			setChangePasswordError(error.message);
			toast({
				title: 'Error',
				description: error.message,
				variant: 'destructive',
			});
			if (
				error.message === 'Invalid token' ||
				error.message === 'No token provided'
			) {
				handleLogout();
			}
		} finally {
			setChangePasswordLoading(false);
		}
	};

	const addAccount = async () => {
		if (!newAccount.name || !newAccount.secret) {
			toast({
				title: 'Error',
				description: 'Please fill in all required fields',
				variant: 'destructive',
			});
			return;
		}

		try {
			TOTP.generate(newAccount.secret);
		} catch (error) {
			toast({
				title: 'Invalid Secret',
				description: 'Please enter a valid base32 secret key',
				variant: 'destructive',
			});
			return;
		}

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
			const response = await fetch('/api/accounts', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${userToken}`,
				},
				body: JSON.stringify(accountData),
			});

			if (!response.ok) {
				throw new Error('Failed to add account');
			}

			const addedAccount: Account = await response.json();
			setAccounts((prev) => [...prev, addedAccount]);
			setNewAccount({ name: '', issuer: '', secret: '', tags: '' });
			setIsAddDialogOpen(false);

			toast({
				title: 'Account Added',
				description: `${addedAccount.name} has been added successfully`,
			});
		} catch (error) {
			console.error('Error adding account:', error);
			toast({
				title: 'Error',
				description: 'Failed to add account to database.',
				variant: 'destructive',
			});
			if (
				error.message === 'Invalid token' ||
				error.message === 'No token provided'
			) {
				handleLogout();
			}
		}
	};

	const removeAccount = async (e: React.MouseEvent, id: string) => {
		e.stopPropagation();
		try {
			const response = await fetch(`/api/accounts?id=${id}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${userToken}`,
				},
			});

			if (!response.ok) {
				throw new Error('Failed to delete account');
			}

			setAccounts((prev) => prev.filter((account) => account._id !== id));
			toast({
				title: 'Account Removed',
				description: 'Account has been removed successfully',
			});
		} catch (error) {
			console.error('Error removing account:', error);
			toast({
				title: 'Error',
				description: 'Failed to remove account from database.',
				variant: 'destructive',
			});
			if (
				error.message === 'Invalid token' ||
				error.message === 'No token provided'
			) {
				handleLogout();
			}
		}
	};

	const copyCode = (code: string, accountName: string) => {
		navigator.clipboard.writeText(code);
		toast({
			title: 'Copied!',
			description: `${accountName} code copied`,
		});
	};

	const formatCode = (code: string) => {
		return code.replace(/(\d{3})(\d{3})/, '$1 $2');
	};

	const clearSearch = () => {
		setSearchQuery('');
	};

	const searchByTag = (tag: string) => {
		setSearchQuery(`tag:${tag}`);
	};

	// Authentication Screen
	if (!isAuthenticated) {
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

						{/* Login/Register Form */}
						<form onSubmit={handleAuth} className='space-y-4'>
							<div>
								<Label htmlFor='username'>Username</Label>
								<Input
									id='username'
									type='text'
									placeholder='Enter your username'
									value={authUsername}
									onChange={(e) => setAuthUsername(e.target.value)}
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
									value={authPassword}
									onChange={(e) => setAuthPassword(e.target.value)}
									required
									className='rounded-xl'
								/>
							</div>
							{authError && <p className='text-red-500 text-sm'>{authError}</p>}
							<Button
								type='submit'
								disabled={authLoading}
								className='w-full h-12 rounded-2xl text-base font-medium'
							>
								{authLoading ? (
									<>
										<div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2' />
										{isLoginMode ? 'Logging in...' : 'Registering...'}
									</>
								) : isLoginMode ? (
									'Login'
								) : (
									'Register'
								)}
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

						{/* Forgot Password */}
						<Dialog
							open={isForgotPasswordDialogOpen}
							onOpenChange={setIsForgotPasswordDialogOpen}
						>
							<DialogTrigger asChild>
								<Button
									variant='link'
									className='mt-4 text-blue-600 hover:text-blue-700'
								>
									Forgot Password?
								</Button>
							</DialogTrigger>
							<DialogContent className='rounded-2xl'>
								<DialogHeader>
									<DialogTitle>Forgot Password</DialogTitle>
									<DialogDescription>
										Enter your username to receive a new password.
									</DialogDescription>
								</DialogHeader>
								<form
									onSubmit={handleForgotPasswordSubmit}
									className='space-y-4'
								>
									<div>
										<Label htmlFor='forgot-username'>Username</Label>
										<Input
											id='forgot-username'
											type='text'
											placeholder='Enter your username'
											value={forgotPasswordUsername}
											onChange={(e) =>
												setForgotPasswordUsername(e.target.value)
											}
											required
											className='rounded-xl'
										/>
									</div>
									{forgotPasswordError && (
										<p className='text-red-500 text-sm'>
											{forgotPasswordError}
										</p>
									)}
									<DialogFooter>
										<Button
											variant='outline'
											onClick={() => setIsForgotPasswordDialogOpen(false)}
											className='rounded-xl'
										>
											Cancel
										</Button>
										<Button
											type='submit'
											disabled={forgotPasswordLoading}
											className='rounded-xl'
										>
											{forgotPasswordLoading ? (
												<>
													<div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2' />
													Sending...
												</>
											) : (
												'Reset Password'
											)}
										</Button>
									</DialogFooter>
								</form>
							</DialogContent>
						</Dialog>

						{/* Biometric Setup/Auth (only if WebAuthn is supported and user is logged in) */}
						{webAuthnSupported && userToken && (
							<div className='mt-8 pt-8 border-t border-gray-200 space-y-6'>
								{!hasCredential ? (
									<div className='p-6 bg-blue-50 rounded-2xl'>
										<Fingerprint className='w-12 h-12 text-blue-600 mx-auto mb-4' />
										<h3 className='font-semibold text-gray-900 mb-2'>
											Set up Biometric Auth
										</h3>
										<p className='text-sm text-gray-600 mb-4'>
											Secure your authenticator app with your fingerprint or
											face recognition
										</p>
										<Button
											onClick={setupFingerprint}
											disabled={isAuthenticating}
											className='w-full h-12 rounded-2xl text-base font-medium'
										>
											{isAuthenticating ? (
												<>
													<div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2' />
													Setting up...
												</>
											) : (
												<>
													<Fingerprint className='w-5 h-5 mr-2' />
													Set up Biometric Auth
												</>
											)}
										</Button>
									</div>
								) : (
									<div className='p-6 bg-green-50 rounded-2xl'>
										<Lock className='w-12 h-12 text-green-600 mx-auto mb-4' />
										<h3 className='font-semibold text-gray-900 mb-2'>
											Verify Identity
										</h3>
										<p className='text-sm text-gray-600 mb-4'>
											Use your biometric authentication to access your accounts
										</p>
										<Button
											onClick={authenticateWithFingerprint}
											disabled={isAuthenticating}
											className='w-full h-12 rounded-2xl text-base font-medium'
										>
											{isAuthenticating ? (
												<>
													<div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2' />
													Authenticating...
												</>
											) : (
												<>
													<Unlock className='w-5 h-5 mr-2' />
													Authenticate
												</>
											)}
										</Button>
										<Button
											variant='outline'
											onClick={resetFingerprint}
											className='w-full h-12 rounded-2xl text-base font-medium text-red-600 border-red-200 hover:bg-red-50 bg-transparent mt-2'
										>
											Reset Biometric Auth
										</Button>
									</div>
								)}
							</div>
						)}

						{/* WebAuthn Not Supported Message */}
						{!webAuthnSupported && (
							<div className='mt-8 pt-8 border-t border-gray-200 space-y-6'>
								<div className='p-6 bg-yellow-50 rounded-2xl'>
									<AlertCircle className='w-12 h-12 text-yellow-600 mx-auto mb-4' />
									<h3 className='font-semibold text-gray-900 mb-2'>
										Biometric Auth Not Available
									</h3>
									<p className='text-sm text-gray-600 mb-4'>
										Biometric authentication is not supported in this
										environment or by your device. You can still use the app
										normally after logging in.
									</p>
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		);
	}

	// Main App Screen (after authentication)
	return (
		<div className='min-h-screen bg-gray-50 p-4'>
			<div className='max-w-md mx-auto'>
				{/* Header */}
				<div
					className='flex items-center justify-between mb-6 sticky top-4 z-[999] px-4 py-2 rounded-md border border-gray-200'
					style={{
						backdropFilter: `blur(2px) url('${getDisplacementFilter({
							height: 50,
							width: 500,
							radius: 4,
							depth: 5,
							strength: 100,
							chromaticAberration: 0,
						})}') blur(4px)`,
					}}
				>
					<div className='flex items-center gap-3'>
						<Shield className='w-8 h-8 text-blue-600' />
						<h1 className='text-sm md:text-2xl flex flex-col font-bold text-gray-900'>
							<span>Auth316</span>
							<span className='text-xs font-medium'>{currentUsername}</span>
						</h1>
					</div>
					<div className='flex items-center gap-2'>
						{/* Change Password Dialog Trigger */}
						<Dialog
							open={isChangePasswordDialogOpen}
							onOpenChange={setIsChangePasswordDialogOpen}
						>
							<DialogTrigger asChild>
								<Button
									variant='ghost'
									className='rounded-full h-10 w-10 p-0'
									title='Change Password'
								>
									<KeyRound className='w-5 h-5 text-gray-600' />
								</Button>
							</DialogTrigger>
							<DialogContent className='rounded-2xl'>
								<DialogHeader>
									<DialogTitle>Change Password</DialogTitle>
									<DialogDescription>
										Update your account password.
									</DialogDescription>
								</DialogHeader>
								<form
									onSubmit={handleChangePasswordSubmit}
									className='space-y-4'
								>
									<div>
										<Label htmlFor='old-password'>Old Password</Label>
										<Input
											id='old-password'
											type='password'
											placeholder='Enter your old password'
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
											placeholder='Enter new password (min 8 chars)'
											value={newPassword}
											onChange={(e) => setNewPassword(e.target.value)}
											required
											className='rounded-xl'
										/>
									</div>
									<div>
										<Label htmlFor='confirm-new-password'>
											Confirm New Password
										</Label>
										<Input
											id='confirm-new-password'
											type='password'
											placeholder='Confirm new password'
											value={confirmNewPassword}
											onChange={(e) => setConfirmNewPassword(e.target.value)}
											required
											className='rounded-xl'
										/>
									</div>
									{changePasswordError && (
										<p className='text-red-500 text-sm'>
											{changePasswordError}
										</p>
									)}
									<DialogFooter>
										<Button
											variant='outline'
											onClick={() => setIsChangePasswordDialogOpen(false)}
											className='rounded-xl'
										>
											Cancel
										</Button>
										<Button
											type='submit'
											disabled={changePasswordLoading}
											className='rounded-xl'
										>
											{changePasswordLoading ? (
												<>
													<div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2' />
													Changing...
												</>
											) : (
												'Change Password'
											)}
										</Button>
									</DialogFooter>
								</form>
							</DialogContent>
						</Dialog>
						<Button
							variant='ghost'
							onClick={handleLogout}
							className='rounded-full h-10 w-10 p-0'
							title='Logout'
						>
							<LogOut className='w-5 h-5 text-gray-600' />
						</Button>
					</div>
				</div>

				{/* Search Bar */}
				<div className='relative mb-6'>
					<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
					<Input
						placeholder='Search accounts or use org:company, tag:work'
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className='pl-10 pr-10 rounded-2xl border-gray-200 focus:border-blue-500 focus:ring-blue-500'
					/>
					{searchQuery && (
						<Button
							variant='ghost'
							size='sm'
							onClick={clearSearch}
							className='absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 rounded-full hover:bg-gray-100'
						>
							<X className='w-3 h-3' />
						</Button>
					)}
				</div>

				{/* Popular Tags */}
				{allTags.length > 0 && !searchQuery && (
					<div className='mb-6'>
						<div className='flex items-center gap-2 mb-3'>
							<Tag className='w-4 h-4 text-gray-500' />
							<span className='text-sm font-medium text-gray-700'>
								Quick filters
							</span>
						</div>
						<div className='flex flex-wrap gap-2'>
							{allTags.slice(0, 6).map((tag) => (
								<Badge
									key={tag}
									variant='secondary'
									className='cursor-pointer hover:bg-blue-100 hover:text-blue-700 transition-colors rounded-full'
									onClick={() => searchByTag(tag)}
								>
									{tag}
								</Badge>
							))}
						</div>
					</div>
				)}

				{/* Search Results Info */}
				{searchQuery && (
					<div className='mb-4'>
						<p className='text-sm text-gray-600'>
							{filteredAccounts.length} result
							{filteredAccounts.length !== 1 ? 's' : ''} for "
							<span className='font-medium'>{searchQuery}</span>"
						</p>
					</div>
				)}

				{/* Accounts List */}
				<div className='space-y-4 mb-6'>
					{filteredAccounts.length === 0 ? (
						<Card className='rounded-2xl border border-gray-200'>
							<CardContent className='p-8 text-center'>
								{searchQuery ? (
									<>
										<Search className='w-12 h-12 text-gray-300 mx-auto mb-4' />
										<h3 className='text-lg font-medium text-gray-900 mb-2'>
											No results found
										</h3>
										<p className='text-gray-500 mb-4'>
											Try searching with different terms or use org:company or
											tag:work
										</p>
										<Button
											variant='outline'
											onClick={clearSearch}
											className='rounded-xl bg-transparent'
										>
											Clear search
										</Button>
									</>
								) : (
									<>
										<Shield className='w-12 h-12 text-gray-300 mx-auto mb-4' />
										<h3 className='text-lg font-medium text-gray-900 mb-2'>
											No accounts
										</h3>
										<p className='text-gray-500'>
											Add your first account to get started
										</p>
									</>
								)}
							</CardContent>
						</Card>
					) : (
						filteredAccounts.map((account) => {
							const codeData = codes[account._id];

							return (
								<CardContent className='p-4 border rounded-2xl'>
									<div className='flex items-center justify-between'>
										<div className='flex-1'>
											<div className='flex items-center gap-3 mb-2'>
												<div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
													<span className='text-blue-600 font-semibold text-sm'>
														{account.issuer.charAt(0).toUpperCase()}
													</span>
												</div>
												<div className='flex-1'>
													<h3 className='font-medium text-gray-900'>
														{account.issuer}
													</h3>
													<p className='text-sm text-gray-500'>
														{account.name}
													</p>
												</div>
											</div>
											<div className='font-mono text-2xl font-bold text-gray-900 tracking-wider ml-11 mb-2'>
												{formatCode(codeData?.current || '------')}
											</div>
											{account.tags.length > 0 && (
												<div className='flex flex-wrap gap-1 ml-11'>
													{account.tags.map((tag) => (
														<Badge
															key={tag}
															variant='outline'
															className='text-xs cursor-pointer hover:bg-blue-50 hover:border-blue-200 rounded-full'
															onClick={(e) => {
																e.stopPropagation();
																searchByTag(tag);
															}}
														>
															{tag}
														</Badge>
													))}
												</div>
											)}
										</div>
										<div className='flex items-center gap-3'>
											<div className='text-center'>
												<div className='text-xs text-gray-500 font-medium'>
													{codeData?.timeRemaining || 0}s
												</div>
											</div>
											<Button
												variant='ghost'
												size='sm'
												onClick={(e) => removeAccount(e, account._id)}
												className='text-gray-400 hover:text-red-500 rounded-full h-8 w-8 p-0'
											>
												<Trash2 className='w-4 h-4' />
											</Button>
										</div>
									</div>
								</CardContent>
							);
						})
					)}
				</div>

				{/* Add Account Button */}
				<Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
					<DialogTrigger asChild>
						<Button
							className='w-full h-12 text-base font-medium sticky bottom-4 px-4 py-2 rounded-2xl border border-gray-200 bg-transparent text-black hover:bg-white/50'
							style={{
								backdropFilter: `blur(2px) url('${getDisplacementFilter({
									height: 50,
									width: 500,
									radius: 15,
									depth: 5,
									strength: 100,
									chromaticAberration: 0,
								})}') blur(4px)`,
							}}
						>
							<Plus className='w-5 h-5 mr-2' />
							Add Account
						</Button>
					</DialogTrigger>
					<DialogContent className='rounded-2xl'>
						<DialogHeader>
							<DialogTitle>Add Account</DialogTitle>
							<DialogDescription>
								Enter your account details to generate TOTP codes.
							</DialogDescription>
						</DialogHeader>
						<div className='space-y-4'>
							<div>
								<Label htmlFor='issuer'>Service</Label>
								<Input
									id='issuer'
									placeholder='Google, GitHub, etc.'
									value={newAccount.issuer}
									onChange={(e) =>
										setNewAccount((prev) => ({
											...prev,
											issuer: e.target.value,
										}))
									}
									className='rounded-xl'
								/>
							</div>
							<div>
								<Label htmlFor='name'>Account</Label>
								<Input
									id='name'
									placeholder='your@email.com'
									value={newAccount.name}
									onChange={(e) =>
										setNewAccount((prev) => ({ ...prev, name: e.target.value }))
									}
									className='rounded-xl'
								/>
							</div>
							<div>
								<Label htmlFor='secret'>Secret Key</Label>
								<Input
									id='secret'
									placeholder='Enter your secret key'
									value={newAccount.secret}
									onChange={(e) =>
										setNewAccount((prev) => ({
											...prev,
											secret: e.target.value,
										}))
									}
									className='font-mono rounded-xl'
								/>
							</div>
							<div>
								<Label htmlFor='tags'>Tags (optional)</Label>
								<Input
									id='tags'
									placeholder='work, personal, company-name (comma separated)'
									value={newAccount.tags}
									onChange={(e) =>
										setNewAccount((prev) => ({ ...prev, tags: e.target.value }))
									}
									className='rounded-xl'
								/>
								<p className='text-xs text-gray-500 mt-1'>
									Add tags to organize your accounts. Use company names for org:
									searches.
								</p>
							</div>
						</div>
						<DialogFooter>
							<Button
								variant='outline'
								onClick={() => setIsAddDialogOpen(false)}
								className='rounded-xl'
							>
								Cancel
							</Button>
							<Button onClick={addAccount} className='rounded-xl'>
								Add
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}
