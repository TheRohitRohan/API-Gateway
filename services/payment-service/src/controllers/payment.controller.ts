import { FastifyRequest, FastifyReply } from 'fastify';
import { PaymentService } from '../services/payment.service.js';
import { ApiResponse } from '@microservices-demo/shared-types';

export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  processPayment = async (
    request: FastifyRequest<{ Body: any }>,
    reply: FastifyReply,
  ) => {
    const result = await this.paymentService.processPayment(request.body as any);
    const success = result.status === 'SUCCESS';
    const response: ApiResponse = {
      success,
      message: success ? 'Payment processed successfully' : 'Payment processing failed',
      data: result,
    };
    return reply.status(success ? 200 : 400).send(response);
  };

  getPaymentById = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) => {
    const result = await this.paymentService.getPaymentById(request.params.id);
    const response: ApiResponse = {
      success: true,
      message: 'Payment record retrieved successfully',
      data: result,
    };
    return reply.status(200).send(response);
  };

  refundPayment = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) => {
    const result = await this.paymentService.refundPayment(request.params.id);
    const response: ApiResponse = {
      success: true,
      message: 'Payment refunded successfully',
      data: result,
    };
    return reply.status(200).send(response);
  };
}
