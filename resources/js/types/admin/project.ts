import type { PageProps, Paginator } from '@/types';

export type ProjectCategory = 'under_development' | 'ready' | 'investment_opportunity';
export type ProjectListingStatus = 'for_sale' | 'for_rent' | 'sold' | 'reserved';

export interface ProjectListItem {
    id: number;
    title_en: string;
    title_ar: string;
    category: ProjectCategory;
    listing_status: ProjectListingStatus | null;
    is_active: boolean;
    images_count: number;
    inquiries_count: number;
    /** Ordered image URLs (featured/OG first); empty when the project has no uploads. */
    images: string[];
}

export interface ProjectImageItem {
    id: number;
    sort_order: number;
    media: {
        id: number;
        url: string;
        original_filename: string;
        alt_text_en: string | null;
        alt_text_ar: string | null;
        mime_type: string | null;
        size_bytes: number | null;
    };
}

export interface CommittedImageItem {
    url: string;
    size_bytes: number | null;
    mime_type: string | null;
}

export interface ProjectFormItem {
    id: number;
    slug: string;
    title_en: string;
    title_ar: string;
    category: ProjectCategory;
    listing_status: ProjectListingStatus | null;
    short_description_en: string | null;
    short_description_ar: string | null;
    description_en: string | null;
    description_ar: string | null;
    location_en: string | null;
    location_ar: string | null;
    address_en: string | null;
    address_ar: string | null;
    area_sqm: number | null;        // built-up area
    land_area_sqm: number | null;
    completion_year: number | null;
    floors: number | null;
    bedrooms: number | null;
    bathrooms: number | null;
    hidden_specs: string[] | null;
    featured_image_id: number | null;
    seo_title_en: string | null;
    seo_title_ar: string | null;
    seo_description_en: string | null;
    seo_description_ar: string | null;
    og_image_id: number | null;
    is_active: boolean;
    is_featured: boolean;
    sort_order: number;
    images: ProjectImageItem[];
}

export interface ProjectIndexProps extends PageProps {
    projects: Paginator<ProjectListItem>;
    filters: {
        category?: string;
        listing_status?: string;
        active?: string;
        search?: string;
        per_page?: number | string;
    };
    trashedCount: number;
}

export interface ProjectTrashItem {
    id: number;
    title_en: string;
    title_ar: string;
    category: ProjectCategory;
    updated_at: string;
}

export interface ProjectTrashProps extends PageProps {
    projects: Paginator<ProjectTrashItem>;
}

export interface ProjectShowImage {
    id: number;
    url: string;
    filename: string;
    is_featured: boolean;
    is_og: boolean;
}

export interface ProjectShowItem {
    id: number;
    slug: string;
    title_en: string;
    title_ar: string;
    category: ProjectCategory;
    listing_status: ProjectListingStatus | null;
    group: string | null;
    is_active: boolean;
    short_description_en: string | null;
    short_description_ar: string | null;
    description_en: string | null;
    description_ar: string | null;
    location_en: string | null;
    location_ar: string | null;
    address_en: string | null;
    address_ar: string | null;
    area_sqm: number | null;        // built-up area
    land_area_sqm: number | null;
    completion_year: number | null;
    floors: number | null;
    bedrooms: number | null;
    bathrooms: number | null;
    hidden_specs: string[];
    seo_title_en: string | null;
    seo_title_ar: string | null;
    seo_description_en: string | null;
    seo_description_ar: string | null;
    images: ProjectShowImage[];
    inquiries_count: number;
    created_by: string | null;
    updated_by: string | null;
    created_at: string | null;
    updated_at: string | null;
    public_url: string;
}

export interface ProjectShowProps extends PageProps {
    project: ProjectShowItem;
}

export interface ProjectFormProps extends PageProps {
    item: ProjectFormItem | null;
    committedImageUrls: CommittedImageItem[];
}
