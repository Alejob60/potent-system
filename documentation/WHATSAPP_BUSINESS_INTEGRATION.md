# WhatsApp Business API Integration

## Overview

This document provides documentation for the WhatsApp Business API integration implemented in Sprint 12. The integration enables the MisyBot platform to send and receive messages through WhatsApp Business.

## Features

1. **Text Message Sending**: Send simple text messages to WhatsApp users
2. **Template Message Sending**: Send predefined template messages for consistent communication
3. **Webhook Handling**: Process incoming messages and events from WhatsApp
4. **Webhook Verification**: Verify webhook subscriptions with WhatsApp

## Setup Requirements

### Environment Variables

The following environment variables need to be configured:

```env
WHATSAPP_BASE_URL=https://graph.facebook.com/v17.0
WHATSAPP_ACCESS_TOKEN=your_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_VERIFY_TOKEN=your_verify_token_here
```

### Facebook Developer Setup

1. Create a Facebook Developer account
2. Create a Facebook Business Manager account
3. Set up a WhatsApp Business account
4. Create a Facebook App and add WhatsApp product
5. Obtain the Access Token and Phone Number ID
6. Configure the webhook URL in the Facebook App settings

## API Endpoints

### Send Text Message

```
POST /whatsapp/send-text
```

**Request Body:**
```json
{
  "to": "+1234567890",
  "message": "Hello from MisyBot!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "messaging_product": "whatsapp",
    "contacts": [
      {
        "input": "+1234567890",
        "wa_id": "1234567890"
      }
    ],
    "messages": [
      {
        "id": "wamid.ID"
      }
    ]
  },
  "message": "Message sent successfully"
}
```

### Send Template Message

```
POST /whatsapp/send-template
```

**Request Body:**
```json
{
  "to": "+1234567890",
  "templateName": "welcome_template",
  "language": "en_US",
  "components": [
    {
      "type": "body",
      "parameters": [
        {
          "type": "text",
          "text": "John"
        }
      ]
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "messaging_product": "whatsapp",
    "contacts": [
      {
        "input": "+1234567890",
        "wa_id": "1234567890"
      }
    ],
    "messages": [
      {
        "id": "wamid.ID"
      }
    ]
  },
  "message": "Template message sent successfully"
}
```

### Webhook Endpoint

```
POST /whatsapp/webhook
```

**Webhook Payload Example:**
```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "PHONE_NUMBER",
              "phone_number_id": "PHONE_NUMBER_ID"
            },
            "contacts": [
              {
                "profile": {
                  "name": "NAME"
                },
                "wa_id": "PHONE_NUMBER"
              }
            ],
            "messages": [
              {
                "from": "PHONE_NUMBER",
                "id": "wamid.ID",
                "timestamp": "TIMESTAMP",
                "text": {
                  "body": "MESSAGE_BODY"
                },
                "type": "text"
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

### Webhook Verification

```
GET /whatsapp/webhook
```

**Query Parameters:**
```
hub.mode=subscribe
hub.verify_token=your_verify_token
hub.challenge=challenge_string
```

## Technical Implementation

### Service Layer

The [WhatsappBusinessService](file://d:\MisyBot\Misy-Agent\meta-agent\backend-refactor\src\integrations\channels\whatsapp-business.service.ts#L5-L175) handles all business logic for WhatsApp integration:

1. **Message Sending**: Implements methods to send text and template messages
2. **Webhook Processing**: Processes incoming events from WhatsApp
3. **Error Handling**: Comprehensive error handling and logging
4. **Configuration Management**: Reads configuration from environment variables

### Controller Layer

The [WhatsappBusinessController](file://d:\MisyBot\Misy-Agent\meta-agent\backend-refactor\src\integrations\channels\whatsapp-business.controller.ts#L1-L222) exposes REST endpoints:

1. **POST /whatsapp/send-text**: Send text messages
2. **POST /whatsapp/send-template**: Send template messages
3. **POST /whatsapp/webhook**: Handle incoming webhook events
4. **GET /whatsapp/webhook**: Verify webhook subscriptions

### Module Configuration

The [WhatsappBusinessModule](file://d:\MisyBot\Misy-Agent\meta-agent\backend-refactor\src\integrations\channels\whatsapp-business.module.ts#L1-L10) configures the NestJS module:

1. Registers the service and controller
2. Exports the service for use in other modules

## Testing

Unit tests are provided in [whatsapp-business.service.spec.ts](file://d:\MisyBot\Misy-Agent\meta-agent\backend-refactor\src\integrations\channels\whatsapp-business.service.spec.ts) to verify:

1. Service instantiation
2. Webhook verification functionality
3. Error handling

## Security Considerations

1. **Access Token Protection**: Access tokens should be stored securely and never exposed in client-side code
2. **Webhook Verification**: All webhook requests are verified using the configured verify token
3. **Input Validation**: All incoming data is validated before processing
4. **Rate Limiting**: Implementation includes rate limiting to prevent abuse

## Error Handling

The service implements comprehensive error handling:

1. **Network Errors**: Handles connection issues with the WhatsApp API
2. **Authentication Errors**: Manages invalid access tokens
3. **Validation Errors**: Validates input data before sending requests
4. **Logging**: Detailed error logging for debugging and monitoring

## Future Enhancements

Planned enhancements for the WhatsApp Business integration:

1. **Media Support**: Add support for sending and receiving images, documents, and other media types
2. **Interactive Messages**: Implement support for buttons, lists, and other interactive message types
3. **Message Status Tracking**: Track message delivery and read status
4. **Conversation Management**: Implement conversation state management
5. **Rich Media Templates**: Support for media templates and interactive templates

## Troubleshooting

### Common Issues

1. **Authentication Failed**: Verify that the access token is correct and has not expired
2. **Webhook Not Verified**: Check that the verify token matches the configuration
3. **Message Not Delivered**: Ensure the recipient phone number is correct and registered with WhatsApp
4. **Rate Limiting**: Monitor for rate limiting errors and implement appropriate backoff strategies

### Logs

Check the application logs for detailed error information:

```
[Nest] 12345 - 2025-12-05 10:30:00 INFO [WhatsappBusinessService] Successfully sent message to +1234567890
[Nest] 12345 - 2025-12-05 10:30:01 ERROR [WhatsappBusinessService] Failed to send message to +1234567890: Invalid recipient
```