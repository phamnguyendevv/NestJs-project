import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: any; // Define `user` property in request
}
