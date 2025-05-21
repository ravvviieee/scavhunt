import { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import { storage } from './storage';
import * as bcrypt from 'bcrypt';
import connectPgSimple from 'connect-pg-simple';
import { pool } from './db';

declare module 'express-session' {
  interface SessionData {
    userId?: number;
    isAdmin?: boolean;
  }
}

// Session configuration
export const configureSession = (app: any) => {
  const PgSession = connectPgSimple(session);
  
  app.use(
    session({
      store: new PgSession({
        pool,
        tableName: 'sessions',
        createTableIfMissing: true
      }),
      secret: process.env.SESSION_SECRET || 'scavenger-hunt-secret',
      resave: false,
      saveUninitialized: false,
      cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      }
    })
  );
};

// Middleware to check if user is authenticated
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized: Please log in' });
  }
};

// Middleware to check if user is admin
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.session.userId && req.session.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Admin access required' });
  }
};

// Login function
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Special admin login for demo purposes
    if (username === 'admin' && password === 'admin123') {
      // Create a temporary admin user
      const adminUser = {
        id: 999,
        username: 'admin',
        isAdmin: true
      };

      // Set session data
      req.session.userId = adminUser.id;
      req.session.isAdmin = adminUser.isAdmin;

      return res.status(200).json(adminUser);
    }

    // For all other users, register on the fly
    let user = await storage.getUserByUsername(username);
    
    if (!user) {
      // Create a new user with whatever credentials they provided
      try {
        user = await storage.createUser({
          username,
          password,
          isAdmin: false
        });
      } catch (error) {
        console.error("Error creating user:", error);
        return res.status(500).json({ message: 'Error creating account' });
      }
    } else {
      // For existing users, perform password check
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    }

    // Set session data
    req.session.userId = user.id;
    req.session.isAdmin = user.isAdmin;

    return res.status(200).json({ 
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Error during login' });
  }
};

// Register function
export const register = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Check if username already exists
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    // Create user
    const user = await storage.createUser({
      username,
      password,
      isAdmin: false // Default to regular user
    });

    // Set session data
    req.session.userId = user.id;
    req.session.isAdmin = user.isAdmin;

    return res.status(201).json({
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Error during registration' });
  }
};

// Logout function
export const logout = (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ message: 'Error during logout' });
    }
    res.clearCookie('connect.sid');
    return res.status(200).json({ message: 'Logged out successfully' });
  });
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({ message: 'User not found' });
    }

    return res.status(200).json({
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({ message: 'Error retrieving user' });
  }
};