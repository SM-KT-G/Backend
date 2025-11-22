import { Router, Request, Response } from 'express';

const router = Router();

// Example API routes
router.get('/users', (req: Request, res: Response) => {
  res.json({
    users: [
      { id: 1, name: 'User 1' },
      { id: 2, name: 'User 2' },
    ],
  });
});

router.post('/users', (req: Request, res: Response) => {
  const { name } = req.body;
  res.status(201).json({
    message: 'User created',
    user: { id: 3, name },
  });
});

router.get('/status', (requ:Request, res:Response) => {
  res.json({ status: 'OK' });
})

export default router;
