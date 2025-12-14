import React, { useState } from 'react';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Check, QrCode, X } from 'lucide-react';
import type { Account, CodeData } from '@/types/account';
import { QRCodeSVG } from 'qrcode.react';

interface AccountCardProps {
	account: Account;
	codeData: CodeData;
	onRemove: (e: React.MouseEvent, id: string) => void;
}

export const AccountCard: React.FC<AccountCardProps> = ({
	account,
	codeData,
	onRemove,
}) => {
	const [isCopied, setIsCopied] = useState(false);
	const [isDeleteMode, setIsDeleteMode] = useState(false);
	const [showQRModal, setShowQRModal] = useState(false);
	const deleteTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

	const formatCode = (code: string) => {
		try {
			return code?.replace(/(\d{3})(\d{3})/, '$1 $2');
		} catch {
			return '--- ---';
		}
	};

	const isLowTime = (codeData?.timeRemaining || 30) <= 5;

	const handleCopy = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (codeData?.current) {
			navigator?.clipboard?.writeText(codeData.current);
			setIsCopied(true);
			setTimeout(() => setIsCopied(false), 2000);
		}
	};

	const handleDeleteClick = (e: React.MouseEvent) => {
		e.stopPropagation();

		if (isDeleteMode) {
			// Second click - actually delete
			if (deleteTimeoutRef.current) {
				clearTimeout(deleteTimeoutRef.current);
			}
			onRemove(e, account._id);
		} else {
			// First click - enter delete mode
			setIsDeleteMode(true);
			deleteTimeoutRef.current = setTimeout(() => {
				setIsDeleteMode(false);
			}, 2000);
		}
	};

	const handleQRClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		setShowQRModal(true);
	};

	const generateOtpAuthUri = () => {
		const params = new URLSearchParams({
			secret: account.secret,
			issuer: account.issuer,
			period: String(account.period || 30),
		});
		return `otpauth://totp/${encodeURIComponent(
			account.issuer
		)}:${encodeURIComponent(account.name)}?${params.toString()}`;
	};

	React.useEffect(() => {
		return () => {
			if (deleteTimeoutRef.current) {
				clearTimeout(deleteTimeoutRef.current);
			}
		};
	}, []);

	return (
		<>
			{/* QR Code Modal */}
			{showQRModal && (
				<div
					className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200'
					onClick={() => setShowQRModal(false)}
				>
					<div
						className='relative bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4 animate-in zoom-in duration-300'
						onClick={(e) => e.stopPropagation()}
					>
						{/* Close Button */}
						<Button
							onClick={() => setShowQRModal(false)}
							variant='ghost'
							size='sm'
							className='absolute top-4 right-4 rounded-full w-10 h-10 p-0 hover:bg-gray-100 transition-all duration-200'
						>
							<X className='w-5 h-5' />
						</Button>

						{/* Header */}
						<div className='text-center mb-6'>
							<div className='mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg'>
								<QrCode className='w-8 h-8 text-white' />
							</div>
							<h3 className='text-2xl font-bold text-gray-900 mb-2'>QR Code</h3>
							<p className='text-sm text-gray-600 mb-1'>{account.issuer}</p>
							<p className='text-xs text-gray-500'>{account.name}</p>
						</div>

						{/* QR Code */}
						<div className='bg-white p-6 rounded-2xl border-2 border-gray-200 flex items-center justify-center mb-6'>
							<QRCodeSVG
								value={generateOtpAuthUri()}
								size={240}
								level='H'
								includeMargin={true}
								className='w-full h-auto'
							/>
						</div>

						{/* Footer */}
						<div className='text-center'>
							<p className='text-xs text-gray-500'>
								Scan this QR code with your authenticator app
							</p>
						</div>
					</div>
				</div>
			)}

			<div className='group relative rounded-3xl cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg select-none'>
				<CardContent
					onClick={handleCopy}
					className={`relative p-5 rounded-3xl border-2 active:scale-[0.98] transition-all duration-200 ${
						isDeleteMode
							? 'bg-red-50/80 border-red-300 hover:border-red-400 animate-pulse'
							: 'bg-white border-gray-200 hover:border-blue-300'
					}`}
					style={{
						backgroundImage: `
							linear-gradient(to right, rgb(229 231 235 / 0.3) 1px, transparent 1px),
							linear-gradient(to bottom, rgb(229 231 235 / 0.3) 1px, transparent 1px)
						`,
						backgroundSize: '20px 20px',
					}}
				>
					<div className='flex items-center justify-between gap-4'>
						<div className='flex-1 min-w-0'>
							{/* Header with issuer and tags */}
							<div className='flex items-center gap-2 mb-2'>
								<h3 className='text-base font-semibold text-gray-800 truncate'>
									{account.issuer}
								</h3>
								{account.tags && account.tags.length > 0 && (
									<div className='flex gap-1 shrink-0'>
										{account.tags.slice(0, 2).map((tag, idx) => (
											<Badge
												key={tag}
												variant='secondary'
												className='text-xs px-2 py-0.5 h-5 bg-blue-50 text-blue-700 border-blue-200'
											>
												{tag}
											</Badge>
										))}
										{account.tags.length > 2 && (
											<Badge
												variant='secondary'
												className='text-xs px-2 py-0.5 h-5 bg-blue-50 text-blue-700 border-blue-200'
											>
												+{account.tags.length - 2}
											</Badge>
										)}
									</div>
								)}
							</div>

							{/* Account name */}
							<p className='text-xs text-gray-500 mb-4 truncate'>
								{account.name}
							</p>

							{/* Code and timer */}
							<div className='flex items-center gap-4'>
								{isCopied ? (
									<div className='flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 text-green-700 animate-in fade-in zoom-in duration-200'>
										<Check className='w-3.5 h-3.5' />
										<span className='text-sm font-semibold'>Copied!</span>
									</div>
								) : (
									<span className='text-3xl font-mono font-bold text-gray-900 tracking-wider select-text'>
										{codeData ? formatCode(codeData.current) : '--- ---'}
									</span>
								)}
								<div className='flex items-center gap-2'>
									{!isCopied && (
										<div
											className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full transition-all duration-300 ${
												isLowTime
													? 'bg-red-100 text-red-600 animate-pulse'
													: 'bg-gray-100 text-gray-600'
											}`}
										>
											<span className='text-sm font-semibold'>
												{codeData?.timeRemaining}s
											</span>
										</div>
									)}
								</div>
							</div>
						</div>

						{/* Action buttons */}
						<div className='flex items-center flex-col gap-0 shrink-0'>
							<Button
								variant='ghost'
								size='sm'
								onClick={handleQRClick}
								className='h-9 w-9 p-0 rounded-full transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 opacity-60 group-hover:opacity-100'
							>
								<QrCode className='w-4 h-4' />
							</Button>
							<Button
								variant='ghost'
								size='sm'
								onClick={handleDeleteClick}
								className={`h-9 w-9 p-0 rounded-full transition-all duration-200 group-hover:opacity-100 ${
									isDeleteMode
										? 'bg-red-500 text-white hover:bg-red-600 opacity-100'
										: 'hover:bg-red-50 hover:text-red-600 opacity-60'
								}`}
							>
								<Trash2 className='w-4 h-4' />
							</Button>
						</div>
					</div>
				</CardContent>
			</div>
		</>
	);
};
