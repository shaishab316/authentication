import type React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import 'react-toastify/dist/ReactToastify.css';
import ToastProvider from '@/components/toast-provider';

export const metadata: Metadata = {
	title: '2FA Authenticator',
	description: '2FA Authenticator App',
	generator: 'shaishab316',
	keywords: ['2fa', 'authenticator', 'shaishab316'],
	icons: {
		icon: '/favicon.svg',
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en'>
			<body>
				{children}
				<ToastProvider />
				<div className='fixed inset-0 pointer-events-none flex items-center justify-center z-9999'>
					<div className='text-7xl md:text-9xl font-bold text-gray-300/20 dark:text-gray-700/20 -rotate-45 select-none'>
						PREVIEW
					</div>
				</div>
			</body>
		</html>
	);
}
