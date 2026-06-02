<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New inquiry</title>
</head>
<body style="margin:0;background:#f5f8fb;font-family:Arial,Helvetica,sans-serif;color:#1a2433;">
    <div style="max-width:560px;margin:24px auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5ebf0;">
        <div style="background:#1A3954;padding:20px 28px;">
            <h1 style="margin:0;color:#ffffff;font-size:18px;">New {{ ucfirst($submission->request_type) }} inquiry</h1>
        </div>
        <div style="padding:24px 28px;">
            <p style="margin:0 0 14px;"><strong>Name:</strong> {{ $submission->name }}</p>
            <p style="margin:0 0 14px;"><strong>Email:</strong> <a href="mailto:{{ $submission->email }}">{{ $submission->email }}</a></p>
            @if ($submission->phone)
                <p style="margin:0 0 14px;"><strong>Phone:</strong> {{ $submission->phone }}</p>
            @endif
            <p style="margin:0 0 14px;"><strong>Request type:</strong> {{ ucfirst($submission->request_type) }}</p>
            @if ($submission->project)
                <p style="margin:0 0 14px;"><strong>Property:</strong> {{ $submission->project->title_en }}</p>
            @endif
            <p style="margin:18px 0 6px;"><strong>Message</strong></p>
            <p style="margin:0;line-height:1.6;white-space:pre-wrap;">{{ $submission->message }}</p>
        </div>
        <div style="padding:14px 28px;border-top:1px solid #e5ebf0;color:#8a97a8;font-size:12px;">
            Received {{ $submission->created_at?->toDayDateTimeString() }} · IP {{ $submission->ip_address }}
        </div>
    </div>
</body>
</html>
