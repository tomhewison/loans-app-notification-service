import { app, EventGridEvent, InvocationContext } from '@azure/functions';
import { getEmailSender, getNotificationRepo } from '../config/appServices';
import { sendReservationEmail, ReservationEventData } from '../app/send-reservation-email';
import { NotificationType } from '../domain/entities/email-notification';

/**
 * Reservation event types that trigger email notifications.
 */
const RESERVATION_EVENT_TYPES = {
    'reservation.created': NotificationType.ReservationCreated,
    'reservation.collected': NotificationType.ReservationCollected,
    'reservation.returned': NotificationType.ReservationReturned,
    'reservation.cancelled': NotificationType.ReservationCancelled,
    'reservation.expired': NotificationType.ReservationExpired,
    'reservation.overdue': NotificationType.ReservationOverdue,
} as const;

type ReservationEventType = keyof typeof RESERVATION_EVENT_TYPES;

/**
 * Expected event data structure from the reservation service.
 */
type ReservationEventPayload = {
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

/**
 * Handles reservation events from Event Grid and sends appropriate email notifications.
 */
async function handleReservationEvent(
    event: EventGridEvent,
    context: InvocationContext
): Promise<void> {
    context.log(`Received event: ${event.eventType} - ${event.id}`);

    try {
        // Check if this is a reservation event we handle
        const eventType = event.eventType as ReservationEventType;
        const notificationType = RESERVATION_EVENT_TYPES[eventType];

        if (!notificationType) {
            context.log(`Ignoring unhandled event type: ${event.eventType}`);
            return;
        }

        // Parse the event data
        const eventData = event.data as ReservationEventPayload;

        if (!eventData.userEmail) {
            context.warn(`Event ${event.id} missing userEmail, skipping notification`);
            return;
        }

        if (!eventData.reservationId) {
            context.warn(`Event ${event.id} missing reservationId, skipping notification`);
            return;
        }

        context.log(`Processing ${notificationType} for reservation ${eventData.reservationId}`);

        // Send the email notification
        const result = await sendReservationEmail(
            {
                emailSender: getEmailSender(),
                notificationRepo: getNotificationRepo(),
            },
            notificationType,
            eventData as ReservationEventData
        );

        if (result.success) {
            context.log(`Email sent successfully for event ${event.id}`);
        } else {
            context.error(`Failed to send email for event ${event.id}: ${result.error}`);
            // Note: We don't throw here to avoid retrying the event
            // The failed notification is recorded in the database for later retry
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        context.error(`Error processing reservation event: ${message}`);
        // Log but don't throw to prevent infinite retries
        // The event is considered processed even if email sending fails
    }
}

// Register the Event Grid trigger
app.eventGrid('reservationEventsHandler', {
    handler: handleReservationEvent,
});
