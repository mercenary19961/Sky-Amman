import type { PageProps, Paginator } from '@/types';

export interface NewsletterSubscriberItem {
    id: number;
    email: string;
    is_active: boolean;
    ip_address: string | null;
    created_at: string | null;
    created_ago: string | null;
}

export interface NewsletterSubscribersProps extends PageProps {
    subscribers: Paginator<NewsletterSubscriberItem>;
    filters: { search?: string };
    totalCount: number;
    activeCount: number;
}
