export type UserRole = 'admin' | 'customer';

export interface JwtPayload {
    userId: string;
    email: string;
    role: UserRole;
}

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T | null;
}

export interface PaginationMetadata {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface PaginatedData<T> {
    items: T[];
    meta: PaginationMetadata;
}

export type PaginatedResponse<T> = ApiResponse<PaginatedData<T>>;
