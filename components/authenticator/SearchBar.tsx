import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
	Search,
	X,
	Tag,
	TrendingUp,
	Clock,
	Star,
	Filter,
	Sparkles,
	Zap,
	Command,
} from 'lucide-react';

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
	const [isFocused, setIsFocused] = useState(false);
	const [showShortcuts, setShowShortcuts] = useState(false);
	const [recentSearches, setRecentSearches] = useState<string[]>([]);
	const [animateSearch, setAnimateSearch] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		// Load recent searches from localStorage
		const saved = localStorage.getItem('recentSearches');
		if (saved) {
			setRecentSearches(JSON.parse(saved));
		}

		// Keyboard shortcut: Ctrl/Cmd + K to focus search
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
				e.preventDefault();
				inputRef.current?.focus();
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, []);

	const clearSearch = () => {
		setSearchQuery('');
		setAnimateSearch(true);
		setTimeout(() => setAnimateSearch(false), 300);
	};

	const handleSearch = (value: string) => {
		setSearchQuery(value);
		if (value.trim()) {
			// Save to recent searches
			const updated = [
				value,
				...recentSearches.filter((s) => s !== value),
			].slice(0, 5);
			setRecentSearches(updated);
			localStorage.setItem('recentSearches', JSON.stringify(updated));
		}
	};

	const useRecentSearch = (search: string) => {
		setSearchQuery(search);
		setIsFocused(false);
	};

	return (
		<>
			<div className='mb-6 sticky top-4 z-20'>
				{/* Main Search Bar */}
				<div className='relative group'>
					{/* Animated background glow */}
					<div
						className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 blur-xl transition-opacity duration-500 ${
							isFocused ? 'opacity-20' : 'group-hover:opacity-10'
						}`}
					/>

					<div className='relative'>
						<div className='absolute z-10 left-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2'>
							<Search
								className={`w-5 h-5 transition-all duration-300 ${
									isFocused
										? 'text-blue-500 scale-110'
										: 'text-gray-400 group-hover:text-blue-500'
								} ${animateSearch ? 'animate-spin' : ''}`}
							/>
						</div>

						<Input
							ref={inputRef}
							placeholder='Search accounts or use org:company, tag:work...'
							value={searchQuery}
							onChange={(e) => handleSearch(e.target.value)}
							onFocus={() => setIsFocused(true)}
							onBlur={() => setTimeout(() => setIsFocused(false), 200)}
							className='pl-12 pr-24 h-14 rounded-2xl bg-white/80 backdrop-blur-xl border-white/50 shadow-lg hover:shadow-xl focus:shadow-2xl transition-all duration-300 text-base focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:ring-offset-2'
						/>

						<div className='absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1'>
							{/* Keyboard shortcut hint */}
							{!searchQuery && !isFocused && (
								<div
									className='hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100/80 border border-gray-200/50 animate-in fade-in duration-500'
									onMouseEnter={() => setShowShortcuts(true)}
									onMouseLeave={() => setShowShortcuts(false)}
								>
									<Command className='w-3 h-3 text-gray-500' />
									<span className='text-xs text-gray-500 font-medium'>K</span>
								</div>
							)}

							{searchQuery && (
								<>
									{/* Results counter badge */}
									{resultCount !== undefined && (
										<Badge
											variant='outline'
											className='animate-in zoom-in duration-200 bg-blue-50/80 text-blue-600 border-blue-200 px-2 py-0.5 font-semibold'
										>
											{resultCount}
										</Badge>
									)}

									{/* Clear button */}
									<Button
										variant='ghost'
										size='sm'
										onClick={clearSearch}
										className='h-8 w-8 p-0 rounded-xl hover:bg-red-100 hover:scale-110 transition-all duration-200 active:scale-95 group/clear'
									>
										<X className='w-4 h-4 text-red-500 group-hover/clear:rotate-90 transition-transform duration-200' />
									</Button>
								</>
							)}
						</div>
					</div>

					{/* Search suggestions dropdown */}
					{isFocused && !searchQuery && recentSearches.length > 0 && (
						<div className='absolute top-full mt-2 w-full bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/50 p-3 animate-in slide-in-from-top-2 duration-200 z-30'>
							<div className='flex items-center gap-2 mb-2 px-2'>
								<Clock className='w-4 h-4 text-gray-400' />
								<span className='text-xs font-semibold text-gray-500 uppercase tracking-wide'>
									Recent Searches
								</span>
							</div>
							{recentSearches.map((search, idx) => (
								<button
									key={idx}
									onClick={() => useRecentSearch(search)}
									className='w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors duration-150 flex items-center gap-2 group/recent'
								>
									<TrendingUp className='w-3.5 h-3.5 text-gray-400 group-hover/recent:text-blue-500 transition-colors' />
									<span className='text-sm text-gray-700 group-hover/recent:text-blue-600 transition-colors'>
										{search}
									</span>
								</button>
							))}
						</div>
					)}

					{/* Keyboard shortcuts tooltip */}
					{showShortcuts && (
						<div className='absolute top-full right-0 mt-2 bg-gray-900/95 backdrop-blur-xl text-white text-xs rounded-xl p-3 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 z-30 min-w-[200px]'>
							<div className='font-semibold mb-2 flex items-center gap-2'>
								<Zap className='w-3.5 h-3.5 text-yellow-400' />
								Quick Shortcuts
							</div>
							<div className='space-y-1.5 text-gray-300'>
								<div className='flex justify-between'>
									<span>Focus search</span>
									<kbd className='px-2 py-0.5 bg-gray-700 rounded'>⌘K</kbd>
								</div>
								<div className='flex justify-between'>
									<span>Clear search</span>
									<kbd className='px-2 py-0.5 bg-gray-700 rounded'>Esc</kbd>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Quick Filters Section */}
			{allTags.length > 0 && !searchQuery && (
				<div className='mb-6 p-5 rounded-2xl bg-white/60 backdrop-blur-lg shadow-md hover:shadow-xl transition-all duration-300 border border-white/50 group/filters'>
					{/* Header */}
					<div className='flex items-center justify-between mb-4'>
						<div className='flex items-center gap-2'>
							<div className='relative'>
								<div className='w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover/filters:shadow-xl transition-shadow duration-300'>
									<Filter className='w-4 h-4 text-white' />
								</div>
								<div className='absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse' />
							</div>
							<div>
								<span className='text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
									Quick Filters
								</span>
								<p className='text-xs text-gray-500'>
									Click to filter accounts
								</p>
							</div>
						</div>
						<Badge
							variant='outline'
							className='bg-blue-50/50 text-blue-600 border-blue-200 font-semibold animate-in zoom-in duration-300'
						>
							{allTags.length} tags
						</Badge>
					</div>

					{/* Tags Grid */}
					<div className='flex flex-wrap gap-2'>
						{allTags.slice(0, 8).map((tag, idx) => {
							const gradients = [
								'from-blue-100 to-cyan-100 hover:from-blue-200 hover:to-cyan-200 border-blue-200',
								'from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 border-purple-200',
								'from-green-100 to-emerald-100 hover:from-green-200 hover:to-emerald-200 border-green-200',
								'from-orange-100 to-amber-100 hover:from-orange-200 hover:to-amber-200 border-orange-200',
								'from-rose-100 to-red-100 hover:from-rose-200 hover:to-red-200 border-rose-200',
								'from-violet-100 to-purple-100 hover:from-violet-200 hover:to-purple-200 border-violet-200',
							];
							const gradient = gradients[idx % gradients.length];

							return (
								<Badge
									key={tag}
									variant='secondary'
									className={`cursor-pointer bg-gradient-to-r ${gradient} text-gray-700 hover:text-gray-900 transition-all duration-200 rounded-xl px-4 py-2 text-sm font-semibold hover:scale-110 active:scale-95 shadow-sm hover:shadow-lg border group/tag animate-in zoom-in duration-300`}
									style={{ animationDelay: `${idx * 50}ms` }}
									onClick={() => onTagClick(tag)}
								>
									<div className='flex items-center gap-2'>
										<Tag className='w-3.5 h-3.5 group-hover/tag:rotate-12 transition-transform duration-200' />
										<span>{tag}</span>
										<Star className='w-3 h-3 opacity-0 group-hover/tag:opacity-100 transition-opacity duration-200' />
									</div>
								</Badge>
							);
						})}

						{allTags.length > 8 && (
							<Badge
								variant='outline'
								className='cursor-pointer bg-gray-50/80 hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition-all duration-200 rounded-xl px-4 py-2 text-sm font-semibold hover:scale-110 active:scale-95 shadow-sm hover:shadow-lg border-gray-300'
							>
								<div className='flex items-center gap-2'>
									<Sparkles className='w-3.5 h-3.5' />
									<span>+{allTags.length - 8} more</span>
								</div>
							</Badge>
						)}
					</div>

					{/* Search tips */}
					<div className='mt-4 pt-4 border-t border-gray-200/50'>
						<div className='flex items-start gap-2 text-xs text-gray-500'>
							<Zap className='w-3.5 h-3.5 text-yellow-500 mt-0.5 flex-shrink-0' />
							<div className='space-y-1'>
								<p>
									<span className='font-semibold text-gray-700'>Pro tip:</span>{' '}
									Use{' '}
									<code className='px-1.5 py-0.5 bg-gray-200/80 rounded text-blue-600 font-mono'>
										org:company
									</code>{' '}
									or{' '}
									<code className='px-1.5 py-0.5 bg-gray-200/80 rounded text-purple-600 font-mono'>
										tag:work
									</code>{' '}
									for advanced filtering
								</p>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Search Results Summary */}
			{searchQuery && resultCount !== undefined && (
				<div className='mb-4 px-2 animate-in slide-in-from-top duration-300'>
					<div className='relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 p-4 shadow-lg border border-white/50 group/result'>
						{/* Animated background shine */}
						<div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover/result:translate-x-[100%] transition-transform duration-1000' />

						<div className='relative flex items-center justify-between'>
							<div className='flex items-center gap-3'>
								<div className='relative'>
									<div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg'>
										<Search className='w-5 h-5 text-white' />
									</div>
									{resultCount > 0 && (
										<div className='absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white shadow-md animate-bounce'>
											✓
										</div>
									)}
								</div>

								<div>
									<p className='text-sm font-bold text-gray-800 flex items-center gap-2'>
										{resultCount > 0 ? (
											<>
												<TrendingUp className='w-4 h-4 text-green-600' />
												Found {resultCount} result{resultCount !== 1 ? 's' : ''}
											</>
										) : (
											<>
												<X className='w-4 h-4 text-red-500' />
												No results found
											</>
										)}
									</p>
									<p className='text-xs text-gray-600'>
										for{' '}
										<span className='font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
											"{searchQuery}"
										</span>
									</p>
								</div>
							</div>

							{resultCount === 0 && (
								<Button
									variant='ghost'
									size='sm'
									onClick={clearSearch}
									className='rounded-xl hover:bg-white/80 transition-all duration-200 hover:scale-105 active:scale-95'
								>
									<span className='text-xs font-medium text-gray-600'>
										Clear
									</span>
								</Button>
							)}
						</div>

						{/* No results suggestions */}
						{resultCount === 0 && (
							<div className='mt-3 pt-3 border-t border-gray-200/50'>
								<p className='text-xs text-gray-500 mb-2 flex items-center gap-1.5'>
									<Sparkles className='w-3.5 h-3.5 text-purple-400' />
									Try these suggestions:
								</p>
								<ul className='text-xs text-gray-600 space-y-1 ml-5'>
									<li>• Check your spelling</li>
									<li>• Use fewer keywords</li>
									<li>• Try different search terms</li>
								</ul>
							</div>
						)}
					</div>
				</div>
			)}
		</>
	);
};
