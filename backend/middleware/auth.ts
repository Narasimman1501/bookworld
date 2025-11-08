import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Use declaration merging to add the custom 'user' property to the Express Request type.
// This is the standard way to extend Express types and avoids TypeScript errors.
declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}

const protect = (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
      // 'req.user' is now a valid property.
      req.user = { id: decoded.id };
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export default protect;
