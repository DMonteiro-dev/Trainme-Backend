import { IUserDocument } from '../../models/user.model.js';

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Request {
      user?: IUserDocument;
    }
  }
}
export {};
