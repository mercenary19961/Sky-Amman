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
import type { HomePageProps } from '@/types/home';

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

            <HomeHero content={content} />
            <InvestmentBanner content={content} />
            <AboutUs content={content} />
            <AssurancePillars content={content} />
            <ManagingPartner content={content} />
            <HeadOfDepartments content={content} />
            <ProjectShowcase
                title={content.showcase?.title?.content ?? ''}
                ctaLabel={content.showcase?.card_cta?.content ?? ''}
                projects={props.featuredProjects}
            />
            <ProjectShowcase
                title={content.rentals?.title?.content ?? ''}
                ctaLabel={content.rentals?.card_cta?.content ?? ''}
                projects={props.featuredRentals}
            />
            <Testimonials content={content} />
            <ValueProposition content={content} />
            <MediaRoom
                content={content}
                linkedinUrl={props.mediaEmbeds?.linkedin ?? ''}
                instagramPosts={props.instagramPosts ?? []}
            />
            <LocationMap
                content={content}
                mapEmbedUrl={props.siteSettings?.google_maps_embed_url ?? ''}
            />
        </PublicLayout>
    );
}
