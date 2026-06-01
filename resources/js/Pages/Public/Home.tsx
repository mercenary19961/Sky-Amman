import { Head, usePage } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { HomeHero } from '@/Components/Home/HomeHero';
import { InvestmentBanner } from '@/Components/Home/InvestmentBanner';
import { AboutUs } from '@/Components/Home/AboutUs';
import { AssurancePillars } from '@/Components/Home/AssurancePillars';
import { ManagingPartner } from '@/Components/Home/ManagingPartner';
import { HeadOfDepartments } from '@/Components/Home/HeadOfDepartments';
import { ProjectShowcase } from '@/Components/Home/ProjectShowcase';
import { Testimonials } from '@/Components/Home/Testimonials';
import { ValueProposition } from '@/Components/Home/ValueProposition';
import { MediaRoom } from '@/Components/Home/MediaRoom';
import { LocationMap } from '@/Components/Home/LocationMap';
import type { ContentValue, HomePageProps } from '@/types/home';

/**
 * Whether a CMS section is visible on the public site. A section is hidden
 * when every row in it has been toggled to `is_visible=false` via the admin
 * Site Content editor's per-section visibility button. Unseeded sections
 * (undefined) default to visible so missing CMS rows don't accidentally hide
 * code-driven UI.
 */
function sectionVisible(section: Record<string, ContentValue> | undefined): boolean {
    if (!section) return true;
    const rows = Object.values(section);
    if (rows.length === 0) return true;
    return rows.some(r => r.is_visible);
}

export default function Home() {
    const { props } = usePage<HomePageProps>();
    const { language } = useLanguage();

    // Instant-language pattern: both bundles arrive from the controller, the
    // client picks based on the active language without an HTTP round-trip.
    const content = language === 'ar' ? props.content_ar : props.content_en;

    const seoTitle = props.siteSettings?.seo_title ?? 'SkyAmman';
    const seoDescription = props.siteSettings?.seo_description ?? '';

    return (
        <PublicLayout>
            <Head title={seoTitle}>
                <meta name="description" content={seoDescription} />
                <meta property="og:title" content={seoTitle} />
                <meta property="og:description" content={seoDescription} />
                <meta property="og:type" content="website" />
            </Head>

            {sectionVisible(content.hero) && <HomeHero content={content} />}
            {sectionVisible(content.investment_banner) && <InvestmentBanner content={content} />}
            {sectionVisible(content.about) && <AboutUs content={content} />}
            {(sectionVisible(content.assurance_legal)
                || sectionVisible(content.assurance_financial)
                || sectionVisible(content.assurance_safety)) && (
                <AssurancePillars content={content} />
            )}
            {sectionVisible(content.managing_partner) && <ManagingPartner content={content} />}
            {sectionVisible(content.departments) && <HeadOfDepartments content={content} />}
            {sectionVisible(content.showcase) && (
                <ProjectShowcase
                    title={content.showcase?.title?.content ?? ''}
                    ctaLabel={content.showcase?.card_cta?.content ?? ''}
                    projects={props.featuredProjects}
                />
            )}
            {sectionVisible(content.rentals) && (
                <ProjectShowcase
                    title={content.rentals?.title?.content ?? ''}
                    ctaLabel={content.rentals?.card_cta?.content ?? ''}
                    projects={props.featuredRentals}
                />
            )}
            {sectionVisible(content.testimonials) && (
                <Testimonials content={content} videos={props.testimonialVideos} />
            )}
            {sectionVisible(content.value_prop) && <ValueProposition content={content} />}
            {sectionVisible(content.media_room) && (
                <MediaRoom
                    content={content}
                    linkedinUrl={props.mediaEmbeds?.linkedin ?? ''}
                    instagramPosts={props.instagramPosts ?? []}
                />
            )}
            {sectionVisible(content.location) && (
                <LocationMap
                    content={content}
                    mapEmbedUrl={props.siteSettings?.google_maps_embed_url ?? ''}
                />
            )}
        </PublicLayout>
    );
}
