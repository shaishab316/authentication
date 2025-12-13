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
			<div className='mb-6 sticky top-4 z-20'>
				<div className='relative group'>
					<Search className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-200' />
					<Input
						placeholder='Search accounts or use org:company, tag:work'
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className='pl-12 pr-12 h-14 rounded-2xl bg-white/80 backdrop-blur-xl border-white/50 shadow-lg hover:shadow-xl focus:shadow-2xl transition-all duration-300 text-base focus:border-blue-400 focus:ring-2 focus:ring-blue-200'
					/>
					{searchQuery && (
						<Button
							variant='ghost'
							size='sm'
							onClick={clearSearch}
							className='absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 rounded-xl hover:bg-red-100 hover:scale-110 transition-all duration-200 active:scale-95'
						>
							<X className='w-4 h-4 text-red-500' />
						</Button>
					)}
				</div>
			</div>

			{allTags.length > 0 && !searchQuery && (
				<div className='mb-6 p-4 rounded-2xl bg-white/60 backdrop-blur-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-white/50'>
					<div className='flex items-center gap-2 mb-3'>
						<div className='w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md'>
							<Tag className='w-4 h-4 text-white' />
						</div>
						<span className='text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
							Quick Filters
						</span>
					</div>
					<div className='flex flex-wrap gap-2'>
						{allTags.slice(0, 6).map((tag) => (
							<Badge
								key={tag}
								variant='secondary'
								className='cursor-pointer bg-gradient-to-r from-blue-100 to-purple-100 hover:from-blue-200 hover:to-purple-200 text-gray-700 hover:text-gray-900 transition-all duration-200 rounded-xl px-3 py-1.5 text-sm font-medium hover:scale-105 active:scale-95 shadow-sm hover:shadow-md border border-white/50'
								onClick={() => onTagClick(tag)}
							>
								{tag}
							</Badge>
						))}
					</div>
				</div>
			)}

			{searchQuery && resultCount !== undefined && (
				<div className='mb-4 px-2 animate-in slide-in-from-top duration-300'>
					<p className='text-sm font-medium text-gray-700 bg-white/60 backdrop-blur-lg rounded-xl px-4 py-2 shadow-sm border border-white/50'>
						{resultCount} result{resultCount !== 1 ? 's' : ''} for "
						<span className='font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
							{searchQuery}
						</span>
						"
					</p>
				</div>
			)}
		</>
	);
};
