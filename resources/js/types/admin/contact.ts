import type { PageProps, Paginator } from '@/types';

export type RequestType = 'buy' | 'rent' | 'build' | 'investment' | 'general';

export interface ContactListItem {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    request_type: RequestType;
    preview: string;
    is_read: boolean;
    is_archived: boolean;
    project: { id: number; title_en: string } | null;
    created_ago: string;
    created_at: string;
}

export interface ContactDetail {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    request_type: RequestType;
    subject: string | null;
    message: string;
    is_read: boolean;
    is_archived: boolean;
    ip_address: string | null;
    project: { id: number; slug: string; title_en: string } | null;
    read_by: string | null;
    created_at: string;
    created_ago: string;
}

export interface ContactIndexProps extends PageProps {
    submissions: Paginator<ContactListItem>;
    filters: {
        request_type?: string;
        read?: string;
        search?: string;
        view?: string;
    };
    view: 'inbox' | 'archived';
    unreadCount: number;
    archivedCount: number;
    trashedCount: number;
}

export interface ContactShowProps extends PageProps {
    submission: ContactDetail;
}

export interface ContactTrashProps extends PageProps {
    submissions: Paginator<ContactListItem>;
}
