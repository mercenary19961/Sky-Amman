export interface Paginator<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: Array<{ url: string | null; label: string; active: boolean }>;
    next_page_url: string | null;
    prev_page_url: string | null;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'editor';
    created_at: string;
    updated_at: string;
}

export interface SiteSettings {
    phone?: string;
    email?: string;
    address?: string;
    facebook_url?: string;
    instagram_url?: string;
    linkedin_url?: string;
    twitter_url?: string;
    youtube_url?: string;
    tiktok_url?: string;
    google_maps_embed_url?: string;
    google_maps_place_url?: string;
    seo_title?: string;
    seo_description?: string;
    og_image_url?: string;
    [key: string]: string | undefined;
}

export interface Flash {
    success?: string;
    error?: string;
    info?: string;
    warning?: string;
}

export interface PageProps {
    auth: {
        user: User | null;
    };
    locale: 'en' | 'ar';
    flash: Flash;
    siteSettings: SiteSettings;
    ziggy: {
        url: string;
        port: number | null;
        defaults: Record<string, unknown>;
        routes: Record<string, unknown>;
        location?: string;
    };
    [key: string]: unknown;
}
