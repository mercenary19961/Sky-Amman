import type { SiteContentBundle } from '@/types/home';

interface AboutUsProps {
    content: SiteContentBundle;
}

export function AboutUs({ content }: AboutUsProps) {
    const about = content.about ?? {};
    const title = about.title?.content ?? '';
    const body = about.body?.content ?? '';

    if (!title && !body) return null;

    return (
        <section className="bg-surface py-16 sm:py-24">
            <div className="section-x">
                <div
                    className="relative mx-auto overflow-hidden rounded-3xl shadow-md bg-cover bg-center"
                    style={{
                        backgroundImage: 'url(/images/home/who-are-we.webp)',
                        // Match the AssurancePillars stage width (the section below).
                        maxWidth: 'min(900px, 90vw)',
                    }}
                >
                    <div className="relative px-6 sm:px-10 lg:px-14 py-20 sm:py-28 lg:py-32 text-center">
                        {title && (
                            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-normal text-primary drop-shadow-sm tracking-wide">
                                {title}
                            </h2>
                        )}
                        {body && (
                            <p className="mt-6 sm:mt-8 text-base sm:text-lg lg:text-xl text-ink leading-relaxed">
                                {body}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
