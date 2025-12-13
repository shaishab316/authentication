import type React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import 'react-toastify/dist/ReactToastify.css';
import ToastProvider from '@/components/toast-provider';

export const metadata: Metadata = {
	title: 'Auth316 | 2FA Authenticator',
	description: 'Auth316 2FA Authenticator App',
	generator: 'shaishab316',
	keywords: ['auth316', '2fa', 'authenticator', 'shaishab316'],
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
			</body>
		</html>
	);
}
