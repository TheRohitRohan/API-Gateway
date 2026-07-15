import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.js';

const token = jwt.sign(
    {
        id: '1',
        role: 'admin',
        name: 'Rohan',
    },
    jwtConfig.secret,
    {
        expiresIn: '1h',
    },
);

console.log(token);
