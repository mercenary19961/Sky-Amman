import type { PageProps } from '@/types';

export type UserRole = 'admin' | 'editor';

export interface UserListItem {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    is_active: boolean;
    /** Granted admin-section abilities. Always empty for admins (they bypass). */
    permissions: string[];
    created_at: string;
}

/** One entry from the PHP-side User::ABILITIES registry. */
export interface Ability {
    key: string;
    group: string;
    label: string;
    description: string;
    /** Ability that must be granted alongside this one (e.g. edit needs view). */
    requires?: string;
}

export interface UsersPageProps extends PageProps {
    users: UserListItem[];
    currentUserId: number;
    abilities: Ability[];
}
