import { Router } from 'express';
import { db } from '../db/index.js';

const router = Router();

router.get('/', async (req, res) => {
  const allProducts = await db.query.products.findMany();
  // Extract unique categories
  const categoriesMap = new Map<string, any>();
  
  for (const p of allProducts) {
    if (!categoriesMap.has(p.category)) {
      categoriesMap.set(p.category, {
        id: categoriesMap.size + 1,
        title: p.category,
        image: p.image, // Use the first product's image as category image
        count: 1,
        slug: p.category.toLowerCase().replace(/\s+/g, '-')
      });
    } else {
      categoriesMap.get(p.category).count++;
    }
  }
  
  res.json(Array.from(categoriesMap.values()));
});

export default router;
