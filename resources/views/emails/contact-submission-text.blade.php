New {{ ucfirst($submission->request_type) }} inquiry

Name: {{ $submission->name }}
Email: {{ $submission->email }}
@if ($submission->phone)
Phone: {{ $submission->phone }}
@endif
Request type: {{ ucfirst($submission->request_type) }}
@if ($submission->project)
Property: {{ $submission->project->title_en }}
@endif

Message:
{{ $submission->message }}

---
Received {{ $submission->created_at?->toDayDateTimeString() }} · IP {{ $submission->ip_address }}
