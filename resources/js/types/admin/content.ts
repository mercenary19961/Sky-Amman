import type { PageProps } from '@/types';

export interface SiteContentRow {
    id: number;
    page: string;
    section: string;
    key: string;
    content_en: string;
    content_ar: string;
    is_visible: boolean;
    type: 'text' | 'textarea' | 'html';
    sort_order: number;
}

export interface PageRecord {
    id: number;
    slug: string;
    title_en: string;
    title_ar: string;
    seo_title_en: string | null;
    seo_title_ar: string | null;
    seo_description_en: string | null;
    seo_description_ar: string | null;
    is_visible: boolean;
}

export interface ContentPageProps extends PageProps {
    grouped: Record<string, Record<string, SiteContentRow[]>>;
    pages: Record<string, PageRecord>;
}
