# Resilient Email Service Documentation

## Project Overview

The Resilient Email Service is a TypeScript-based email sending service that implements various resilience patterns to ensure reliable email delivery. This documentation provides a comprehensive overview of the project structure, components, and functionality.

## Project Structure

```
src/
├── types/
│   └── index.ts           # Type definitions and interfaces
├── providers/
│   └── MockEmailProviders.ts  # Mock email provider implementations
├── utils/
│   ├── RateLimiter.ts     # Rate limiting implementation
│   └── CircuitBreaker.ts  # Circuit breaker pattern implementation
├── services/
│   └── EmailService.ts    # Main email service implementation
├── public/
│   ├── index.html        # Web interface
│   ├── styles.css        # UI styles
│   └── app.ts           # UI logic
└── index.ts             # Example usage
```

## Core Components

### 1. EmailService (src/services/EmailService.ts)

The main service class that orchestrates email sending with resilience features:

- **Constructor Parameters**:
  - `primaryProvider`: Primary email provider
  - `secondaryProvider`: Fallback email provider
  - `maxRetries`: Maximum retry attempts (default: 3)
  - `baseDelay`: Base delay for exponential backoff (default: 1000ms)

- **Key Methods**:
  - `sendEmail(options: EmailOptions)`: Sends an email with retry and fallback logic
  - `getEmailStatus(id: string)`: Retrieves the status of a sent email

### 2. Mock Email Providers (src/providers/MockEmailProviders.ts)

Mock implementations of email providers for testing:

- **MockPrimaryProvider**:
  - Simulates a primary email provider with configurable failure rate
  - Default failure rate: 20%

- **MockSecondaryProvider**:
  - Simulates a secondary email provider with configurable failure rate
  - Default failure rate: 10%

### 3. Rate Limiter (src/utils/RateLimiter.ts)

Implements rate limiting to prevent overwhelming email providers:

- **Features**:
  - Configurable request limits
  - Time window-based limiting
  - Automatic request tracking

### 4. Circuit Breaker (src/utils/CircuitBreaker.ts)

Implements the circuit breaker pattern to prevent cascading failures:

- **Features**:
  - Failure threshold tracking
  - Automatic circuit reset
  - Configurable timeout periods

## Resilience Patterns

### 1. Retry with Exponential Backoff

```typescript
private async retryWithBackoff(
  operation: () => Promise<boolean>,
  attempt: number
): Promise<boolean> {
  try {
    return await operation();
  } catch (error) {
    if (attempt >= this.maxRetries) {
      throw error;
    }
    const delay = this.baseDelay * Math.pow(2, attempt);
    await this.sleep(delay);
    return this.retryWithBackoff(operation, attempt + 1);
  }
}
```

### 2. Provider Fallback

```typescript
try {
  // Try primary provider
  await this.retryWithBackoff(
    () => this.sendWithProvider(this.primaryProvider, options, this.primaryCircuitBreaker),
    0
  );
} catch (primaryError) {
  // Fallback to secondary provider
  await this.retryWithBackoff(
    () => this.sendWithProvider(this.secondaryProvider, options, this.secondaryCircuitBreaker),
    0
  );
}
```

### 3. Idempotency

```typescript
const id = options.idempotencyKey || uuidv4();
if (this.sentEmails.has(id)) {
  return this.sentEmails.get(id)!;
}
```

## Web Interface

The service includes a web interface for easy interaction:

### Features:
- Email composition form
- Real-time status updates
- Provider statistics
- Responsive design

### Usage:
1. Open `index.html` in a web browser
2. Fill in the email details
3. Submit the form to send an email
4. Monitor the status and statistics

## Configuration

### Email Service Configuration

```typescript
const emailService = new EmailService(
  primaryProvider,
  secondaryProvider,
  maxRetries,    // Optional: default 3
  baseDelay      // Optional: default 1000ms
);
```

### Rate Limiter Configuration

```typescript
const rateLimiter = new SimpleRateLimiter(
  maxRequests,   // Optional: default 100
  timeWindow     // Optional: default 60000ms
);
```

### Circuit Breaker Configuration

```typescript
const circuitBreaker = new SimpleCircuitBreaker(
  failureThreshold,  // Optional: default 5
  resetTimeout       // Optional: default 30000ms
);
```

## Best Practices

1. **Error Handling**:
   - Always use try-catch blocks when sending emails
   - Implement proper error logging
   - Handle both provider-specific and general errors

2. **Idempotency**:
   - Always provide idempotency keys for critical emails
   - Use UUID v4 for generating unique keys
   - Implement proper duplicate detection

3. **Monitoring**:
   - Track success/failure rates
   - Monitor provider health
   - Log important events

4. **Configuration**:
   - Adjust retry attempts based on use case
   - Configure appropriate rate limits
   - Set reasonable circuit breaker thresholds

## Testing

The service includes mock providers for testing:

```typescript
const primaryProvider = new MockPrimaryProvider(0.2);   // 20% failure rate
const secondaryProvider = new MockSecondaryProvider(0.1); // 10% failure rate
```

## Future Improvements

1. **Persistence**:
   - Add database storage for email status
   - Implement email queue persistence

2. **Monitoring**:
   - Add detailed metrics collection
   - Implement alerting system

3. **Scalability**:
   - Add support for multiple providers
   - Implement load balancing

4. **Security**:
   - Add authentication
   - Implement rate limiting per user
   - Add email validation

## License

MIT License 