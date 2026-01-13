import { EmailSender } from '../domain/ports/email-sender';
import { NotificationRepo } from '../domain/repositories/notification-repo';
import { AcsEmailSender } from '../infra/adapters/acs-email-sender';
import { CosmosNotificationRepo } from '../infra/adapters/cosmos-notification-repo';

let cachedEmailSender: EmailSender | undefined;
let cachedNotificationRepo: NotificationRepo | undefined;

/**
 * Gets or creates a singleton EmailSender instance.
 *
 * Uses Azure Communication Services for email delivery.
 */
export const getEmailSender = (): EmailSender => {
    if (!cachedEmailSender) {
        const connectionString = process.env.ACS_CONNECTION_STRING || '';
        const senderAddress = process.env.ACS_SENDER_ADDRESS || '';

        if (!connectionString) {
            throw new Error('ACS_CONNECTION_STRING environment variable is required');
        }
        if (!senderAddress) {
            throw new Error('ACS_SENDER_ADDRESS environment variable is required');
        }

        cachedEmailSender = new AcsEmailSender({
            connectionString,
            senderAddress,
        });
    }
    return cachedEmailSender;
};

/**
 * Gets or creates a singleton NotificationRepo instance.
 *
 * Uses Cosmos DB for notification persistence.
 */
export const getNotificationRepo = (): NotificationRepo => {
    if (!cachedNotificationRepo) {
        const endpoint = process.env.COSMOS_ENDPOINT || '';
        const databaseId = process.env.COSMOS_NOTIFICATION_DATABASE_ID || 'notification-db';
        const containerId = process.env.COSMOS_NOTIFICATION_CONTAINER_ID || 'notifications';
        const key = process.env.COSMOS_KEY;

        if (!endpoint) {
            throw new Error('COSMOS_ENDPOINT environment variable is required');
        }

        cachedNotificationRepo = new CosmosNotificationRepo({
            endpoint,
            key,
            databaseId,
            containerId,
        });
    }
    return cachedNotificationRepo;
};
