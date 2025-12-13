import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, Tag } from 'lucide-react';

interface SearchBarProps {
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	allTags: string[];
	onTagClick: (tag: string) => void;
	resultCount?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
	searchQuery,
	setSearchQuery,
	allTags,
	onTagClick,
	resultCount,
}) => {
	const clearSearch = () => {
		setSearchQuery('');
	};

	return (
		<>
			<div className='mb-6 sticky top-4 z-10'>
				<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
				<Input
					placeholder='Search accounts or use org:company, tag:work'
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className='pl-10 pr-10 rounded-md border-gray-200 bg-white focus:border-blue-500 focus:ring-blue-500'
					style={{
						backgroundImage: `
					radial-gradient(circle at 1px 1px, rgb(59 130 246 / 0.15) 1px, transparent 0)
				`,
						backgroundSize: '24px 24px',
					}}
				/>
				{searchQuery && (
					<Button
						variant='ghost'
						size='sm'
						onClick={clearSearch}
						className='absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 rounded-full hover:bg-gray-100'
					>
						<X className='w-3 h-3' />
					</Button>
				)}
			</div>

			{allTags.length > 0 && !searchQuery && (
				<div className='mb-6'>
					<div className='flex items-center gap-2 mb-3'>
						<Tag className='w-4 h-4 text-gray-500' />
						<span className='text-sm font-medium text-gray-700'>
							Quick filters
						</span>
					</div>
					<div className='flex flex-wrap gap-2'>
						{allTags.slice(0, 6).map((tag) => (
							<Badge
								key={tag}
								variant='secondary'
								className='cursor-pointer hover:bg-blue-100 hover:text-blue-700 transition-colors rounded-full'
								onClick={() => onTagClick(tag)}
							>
								{tag}
							</Badge>
						))}
					</div>
				</div>
			)}

			{searchQuery && resultCount !== undefined && (
				<div className='mb-4'>
					<p className='text-sm text-gray-600'>
						{resultCount} result{resultCount !== 1 ? 's' : ''} for "
						<span className='font-medium'>{searchQuery}</span>"
					</p>
				</div>
			)}
		</>
	);
};
