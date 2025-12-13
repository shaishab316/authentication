'use client';
import type React from 'react';
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { accountService } from '@/services/accountService';
import { authService } from '@/services/authService';
import { totpService } from '@/services/totpService';
import type { Account, CodeData } from '@/types/account';
import { Header } from '@/components/authenticator/Header';
import { SearchBar } from '@/components/authenticator/SearchBar';
import { AccountList } from '@/components/authenticator/AccountList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function AuthenticatorApp() {
	const router = useRouter();
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [userToken, setUserToken] = useState<string | null>(null);
	const [currentUsername, setCurrentUsername] = useState<string | null>(null);
	const [accounts, setAccounts] = useState<Account[]>([]);
	const [codes, setCodes] = useState<{ [key: string]: CodeData }>({});
	const [searchQuery, setSearchQuery] = useState('');
	const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] =
		useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const stored = authService.getStoredAuth();
		if (stored) {
			setUserToken(stored.token);
			setCurrentUsername(stored.username);
			setIsAuthenticated(true);
		} else {
			// Redirect to login if not authenticated
			router.push('/login');
		}
	}, [router]);

	useEffect(() => {
		if (isAuthenticated && userToken) {
			setIsLoading(true);
			setError(null);
			accountService
				.fetchAccounts(userToken)
				.then((data) => {
					setAccounts(data);
					setIsLoading(false);
					setError(null);
				})
				.catch((error) => {
					console.error('Error fetching accounts:', error);
					setError(error.message || 'Failed to load accounts');
					setIsLoading(false);
					setError(error.message || 'Failed to load accounts');
					setIsLoading(false);
					toast.error('Failed to load accounts. Please log in again.');
					handleLogout();
				});
		} else {
			setAccounts([]);
			setIsLoading(false);
		}
	}, [isAuthenticated, userToken]);

	useEffect(() => {
		if (!isAuthenticated || accounts.length === 0) return;

		const updateCodes = () => {
			setCodes(totpService.generateCodes(accounts));
		};

		updateCodes();
		const interval = setInterval(updateCodes, 1000);
		return () => clearInterval(interval);
	}, [accounts, isAuthenticated]);

	const allTags = useMemo(() => {
		const tagSet = new Set<string>();
		accounts.forEach((account) => {
			account.tags.forEach((tag) => tagSet.add(tag));
		});
		return Array.from(tagSet).sort();
	}, [accounts]);

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

	const handleLogout = () => {
		authService.clearAuth();
		setIsAuthenticated(false);
		setUserToken(null);
		setCurrentUsername(null);
		setAccounts([]);
		router.push('/login');
	};

	const handleRemoveAccount = async (e: React.MouseEvent, id: string) => {
		e.stopPropagation();
		try {
			if (!userToken) throw new Error('No token');
			await accountService.removeAccount(id, userToken);
			setAccounts((prev) => prev.filter((acc) => acc._id !== id));
		} catch (error: any) {
			if (
				error.message === 'Invalid token' ||
				error.message === 'No token provided'
			) {
				handleLogout();
			}
		}
	};

	const searchByTag = (tag: string) => {
		setSearchQuery(`tag:${tag}`);
	};

	// Show nothing while checking authentication (will redirect if needed)
	if (!isAuthenticated) {
		return null;
	}

	return (
		<div className='min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'>
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
				<div className='absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5' />
			</div>

			{/* Floating Orbs */}
			<div className='absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse' />
			<div
				className='absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse'
				style={{ animationDelay: '1s' }}
			/>
			<div
				className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-400/10 rounded-full blur-3xl animate-pulse'
				style={{ animationDelay: '0.5s' }}
			/>

			{/* Content */}
			<div className='relative z-10 p-4 sm:p-6 max-w-7xl mx-auto'>
				<Header
					currentUsername={currentUsername}
					userToken={userToken}
					onLogout={handleLogout}
					isChangePasswordDialogOpen={isChangePasswordDialogOpen}
					setIsChangePasswordDialogOpen={setIsChangePasswordDialogOpen}
				/>

				<SearchBar
					searchQuery={searchQuery}
					setSearchQuery={setSearchQuery}
					allTags={allTags}
					onTagClick={searchByTag}
					resultCount={searchQuery ? filteredAccounts.length : undefined}
				/>

				{/* Loading State */}
				{isLoading && (
					<div className='flex flex-col items-center justify-center py-20 space-y-6'>
						<div className='relative'>
							{/* Spinning rings */}
							<div className='w-20 h-20 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin' />
							<div
								className='absolute inset-0 w-20 h-20 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin'
								style={{
									animationDirection: 'reverse',
									animationDuration: '1s',
								}}
							/>
						</div>
						<div className='text-center space-y-2'>
							<h3 className='text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent'>
								Loading Accounts
							</h3>
							<p className='text-gray-600'>
								Please wait while we fetch your accounts...
							</p>
						</div>
					</div>
				)}

				{/* Error State */}
				{!isLoading && error && (
					<div className='flex flex-col items-center justify-center py-20 space-y-6'>
						<div className='relative'>
							<div className='w-24 h-24 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center shadow-xl'>
								<svg
									className='w-12 h-12 text-red-600'
									fill='none'
									viewBox='0 0 24 24'
									stroke='currentColor'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
									/>
								</svg>
							</div>
						</div>
						<div className='text-center space-y-3 max-w-md'>
							<h3 className='text-xl font-bold text-gray-900'>
								Oops! Something went wrong
							</h3>
							<p className='text-gray-600'>{error}</p>
							<Button
								onClick={() => window.location.reload()}
								className='mt-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300'
							>
								Try Again
							</Button>
						</div>
					</div>
				)}

				{/* Account List */}
				{!isLoading && !error && (
					<AccountList
						accounts={accounts}
						codes={codes}
						searchQuery={searchQuery}
						onRemove={handleRemoveAccount}
					/>
				)}

				{/* Floating Add Button with Enhanced Effects */}
				<Button
					onClick={() => router.push('/add-account')}
					className='w-fit h-12 sm:h-14 text-sm sm:text-base font-semibold fixed bottom-4 right-4 sm:bottom-10 sm:right-10 px-4 sm:px-5 py-2 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-xl hover:shadow-2xl group flex justify-center items-center gap-2 overflow-hidden transition-all duration-300 z-50 hover:scale-110 active:scale-95 border-2 border-white/20'
				>
					{/* Shine effect */}
					<div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000' />

					<Plus className='size-5 sm:size-6 transition-transform duration-300 group-hover:rotate-180 relative z-10' />
					<span className='hidden sm:group-hover:inline-block relative z-10 font-bold'>
						Add Account
					</span>

					{/* Glow effect */}
					<div className='absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300' />
				</Button>
			</div>
		</div>
	);
}
