import { Request } from 'express';
import { IUserDocument } from '../../models/user.model.js';

export interface AuthenticatedRequest extends Request {
  user?: IUserDocument;
}
