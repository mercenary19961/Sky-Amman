import type { PageProps } from '@/types';

export interface ContentValue {
    content: string;
    media: { id: number; url: string; alt: string | null } | null;
    is_visible: boolean;
}

export type SiteContentBundle = Record<string, Record<string, ContentValue>>;

export interface FeaturedProject {
    id: number;
    slug: string;
    title_en: string;
    title_ar: string;
    category: 'under_development' | 'ready' | 'investment_opportunity';
    listing_status: 'for_sale' | 'for_rent' | 'sold' | 'reserved' | null;
    location_en: string | null;
    location_ar: string | null;
    area_sqm: number | null;
    image_url: string;
}

export interface HomePageProps extends PageProps {
    content_en: SiteContentBundle;
    content_ar: SiteContentBundle;
    featuredProjects: FeaturedProject[];
    mediaEmbeds: {
        linkedin: string;
        instagram: string;
    };
}
