import { EmailClient, KnownEmailSendStatus } from '@azure/communication-email';
import { EmailSender, EmailContent, EmailSendResult } from '../../domain/ports/email-sender';
import { logger, createLogger } from '../logging/logger';
import type { Logger } from '../logging/logger';

export type AcsEmailSenderOptions = {
    connectionString: string;
    senderAddress: string;
};

/**
 * Azure Communication Services Email Sender implementation.
 *
 * Sends emails using the Azure Communication Services Email SDK.
 */
export class AcsEmailSender implements EmailSender {
    private readonly client: EmailClient;
    private readonly senderAddress: string;
    private readonly log: Logger;

    constructor(private readonly options: AcsEmailSenderOptions) {
        this.log = createLogger({
            component: 'AcsEmailSender',
        });

        this.log.info('Initializing AcsEmailSender');

        if (!options.connectionString) {
            throw new Error('ACS_CONNECTION_STRING is required');
        }
        if (!options.senderAddress) {
            throw new Error('ACS_SENDER_ADDRESS is required');
        }

        this.client = new EmailClient(options.connectionString);
        this.senderAddress = options.senderAddress;

        this.log.info('AcsEmailSender initialized successfully', {
            senderAddress: this.senderAddress,
        });
    }

    public async sendEmail(content: EmailContent): Promise<EmailSendResult> {
        const startTime = Date.now();
        this.log.debug('Sending email', {
            to: content.to,
            subject: content.subject,
        });

        try {
            const message = {
                senderAddress: this.senderAddress,
                content: {
                    subject: content.subject,
                    html: content.htmlBody,
                    plainText: content.textBody,
                },
                recipients: {
                    to: [{ address: content.to }],
                },
            };

            // Start the send operation
            const poller = await this.client.beginSend(message);

            // Wait for the operation to complete
            const result = await poller.pollUntilDone();

            const duration = Date.now() - startTime;

            if (result.status === KnownEmailSendStatus.Succeeded) {
                this.log.info('Email sent successfully', {
                    to: content.to,
                    messageId: result.id,
                    durationMs: duration,
                });
                this.log.trackDependency('ACS.Email.Send', 'AzureCommunicationServices', duration, true, {
                    recipient: content.to,
                });

                return {
                    success: true,
                    messageId: result.id,
                };
            } else {
                const error = `Email send failed with status: ${result.status}`;
                this.log.warn('Email send failed', {
                    to: content.to,
                    status: result.status,
                    durationMs: duration,
                });
                this.log.trackDependency('ACS.Email.Send', 'AzureCommunicationServices', duration, false, {
                    recipient: content.to,
                    status: result.status,
                });

                return {
                    success: false,
                    error,
                };
            }
        } catch (error) {
            const duration = Date.now() - startTime;
            const errorMessage = error instanceof Error ? error.message : String(error);

            this.log.error('Email send error', error as Error, {
                to: content.to,
                durationMs: duration,
            });
            this.log.trackDependency('ACS.Email.Send', 'AzureCommunicationServices', duration, false, {
                recipient: content.to,
            });

            return {
                success: false,
                error: errorMessage,
            };
        }
    }
}
