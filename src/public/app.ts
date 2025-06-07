import { EmailService } from '../services/EmailService';
import { MockPrimaryProvider, MockSecondaryProvider } from '../providers/MockEmailProviders';

interface EmailFormData {
    to: string;
    subject: string;
    body: string;
    idempotencyKey?: string;
}

interface EmailStatus {
    id: string;
    status: 'pending' | 'sent' | 'failed';
    message: string;
    timestamp: Date;
}

class EmailServiceUI {
    private emailService: EmailService;
    private form: HTMLFormElement;
    private statusList: HTMLElement;
    private primaryStatus: HTMLElement;
    private secondaryStatus: HTMLElement;
    private primarySuccessRate: HTMLElement;
    private secondarySuccessRate: HTMLElement;

    constructor() {
        // Initialize email service
        const primaryProvider = new MockPrimaryProvider(0.2);
        const secondaryProvider = new MockSecondaryProvider(0.1);
        this.emailService = new EmailService(primaryProvider, secondaryProvider);

        // Get DOM elements
        this.form = document.getElementById('emailForm') as HTMLFormElement;
        this.statusList = document.getElementById('statusList')!;
        this.primaryStatus = document.getElementById('primaryStatus')!;
        this.secondaryStatus = document.getElementById('secondaryStatus')!;
        this.primarySuccessRate = document.getElementById('primarySuccessRate')!;
        this.secondarySuccessRate = document.getElementById('secondarySuccessRate')!;

        // Initialize event listeners
        this.initializeEventListeners();
    }

    private initializeEventListeners(): void {
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
    }

    private async handleSubmit(event: Event): Promise<void> {
        event.preventDefault();

        const formData = new FormData(this.form);
        const emailOptions = {
            to: formData.get('to') as string,
            subject: formData.get('subject') as string,
            body: formData.get('body') as string,
            idempotencyKey: formData.get('idempotencyKey') as string || undefined
        };

        const pendingStatus: EmailStatus = {
            id: crypto.randomUUID(),
            status: 'pending',
            message: 'Sending email...',
            timestamp: new Date()
        };

        this.addStatus(pendingStatus);

        try {
            const result = await this.emailService.sendEmail(emailOptions);
            const successStatus: EmailStatus = {
                id: result.id,
                status: 'sent',
                message: 'Email sent successfully!',
                timestamp: new Date()
            };
            this.addStatus(successStatus);
            this.updateStats();
        } catch (error) {
            const errorStatus: EmailStatus = {
                id: crypto.randomUUID(),
                status: 'failed',
                message: error instanceof Error ? error.message : 'Failed to send email. Please try again.',
                timestamp: new Date()
            };
            this.addStatus(errorStatus);
        }
    }

    private addStatus(status: EmailStatus): void {
        const statusItem = document.createElement('div');
        statusItem.className = `status-item ${status.status === 'sent' ? 'success' : status.status === 'failed' ? 'error' : 'pending'}`;
        
        const content = `
            <p><strong>ID:</strong> ${status.id}</p>
            <p><strong>Status:</strong> ${status.status}</p>
            <p><strong>Message:</strong> ${status.message}</p>
            <p><strong>Timestamp:</strong> ${status.timestamp.toLocaleString()}</p>
        `;
        
        statusItem.innerHTML = content;
        this.statusList.insertBefore(statusItem, this.statusList.firstChild);
    }

    private updateStats(): void {
        // Update provider statuses and success rates
        // This is a mock implementation - in a real application, you would track actual statistics
        this.primaryStatus.textContent = 'Active';
        this.secondaryStatus.textContent = 'Active';
        this.primarySuccessRate.textContent = '80%';
        this.secondarySuccessRate.textContent = '90%';
    }
}

// Initialize the UI when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EmailServiceUI();
}); 