export class AppError extends Error {
  public readonly isOperational = true;

  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details: any = null,
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad Request', details: any = null) {
    super(400, message, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', details: any = null) {
    super(401, message, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden', details: any = null) {
    super(403, message, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Not Found', details: any = null) {
    super(404, message, details);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflict', details: any = null) {
    super(409, message, details);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Internal Server Error', details: any = null) {
    super(500, message, details);
  }
}
