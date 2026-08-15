import { Router } from 'express';
import { db } from '../db/index.js';
// Using hardcoded brands list for now as requested, or derive from products
import { ALL_BRANDS } from '../data/seed-data.js';

const router = Router();

router.get('/', async (req, res) => {
  // We can just return the pre-seeded brands list since brands aren't in a table yet.
  res.json(ALL_BRANDS);
});

export default router;
