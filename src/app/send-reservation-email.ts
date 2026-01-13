import { randomUUID } from 'crypto';
import {
    EmailNotification,
    NotificationType,
    createEmailNotification,
    markNotificationSent,
    markNotificationFailed,
} from '../domain/entities/email-notification';
import { EmailSender } from '../domain/ports/email-sender';
import { NotificationRepo } from '../domain/repositories/notification-repo';
import { getEmailTemplate, ReservationEmailData } from './email-templates';

export type SendReservationEmailDeps = {
    emailSender: EmailSender;
    notificationRepo: NotificationRepo;
};

export type ReservationEventData = {
    reservationId: string;
    userId: string;
    userEmail: string;
    deviceId: string;
    deviceModelId: string;
    deviceName?: string;
    reservedAt?: string;
    expiresAt?: string;
    collectedAt?: string;
    returnDueAt?: string;
    returnedAt?: string;
    cancelledAt?: string;
};

export type SendReservationEmailResult = {
    success: boolean;
    notification?: EmailNotification;
    error?: string;
};

/**
 * Sends an email notification for a reservation event.
 *
 * This use case:
 * 1. Generates the appropriate email template based on event type
 * 2. Creates a notification record
 * 3. Sends the email via the email sender
 * 4. Updates the notification record with the result
 */
export async function sendReservationEmail(
    deps: SendReservationEmailDeps,
    eventType: NotificationType,
    eventData: ReservationEventData
): Promise<SendReservationEmailResult> {
    try {
        // Prepare template data
        const templateData: ReservationEmailData = {
            userEmail: eventData.userEmail,
            reservationId: eventData.reservationId,
            deviceName: eventData.deviceName,
            reservedAt: eventData.reservedAt,
            expiresAt: eventData.expiresAt,
            collectedAt: eventData.collectedAt,
            returnDueAt: eventData.returnDueAt,
            returnedAt: eventData.returnedAt,
        };

        // Get the email template
        const template = getEmailTemplate(eventType, templateData);

        // Create the notification record
        let notification = createEmailNotification({
            id: randomUUID(),
            userId: eventData.userId,
            userEmail: eventData.userEmail,
            type: eventType,
            subject: template.subject,
            htmlBody: template.htmlBody,
            textBody: template.textBody,
            reservationId: eventData.reservationId,
        });

        // Save initial pending notification
        notification = await deps.notificationRepo.save(notification);

        // Send the email
        const sendResult = await deps.emailSender.sendEmail({
            to: eventData.userEmail,
            subject: template.subject,
            htmlBody: template.htmlBody,
            textBody: template.textBody,
        });

        if (sendResult.success) {
            // Mark as sent
            notification = markNotificationSent(notification);
            notification = await deps.notificationRepo.save(notification);

            console.log(`Email sent successfully: ${notification.id} to ${eventData.userEmail}`);

            return {
                success: true,
                notification,
            };
        } else {
            // Mark as failed
            notification = markNotificationFailed(notification, sendResult.error || 'Unknown error');
            notification = await deps.notificationRepo.save(notification);

            console.error(`Email send failed: ${notification.id} - ${sendResult.error}`);

            return {
                success: false,
                notification,
                error: sendResult.error,
            };
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`Error in sendReservationEmail: ${message}`);

        return {
            success: false,
            error: message,
        };
    }
}
