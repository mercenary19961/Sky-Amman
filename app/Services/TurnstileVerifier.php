<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TurnstileVerifier
{
    private const ENDPOINT = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

    /**
     * Verify a Turnstile token against Cloudflare's siteverify endpoint.
     *
     * Returns true when verification passes — OR when no secret is configured
     * (feature-flag off, e.g. local dev or pre-launch staging). This keeps the
     * site functional before keys are provisioned in Cloudflare.
     */
    public function verify(?string $token, ?string $remoteIp = null): bool
    {
        $secret = config('services.turnstile.secret_key');

        if (empty($secret)) {
            return true;
        }

        if (empty($token)) {
            return false;
        }

        try {
            $response = Http::asForm()
                ->timeout(5)
                ->post(self::ENDPOINT, array_filter([
                    'secret' => $secret,
                    'response' => $token,
                    'remoteip' => $remoteIp,
                ]));
        } catch (ConnectionException $e) {
            Log::warning('Turnstile siteverify connection failed', ['error' => $e->getMessage()]);
            // Fail closed: better to reject a real user during a CF outage than
            // to give bots a free pass.
            return false;
        }

        if (! $response->successful()) {
            Log::warning('Turnstile siteverify non-2xx', ['status' => $response->status()]);
            return false;
        }

        $success = $response->json('success') === true;

        if (! $success) {
            Log::warning('Turnstile siteverify rejected', [
                'error_codes' => $response->json('error-codes'),
                'hostname' => $response->json('hostname'),
            ]);
        }

        return $success;
    }

    public function isEnabled(): bool
    {
        return ! empty(config('services.turnstile.secret_key'));
    }
}
