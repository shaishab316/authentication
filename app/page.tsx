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
			accountService
				.fetchAccounts(userToken)
				.then(setAccounts)
				.catch((error) => {
					console.error('Error fetching accounts:', error);
					toast.error('Failed to load accounts. Please log in again.');
					handleLogout();
				});
		} else {
			setAccounts([]);
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
		toast.success('You have been successfully logged out.');
		router.push('/login');
	};

	const handleRemoveAccount = async (e: React.MouseEvent, id: string) => {
		e.stopPropagation();
		try {
			if (!userToken) throw new Error('No token');
			await accountService.removeAccount(id, userToken);
			setAccounts((prev) => prev.filter((acc) => acc._id !== id));
			toast.success('Account has been removed successfully');
		} catch (error: any) {
			toast.error('Failed to remove account from database.');
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
		<div className='min-h-screen relative overflow-hidden bg-linear-to-br from-blue-50 via-purple-50 to-pink-50'>
			{/* Animated Grid Background */}
			<div className='absolute inset-0 opacity-30'>
				<div
					className='absolute inset-0'
					style={{
						backgroundImage: `linear-linear(to right, #e5e7eb 1px, transparent 1px),
					                  linear-linear(to bottom, #e5e7eb 1px, transparent 1px)`,
						backgroundSize: '40px 40px',
					}}
				/>
				{/* linear Overlay */}
				<div className='absolute inset-0 bg-linear-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5' />
			</div>

			{/* Floating Orbs */}
			<div className='absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse' />
			<div className='absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000' />
			<div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-400/10 rounded-full blur-3xl animate-pulse delay-500' />

			{/* Content */}
			<div className='relative z-10 p-4 sm:p-6'>
				<div className='max-w-md mx-auto'>
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

					<AccountList
						accounts={accounts}
						codes={codes}
						searchQuery={searchQuery}
						onRemove={handleRemoveAccount}
					/>

					{/* Floating Add Button with Enhanced Effects */}
					<Button
						onClick={() => router.push('/add-account')}
						className='w-fit h-12 sm:h-14 text-sm sm:text-base font-semibold fixed bottom-4 right-4 sm:bottom-10 sm:right-10 px-4 sm:px-5 py-2 rounded-2xl bg-linear-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-xl hover:shadow-2xl group flex justify-center items-center gap-2 overflow-hidden transition-all duration-300 z-50 hover:scale-110 active:scale-95 border-2 border-white/20'
					>
						{/* Shine effect */}
						<div className='absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000' />

						<Plus className='size-5 sm:size-6 transition-transform duration-300 group-hover:rotate-180 relative z-10' />
						<span className='hidden sm:group-hover:inline-block relative z-10 font-bold'>
							Add Account
						</span>

						{/* Glow effect */}
						<div className='absolute inset-0 rounded-2xl bg-linear-to-r from-blue-500 to-purple-600 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300' />
					</Button>
				</div>
			</div>
		</div>
	);
}
