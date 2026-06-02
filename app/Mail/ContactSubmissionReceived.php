<?php

namespace App\Mail;

use App\Models\ContactSubmission;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Notifies the routed recipient(s) of a new contact inquiry. Reply-To is set to
 * the submitter so staff can respond directly. Dev uses MAIL_MAILER=log.
 */
class ContactSubmissionReceived extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public ContactSubmission $submission)
    {
    }

    public function envelope(): Envelope
    {
        $type = ucfirst($this->submission->request_type);

        return new Envelope(
            subject: "New {$type} inquiry from {$this->submission->name}",
            replyTo: [new Address($this->submission->email, $this->submission->name)],
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.contact-submission',
            text: 'emails.contact-submission-text',
            with: ['submission' => $this->submission->loadMissing('project')],
        );
    }
}
