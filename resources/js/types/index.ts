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

/**
 * Shape returned by SiteContent::getPage() — one entry per (section, key) pair
 * for a given page slug. Used here for the shared footer copy (loaded by
 * HandleInertiaRequests middleware).
 *
 * NOTE: An identically-shaped `SiteContentBundle` also lives in `@/types/home`
 * scoped to homepage components. Kept duplicated rather than centralized to
 * avoid a circular import (`home.ts` already pulls `PageProps` from here).
 * If you change the shape, update both definitions.
 */
export type SiteContentBundle = Record<string, Record<string, {
    content: string;
    media: { id: number; url: string; alt: string | null } | null;
    is_visible: boolean;
}>>;

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
    /** One-shot payload for the post-save Undo toast (set after a tracked change). */
    undo?: { id: number; section: string; action: string; label: string | null } | null;
    siteSettings: SiteSettings;
    footerContentEn: SiteContentBundle;
    footerContentAr: SiteContentBundle;
    ziggy: {
        url: string;
        port: number | null;
        defaults: Record<string, unknown>;
        routes: Record<string, unknown>;
        location?: string;
    };
    [key: string]: unknown;
}
