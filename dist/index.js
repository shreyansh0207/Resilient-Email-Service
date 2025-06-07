"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EmailService_1 = require("./services/EmailService");
const MockEmailProviders_1 = require("./providers/MockEmailProviders");
async function main() {
    // Create email providers
    const primaryProvider = new MockEmailProviders_1.MockPrimaryProvider(0.2); // 20% failure rate
    const secondaryProvider = new MockEmailProviders_1.MockSecondaryProvider(0.1); // 10% failure rate
    // Create email service
    const emailService = new EmailService_1.EmailService(primaryProvider, secondaryProvider);
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
    }
    catch (error) {
        console.error('Failed to send email:', error);
    }
}
// Run the example
main().catch(console.error);
