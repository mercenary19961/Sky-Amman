<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class DefaultSettingsSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            // Contact info — placeholders, admin overrides via Settings page.
            ['key' => 'company_phone', 'value' => '+962 6 000 0000', 'type' => 'text', 'group' => 'contact'],
            ['key' => 'company_email', 'value' => 'info@skyamman.com', 'type' => 'email', 'group' => 'contact'],
            ['key' => 'company_address_en', 'value' => 'Amman, Jordan', 'type' => 'text', 'group' => 'contact'],
            ['key' => 'company_address_ar', 'value' => 'عمّان، الأردن', 'type' => 'text', 'group' => 'contact'],

            // Social — leave empty so the footer renders only configured icons.
            ['key' => 'linkedin_url', 'value' => '', 'type' => 'url', 'group' => 'social'],
            ['key' => 'instagram_url', 'value' => '', 'type' => 'url', 'group' => 'social'],
            ['key' => 'facebook_url', 'value' => '', 'type' => 'url', 'group' => 'social'],
            ['key' => 'twitter_url', 'value' => '', 'type' => 'url', 'group' => 'social'],
            ['key' => 'youtube_url', 'value' => '', 'type' => 'url', 'group' => 'social'],
            ['key' => 'tiktok_url', 'value' => '', 'type' => 'url', 'group' => 'social'],

            // Map embed for the homepage "Our Location" section.
            ['key' => 'google_maps_embed_url', 'value' => '', 'type' => 'url', 'group' => 'map'],
            ['key' => 'google_maps_place_url', 'value' => '', 'type' => 'url', 'group' => 'map'],

            // Site-wide SEO defaults — fall back here when a page has no per-page SEO.
            ['key' => 'seo_title_en', 'value' => 'Sky Amman — Real Estate Consultancy', 'type' => 'text', 'group' => 'seo'],
            ['key' => 'seo_title_ar', 'value' => 'سكاي عمان — استشارات عقارية', 'type' => 'text', 'group' => 'seo'],
            ['key' => 'seo_description_en', 'value' => 'Buy, rent or build a property in Amman with security, credibility and transparency.', 'type' => 'textarea', 'group' => 'seo'],
            ['key' => 'seo_description_ar', 'value' => 'اشترِ، استأجر أو ابنِ عقاراً في عمّان بأمان ومصداقية وشفافية.', 'type' => 'textarea', 'group' => 'seo'],
            ['key' => 'og_image_url', 'value' => '', 'type' => 'url', 'group' => 'seo'],

            // Lead routing map — request_type -> recipient email(s). JSON-encoded.
            // Empty entries fall back to company_email.
            ['key' => 'lead_routing', 'value' => json_encode([
                'buy' => '',
                'rent' => '',
                'build' => '',
                'investment' => '',
                'general' => '',
            ]), 'type' => 'json', 'group' => 'leads'],
        ];

        foreach ($defaults as $row) {
            Setting::updateOrCreate(
                ['key' => $row['key']],
                [
                    'value' => $row['value'],
                    'type' => $row['type'],
                    'group' => $row['group'],
                ],
            );
        }
    }
}
