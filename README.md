# Resilient Email Service

A robust email sending service implemented in TypeScript that provides reliable email delivery with multiple fallback mechanisms and resilience patterns.
 
# To run this 
```bash
npm install
npm run dev
```

## Features

- **Multiple Email Providers**: Support for primary and secondary email providers with automatic failover
- **Retry Mechanism**: Exponential backoff retry logic for failed attempts
- **Idempotency**: Prevents duplicate email sends using idempotency keys
- **Rate Limiting**: Prevents overwhelming email providers
- **Circuit Breaker**: Prevents cascading failures when providers are down
- **Status Tracking**: Track the status of email sending attempts
- **Mock Providers**: Included mock providers for testing

## Installation

```bash
npm install
```

## Usage

```typescript
import { EmailService } from './services/EmailService';
import { MockPrimaryProvider, MockSecondaryProvider } from './providers/MockEmailProviders';

// Create email providers
const primaryProvider = new MockPrimaryProvider(0.2);
const secondaryProvider = new MockSecondaryProvider(0.1);

// Create email service
const emailService = new EmailService(primaryProvider, secondaryProvider);

// Send an email
const status = await emailService.sendEmail({
  to: 'recipient@example.com',
  subject: 'Test Email',
  body: 'This is a test email',
  idempotencyKey: 'unique-key' // Optional
});
```

## Architecture

The service implements several resilience patterns:

1. **Retry with Exponential Backoff**: Automatically retries failed attempts with increasing delays
2. **Circuit Breaker**: Prevents overwhelming failing providers
3. **Rate Limiting**: Controls the rate of email sending
4. **Provider Fallback**: Automatically switches to secondary provider if primary fails
5. **Idempotency**: Ensures emails are not sent multiple times

## Configuration

The service can be configured with the following parameters:

- `maxRetries`: Maximum number of retry attempts (default: 3)
- `baseDelay`: Base delay for exponential backoff in milliseconds (default: 1000)
- Provider-specific failure rates for testing

## Testing

```bash
npm test
npm install
npm run dev
```

## License

MIT 