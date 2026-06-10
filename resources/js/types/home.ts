import type { PageProps } from '@/types';

export interface ContentValue {
    content: string;
    media: { id: number; url: string; alt: string | null } | null;
    is_visible: boolean;
}

export type SiteContentBundle = Record<string, Record<string, ContentValue>>;

/** Per-page SEO overrides (from the `pages` table). Empty fields fall back to
 *  the site-wide Settings defaults on the client. */
export interface PageSeo {
    title_en: string | null;
    title_ar: string | null;
    description_en: string | null;
    description_ar: string | null;
}

export interface FeaturedProject {
    id: number;
    slug: string;
    title_en: string;
    title_ar: string;
    category: 'under_development' | 'ready' | 'investment_opportunity';
    listing_status: 'for_sale' | 'for_rent' | 'sold' | 'reserved' | null;
    group: string | null;
    location_en: string | null;
    location_ar: string | null;
    area_sqm: number | null;        // built-up area (m²)
    land_area_sqm: number | null;   // land/plot area (m²)
    image_url: string;
    /** Full swappable image set (featured/OG first). Absent on homepage cards. */
    images?: string[];
}

export interface InstagramPost {
    id: string;
    caption: string;
    media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
    media_url: string;
    permalink: string;
}

export interface GalleryImage {
    id: string;
    url: string;
    alt: string;
}

export interface PropertiesPageProps extends PageProps {
    content_en: SiteContentBundle;
    content_ar: SiteContentBundle;
    projects: FeaturedProject[];
    galleryImages: GalleryImage[];
    galleryPerView: number;
    seo: PageSeo;
    url: string;
}

export interface PropertyDetail {
    id: number;
    slug: string;
    title_en: string;
    title_ar: string;
    listing_status: 'for_sale' | 'for_rent' | 'sold' | 'reserved' | null;
    address_en: string | null;
    address_ar: string | null;
    location_en: string | null;
    location_ar: string | null;
    description_en: string | null;
    description_ar: string | null;
    area_sqm: number | null;        // built-up area
    land_area_sqm: number | null;
    completion_year: number | null;
    floors: number | null;
    bedrooms: number | null;
    bathrooms: number | null;
    hidden_specs: string[] | null;
    seo_title_en: string | null;
    seo_title_ar: string | null;
    seo_description_en: string | null;
    seo_description_ar: string | null;
    url: string;
    og_image: string;
}

export interface RelatedProject {
    id: number;
    slug: string;
    title_en: string;
    title_ar: string;
    listing_status: 'for_sale' | 'for_rent' | 'sold' | 'reserved' | null;
    image_url: string;
}

export interface AboutPageProps extends PageProps {
    content_en: SiteContentBundle;
    content_ar: SiteContentBundle;
    craftedImages: Record<'about_crafted_1' | 'about_crafted_2' | 'about_crafted_3', string>;
    seo: {
        title_en: string | null;
        title_ar: string | null;
        description_en: string | null;
        description_ar: string | null;
    };
    url: string;
}

export interface SelfBuildPageProps extends PageProps {
    content_en: SiteContentBundle;
    content_ar: SiteContentBundle;
    seo: {
        title_en: string | null;
        title_ar: string | null;
        description_en: string | null;
        description_ar: string | null;
    };
    url: string;
}

export interface InvestmentPageProps extends PageProps {
    content_en: SiteContentBundle;
    content_ar: SiteContentBundle;
    seo: {
        title_en: string | null;
        title_ar: string | null;
        description_en: string | null;
        description_ar: string | null;
    };
    url: string;
}

export interface SecurityPageProps extends PageProps {
    content_en: SiteContentBundle;
    content_ar: SiteContentBundle;
    seo: {
        title_en: string | null;
        title_ar: string | null;
        description_en: string | null;
        description_ar: string | null;
    };
    url: string;
}

export interface ContactPageProps extends PageProps {
    content_en: SiteContentBundle;
    content_ar: SiteContentBundle;
    requestTypes: string[];
    project: { id: number; slug: string; title_en: string; title_ar: string } | null;
    seo: PageSeo;
    url: string;
}

export interface PropertyDetailPageProps extends PageProps {
    project: PropertyDetail;
    images: GalleryImage[];
    related: RelatedProject[];
    mapEmbedUrl: string;
}

export interface TestimonialCard {
    name_en: string;
    name_ar: string | null;
    quote_en: string;
    quote_ar: string | null;
    image_url: string | null;
}

export interface DepartmentMemberCard {
    name_en: string | null;
    name_ar: string | null;
    role_en: string | null;
    role_ar: string | null;
    image_url: string | null;
}

export interface HomePageProps extends PageProps {
    content_en: SiteContentBundle;
    content_ar: SiteContentBundle;
    featuredProjects: FeaturedProject[];
    featuredRentals: FeaturedProject[];
    testimonialVideos: string[];
    testimonials: TestimonialCard[];
    departmentMembers: DepartmentMemberCard[];
    mediaEmbeds: {
        linkedin: string;
    };
    instagramPosts: InstagramPost[];
    seo: PageSeo;
    url: string;
}
