import type React from 'react';
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

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
			<head>
				<style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
			</head>
			<body>
				{children}
				<Toaster />
			</body>
		</html>
	);
}
