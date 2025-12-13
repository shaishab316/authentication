import React, { useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getDisplacementFilter } from '@/components/ui/LiquidGlass';
import { TOTP } from 'totp-generator';

interface AddAccountDialogProps {
	onAdd: (accountData: {
		name: string;
		issuer: string;
		secret: string;
		tags: string[];
	}) => Promise<any>;
}

export const AddAccountDialog: React.FC<AddAccountDialogProps> = ({
	onAdd,
}) => {
	const [open, setOpen] = useState(false);
	const [newAccount, setNewAccount] = useState({
		name: '',
		issuer: '',
		secret: '',
		tags: '',
	});
	const { toast } = useToast();

	const handleAdd = async () => {
		if (!newAccount.name || !newAccount.secret) {
			toast({
				title: 'Error',
				description: 'Please fill in all required fields',
				variant: 'destructive',
			});
			return;
		}

		try {
			await TOTP.generate(newAccount.secret);
		} catch (error) {
			toast({
				title: 'Invalid Secret',
				description: 'Please enter a valid base32 secret key',
				variant: 'destructive',
			});
			return;
		}

		const tags = newAccount.tags
			.split(',')
			.map((tag) => tag.trim())
			.filter((tag) => tag.length > 0);

		const accountData = {
			name: newAccount.name,
			issuer: newAccount.issuer || 'Unknown',
			secret: newAccount.secret.replace(/\s/g, '').toUpperCase(),
			tags,
		};

		try {
			await onAdd(accountData);
			setNewAccount({ name: '', issuer: '', secret: '', tags: '' });
			setOpen(false);
			toast({
				title: 'Account Added',
				description: `${accountData.name} has been added successfully`,
			});
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to add account to database.',
				variant: 'destructive',
			});
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					className='w-full h-12 text-base font-medium sticky bottom-4 px-4 py-2 rounded-2xl border border-gray-200 bg-transparent text-black hover:bg-white/50'
					style={{
						backdropFilter: `blur(2px) url('${getDisplacementFilter({
							height: 50,
							width: 500,
							radius: 15,
							depth: 5,
							strength: 100,
							chromaticAberration: 0,
						})}') blur(4px)`,
					}}
				>
					<Plus className='w-5 h-5 mr-2' />
					Add Account
				</Button>
			</DialogTrigger>
			<DialogContent className='rounded-2xl'>
				<DialogHeader>
					<DialogTitle>Add Account</DialogTitle>
					<DialogDescription>
						Enter your account details to generate TOTP codes.
					</DialogDescription>
				</DialogHeader>
				<div className='space-y-4'>
					<div>
						<Label htmlFor='issuer'>Service</Label>
						<Input
							id='issuer'
							placeholder='Google, GitHub, etc.'
							value={newAccount.issuer}
							onChange={(e) =>
								setNewAccount((prev) => ({
									...prev,
									issuer: e.target.value,
								}))
							}
							className='rounded-xl'
						/>
					</div>
					<div>
						<Label htmlFor='name'>Account</Label>
						<Input
							id='name'
							placeholder='your@email.com'
							value={newAccount.name}
							onChange={(e) =>
								setNewAccount((prev) => ({ ...prev, name: e.target.value }))
							}
							className='rounded-xl'
						/>
					</div>
					<div>
						<Label htmlFor='secret'>Secret Key</Label>
						<Input
							id='secret'
							placeholder='Enter your secret key'
							value={newAccount.secret}
							onChange={(e) =>
								setNewAccount((prev) => ({
									...prev,
									secret: e.target.value,
								}))
							}
							className='font-mono rounded-xl'
						/>
					</div>
					<div>
						<Label htmlFor='tags'>Tags (optional)</Label>
						<Input
							id='tags'
							placeholder='work, personal, company-name (comma separated)'
							value={newAccount.tags}
							onChange={(e) =>
								setNewAccount((prev) => ({ ...prev, tags: e.target.value }))
							}
							className='rounded-xl'
						/>
						<p className='text-xs text-gray-500 mt-1'>
							Add tags to organize your accounts. Use company names for org:
							searches.
						</p>
					</div>
				</div>
				<DialogFooter>
					<Button
						variant='outline'
						onClick={() => setOpen(false)}
						className='rounded-xl'
					>
						Cancel
					</Button>
					<Button onClick={handleAdd} className='rounded-xl'>
						Add
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
