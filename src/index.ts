import { EmailService } from './services/EmailService';
import { MockPrimaryProvider, MockSecondaryProvider } from './providers/MockEmailProviders';

async function main() {
  // Create email providers
  const primaryProvider = new MockPrimaryProvider(0.2); // 20% failure rate
  const secondaryProvider = new MockSecondaryProvider(0.1); // 10% failure rate

  // Create email service
  const emailService = new EmailService(primaryProvider, secondaryProvider);

  // Example email options
  const emailOptions = {
    to: 'recipient@example.com',
    subject: 'Test Email',
    body: 'This is a test email',
    idempotencyKey: 'test-email-1' // Optional: for idempotency
  };

  try {
    // Send email
    const status = await emailService.sendEmail(emailOptions);
    console.log('Email status:', status);

    // Check status later
    const emailStatus = emailService.getEmailStatus(status.id);
    console.log('Email status check:', emailStatus);
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

// Run the example
main().catch(console.error); 