import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import PublicLayout from '@/Layouts/PublicLayout';

export default function Welcome() {
    const { t } = useTranslation();

    return (
        <PublicLayout>
            <Head title={t('home.hero.title')} />
            <section className="min-h-[80vh] flex items-center justify-center px-4">
                <div className="text-center max-w-3xl">
                    <p className="text-sm font-semibold tracking-widest text-primary uppercase mb-3">
                        Sky Amman — {t('footer.tagline')}
                    </p>
                    <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4 text-ink">
                        {t('home.hero.title')}
                    </h1>
                    <p className="text-lg text-ink-muted">{t('home.hero.subtitle')}</p>
                </div>
            </section>
        </PublicLayout>
    );
}
