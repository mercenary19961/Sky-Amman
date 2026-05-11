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
                    className="relative overflow-hidden rounded-3xl shadow-md bg-primary-light/40 bg-cover bg-center"
                    style={{ backgroundImage: 'url(/images/home/about-villa.jpg)' }}
                >
                    {/* Light blue overlay so the copy stays legible over the photo */}
                    <div
                        className="absolute inset-0 bg-primary/30 backdrop-blur-[1px]"
                        aria-hidden="true"
                    />

                    <div className="relative px-6 sm:px-12 lg:px-20 py-14 sm:py-20 lg:py-24 text-center max-w-4xl mx-auto">
                        {title && (
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white drop-shadow-sm tracking-wide">
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
