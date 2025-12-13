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
		<div className='relative mb-6 px-5 py-4 rounded-3xl bg-white/80 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50 overflow-hidden group'>
			{/* Animated gradient border effect */}
			<div className='absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl' />
			<div className='absolute inset-[1px] rounded-3xl bg-white/80 backdrop-blur-xl' />

			{/* Content */}
			<div className='relative z-10 flex items-center justify-between'>
				<div className='flex items-center gap-3'>
					<div className='w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300'>
						<Shield className='w-6 h-6 sm:w-7 sm:h-7 text-white' />
					</div>
					<div className='flex flex-col'>
						<h1 className='text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
							Auth316
						</h1>
						<span className='text-xs sm:text-sm font-medium text-gray-600'>
							{currentUsername}
						</span>
					</div>
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
						className='rounded-2xl h-10 w-10 p-0 hover:bg-purple-100 hover:scale-110 transition-all duration-200 active:scale-95'
						title='Change Password'
					>
						<KeyRound className='w-5 h-5 text-purple-600' />
					</Button>
					<Button
						variant='ghost'
						onClick={onLogout}
						className='rounded-2xl h-10 w-10 p-0 hover:bg-red-100 hover:scale-110 transition-all duration-200 active:scale-95'
						title='Logout'
					>
						<LogOut className='w-5 h-5 text-red-600' />
					</Button>
				</div>
			</div>
		</div>
	);
};
