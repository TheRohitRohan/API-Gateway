import { FastifyRequest, FastifyReply } from 'fastify';
import { NotificationService } from '../services/notification.service.js';
import { ApiResponse } from '@microservices-demo/shared-types';

export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  sendEmail = async (
    request: FastifyRequest<{ Body: any }>,
    reply: FastifyReply,
  ) => {
    const { to, subject, body } = request.body as any;
    const result = await this.notificationService.sendEmail(to, subject, body);
    
    request.log.info({ notification: result }, 'Email notification dispatched');

    const response: ApiResponse = {
      success: true,
      message: 'Email notification sent successfully (mocked)',
      data: result,
    };
    return reply.status(200).send(response);
  };

  sendSms = async (
    request: FastifyRequest<{ Body: any }>,
    reply: FastifyReply,
  ) => {
    const { to, message } = request.body as any;
    const result = await this.notificationService.sendSms(to, message);

    request.log.info({ notification: result }, 'SMS notification dispatched');

    const response: ApiResponse = {
      success: true,
      message: 'SMS notification sent successfully (mocked)',
      data: result,
    };
    return reply.status(200).send(response);
  };

  sendPush = async (
    request: FastifyRequest<{ Body: any }>,
    reply: FastifyReply,
  ) => {
    const { userId, title, body } = request.body as any;
    const result = await this.notificationService.sendPush(userId, title, body);

    request.log.info({ notification: result }, 'Push notification dispatched');

    const response: ApiResponse = {
      success: true,
      message: 'Push notification sent successfully (mocked)',
      data: result,
    };
    return reply.status(200).send(response);
  };
}
