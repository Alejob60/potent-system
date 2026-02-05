# Email Integration

## Overview

This document provides documentation for the email integration implemented in Sprint 12. The integration enables the MisyBot platform to send various types of emails including simple text emails, HTML emails, templated emails, and bulk emails.

## Features

1. **Text Email Sending**: Send simple text emails
2. **HTML Email Sending**: Send rich HTML emails
3. **Templated Email Sending**: Send emails using predefined templates
4. **Bulk Email Sending**: Send emails to multiple recipients
5. **Email with Attachments**: Send emails with file attachments

## Setup Requirements

### Environment Variables

The following environment variables need to be configured:

```env
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_email_password
EMAIL_FROM="MisyBot" <noreply@example.com>
```

### SMTP Configuration

The email integration supports various SMTP providers:
- Gmail SMTP
- Outlook SMTP
- Custom SMTP servers
- AWS SES
- SendGrid
- Mailgun

## API Endpoints

### Send Text Email

```
POST /email/send-text
```

**Request Body:**
```json
{
  "to": "user@example.com",
  "subject": "Hello from MisyBot",
  "text": "This is a simple text email."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accepted": ["user@example.com"],
    "rejected": [],
    "envelopeTime": 123,
    "messageTime": 456,
    "messageId": "<message-id@example.com>",
    "response": "250 2.0.0 OK"
  },
  "message": "Email sent successfully"
}
```

### Send HTML Email

```
POST /email/send-html
```

**Request Body:**
```json
{
  "to": "user@example.com",
  "subject": "Hello from MisyBot",
  "html": "<h1>Hello from MisyBot</h1><p>This is an HTML email.</p>"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accepted": ["user@example.com"],
    "rejected": [],
    "envelopeTime": 123,
    "messageTime": 456,
    "messageId": "<message-id@example.com>",
    "response": "250 2.0.0 OK"
  },
  "message": "HTML email sent successfully"
}
```

### Send Templated Email

```
POST /email/send-template
```

**Request Body:**
```json
{
  "to": "user@example.com",
  "subject": "Hello from MisyBot",
  "template": "welcome",
  "context": {
    "name": "John Doe",
    "company": "MisyBot"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accepted": ["user@example.com"],
    "rejected": [],
    "envelopeTime": 123,
    "messageTime": 456,
    "messageId": "<message-id@example.com>",
    "response": "250 2.0.0 OK"
  },
  "message": "Templated email sent successfully"
}
```

### Send Bulk Email

```
POST /email/send-bulk
```

**Request Body:**
```json
{
  "recipients": ["user1@example.com", "user2@example.com"],
  "subject": "Hello from MisyBot",
  "html": "<h1>Hello from MisyBot</h1><p>This is a bulk email.</p>"
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "recipient": "user1@example.com",
      "success": true,
      "result": {
        "accepted": ["user1@example.com"],
        "rejected": [],
        "envelopeTime": 123,
        "messageTime": 456,
        "messageId": "<message-id1@example.com>",
        "response": "250 2.0.0 OK"
      }
    },
    {
      "recipient": "user2@example.com",
      "success": true,
      "result": {
        "accepted": ["user2@example.com"],
        "rejected": [],
        "envelopeTime": 123,
        "messageTime": 456,
        "messageId": "<message-id2@example.com>",
        "response": "250 2.0.0 OK"
      }
    }
  ],
  "message": "Bulk emails sent successfully"
}
```

## Technical Implementation

### Service Layer

The [EmailService](file://d:\MisyBot\Misy-Agent\meta-agent\backend-refactor\src\integrations\channels\email.service.ts#L5-L153) handles all business logic for email integration:

1. **Text Email Sending**: Implements methods to send simple text emails
2. **HTML Email Sending**: Implements methods to send rich HTML emails
3. **Templated Email Sending**: Implements methods to send emails using templates
4. **Bulk Email Sending**: Implements methods to send emails to multiple recipients
5. **Email with Attachments**: Implements methods to send emails with file attachments

### Controller Layer

The [EmailController](file://d:\MisyBot\Misy-Agent\meta-agent\backend-refactor\src\integrations\channels\email.controller.ts#L1-L214) exposes REST endpoints:

1. **POST /email/send-text**: Send text emails
2. **POST /email/send-html**: Send HTML emails
3. **POST /email/send-template**: Send templated emails
4. **POST /email/send-bulk**: Send bulk emails

### Module Configuration

The [EmailModule](file://d:\MisyBot\Misy-Agent\meta-agent\backend-refactor\src\integrations\channels\email.module.ts#L1-L27) configures the NestJS module:

1. Registers the MailerService with SMTP configuration
2. Registers the service and controller
3. Exports the service for use in other modules

## Testing

Unit tests are provided in [email.service.spec.ts](file://d:\MisyBot\Misy-Agent\meta-agent\backend-refactor\src\integrations\channels\email.service.spec.ts) to verify:

1. Service instantiation
2. Email sending functionality

## Security Considerations

1. **SMTP Credentials Protection**: SMTP credentials should be stored securely and never exposed in client-side code
2. **Input Validation**: All incoming data is validated before sending emails
3. **Rate Limiting**: Implementation includes rate limiting to prevent abuse
4. **Content Filtering**: Email content should be filtered to prevent injection attacks

## Error Handling

The service implements comprehensive error handling:

1. **Network Errors**: Handles connection issues with the SMTP server
2. **Authentication Errors**: Manages invalid SMTP credentials
3. **Validation Errors**: Validates input data before sending emails
4. **Logging**: Detailed error logging for debugging and monitoring

## Future Enhancements

Planned enhancements for the email integration:

1. **Email Tracking**: Track email delivery and open rates
2. **Advanced Templating**: Support for more advanced email templates
3. **Email Scheduling**: Schedule emails to be sent at specific times
4. **Email Analytics**: Collect and analyze email performance metrics
5. **Rich Media Support**: Support for embedded images and other media

## Troubleshooting

### Common Issues

1. **Authentication Failed**: Verify that the SMTP credentials are correct
2. **Connection Timeout**: Check that the SMTP server is accessible and the port is correct
3. **Email Rejected**: Ensure the recipient email addresses are valid
4. **Rate Limiting**: Monitor for rate limiting errors and implement appropriate backoff strategies

### Logs

Check the application logs for detailed error information:

```
[Nest] 12345 - 2025-12-05 10:30:00 INFO [EmailService] Successfully sent email to user@example.com
[Nest] 12345 - 2025-12-05 10:30:01 ERROR [EmailService] Failed to send email to user@example.com: Invalid recipient
```