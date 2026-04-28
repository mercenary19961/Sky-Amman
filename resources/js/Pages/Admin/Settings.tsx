import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Save } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import type { SettingsPageProps, SettingRow } from '@/types/admin/settings';

// ── Label maps ────────────────────────────────────────────────────────────────

const GROUP_LABELS: Record<string, string> = {
    contact:    'Contact Info',
    social:     'Social Links',
    map:        'Map',
    media_room: 'Media Room',
    seo:        'SEO Defaults',
    leads:      'Lead Routing',
};

const GROUP_ORDER = ['contact', 'social', 'map', 'media_room', 'seo', 'leads'];

const SETTING_LABELS: Record<string, string> = {
    company_phone:        'Phone',
    company_email:        'Email',
    company_address_en:   'Address (EN)',
    company_address_ar:   'Address (AR)',
    linkedin_url:         'LinkedIn URL',
    instagram_url:        'Instagram URL',
    facebook_url:         'Facebook URL',
    twitter_url:          'X (Twitter) URL',
    youtube_url:          'YouTube URL',
    tiktok_url:           'TikTok URL',
    google_maps_embed_url: 'Google Maps Embed URL',
    google_maps_place_url: 'Google Maps Place URL',
    linkedin_embed_url:   'LinkedIn Embed URL',
    instagram_embed_url:  'Instagram Embed URL',
    seo_title_en:         'SEO Title (EN)',
    seo_title_ar:         'SEO Title (AR)',
    seo_description_en:   'SEO Description (EN)',
    seo_description_ar:   'SEO Description (AR)',
    og_image_url:         'OG Image URL',
    lead_routing:         'Lead Routing',
};

const LEAD_TYPES: Array<{ key: string; label: string }> = [
    { key: 'buy',        label: 'Buy inquiries' },
    { key: 'rent',       label: 'Rent inquiries' },
    { key: 'build',      label: 'Build inquiries' },
    { key: 'investment', label: 'Investment inquiries' },
    { key: 'general',    label: 'General inquiries' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function inputClass(multiline = false) {
    return `w-full px-3 py-2 text-sm border border-ink/10 rounded bg-white dark:bg-zinc-700 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/30${multiline ? ' resize-y' : ''}`;
}

function Label({ children }: { children: React.ReactNode }) {
    return <label className="block text-xs font-medium text-ink-muted mb-1">{children}</label>;
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Settings() {
    const { settings } = usePage<SettingsPageProps>().props;
    const [processing, setProcessing] = useState(false);

    // Flat key→value for all settings
    const [values, setValues] = useState<Record<string, string>>(() => {
        const v: Record<string, string> = {};
        Object.values(settings).flat().forEach((s: SettingRow) => { v[s.key] = s.value ?? ''; });
        return v;
    });

    // Lead routing parsed into individual fields
    const [leadRouting, setLeadRouting] = useState<Record<string, string>>(() => {
        try {
            const parsed = JSON.parse(values['lead_routing'] || '{}');
            return typeof parsed === 'object' && parsed !== null ? parsed : {};
        } catch {
            return {};
        }
    });

    function setValue(key: string, value: string) {
        setValues(prev => ({ ...prev, [key]: value }));
    }

    function setLead(type: string, email: string) {
        setLeadRouting(prev => ({ ...prev, [type]: email }));
    }

    function save() {
        const allValues = {
            ...values,
            lead_routing: JSON.stringify(leadRouting),
        };

        const payload = Object.entries(allValues)
            .map(([key, value]) => ({ key, value }));

        setProcessing(true);
        router.put('/admin/settings', { settings: payload } as any, {
            preserveScroll: true,
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <AdminLayout title="Settings">
            <Head title="Settings" />

            <div className="flex justify-end mb-6">
                <button
                    type="button"
                    onClick={save}
                    disabled={processing}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded text-sm font-medium hover:bg-primary-dark disabled:opacity-60 transition-colors"
                >
                    <Save size={15} />
                    {processing ? 'Saving…' : 'Save All Settings'}
                </button>
            </div>

            <div className="space-y-4">
                {GROUP_ORDER.filter(g => settings[g]).map(group => {
                    const rows: SettingRow[] = settings[group] ?? [];

                    return (
                        <div
                            key={group}
                            className="bg-white dark:bg-zinc-800 border border-ink/5 dark:border-white/10 rounded-lg p-5"
                        >
                            <h2 className="text-sm font-semibold text-ink mb-4">
                                {GROUP_LABELS[group] ?? group}
                            </h2>

                            {group === 'leads' ? (
                                // Lead routing — special UI: 5 email fields
                                <div className="space-y-3">
                                    <p className="text-xs text-ink-muted">
                                        Route each request type to a specific recipient email.
                                        Leave blank to fall back to the company email.
                                    </p>
                                    {LEAD_TYPES.map(({ key, label }) => (
                                        <div key={key}>
                                            <Label>{label}</Label>
                                            <input
                                                type="email"
                                                value={leadRouting[key] ?? ''}
                                                onChange={e => setLead(key, e.target.value)}
                                                placeholder="Defaults to company email"
                                                className={inputClass()}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {rows.map((setting: SettingRow) => {
                                        const label = SETTING_LABELS[setting.key] ?? setting.key;
                                        const isAr = setting.key.endsWith('_ar');
                                        const isMultiline = setting.type === 'textarea';
                                        const isUrl = setting.type === 'url';
                                        const isEmail = setting.type === 'email';

                                        return (
                                            <div key={setting.key}>
                                                <Label>{label}</Label>
                                                {isMultiline ? (
                                                    <textarea
                                                        value={values[setting.key] ?? ''}
                                                        onChange={e => setValue(setting.key, e.target.value)}
                                                        rows={2}
                                                        dir={isAr ? 'rtl' : 'ltr'}
                                                        className={inputClass(true)}
                                                    />
                                                ) : (
                                                    <input
                                                        type={isUrl ? 'url' : isEmail ? 'email' : 'text'}
                                                        value={values[setting.key] ?? ''}
                                                        onChange={e => setValue(setting.key, e.target.value)}
                                                        dir={isAr ? 'rtl' : 'ltr'}
                                                        className={inputClass()}
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Bottom save */}
            <div className="flex justify-end mt-4 mb-8">
                <button
                    type="button"
                    onClick={save}
                    disabled={processing}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded text-sm font-medium hover:bg-primary-dark disabled:opacity-60 transition-colors"
                >
                    <Save size={15} />
                    {processing ? 'Saving…' : 'Save All Settings'}
                </button>
            </div>
        </AdminLayout>
    );
}
