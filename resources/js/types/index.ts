export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'editor';
    created_at: string;
    updated_at: string;
}

export interface SiteSettings {
    contact_email?: string;
    contact_phone?: string;
    address_en?: string;
    address_ar?: string;
    facebook_url?: string;
    instagram_url?: string;
    linkedin_url?: string;
    twitter_url?: string;
    seo_title_en?: string;
    seo_title_ar?: string;
    seo_description_en?: string;
    seo_description_ar?: string;
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
