'use client';
import type React from 'react';
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { accountService } from '@/services/accountService';
import { authService } from '@/services/authService';
import { totpService } from '@/services/totpService';
import type { Account, CodeData } from '@/types/account';
import { AuthScreen } from '@/components/auth/AuthScreen';
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
		}
	}, []);

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

	const handleLogin = async (token: string, username: string) => {
		authService.storeAuth(token, username);
		setUserToken(token);
		setCurrentUsername(username);
		setIsAuthenticated(true);
	};

	const handleLogout = () => {
		authService.clearAuth();
		setIsAuthenticated(false);
		setUserToken(null);
		setCurrentUsername(null);
		setAccounts([]);
		toast.success('You have been successfully logged out.');
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

	if (!isAuthenticated) {
		return <AuthScreen onLogin={handleLogin} />;
	}

	return (
		<div className='min-h-screen bg-gray-50 p-4'>
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

				<Button
					onClick={() => router.push('/add-account')}
					className='w-fit h-12 sm:h-12 text-sm sm:text-base font-medium fixed bottom-4 right-4 sm:bottom-10 sm:right-10 px-3 sm:px-4 py-2 rounded-2xl border-2 border-gray-200 text-black bg-white hover:bg-white hover:border-blue-300 hover:shadow-lg group flex justify-center items-center gap-2 overflow-hidden transition-all duration-300 z-50'
				>
					<Plus className='size-5 transition-transform duration-300 group-hover:rotate-90' />
					<span className='hidden sm:group-hover:inline-block'>
						Add Account
					</span>
				</Button>
			</div>
		</div>
	);
}
