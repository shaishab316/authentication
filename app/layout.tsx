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
			</body>
		</html>
	);
}
