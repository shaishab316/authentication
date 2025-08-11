import type React from 'react';
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
	title: 'v0 App',
	description: 'Created with v0',
	generator: 'v0.dev',
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
				<svg
					xmlns='http://www.w3.org/2000/svg'
					style={{
						position: 'absolute',
						width: 0,
						height: 0,
						overflow: 'hidden',
					}}
					aria-hidden='true'
					focusable='false'
				>
					<defs>
						<filter
							id='liquidGlass'
							x='0'
							y='0'
							width='100%'
							height='100%'
							colorInterpolationFilters='sRGB'
						>
							<feTurbulence
								id='turbulence'
								type='turbulence'
								baseFrequency='0.02'
								numOctaves='3'
								seed='10'
								result='turbulence'
							>
								<animate
									attributeName='baseFrequency'
									dur='6s'
									values='0.02;0.05;0.02'
									repeatCount='indefinite'
								/>
							</feTurbulence>

							<feDisplacementMap
								in='SourceGraphic'
								in2='turbulence'
								scale='15'
								xChannelSelector='R'
								yChannelSelector='G'
								result='displaced'
							/>

							<feGaussianBlur
								in='displaced'
								stdDeviation='1.2'
								result='blurred'
							/>

							<feComponentTransfer in='blurred' result='brightened'>
								<feFuncR type='linear' slope='1.1' />
								<feFuncG type='linear' slope='1.1' />
								<feFuncB type='linear' slope='1.1' />
							</feComponentTransfer>

							<feComposite
								in='brightened'
								in2='SourceAlpha'
								operator='in'
								result='final'
							/>

							<feComposite in='final' in2='SourceGraphic' operator='over' />
						</filter>
					</defs>
				</svg>
				{children}
				<Toaster />
			</body>
		</html>
	);
}
