export default function Loading() {
	return (
		<div className='flex h-screen w-full items-center justify-center'>
			<div className='relative'>
				{/* Spinning rings */}
				<div className='w-20 h-20 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin' />
				<div
					className='absolute inset-0 w-20 h-20 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin'
					style={{
						animationDirection: 'reverse',
						animationDuration: '1s',
					}}
				/>
			</div>
		</div>
	);
}
