'use client';
import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Search as SearchIcon } from 'lucide-react';
import type { Account, CodeData } from '@/types/account';
import { AccountCard } from './AccountCard';

interface AccountListProps {
	accounts: Account[];
	codes: { [key: string]: CodeData };
	searchQuery: string;
	onRemove: (e: React.MouseEvent, id: string) => void;
}

export const AccountList: React.FC<AccountListProps> = ({
	accounts,
	codes,
	searchQuery,
	onRemove,
}) => {
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

	if (filteredAccounts.length === 0) {
		return (
			<Card className='rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl shadow-lg'>
				<CardContent className='p-10 text-center'>
					{searchQuery ? (
						<>
							<div className='w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md'>
								<SearchIcon className='w-8 h-8 text-gray-400' />
							</div>
							<h3 className='text-xl font-bold text-gray-900 mb-2'>
								No results found
							</h3>
							<p className='text-gray-600'>
								No accounts match your search. Try a different query.
							</p>
						</>
					) : (
						<>
							<div className='w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse'>
								<Plus className='w-8 h-8 text-white' />
							</div>
							<h3 className='text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2'>
								No accounts yet
							</h3>
							<p className='text-gray-600'>
								Add your first account to get started with two-factor
								authentication.
							</p>
						</>
					)}
				</CardContent>
			</Card>
		);
	}

	return (
		<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6'>
			{filteredAccounts.map((account) => {
				const codeData = codes[account._id];

				return (
					<AccountCard
						key={account._id}
						account={account}
						codeData={codeData}
						onRemove={onRemove}
					/>
				);
			})}
		</div>
	);
};
