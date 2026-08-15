import { Router } from 'express';

const router = Router();

router.post('/', (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'نام، ایمیل و پیام الزامی است' });
  }

  // In a real application, you would send an email or store this in a database
  console.log('Received contact message:', { name, email, phone, subject, message });

  res.status(200).json({ message: 'پیام شما با موفقیت ارسال شد. به زودی با شما تماس خواهیم گرفت.' });
});

export default router;
