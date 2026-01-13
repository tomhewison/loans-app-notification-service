/**
 * Port interface for sending emails.
 *
 * This interface defines the contract for email sending operations,
 * following the Ports and Adapters pattern to abstract email infrastructure
 * concerns from business logic.
 */

export type EmailSendResult = {
    success: boolean;
    messageId?: string;
    error?: string;
};

export type EmailContent = {
    to: string;
    subject: string;
    htmlBody: string;
    textBody?: string;
};

/**
 * Email sender port interface.
 *
 * Implementations should handle:
 * - Email delivery via the chosen email service
 * - Error handling and result reporting
 * - Connection management
 */
export interface EmailSender {
    /**
     * Sends an email to the specified recipient.
     *
     * @param content - The email content to send
     * @returns Promise resolving to the send result
     */
    sendEmail(content: EmailContent): Promise<EmailSendResult>;
}
