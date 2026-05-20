import type { PageProps } from '@/types';

export interface DashboardStats {
    activeProjects: number;
    totalProjects: number;
    inquiriesThisWeek: number;
    totalInquiries: number;
    unreadInquiries: number;
    projectsWithoutImages: number;
}

export interface DailyInquiry {
    date: string;
    count: number;
}

export interface TypeBreakdown {
    type: string;
    count: number;
}

export interface CategoryBreakdown {
    category: string;
    count: number;
}

export interface ContentHealthItem {
    id: number;
    title_en: string;
}

export interface ContentHealth {
    projectsMissingImages: ContentHealthItem[];
    projectsMissingSeo: ContentHealthItem[];
    emptySocialKeys: string[];
    missingInstagramCreds: string[];
    hiddenPages: Array<{ slug: string; title_en: string }>;
    hiddenSections: Array<{ page: string; section: string }>;
}

export interface RecentInquiry {
    id: number;
    name: string;
    email: string;
    request_type: string;
    is_read: boolean;
    project_id: number | null;
    project: { id: number; title_en: string } | null;
    created_at: string;
}

export interface DashboardPageProps extends PageProps {
    stats: DashboardStats;
    dailyInquiries: DailyInquiry[];
    inquiriesByType: TypeBreakdown[];
    projectsByCategory: CategoryBreakdown[];
    contentHealth: ContentHealth;
    recentInquiries: RecentInquiry[];
}
