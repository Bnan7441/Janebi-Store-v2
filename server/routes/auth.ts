import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../validators/index.js';
import { db } from '../db/index.js';
import { users, addresses } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { env } from '../env.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Generate tokens
const generateTokens = (userId: string) => {
  const accessToken = jwt.sign({ userId }, env.JWT_ACCESS_SECRET, { expiresIn: '1d' });
  const refreshToken = jwt.sign({ userId }, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

router.post('/register', validate(registerSchema), async (req, res) => {
  const { name, phone, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.phone, phone)
    });

    if (existingUser) {
      return res.status(400).json({ message: 'کاربری با این شماره موبایل قبلا ثبت نام کرده است' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `usr-${Date.now()}`;
    const joinedDate = new Intl.DateTimeFormat("fa-IR").format(new Date());

    // Insert user
    await db.insert(users).values({
      id: userId,
      name,
      phone,
      password: hashedPassword,
      joinedDate,
      role: 'user',
      vipPoints: 0
    });

    const tokens = generateTokens(userId);

    res.status(201).json({
      message: 'ثبت نام با موفقیت انجام شد',
      user: { id: userId, name, phone, role: 'user', addresses: [] },
      ...tokens
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'خطای سرور' });
  }
});

router.post('/login', validate(loginSchema), async (req, res) => {
  const { phone, password } = req.body;

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.phone, phone)
    });

    if (!user) {
      return res.status(401).json({ message: 'شماره موبایل یا رمز عبور اشتباه است' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'شماره موبایل یا رمز عبور اشتباه است' });
    }

    const tokens = generateTokens(user.id);
    const { password: _, ...userWithoutPassword } = user;

    const userAddresses = await db.query.addresses.findMany({
      where: eq(addresses.userId, user.id)
    });

    res.json({
      message: 'ورود با موفقیت انجام شد',
      user: { ...userWithoutPassword, addresses: userAddresses },
      ...tokens
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'خطای سرور' });
  }
});

router.get('/me', authenticate, async (req: AuthRequest, res) => {
  const userAddresses = await db.query.addresses.findMany({
    where: eq(addresses.userId, req.user.id)
  });
  res.json({ user: { ...req.user, addresses: userAddresses } });
});

export default router;
