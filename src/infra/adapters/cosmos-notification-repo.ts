import { CosmosClient, Database, Container, SqlQuerySpec } from '@azure/cosmos';
import { DefaultAzureCredential } from '@azure/identity';
import { EmailNotification, NotificationStatus } from '../../domain/entities/email-notification';
import { NotificationRepo } from '../../domain/repositories/notification-repo';
import { logger, createLogger } from '../logging/logger';
import type { Logger } from '../logging/logger';

export type CosmosNotificationRepoOptions = {
    endpoint: string;
    key?: string;
    databaseId: string;
    containerId: string;
};

type NotificationDocument = {
    id: string;
    userId: string;
    userEmail: string;
    type: string;
    subject: string;
    htmlBody: string;
    textBody?: string;
    status: NotificationStatus;
    reservationId: string;
    createdAt: string; // ISO string
    sentAt?: string; // ISO string
    failureReason?: string;
    retryCount: number;
    updatedAt: string; // ISO string
};

export class CosmosNotificationRepo implements NotificationRepo {
    private readonly client: CosmosClient;
    private readonly database: Database;
    private readonly container: Container;
    private readonly log: Logger;

    constructor(private readonly options: CosmosNotificationRepoOptions) {
        this.log = createLogger({
            component: 'CosmosNotificationRepo',
            database: options.databaseId,
            container: options.containerId,
        });

        this.log.info('Initializing CosmosNotificationRepo', {
            endpoint: options.endpoint,
            authMethod: options.key ? 'key' : 'managed-identity',
        });

        if (options.key) {
            this.client = new CosmosClient({ endpoint: options.endpoint, key: options.key });
        } else {
            this.client = new CosmosClient({ endpoint: options.endpoint, aadCredentials: new DefaultAzureCredential() });
        }
        this.database = this.client.database(options.databaseId);
        this.container = this.database.container(options.containerId);

        this.log.info('CosmosNotificationRepo initialized successfully');
    }

    public async getById(id: string): Promise<EmailNotification | null> {
        const startTime = Date.now();
        this.log.debug('Getting notification by ID', { notificationId: id });

        try {
            const { resource } = await this.container.item(id, id).read<NotificationDocument>();
            const duration = Date.now() - startTime;

            if (!resource) {
                this.log.debug('Notification not found', { notificationId: id, durationMs: duration });
                return null;
            }

            this.log.debug('Notification retrieved successfully', { notificationId: id, durationMs: duration });
            return this.mapToDomain(resource);
        } catch (error) {
            if (this.isNotFound(error)) {
                const duration = Date.now() - startTime;
                this.log.debug('Notification not found (404)', { notificationId: id, durationMs: duration });
                return null;
            }

            const duration = Date.now() - startTime;
            this.log.error('Failed to get notification by ID', error as Error, { notificationId: id, durationMs: duration });
            throw this.wrapError('Failed to get EmailNotification by id', error);
        }
    }

    public async listByUserId(userId: string): Promise<EmailNotification[]> {
        const startTime = Date.now();
        this.log.debug('Listing notifications by user', { userId });

        try {
            const query: SqlQuerySpec = {
                query: 'SELECT * FROM c WHERE c.userId = @userId ORDER BY c.createdAt DESC',
                parameters: [{ name: '@userId', value: userId }],
            };
            const { resources } = await this.container.items.query<NotificationDocument>(query).fetchAll();
            const duration = Date.now() - startTime;
            const count = resources?.length ?? 0;

            this.log.debug('User notifications retrieved', { userId, durationMs: duration, count });

            return (resources ?? []).map((doc) => this.mapToDomain(doc));
        } catch (error) {
            const duration = Date.now() - startTime;
            this.log.error('Failed to list notifications by user', error as Error, { userId, durationMs: duration });
            throw this.wrapError('Failed to list EmailNotifications by userId', error);
        }
    }

    public async listByStatus(status: NotificationStatus): Promise<EmailNotification[]> {
        const startTime = Date.now();
        this.log.debug('Listing notifications by status', { status });

        try {
            const query: SqlQuerySpec = {
                query: 'SELECT * FROM c WHERE c.status = @status ORDER BY c.createdAt DESC',
                parameters: [{ name: '@status', value: status }],
            };
            const { resources } = await this.container.items.query<NotificationDocument>(query).fetchAll();
            const duration = Date.now() - startTime;
            const count = resources?.length ?? 0;

            this.log.debug('Notifications by status retrieved', { status, durationMs: duration, count });

            return (resources ?? []).map((doc) => this.mapToDomain(doc));
        } catch (error) {
            const duration = Date.now() - startTime;
            this.log.error('Failed to list notifications by status', error as Error, { status, durationMs: duration });
            throw this.wrapError('Failed to list EmailNotifications by status', error);
        }
    }

    public async listPending(): Promise<EmailNotification[]> {
        return this.listByStatus(NotificationStatus.Pending);
    }

    public async save(notification: EmailNotification): Promise<EmailNotification> {
        const startTime = Date.now();
        this.log.debug('Saving notification', {
            notificationId: notification.id,
            userId: notification.userId,
            type: notification.type,
            status: notification.status,
        });

        try {
            const document = this.mapToDocument(notification);
            const { resource } = await this.container.items.upsert<NotificationDocument>(document);
            const duration = Date.now() - startTime;

            if (!resource) {
                this.log.error('Upsert returned no resource', new Error('No resource returned'), { notificationId: notification.id });
                throw new Error('Upsert returned no resource');
            }

            this.log.info('Notification saved', {
                notificationId: notification.id,
                status: notification.status,
                userId: notification.userId,
                durationMs: duration,
            });

            return this.mapToDomain(resource);
        } catch (error) {
            const duration = Date.now() - startTime;
            this.log.error('Failed to save notification', error as Error, { notificationId: notification.id, durationMs: duration });
            throw this.wrapError('Failed to save EmailNotification', error);
        }
    }

    public async delete(id: string): Promise<void> {
        const startTime = Date.now();
        this.log.debug('Deleting notification', { notificationId: id });

        try {
            await this.container.item(id, id).delete();
            const duration = Date.now() - startTime;

            this.log.info('Notification deleted', { notificationId: id, durationMs: duration });
        } catch (error) {
            const duration = Date.now() - startTime;

            if (this.isNotFound(error)) {
                this.log.debug('Notification not found for deletion (idempotent)', { notificationId: id, durationMs: duration });
                return; // idempotent delete
            }

            this.log.error('Failed to delete notification', error as Error, { notificationId: id, durationMs: duration });
            throw this.wrapError('Failed to delete EmailNotification', error);
        }
    }

    private mapToDocument(notification: EmailNotification): NotificationDocument {
        return {
            id: notification.id,
            userId: notification.userId,
            userEmail: notification.userEmail,
            type: notification.type,
            subject: notification.subject,
            htmlBody: notification.htmlBody,
            textBody: notification.textBody,
            status: notification.status,
            reservationId: notification.reservationId,
            createdAt: notification.createdAt.toISOString(),
            sentAt: notification.sentAt?.toISOString(),
            failureReason: notification.failureReason,
            retryCount: notification.retryCount,
            updatedAt: notification.updatedAt.toISOString(),
        };
    }

    private mapToDomain(document: NotificationDocument): EmailNotification {
        const createdAt = new Date(document.createdAt);
        if (Number.isNaN(createdAt.getTime())) {
            throw new Error(`Invalid createdAt value from Cosmos DB: ${document.createdAt}`);
        }

        const updatedAt = new Date(document.updatedAt);
        if (Number.isNaN(updatedAt.getTime())) {
            throw new Error(`Invalid updatedAt value from Cosmos DB: ${document.updatedAt}`);
        }

        return {
            id: document.id,
            userId: document.userId,
            userEmail: document.userEmail,
            type: document.type as EmailNotification['type'],
            subject: document.subject,
            htmlBody: document.htmlBody,
            textBody: document.textBody,
            status: document.status,
            reservationId: document.reservationId,
            createdAt,
            sentAt: document.sentAt ? new Date(document.sentAt) : undefined,
            failureReason: document.failureReason,
            retryCount: document.retryCount,
            updatedAt,
        };
    }

    private wrapError(message: string, error: unknown): Error {
        if (error instanceof Error) {
            return new Error(`${message}: ${error.message}`);
        }
        return new Error(`${message}: ${String(error)}`);
    }

    private isNotFound(error: unknown): boolean {
        const anyErr = error as { code?: number; statusCode?: number } | undefined;
        const code = anyErr?.code ?? anyErr?.statusCode;
        return code === 404;
    }
}
