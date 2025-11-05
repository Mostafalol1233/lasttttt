import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "SuperAdmin#2024$SecurePass!9x";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  return password === ADMIN_PASSWORD;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  console.log('[AUTH] Authorization header:', authHeader ? 'present' : 'missing');
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log('[AUTH] No Bearer token found');
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.substring(7);
  console.log('[AUTH] Token extracted, length:', token.length);
  
  const payload = verifyToken(token);
  console.log('[AUTH] Token verification result:', payload ? 'valid' : 'invalid');

  if (!payload) {
    return res.status(401).json({ error: "Invalid token" });
  }

  (req as any).user = payload;
  next();
}

export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  
  if (!user || user.role !== 'super_admin') {
    return res.status(403).json({ error: "Forbidden: Super Admin access required" });
  }
  
  next();
}

export function requireAdminOrTicketManager(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  
  if (!user || !['super_admin', 'admin', 'ticket_manager'].includes(user.role)) {
    return res.status(403).json({ error: "Forbidden: Admin access required" });
  }
  
  next();
}
