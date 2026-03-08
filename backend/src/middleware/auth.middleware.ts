import { NextFunction, Request, Response } from 'express';
import admin from '../firebase/admin.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    [key: string]: unknown;
  };
}

// Shared auth middleware for Firebase ID token and session-cookie fallback.
export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = (req.headers.authorization || '') as string;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    (req as AuthenticatedRequest).user = decodedToken as AuthenticatedRequest['user'];
    return next();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('ID token verification failed:', message);

    try {
      const decodedToken = await admin
        .auth()
        .verifySessionCookie(token, true)
        .catch(() => {
          throw new Error('Not a session cookie');
        });
      (req as AuthenticatedRequest).user = decodedToken as AuthenticatedRequest['user'];
      return next();
    } catch (customError: unknown) {
      const customMessage = customError instanceof Error ? customError.message : String(customError);
      console.error('Session cookie verification also failed:', customMessage);
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
  }
};
