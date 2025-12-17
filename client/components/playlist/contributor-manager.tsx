'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Trash2, Shield, UserPlus } from 'lucide-react';
import { useUIStore } from '@/lib/store/ui-store';
import type { User, Contributor } from '@/types';

// Assuming we have a query to search users or we just use USERS_QUERY
const USERS_QUERY = gql`
  query Users {
    users {
      id
      username
      email
    }
  }
`;

const ADD_CONTRIBUTOR_MUTATION = gql`
  mutation AddContributor($input: AddContributorInput!) {
    addContributor(input: $input) {
      id
      user { username }
      role
    }
  }
`;

const REMOVE_CONTRIBUTOR_MUTATION = gql`
  mutation RemoveContributor($playlistId: ID!, $userId: ID!) {
    removeContributor(playlistId: $playlistId, userId: $userId)
  }
`;

interface ContributorManagerProps {
    playlistId: string;
    contributors: Contributor[];
    isOwner: boolean;
}

export function ContributorManager({ playlistId, contributors, isOwner }: ContributorManagerProps) {
    const { addNotification } = useUIStore();
    const [email, setEmail] = useState('');

    // In a real app, implement user search. For now, we might fetch all users or rely on exact email match if backend supports logic
    // Or we just implement "Invite by Email/Username" if backend can resolve it.
    // Given the USERS_QUERY returns all users (as per docs), we can search locally for MVP.
    const { data: usersData } = useQuery<{ users: User[] }>(USERS_QUERY);

    const [addContributor] = useMutation(ADD_CONTRIBUTOR_MUTATION);
    const [removeContributor] = useMutation(REMOVE_CONTRIBUTOR_MUTATION);

    const handleAdd = async () => {
        const userToAdd = usersData?.users.find(u => u.email === email || u.username === email);

        if (!userToAdd) {
            addNotification({ message: 'User not found', type: 'error' });
            return;
        }

        try {
            await addContributor({
                variables: {
                    input: {
                        playlistId,
                        userId: userToAdd.id,
                        role: 'EDITOR' // Default role
                    }
                },
                refetchQueries: ['Playlist']
            });
            addNotification({ message: `Added ${userToAdd.username} as contributor`, type: 'success' });
            setEmail('');
        } catch (error) {
            addNotification({
                message: error instanceof Error ? error.message : 'Failed to add contributor',
                type: 'error'
            });
        }
    };

    const handleRemove = async (userId: string, username: string) => {
        try {
            await removeContributor({
                variables: { playlistId, userId },
                refetchQueries: ['Playlist']
            });
            addNotification({ message: `Removed ${username}`, type: 'success' });
        } catch (error) {
            addNotification({
                message: error instanceof Error ? error.message : 'Failed to remove',
                type: 'error'
            });
        }
    };

    if (!isOwner) return null;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Users size={16} /> Contributors
                </Button>
            </DialogTrigger>
            <DialogContent className="glass-panel border-violet-500/20">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Manage Contributors</DialogTitle>
                </DialogHeader>

                <div className="flex gap-2 mt-4">
                    <Input
                        placeholder="Enter username or email..."
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Button onClick={handleAdd} disabled={!email}>
                        <UserPlus size={16} />
                    </Button>
                </div>

                <div className="mt-6 space-y-3">
                    <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Current Team</h3>
                    {contributors.length === 0 ? (
                        <p className="text-gray-500 text-sm">No contributors yet.</p>
                    ) : (
                        contributors.map(c => (
                            <div key={c.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 text-xs font-bold">
                                        {c.user.username[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-white text-sm font-medium">{c.user.username}</p>
                                        <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                            <Shield size={10} /> {c.role}
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => handleRemove(c.user.id, c.user.username)}
                                >
                                    <Trash2 size={14} />
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
