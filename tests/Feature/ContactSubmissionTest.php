<?php

namespace Tests\Feature;

use App\Mail\ContactSubmissionReceived;
use App\Models\ContactSubmission;
use App\Models\Project;
use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

/**
 * The public Contact form is the single funnel for every lead on the site, so
 * its validation, sanitization, per-project stamping and lead-routing all need
 * guarding. (Phone-format normalization is covered separately in ContactPhoneTest.)
 */
class ContactSubmissionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Don't render/deliver real mail — just record what would be sent. Also
        // avoids building the Mailable view for the validation-only cases.
        Mail::fake();
    }

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Jane Buyer',
            'email' => 'jane@example.com',
            'phone' => '0770770123',
            'request_type' => 'buy',
            'message' => 'I am interested.',
            'cf-turnstile-response' => 'dummy',
        ], $overrides);
    }

    public function test_name_is_required(): void
    {
        $this->post('/contact', collect($this->payload())->except('name')->all())
            ->assertSessionHasErrors('name');

        $this->assertDatabaseCount('contact_submissions', 0);
    }

    public function test_request_type_must_be_a_known_enum(): void
    {
        $this->post('/contact', $this->payload(['request_type' => 'bogus']))
            ->assertSessionHasErrors('request_type');

        $this->assertDatabaseCount('contact_submissions', 0);
    }

    public function test_email_is_optional(): void
    {
        $this->post('/contact', collect($this->payload())->except('email')->all())
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('contact_submissions', ['name' => 'Jane Buyer', 'email' => null]);
    }

    public function test_html_tags_are_stripped_from_stored_fields(): void
    {
        $this->post('/contact', $this->payload([
            'name' => 'Jane <b>Buyer</b>',
            'message' => 'Hi <script>alert(1)</script> there',
        ]))->assertSessionHasNoErrors();

        $row = ContactSubmission::firstOrFail();
        $this->assertSame('Jane Buyer', $row->name);
        $this->assertSame('Hi alert(1) there', $row->message);
    }

    public function test_property_query_stamps_the_project_id(): void
    {
        $project = Project::create([
            'title_en' => 'Villa', 'title_ar' => 'فيلا', 'slug' => 'villa-x',
            'category' => 'ready', 'listing_status' => 'for_sale', 'is_active' => true,
        ]);

        $this->post('/contact', $this->payload(['property' => 'villa-x']))
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('contact_submissions', ['name' => 'Jane Buyer', 'project_id' => $project->id]);
    }

    public function test_inactive_project_slug_is_not_stamped(): void
    {
        Project::create([
            'title_en' => 'Hidden', 'title_ar' => 'مخفي', 'slug' => 'hidden-x',
            'category' => 'ready', 'listing_status' => 'for_sale', 'is_active' => false,
        ]);

        $this->post('/contact', $this->payload(['property' => 'hidden-x']))
            ->assertSessionHasNoErrors();

        // The slug exists but isn't active → no project linkage, but the lead is
        // still captured.
        $this->assertDatabaseHas('contact_submissions', ['name' => 'Jane Buyer', 'project_id' => null]);
    }

    public function test_lead_routing_sends_to_the_request_type_recipient(): void
    {
        Setting::set('lead_routing', json_encode([
            'buy' => 'sales@skyamman.test',
            'rent' => 'rentals@skyamman.test',
        ]));

        $this->post('/contact', $this->payload(['request_type' => 'buy']))
            ->assertSessionHasNoErrors();

        Mail::assertSent(
            ContactSubmissionReceived::class,
            fn (ContactSubmissionReceived $mail) => $mail->hasTo('sales@skyamman.test')
        );
    }

    public function test_lead_routing_falls_back_to_company_email(): void
    {
        Setting::set('lead_routing', json_encode([])); // no per-type map
        Setting::set('company_email', 'hello@skyamman.test');

        $this->post('/contact', $this->payload(['request_type' => 'general']))
            ->assertSessionHasNoErrors();

        Mail::assertSent(
            ContactSubmissionReceived::class,
            fn (ContactSubmissionReceived $mail) => $mail->hasTo('hello@skyamman.test')
        );
    }
}
