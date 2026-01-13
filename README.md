# Device Notification Service

Azure Functions microservice for sending email notifications to users following Clean Architecture principles. Uses Azure Communication Services for email delivery.

## Features

- **Email Notifications**: Sends emails for reservation events (created, collected, returned, cancelled, expired, overdue)
- **Event-Driven**: Listens to Event Grid events from the reservation service
- **Audit Trail**: Stores notification records in Cosmos DB for tracking
- **Professional Templates**: HTML and plain text email templates for each notification type

## Project Structure

```
src/
├── domain/           # Core business logic and entities
│   ├── entities/     # EmailNotification entity
│   ├── ports/        # EmailSender interface
│   └── repositories/ # NotificationRepo interface
├── app/              # Application use cases (business workflows)
│   ├── email-templates.ts  # Email template functions
│   └── send-reservation-email.ts  # Main use case
├── infra/            # Infrastructure adapters
│   ├── adapters/     # ACS email sender, Cosmos repo
│   ├── logging/      # Application Insights logger
│   └── middleware/   # Auth0 middleware
├── functions/        # Azure Functions triggers
│   ├── health.ts     # Health check endpoint
│   └── reservation-events.ts  # Event Grid trigger
└── config/           # Dependency injection
```

## Development Commands

- `npm install` - Install dependencies
- `npm run build` - Compile TypeScript
- `npm run start` - Start Azure Functions runtime
- `npm run clean` - Clean build artifacts

## Environment Variables

### Required
- `ACS_CONNECTION_STRING` - Azure Communication Services connection string
- `ACS_SENDER_ADDRESS` - Sender email address (configured in ACS)
- `COSMOS_ENDPOINT` - Azure Cosmos DB endpoint URL
- `AUTH0_DOMAIN` - Auth0 domain (e.g., `your-tenant.auth0.com`)
- `AUTH0_AUDIENCE` - Auth0 API identifier/audience

### Optional
- `COSMOS_KEY` - Cosmos DB access key (uses managed identity if not set)
- `COSMOS_NOTIFICATION_DATABASE_ID` - Cosmos DB database ID (default: `notification-db`)
- `COSMOS_NOTIFICATION_CONTAINER_ID` - Cosmos DB container ID (default: `notifications`)
- `ALLOWED_ORIGINS` - Comma-separated list of allowed CORS origins
- `APPLICATIONINSIGHTS_CONNECTION_STRING` - Application Insights connection string

## Notification Types

| Event | Email Subject |
|-------|---------------|
| Reservation Created | "Your reservation is confirmed" |
| Device Collected | "Device collected successfully" |
| Device Returned | "Device returned - Thank you!" |
| Reservation Cancelled | "Reservation cancelled" |
| Reservation Expired | "Reservation expired" |
| Overdue Reminder | "URGENT: Device return overdue" |
