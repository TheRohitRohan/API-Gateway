// types.ts
import { JwtPayload } from 'jsonwebtoken';
import { Role } from './roles.js';

export interface AuthUser {
    id: string;
    email: string;
    role: Role;
}

export interface AccessTokenPayload extends JwtPayload {
    userId: string;
    email: string;
    role: Role;
}
