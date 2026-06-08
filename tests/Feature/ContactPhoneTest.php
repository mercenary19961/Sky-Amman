<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class ContactPhoneTest extends TestCase
{
    use RefreshDatabase;

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'phone' => '+962 7 7077 0123',
            'request_type' => 'general',
            'message' => 'Hello there.',
            'cf-turnstile-response' => 'dummy',
        ], $overrides);
    }

    /** Various entered formats all normalize to the canonical "+9627XXXXXXXX". */
    #[DataProvider('validPhones')]
    public function test_valid_phone_is_stored_canonically(string $entered, string $expected): void
    {
        $response = $this->post('/contact', $this->payload(['phone' => $entered]));

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('contact_submissions', ['email' => 'test@example.com', 'phone' => $expected]);
    }

    public static function validPhones(): array
    {
        return [
            'local with leading 0'   => ['0770770123', '+962770770123'],
            'local spaced'           => ['077 077 0123', '+962770770123'],
            'intl with + and spaces' => ['+962 77 077 0123', '+962770770123'],
            'intl no spaces'         => ['+962770770123', '+962770770123'],
            'intl without +'         => ['962770770123', '+962770770123'],
            'local with dashes'      => ['077-077-0123', '+962770770123'],
        ];
    }

    /** Bad formats are rejected and nothing is written to the inbox. */
    #[DataProvider('invalidPhones')]
    public function test_invalid_phone_is_rejected(string $entered): void
    {
        $response = $this->post('/contact', $this->payload(['phone' => $entered]));

        $response->assertSessionHasErrors('phone');
        $this->assertDatabaseCount('contact_submissions', 0);
    }

    public static function invalidPhones(): array
    {
        return [
            'empty'              => [''],
            'too short'         => ['077077012'],
            'too long'          => ['07707701234'],
            'landline (06)'     => ['0612345678'],
            'wrong country'     => ['+9715012345678'],
            'letters'           => ['07abc70123'],
            'not a phone'       => ['hello'],
        ];
    }

    public function test_phone_is_required(): void
    {
        $response = $this->post('/contact', collect($this->payload())->except('phone')->all());

        $response->assertSessionHasErrors('phone');
        $this->assertDatabaseCount('contact_submissions', 0);
    }
}
