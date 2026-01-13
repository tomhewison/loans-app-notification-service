import { EmailNotification, NotificationStatus } from '../entities/email-notification';

/**
 * Repository interface for EmailNotification persistence operations.
 *
 * This interface defines the contract for data access operations on EmailNotification entities,
 * following the Repository pattern to abstract data persistence concerns from business logic.
 *
 * Implementations should handle:
 * - Data mapping between domain objects and persistence format
 * - Error handling and wrapping infrastructure errors
 * - Connection management and resource cleanup
 */
export interface NotificationRepo {
    /**
     * Retrieves an EmailNotification by its unique identifier.
     *
     * @param id - The unique identifier of the notification
     * @returns Promise resolving to the EmailNotification if found, null otherwise
     * @throws Error if the operation fails due to infrastructure issues
     */
    getById(id: string): Promise<EmailNotification | null>;

    /**
     * Retrieves EmailNotification entities for a specific user.
     *
     * @param userId - The user ID to filter by
     * @returns Promise resolving to an array of EmailNotification entities for the user
     * @throws Error if the operation fails due to infrastructure issues
     */
    listByUserId(userId: string): Promise<EmailNotification[]>;

    /**
     * Retrieves EmailNotification entities filtered by status.
     *
     * @param status - The NotificationStatus to filter by
     * @returns Promise resolving to an array of EmailNotification entities matching the status
     * @throws Error if the operation fails due to infrastructure issues
     */
    listByStatus(status: NotificationStatus): Promise<EmailNotification[]>;

    /**
     * Retrieves pending notifications for retry processing.
     *
     * @returns Promise resolving to an array of pending EmailNotification entities
     * @throws Error if the operation fails due to infrastructure issues
     */
    listPending(): Promise<EmailNotification[]>;

    /**
     * Saves an EmailNotification entity (create or update).
     *
     * @param notification - The EmailNotification entity to save
     * @returns Promise resolving to the saved EmailNotification entity
     * @throws Error if the operation fails due to infrastructure issues
     */
    save(notification: EmailNotification): Promise<EmailNotification>;

    /**
     * Deletes an EmailNotification by its unique identifier.
     *
     * @param id - The unique identifier of the notification to delete
     * @returns Promise resolving when deletion is complete
     * @throws Error if the operation fails due to infrastructure issues
     */
    delete(id: string): Promise<void>;
}
