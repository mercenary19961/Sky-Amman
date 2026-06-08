import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { AlertTriangle, Save, Phone, MapPin, Share2, Play, Search, Send } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import type { SettingsPageProps, SettingRow } from '@/types/admin/settings';

// ── Constants ─────────────────────────────────────────────────────────────────

const GROUP_ORDER = ['contact', 'social', 'map', 'media_room', 'seo', 'leads'];

const SOCIAL_KEYS = ['linkedin_url', 'instagram_url', 'facebook_url', 'twitter_url', 'youtube_url', 'tiktok_url'];
const CONTACT_REQUIRED_KEYS = ['company_phone', 'company_email'];

const SOCIAL_PLATFORM_LABELS: Record<string, string> = {
    linkedin_url:  'LinkedIn',
    instagram_url: 'Instagram',
    facebook_url:  'Meta (Facebook)',
    twitter_url:   'X (Twitter)',
    youtube_url:   'YouTube',
    tiktok_url:    'TikTok',
};

const GROUP_META: Record<string, { label: string; icon: React.ElementType; description: string }> = {
    contact:    { label: 'Contact Info',   icon: Phone,  description: 'Displayed in the site footer and contact page.' },
    social:     { label: 'Social Links',   icon: Share2, description: 'Profile URLs for your platforms. Only filled ones appear on the site.' },
    map:        { label: 'Map',            icon: MapPin, description: 'Google Maps embed and direct link for the contact page.' },
    media_room: { label: 'Media Room',     icon: Play,   description: 'Embedded posts shown in the Media Room section on the homepage.' },
    seo:        { label: 'SEO Defaults',   icon: Search, description: 'Fallback meta title, description, and OG image. Per-page settings take priority.' },
    leads:      { label: 'Lead Routing',   icon: Send,   description: 'Route each inquiry type to a specific email. Leave blank to use the company email.' },
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

function FL({ children }: { children: React.ReactNode }) {
    return <label className="block text-xs font-medium text-ink-muted mb-1">{children}</label>;
}

function Hint({ children }: { children: React.ReactNode }) {
    return <p className="mt-1 text-xs text-ink/40">{children}</p>;
}

// ── Group body renderers ──────────────────────────────────────────────────────

function ContactBody({ values, setValue }: { values: Record<string, string>; setValue: (k: string, v: string) => void }) {
    return (
        <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <FL>Phone</FL>
                    <input type="tel" value={values['company_phone'] ?? ''} onChange={e => setValue('company_phone', e.target.value)} placeholder="+962 7xxxxxxxx" dir="ltr" className={inputClass()} />
                </div>
                <div>
                    <FL>Email</FL>
                    <input type="email" value={values['company_email'] ?? ''} onChange={e => setValue('company_email', e.target.value)} placeholder="info@example.com" className={inputClass()} />
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <FL>Address (EN)</FL>
                    <textarea value={values['company_address_en'] ?? ''} onChange={e => setValue('company_address_en', e.target.value)} rows={2} className={inputClass(true)} />
                </div>
                <div>
                    <FL>Address (AR)</FL>
                    <textarea value={values['company_address_ar'] ?? ''} onChange={e => setValue('company_address_ar', e.target.value)} rows={2} dir="rtl" className={inputClass(true)} />
                </div>
            </div>
        </div>
    );
}

function SocialBody({ values, setValue }: { values: Record<string, string>; setValue: (k: string, v: string) => void }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SOCIAL_KEYS.map(key => (
                <div key={key}>
                    <FL>{SOCIAL_PLATFORM_LABELS[key]}</FL>
                    <input
                        type="url"
                        value={values[key] ?? ''}
                        onChange={e => setValue(key, e.target.value)}
                        placeholder="https://"
                        className={inputClass()}
                    />
                </div>
            ))}
        </div>
    );
}

function MapBody({ values, setValue }: { values: Record<string, string>; setValue: (k: string, v: string) => void }) {
    return (
        <div className="space-y-4">
            <div>
                <FL>Embed URL</FL>
                <input type="url" value={values['google_maps_embed_url'] ?? ''} onChange={e => setValue('google_maps_embed_url', e.target.value)} placeholder="https://www.google.com/maps/embed?pb=…" className={inputClass()} />
                <Hint>Paste the iframe src from Google Maps → Share → Embed a map.</Hint>
            </div>
            <div>
                <FL>Place URL</FL>
                <input type="url" value={values['google_maps_place_url'] ?? ''} onChange={e => setValue('google_maps_place_url', e.target.value)} placeholder="https://maps.google.com/?q=…" className={inputClass()} />
                <Hint>Direct link for the "Open in Maps" button.</Hint>
            </div>
        </div>
    );
}

function MediaRoomBody({ values, setValue }: { values: Record<string, string>; setValue: (k: string, v: string) => void }) {
    return (
        <div className="space-y-4">
            <div>
                <FL>LinkedIn Post Embed URL</FL>
                <input type="url" value={values['linkedin_embed_url'] ?? ''} onChange={e => setValue('linkedin_embed_url', e.target.value)} placeholder="https://www.linkedin.com/embed/feed/update/…" className={inputClass()} />
                <Hint>Single-post iframe URL shown on the left side of the homepage Media Room.</Hint>
            </div>
            <div>
                <FL>Instagram Access Token</FL>
                <input type="text" value={values['instagram_access_token'] ?? ''} onChange={e => setValue('instagram_access_token', e.target.value)} placeholder="EAA… (long-lived token)" className={inputClass()} />
                <Hint>Long-lived Graph API token. Powers the Media Room 3×3 grid; expires every 60 days. Leave blank to hide the grid. See CLAUDE.md → Infrastructure TODOs for provisioning & refresh steps.</Hint>
            </div>
            <div>
                <FL>Instagram User ID</FL>
                <input type="text" value={values['instagram_user_id'] ?? ''} onChange={e => setValue('instagram_user_id', e.target.value)} placeholder="17841…" className={inputClass()} />
                <Hint>Numeric IG Business/Creator user ID returned by Graph API Explorer when the token is minted.</Hint>
            </div>
        </div>
    );
}

function SeoBody({ values, setValue }: { values: Record<string, string>; setValue: (k: string, v: string) => void }) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <FL>SEO Title (EN)</FL>
                    <input type="text" value={values['seo_title_en'] ?? ''} onChange={e => setValue('seo_title_en', e.target.value)} className={inputClass()} />
                </div>
                <div>
                    <FL>SEO Title (AR)</FL>
                    <input type="text" value={values['seo_title_ar'] ?? ''} onChange={e => setValue('seo_title_ar', e.target.value)} dir="rtl" className={inputClass()} />
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <FL>SEO Description (EN)</FL>
                    <textarea value={values['seo_description_en'] ?? ''} onChange={e => setValue('seo_description_en', e.target.value)} rows={2} className={inputClass(true)} />
                </div>
                <div>
                    <FL>SEO Description (AR)</FL>
                    <textarea value={values['seo_description_ar'] ?? ''} onChange={e => setValue('seo_description_ar', e.target.value)} rows={2} dir="rtl" className={inputClass(true)} />
                </div>
            </div>
            <div>
                <FL>OG Image URL</FL>
                <input type="url" value={values['og_image_url'] ?? ''} onChange={e => setValue('og_image_url', e.target.value)} placeholder="https://…" className={inputClass()} />
                <Hint>Publicly accessible image URL used as the default social sharing preview.</Hint>
            </div>
        </div>
    );
}

function LeadsBody({ leadRouting, setLead }: { leadRouting: Record<string, string>; setLead: (k: string, v: string) => void }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {LEAD_TYPES.map(({ key, label }) => (
                <div key={key}>
                    <FL>{label}</FL>
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
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Settings() {
    const { settings } = usePage<SettingsPageProps>().props;
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const hash = window.location.hash;
        if (!hash) return;
        const el = document.getElementById(hash.slice(1));
        if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
    }, []);

    const [values, setValues] = useState<Record<string, string>>(() => {
        const v: Record<string, string> = {};
        Object.values(settings).flat().forEach((s: SettingRow) => { v[s.key] = s.value ?? ''; });
        return v;
    });

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
        const payload = Object.entries({ ...values, lead_routing: JSON.stringify(leadRouting) })
            .map(([key, value]) => ({ key, value }));
        setProcessing(true);
        router.put('/admin/settings', { settings: payload } as any, {
            preserveScroll: true,
            onFinish: () => setProcessing(false),
        });
    }

    function groupWarning(group: string): string | null {
        if (group === 'social') {
            const empty = SOCIAL_KEYS.filter(k => !(values[k] ?? '').trim()).length;
            return empty > 0 ? `${empty} not set` : null;
        }
        if (group === 'contact') {
            const missing = CONTACT_REQUIRED_KEYS.filter(k => !(values[k] ?? '').trim());
            if (missing.length === 0) return null;
            return missing.length === 2 ? 'phone & email missing'
                : `${missing[0] === 'company_phone' ? 'phone' : 'email'} missing`;
        }
        if (group === 'seo') {
            const miss: string[] = [];
            if (!(values['seo_title_en'] ?? '').trim()) miss.push('title');
            if (!(values['seo_description_en'] ?? '').trim()) miss.push('description');
            if (!(values['seo_title_ar'] ?? '').trim()) miss.push('title AR');
            if (!(values['seo_description_ar'] ?? '').trim()) miss.push('desc AR');
            if (!(values['og_image_url'] ?? '').trim()) miss.push('OG image');
            return miss.length > 0 ? `Defaults missing: ${miss.join(', ')}` : null;
        }
        return null;
    }

    function renderBody(group: string) {
        switch (group) {
            case 'contact':    return <ContactBody values={values} setValue={setValue} />;
            case 'social':     return <SocialBody values={values} setValue={setValue} />;
            case 'map':        return <MapBody values={values} setValue={setValue} />;
            case 'media_room': return <MediaRoomBody values={values} setValue={setValue} />;
            case 'seo':        return <SeoBody values={values} setValue={setValue} />;
            case 'leads':      return <LeadsBody leadRouting={leadRouting} setLead={setLead} />;
            default:           return null;
        }
    }

    const SaveButton = ({ className = '' }: { className?: string }) => (
        <button
            type="button"
            onClick={save}
            disabled={processing}
            className={`inline-flex items-center gap-2 px-4 py-2 bg-primary text-zinc-900 rounded text-sm font-medium hover:bg-primary-dark disabled:opacity-60 transition-colors ${className}`}
        >
            <Save size={15} />
            {processing ? 'Saving…' : 'Save All Settings'}
        </button>
    );

    return (
        <AdminLayout title="Settings">
            <Head title="Settings" />

            <div className="flex justify-end mb-6">
                <SaveButton />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                {GROUP_ORDER.filter(g => settings[g]).map(group => {
                    const meta = GROUP_META[group];
                    const Icon = meta?.icon;
                    const warning = groupWarning(group);

                    return (
                        <div
                            key={group}
                            id={`section-${group}`}
                            className="bg-white dark:bg-zinc-800 border border-ink/5 dark:border-white/10 rounded-lg overflow-hidden"
                        >
                            {/* Card header */}
                            <div className="flex items-start gap-3 px-5 py-4 border-b border-ink/5 dark:border-white/10 bg-surface-muted dark:bg-zinc-900/40">
                                {Icon && (
                                    <div className="shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary mt-0.5">
                                        <Icon size={15} />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h2 className="text-sm font-semibold text-ink">{meta?.label ?? group}</h2>
                                        {warning && (
                                            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                                                <AlertTriangle size={10} />
                                                {warning}
                                            </span>
                                        )}
                                    </div>
                                    {meta?.description && (
                                        <p className="text-xs text-ink-muted mt-0.5">{meta.description}</p>
                                    )}
                                </div>
                            </div>

                            {/* Card body */}
                            <div className="p-5">
                                {renderBody(group)}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-end mt-4 mb-8">
                <SaveButton />
            </div>
        </AdminLayout>
    );
}
