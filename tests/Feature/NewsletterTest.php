<?php

namespace Tests\Feature;

use App\Models\NewsletterSubscriber;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Footer newsletter capture. The endpoint must accept a valid address exactly
 * once (idempotent re-subscribe), normalize it, reject junk, and quietly revive
 * a previously unsubscribed address without erroring on the unique constraint.
 */
class NewsletterTest extends TestCase
{
    use RefreshDatabase;

    public function test_valid_email_is_stored_lowercased(): void
    {
        $this->post('/newsletter', ['email' => 'HELLO@Example.COM', 'cf-turnstile-response' => 'dummy'])
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('newsletter_subscribers', [
            'email' => 'hello@example.com',
            'is_active' => true,
        ]);
    }

    public function test_invalid_email_is_rejected(): void
    {
        $this->post('/newsletter', ['email' => 'not-an-email', 'cf-turnstile-response' => 'dummy'])
            ->assertSessionHasErrors('email');

        $this->assertDatabaseCount('newsletter_subscribers', 0);
    }

    public function test_email_is_required(): void
    {
        $this->post('/newsletter', ['cf-turnstile-response' => 'dummy'])
            ->assertSessionHasErrors('email');

        $this->assertDatabaseCount('newsletter_subscribers', 0);
    }

    public function test_resubscribing_does_not_create_a_duplicate(): void
    {
        $this->post('/newsletter', ['email' => 'dup@example.com', 'cf-turnstile-response' => 'dummy']);
        $this->post('/newsletter', ['email' => 'DUP@example.com', 'cf-turnstile-response' => 'dummy']);

        // Same address (case-insensitive) → one row, not two.
        $this->assertDatabaseCount('newsletter_subscribers', 1);
    }

    public function test_resubscribe_revives_a_soft_deleted_address(): void
    {
        $sub = NewsletterSubscriber::subscribe('gone@example.com');
        $sub->delete();
        $this->assertSoftDeleted('newsletter_subscribers', ['email' => 'gone@example.com']);

        $this->post('/newsletter', ['email' => 'gone@example.com', 'cf-turnstile-response' => 'dummy'])
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('newsletter_subscribers', [
            'email' => 'gone@example.com',
            'deleted_at' => null,
            'is_active' => true,
        ]);
        $this->assertDatabaseCount('newsletter_subscribers', 1);
    }
}
