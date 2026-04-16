import { Request, Response } from 'express';
import { AuthService } from './auth_service';

const auth_service = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const user = await auth_service.register(req.body);
      res.status(201).json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const result = await auth_service.login(req.body);
      res.json(result);
    } catch (error: any) {
      res.status(401).json({ message: error.message });
    }
  }
}