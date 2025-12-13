import React from 'react';
import { Button } from '@/components/ui/button';
import { Shield, LogOut, KeyRound } from 'lucide-react';
import { ChangePasswordDialog } from '../auth/ChangePasswordDialog';

interface HeaderProps {
	currentUsername: string | null;
	userToken: string | null;
	onLogout: () => void;
	isChangePasswordDialogOpen: boolean;
	setIsChangePasswordDialogOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
	currentUsername,
	userToken,
	onLogout,
	isChangePasswordDialogOpen,
	setIsChangePasswordDialogOpen,
}) => {
	return (
		<div
			className='flex items-center justify-between mb-6 px-4 py-2 rounded-md border border-gray-200 bg-white'
			style={{
				backgroundImage: `
					radial-gradient(circle at 1px 1px, rgb(59 130 246 / 0.15) 1px, transparent 0)
				`,
				backgroundSize: '24px 24px',
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
				<ChangePasswordDialog
					open={isChangePasswordDialogOpen}
					onOpenChange={setIsChangePasswordDialogOpen}
					userToken={userToken}
					onLogout={onLogout}
				/>
				<Button
					variant='ghost'
					onClick={() => setIsChangePasswordDialogOpen(true)}
					className='rounded-full h-10 w-10 p-0'
					title='Change Password'
				>
					<KeyRound className='w-5 h-5 text-gray-600' />
				</Button>
				<Button
					variant='ghost'
					onClick={onLogout}
					className='rounded-full h-10 w-10 p-0'
					title='Logout'
				>
					<LogOut className='w-5 h-5 text-gray-600' />
				</Button>
			</div>
		</div>
	);
};
