'use client';
import type React from 'react';
import { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useAccounts } from '@/hooks/useAccounts';
import { useTOTP } from '@/hooks/useTOTP';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { Header } from '@/components/authenticator/Header';
import { SearchBar } from '@/components/authenticator/SearchBar';
import { AccountList } from '@/components/authenticator/AccountList';
import { AddAccountDialog } from '@/components/authenticator/AddAccountDialog';

export default function AuthenticatorApp() {
	const [searchQuery, setSearchQuery] = useState('');
	const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] =
		useState(false);

	const { toast } = useToast();
	const { isAuthenticated, userToken, currentUsername, login, logout } =
		useAuth();
	const { accounts, addAccount, removeAccount } = useAccounts(
		isAuthenticated,
		userToken,
		logout
	);
	const codes = useTOTP(accounts, isAuthenticated);

	// Get all unique tags for filtering
	const allTags = useMemo(() => {
		const tagSet = new Set<string>();
		accounts.forEach((account) => {
			account.tags.forEach((tag) => tagSet.add(tag));
		});
		return Array.from(tagSet).sort();
	}, [accounts]);

	const handleLogout = () => {
		logout();
		toast({
			title: 'Logged Out',
			description: 'You have been successfully logged out.',
		});
	};

	const handleLogin = (token: string, username: string) => {
		login(token, username);
	};

	const handleRemoveAccount = async (e: React.MouseEvent, id: string) => {
		e.stopPropagation();
		try {
			await removeAccount(id);
			toast({
				title: 'Account Removed',
				description: 'Account has been removed successfully',
			});
		} catch (error: any) {
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

	const handleCopyCode = (code: string, accountName: string) => {
		navigator.clipboard.writeText(code);
		toast({
			title: 'Copied!',
			description: `${accountName} code copied`,
		});
	};

	const searchByTag = (tag: string) => {
		setSearchQuery(`tag:${tag}`);
	};

	// Calculate filtered accounts for result count
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
					onCopy={handleCopyCode}
					onRemove={handleRemoveAccount}
				/>

				<AddAccountDialog onAdd={addAccount} />
			</div>
		</div>
	);
}
