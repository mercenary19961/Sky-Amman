import { Head, usePage } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { HomeHero } from '@/Components/Home/HomeHero';
import { InvestmentBanner } from '@/Components/Home/InvestmentBanner';
import { AssurancePillars } from '@/Components/Home/AssurancePillars';
import { ProjectShowcase } from '@/Components/Home/ProjectShowcase';
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

    const seoTitle = props.siteSettings?.seo_title ?? 'Sky Amman';
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
            <AssurancePillars content={content} />
            <ProjectShowcase content={content} projects={props.featuredProjects} />
            <ValueProposition content={content} />
            <MediaRoom content={content} embeds={props.mediaEmbeds} />
            <LocationMap
                content={content}
                mapEmbedUrl={props.siteSettings?.google_maps_embed_url ?? ''}
            />
        </PublicLayout>
    );
}
