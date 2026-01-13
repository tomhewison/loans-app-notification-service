import { NotificationType } from '../domain/entities/email-notification';

/**
 * Email template data for reservation-related emails.
 */
export type ReservationEmailData = {
    userEmail: string;
    reservationId: string;
    deviceName?: string;
    reservedAt?: string;
    expiresAt?: string;
    collectedAt?: string;
    returnDueAt?: string;
    returnedAt?: string;
};

export type EmailTemplate = {
    subject: string;
    htmlBody: string;
    textBody: string;
};

const APP_NAME = 'Device Loan System';
const SUPPORT_EMAIL = 'support@deviceloan.edu';

/**
 * Get email template for reservation created notification.
 */
export function getReservationCreatedEmail(data: ReservationEmailData): EmailTemplate {
    const subject = `${APP_NAME} - Your reservation is confirmed`;

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9fafb; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
    .highlight { background-color: #EEF2FF; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .btn { display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${APP_NAME}</h1>
    </div>
    <div class="content">
      <h2>Reservation Confirmed! 🎉</h2>
      <p>Your device reservation has been successfully created.</p>
      
      <div class="highlight">
        <p><strong>Reservation ID:</strong> ${data.reservationId}</p>
        ${data.deviceName ? `<p><strong>Device:</strong> ${data.deviceName}</p>` : ''}
        ${data.reservedAt ? `<p><strong>Reserved At:</strong> ${data.reservedAt}</p>` : ''}
        ${data.expiresAt ? `<p><strong>Collection Deadline:</strong> ${data.expiresAt}</p>` : ''}
      </div>
      
      <p><strong>Important:</strong> Please collect your device within 24 hours, or your reservation will expire.</p>
      
      <p>Visit the IT desk to collect your device. Don't forget to bring your student ID!</p>
    </div>
    <div class="footer">
      <p>If you have any questions, please contact us at ${SUPPORT_EMAIL}</p>
      <p>&copy; ${new Date().getFullYear()} ${APP_NAME}</p>
    </div>
  </div>
</body>
</html>`;

    const textBody = `
${APP_NAME} - Reservation Confirmed!

Your device reservation has been successfully created.

Reservation ID: ${data.reservationId}
${data.deviceName ? `Device: ${data.deviceName}` : ''}
${data.reservedAt ? `Reserved At: ${data.reservedAt}` : ''}
${data.expiresAt ? `Collection Deadline: ${data.expiresAt}` : ''}

Important: Please collect your device within 24 hours, or your reservation will expire.

Visit the IT desk to collect your device. Don't forget to bring your student ID!

If you have any questions, please contact us at ${SUPPORT_EMAIL}
`;

    return { subject, htmlBody, textBody };
}

/**
 * Get email template for device collected notification.
 */
export function getReservationCollectedEmail(data: ReservationEmailData): EmailTemplate {
    const subject = `${APP_NAME} - Device collected successfully`;

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #059669; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9fafb; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
    .highlight { background-color: #ECFDF5; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .warning { background-color: #FEF3C7; padding: 15px; border-radius: 8px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${APP_NAME}</h1>
    </div>
    <div class="content">
      <h2>Device Collected ✅</h2>
      <p>You have successfully collected your reserved device.</p>
      
      <div class="highlight">
        <p><strong>Reservation ID:</strong> ${data.reservationId}</p>
        ${data.deviceName ? `<p><strong>Device:</strong> ${data.deviceName}</p>` : ''}
        ${data.collectedAt ? `<p><strong>Collected At:</strong> ${data.collectedAt}</p>` : ''}
        ${data.returnDueAt ? `<p><strong>Return Due:</strong> ${data.returnDueAt}</p>` : ''}
      </div>
      
      <div class="warning">
        <p>⚠️ <strong>Remember:</strong> Please return the device by the due date to avoid late fees.</p>
      </div>
      
      <p>Take good care of the device and return it in the same condition you received it.</p>
    </div>
    <div class="footer">
      <p>If you have any questions, please contact us at ${SUPPORT_EMAIL}</p>
      <p>&copy; ${new Date().getFullYear()} ${APP_NAME}</p>
    </div>
  </div>
</body>
</html>`;

    const textBody = `
${APP_NAME} - Device Collected

You have successfully collected your reserved device.

Reservation ID: ${data.reservationId}
${data.deviceName ? `Device: ${data.deviceName}` : ''}
${data.collectedAt ? `Collected At: ${data.collectedAt}` : ''}
${data.returnDueAt ? `Return Due: ${data.returnDueAt}` : ''}

Remember: Please return the device by the due date to avoid late fees.

Take good care of the device and return it in the same condition you received it.

If you have any questions, please contact us at ${SUPPORT_EMAIL}
`;

    return { subject, htmlBody, textBody };
}

/**
 * Get email template for device returned notification.
 */
export function getReservationReturnedEmail(data: ReservationEmailData): EmailTemplate {
    const subject = `${APP_NAME} - Device returned - Thank you!`;

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #2563EB; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9fafb; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
    .highlight { background-color: #EFF6FF; padding: 15px; border-radius: 8px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${APP_NAME}</h1>
    </div>
    <div class="content">
      <h2>Device Returned 🙏</h2>
      <p>Thank you for returning your device!</p>
      
      <div class="highlight">
        <p><strong>Reservation ID:</strong> ${data.reservationId}</p>
        ${data.deviceName ? `<p><strong>Device:</strong> ${data.deviceName}</p>` : ''}
        ${data.returnedAt ? `<p><strong>Returned At:</strong> ${data.returnedAt}</p>` : ''}
      </div>
      
      <p>Your loan has been completed. Feel free to reserve another device whenever you need one!</p>
    </div>
    <div class="footer">
      <p>If you have any questions, please contact us at ${SUPPORT_EMAIL}</p>
      <p>&copy; ${new Date().getFullYear()} ${APP_NAME}</p>
    </div>
  </div>
</body>
</html>`;

    const textBody = `
${APP_NAME} - Device Returned

Thank you for returning your device!

Reservation ID: ${data.reservationId}
${data.deviceName ? `Device: ${data.deviceName}` : ''}
${data.returnedAt ? `Returned At: ${data.returnedAt}` : ''}

Your loan has been completed. Feel free to reserve another device whenever you need one!

If you have any questions, please contact us at ${SUPPORT_EMAIL}
`;

    return { subject, htmlBody, textBody };
}

/**
 * Get email template for reservation cancelled notification.
 */
export function getReservationCancelledEmail(data: ReservationEmailData): EmailTemplate {
    const subject = `${APP_NAME} - Reservation cancelled`;

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #6B7280; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9fafb; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
    .highlight { background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${APP_NAME}</h1>
    </div>
    <div class="content">
      <h2>Reservation Cancelled</h2>
      <p>Your device reservation has been cancelled.</p>
      
      <div class="highlight">
        <p><strong>Reservation ID:</strong> ${data.reservationId}</p>
        ${data.deviceName ? `<p><strong>Device:</strong> ${data.deviceName}</p>` : ''}
      </div>
      
      <p>If this was a mistake or you need to reserve another device, you can create a new reservation anytime.</p>
    </div>
    <div class="footer">
      <p>If you have any questions, please contact us at ${SUPPORT_EMAIL}</p>
      <p>&copy; ${new Date().getFullYear()} ${APP_NAME}</p>
    </div>
  </div>
</body>
</html>`;

    const textBody = `
${APP_NAME} - Reservation Cancelled

Your device reservation has been cancelled.

Reservation ID: ${data.reservationId}
${data.deviceName ? `Device: ${data.deviceName}` : ''}

If this was a mistake or you need to reserve another device, you can create a new reservation anytime.

If you have any questions, please contact us at ${SUPPORT_EMAIL}
`;

    return { subject, htmlBody, textBody };
}

/**
 * Get email template for reservation expired notification.
 */
export function getReservationExpiredEmail(data: ReservationEmailData): EmailTemplate {
    const subject = `${APP_NAME} - Reservation expired`;

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #DC2626; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9fafb; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
    .highlight { background-color: #FEF2F2; padding: 15px; border-radius: 8px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${APP_NAME}</h1>
    </div>
    <div class="content">
      <h2>Reservation Expired ⏰</h2>
      <p>Unfortunately, your device reservation has expired because it was not collected within the 24-hour window.</p>
      
      <div class="highlight">
        <p><strong>Reservation ID:</strong> ${data.reservationId}</p>
        ${data.deviceName ? `<p><strong>Device:</strong> ${data.deviceName}</p>` : ''}
        ${data.expiresAt ? `<p><strong>Expired At:</strong> ${data.expiresAt}</p>` : ''}
      </div>
      
      <p>The device is now available for other students to reserve. If you still need the device, please create a new reservation.</p>
    </div>
    <div class="footer">
      <p>If you have any questions, please contact us at ${SUPPORT_EMAIL}</p>
      <p>&copy; ${new Date().getFullYear()} ${APP_NAME}</p>
    </div>
  </div>
</body>
</html>`;

    const textBody = `
${APP_NAME} - Reservation Expired

Unfortunately, your device reservation has expired because it was not collected within the 24-hour window.

Reservation ID: ${data.reservationId}
${data.deviceName ? `Device: ${data.deviceName}` : ''}
${data.expiresAt ? `Expired At: ${data.expiresAt}` : ''}

The device is now available for other students to reserve. If you still need the device, please create a new reservation.

If you have any questions, please contact us at ${SUPPORT_EMAIL}
`;

    return { subject, htmlBody, textBody };
}

/**
 * Get email template for overdue device reminder.
 */
export function getReservationOverdueEmail(data: ReservationEmailData): EmailTemplate {
    const subject = `${APP_NAME} - ⚠️ URGENT: Device return overdue`;

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #DC2626; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9fafb; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
    .highlight { background-color: #FEF2F2; padding: 15px; border-radius: 8px; margin: 15px 0; border: 2px solid #DC2626; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ URGENT</h1>
    </div>
    <div class="content">
      <h2>Device Return Overdue!</h2>
      <p>Your device loan is <strong>overdue</strong>. Please return the device as soon as possible.</p>
      
      <div class="highlight">
        <p><strong>Reservation ID:</strong> ${data.reservationId}</p>
        ${data.deviceName ? `<p><strong>Device:</strong> ${data.deviceName}</p>` : ''}
        ${data.returnDueAt ? `<p><strong>Was Due:</strong> ${data.returnDueAt}</p>` : ''}
      </div>
      
      <p><strong>Please return the device immediately to avoid any penalties.</strong></p>
      
      <p>If you are experiencing difficulties returning the device, please contact the IT desk immediately.</p>
    </div>
    <div class="footer">
      <p>Contact us at ${SUPPORT_EMAIL}</p>
      <p>&copy; ${new Date().getFullYear()} ${APP_NAME}</p>
    </div>
  </div>
</body>
</html>`;

    const textBody = `
${APP_NAME} - URGENT: Device Return Overdue!

Your device loan is OVERDUE. Please return the device as soon as possible.

Reservation ID: ${data.reservationId}
${data.deviceName ? `Device: ${data.deviceName}` : ''}
${data.returnDueAt ? `Was Due: ${data.returnDueAt}` : ''}

Please return the device immediately to avoid any penalties.

If you are experiencing difficulties returning the device, please contact the IT desk immediately.

Contact us at ${SUPPORT_EMAIL}
`;

    return { subject, htmlBody, textBody };
}

/**
 * Get the appropriate email template for a notification type.
 */
export function getEmailTemplate(type: NotificationType, data: ReservationEmailData): EmailTemplate {
    switch (type) {
        case NotificationType.ReservationCreated:
            return getReservationCreatedEmail(data);
        case NotificationType.ReservationCollected:
            return getReservationCollectedEmail(data);
        case NotificationType.ReservationReturned:
            return getReservationReturnedEmail(data);
        case NotificationType.ReservationCancelled:
            return getReservationCancelledEmail(data);
        case NotificationType.ReservationExpired:
            return getReservationExpiredEmail(data);
        case NotificationType.ReservationOverdue:
            return getReservationOverdueEmail(data);
        default:
            throw new Error(`Unknown notification type: ${type}`);
    }
}
