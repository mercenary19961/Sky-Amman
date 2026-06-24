<?php

namespace Tests\Unit;

use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * The Setting model is the single accessor for all site-wide config (contact
 * info, social URLs, lead routing, SEO defaults). Code-quality rule: always go
 * through set()/get() — never raw queries — so these guard that contract.
 */
class SettingTest extends TestCase
{
    use RefreshDatabase;

    public function test_set_then_get_round_trips(): void
    {
        Setting::set('company_phone', '+962 6 1234567');

        $this->assertSame('+962 6 1234567', Setting::get('company_phone'));
    }

    public function test_get_returns_default_for_a_missing_key(): void
    {
        $this->assertSame('fallback', Setting::get('does_not_exist', 'fallback'));
        $this->assertNull(Setting::get('also_missing'));
    }

    public function test_set_updates_in_place_rather_than_duplicating(): void
    {
        Setting::set('company_email', 'a@example.com');
        Setting::set('company_email', 'b@example.com');

        $this->assertSame('b@example.com', Setting::get('company_email'));
        $this->assertDatabaseCount('settings', 1);
    }

    public function test_get_json_decodes_a_json_setting(): void
    {
        Setting::set('lead_routing', json_encode(['buy' => 'sales@example.com']));

        $this->assertSame(['buy' => 'sales@example.com'], Setting::getJson('lead_routing'));
    }

    public function test_get_json_returns_empty_array_for_missing_or_unparsable(): void
    {
        $this->assertSame([], Setting::getJson('missing_key'));

        Setting::set('garbage', 'not json{');
        $this->assertSame([], Setting::getJson('garbage'));
    }

    public function test_get_group_returns_a_key_value_map(): void
    {
        // set() lands new keys in the default 'general' group.
        Setting::set('alpha', '1');
        Setting::set('beta', '2');

        $this->assertSame(['alpha' => '1', 'beta' => '2'], Setting::getGroup('general'));
    }
}
