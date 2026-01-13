/**
 * EmailNotification entity representing an email notification sent to a user.
 *
 * Business Rules:
 * - Notifications are triggered by reservation events
 * - Each notification tracks its send status
 * - Failed notifications can be retried
 */
export type EmailNotification = {
    id: string;
    userId: string;
    userEmail: string;
    type: NotificationType;
    subject: string;
    htmlBody: string;
    textBody?: string;
    status: NotificationStatus;
    reservationId: string;
    createdAt: Date;
    sentAt?: Date;
    failureReason?: string;
    retryCount: number;
    updatedAt: Date;
};

/**
 * Types of notifications that can be sent
 */
export enum NotificationType {
    ReservationCreated = 'ReservationCreated',
    ReservationCollected = 'ReservationCollected',
    ReservationReturned = 'ReservationReturned',
    ReservationCancelled = 'ReservationCancelled',
    ReservationExpired = 'ReservationExpired',
    ReservationOverdue = 'ReservationOverdue',
}

/**
 * Notification send status
 */
export enum NotificationStatus {
    Pending = 'Pending',
    Sent = 'Sent',
    Failed = 'Failed',
}

export type CreateEmailNotificationParams = {
    id: string;
    userId: string;
    userEmail: string;
    type: NotificationType;
    subject: string;
    htmlBody: string;
    textBody?: string;
    reservationId: string;
};

export class NotificationError extends Error {
    constructor(public field: string, message: string) {
        super(message);
        this.name = 'NotificationError';
    }
}

const validateCreateEmailNotification = (params: CreateEmailNotificationParams): void => {
    if (!params.id || typeof params.id !== 'string' || params.id.trim() === '') {
        throw new NotificationError('id', 'Notification id must be a non-empty string.');
    }

    if (!params.userId || typeof params.userId !== 'string' || params.userId.trim() === '') {
        throw new NotificationError('userId', 'Notification userId must be a non-empty string.');
    }

    if (!params.userEmail || typeof params.userEmail !== 'string' || params.userEmail.trim() === '') {
        throw new NotificationError('userEmail', 'Notification userEmail must be a non-empty string.');
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(params.userEmail.trim())) {
        throw new NotificationError('userEmail', 'Notification userEmail must be a valid email address.');
    }

    if (!params.subject || typeof params.subject !== 'string' || params.subject.trim() === '') {
        throw new NotificationError('subject', 'Notification subject must be a non-empty string.');
    }

    if (!params.htmlBody || typeof params.htmlBody !== 'string' || params.htmlBody.trim() === '') {
        throw new NotificationError('htmlBody', 'Notification htmlBody must be a non-empty string.');
    }

    if (!params.reservationId || typeof params.reservationId !== 'string' || params.reservationId.trim() === '') {
        throw new NotificationError('reservationId', 'Notification reservationId must be a non-empty string.');
    }

    if (!Object.values(NotificationType).includes(params.type)) {
        throw new NotificationError('type', `Notification type must be one of: ${Object.values(NotificationType).join(', ')}`);
    }
};

/**
 * Creates a new email notification with initial pending status.
 *
 * @param params - The parameters for creating the notification
 * @returns A new EmailNotification entity with Pending status
 */
export function createEmailNotification(params: CreateEmailNotificationParams): EmailNotification {
    validateCreateEmailNotification(params);

    const now = new Date();

    return {
        id: params.id.trim(),
        userId: params.userId.trim(),
        userEmail: params.userEmail.trim().toLowerCase(),
        type: params.type,
        subject: params.subject.trim(),
        htmlBody: params.htmlBody,
        textBody: params.textBody?.trim(),
        status: NotificationStatus.Pending,
        reservationId: params.reservationId.trim(),
        createdAt: now,
        retryCount: 0,
        updatedAt: now,
    };
}

/**
 * Marks a notification as successfully sent.
 *
 * @param notification - The notification to mark as sent
 * @returns Updated EmailNotification entity with Sent status
 */
export function markNotificationSent(notification: EmailNotification): EmailNotification {
    const now = new Date();

    return {
        ...notification,
        status: NotificationStatus.Sent,
        sentAt: now,
        updatedAt: now,
    };
}

/**
 * Marks a notification as failed with a reason.
 *
 * @param notification - The notification to mark as failed
 * @param reason - The failure reason
 * @returns Updated EmailNotification entity with Failed status
 */
export function markNotificationFailed(notification: EmailNotification, reason: string): EmailNotification {
    const now = new Date();

    return {
        ...notification,
        status: NotificationStatus.Failed,
        failureReason: reason,
        retryCount: notification.retryCount + 1,
        updatedAt: now,
    };
}
