<?php

namespace Tests\Feature;

use App\Models\ChangeLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ChangeLogFilterTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin', 'is_active' => true]);
    }

    private function log(array $attrs = []): ChangeLog
    {
        return ChangeLog::create(array_merge([
            'model_type' => 'project',
            'model_id'   => '1',
            'action'     => 'create',
            'label'      => 'Villa',
        ], $attrs));
    }

    public function test_action_filter_narrows_results(): void
    {
        $this->log(['action' => 'create']);
        $this->log(['action' => 'create']);
        $this->log(['action' => 'update', 'model_type' => 'settings', 'label' => 'Settings']);

        $this->actingAs($this->admin())
            ->get('/admin/change-log?action=create')
            ->assertInertia(fn (Assert $p) => $p->where('logs.total', 2));
    }

    public function test_status_filter_splits_reverted_and_active(): void
    {
        $this->log();
        $this->log();
        $this->log(['reverted_at' => now(), 'reverted_by' => null]);

        $admin = $this->admin();

        $this->actingAs($admin)->get('/admin/change-log?status=reverted')
            ->assertInertia(fn (Assert $p) => $p->where('logs.total', 1));

        $this->actingAs($admin)->get('/admin/change-log?status=active')
            ->assertInertia(fn (Assert $p) => $p->where('logs.total', 2));
    }

    public function test_search_matches_label(): void
    {
        $this->log(['label' => 'Dabbouq Villa']);
        $this->log(['label' => 'Settings', 'model_type' => 'settings', 'action' => 'update']);

        $this->actingAs($this->admin())
            ->get('/admin/change-log?search=Dabbouq')
            ->assertInertia(fn (Assert $p) => $p->where('logs.total', 1));
    }

    public function test_per_page_limits_rows_on_a_page(): void
    {
        foreach (range(1, 12) as $i) {
            $this->log(['label' => "Entry {$i}"]);
        }

        $this->actingAs($this->admin())
            ->get('/admin/change-log?per_page=10')
            ->assertInertia(fn (Assert $p) => $p
                ->where('logs.total', 12)
                ->has('logs.data', 10));
    }

    public function test_invalid_per_page_falls_back_to_default(): void
    {
        foreach (range(1, 25) as $i) {
            $this->log(['label' => "Entry {$i}"]);
        }

        // 999 is not an allowed size → defaults to 20.
        $this->actingAs($this->admin())
            ->get('/admin/change-log?per_page=999')
            ->assertInertia(fn (Assert $p) => $p->has('logs.data', 20));
    }

    public function test_day_grouping_fields_are_present(): void
    {
        $this->log();

        $this->actingAs($this->admin())
            ->get('/admin/change-log')
            ->assertInertia(fn (Assert $p) => $p
                ->where('logs.data.0.day_label', 'Today')
                ->has('logs.data.0.created_time'));
    }
}
