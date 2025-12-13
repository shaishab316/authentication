import React from 'react';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Copy, Trash2 } from 'lucide-react';
import type { Account, CodeData } from '@/types/account';

interface AccountCardProps {
	account: Account;
	codeData: CodeData;
	onCopy: (code: string, accountName: string) => void;
	onRemove: (e: React.MouseEvent, id: string) => void;
}

export const AccountCard: React.FC<AccountCardProps> = ({
	account,
	codeData,
	onCopy,
	onRemove,
}) => {
	const formatCode = (code: string) => {
		return code.replace(/(\d{3})(\d{3})/, '$1 $2');
	};

	return (
		<CardContent
			onClick={() => onCopy(codeData?.current, account.name)}
			className='p-4 border rounded-2xl hover:bg-gray-100 cursor-pointer active:bg-gray-200'
		>
			<div className='flex items-center justify-between'>
				<div className='flex-1'>
					<div className='flex items-center gap-2 mb-2'>
						<h3 className='text-sm font-medium text-gray-700'>
							{account.issuer}
						</h3>
						{account.tags && account.tags.length > 0 && (
							<div className='flex gap-1'>
								{account.tags.slice(0, 2).map((tag) => (
									<Badge
										key={tag}
										variant='secondary'
										className='text-xs px-2 py-0 h-5'
									>
										{tag}
									</Badge>
								))}
								{account.tags.length > 2 && (
									<Badge variant='secondary' className='text-xs px-2 py-0 h-5'>
										+{account.tags.length - 2}
									</Badge>
								)}
							</div>
						)}
					</div>
					<p className='text-xs text-gray-500 mb-3'>{account.name}</p>
					<div className='flex items-center gap-3'>
						<span className='text-2xl font-mono font-bold text-gray-900'>
							{codeData ? formatCode(codeData.current) : '--- ---'}
						</span>
						<div className='flex items-center gap-2 text-sm text-gray-500'>
							<Copy className='w-3 h-3' />
							<span>{codeData?.timeRemaining}s</span>
						</div>
					</div>
					<Progress value={codeData?.progress || 0} className='h-1 mt-2' />
				</div>
				<Button
					variant='ghost'
					size='sm'
					onClick={(e) => onRemove(e, account._id)}
					className='ml-2 h-8 w-8 p-0 rounded-full hover:bg-red-100 hover:text-red-600'
				>
					<Trash2 className='w-4 h-4' />
				</Button>
			</div>
		</CardContent>
	);
};
