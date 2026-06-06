import type { PageProps } from '@/types';

export type UserRole = 'admin' | 'editor';

export interface UserListItem {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    is_active: boolean;
    created_at: string;
}

export interface UsersPageProps extends PageProps {
    users: UserListItem[];
    currentUserId: number;
}
