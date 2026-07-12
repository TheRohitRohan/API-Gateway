export class NotificationService {
  async sendEmail(to: string, subject: string, body: string) {
    return {
      type: 'email',
      to,
      subject,
      body,
      status: 'SENT',
      messageId: `msg-${Math.random().toString(36).substring(2, 11)}`,
      sentAt: new Date().toISOString(),
    };
  }

  async sendSms(to: string, message: string) {
    return {
      type: 'sms',
      to,
      message,
      status: 'SENT',
      messageId: `msg-${Math.random().toString(36).substring(2, 11)}`,
      sentAt: new Date().toISOString(),
    };
  }

  async sendPush(userId: string, title: string, body: string) {
    return {
      type: 'push',
      userId,
      title,
      body,
      status: 'SENT',
      messageId: `msg-${Math.random().toString(36).substring(2, 11)}`,
      sentAt: new Date().toISOString(),
    };
  }
}
