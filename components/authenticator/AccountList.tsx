'use client';
import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Plus, Search as SearchIcon } from 'lucide-react';
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
			<Card className='rounded-2xl border border-gray-200'>
				<CardContent className='p-8 text-center'>
					{searchQuery ? (
						<>
							<SearchIcon className='w-12 h-12 text-gray-400 mx-auto mb-4' />
							<h3 className='text-lg font-medium text-gray-900 mb-2'>
								No results found
							</h3>
							<p className='text-gray-600 text-sm'>
								No accounts match your search. Try a different query.
							</p>
						</>
					) : (
						<>
							<AlertCircle className='w-12 h-12 text-gray-400 mx-auto mb-4' />
							<h3 className='text-lg font-medium text-gray-900 mb-2'>
								No accounts yet
							</h3>
							<p className='text-gray-600 text-sm'>
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
		<div className='space-y-4 mb-6'>
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
