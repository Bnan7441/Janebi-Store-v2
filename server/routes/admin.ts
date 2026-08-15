import { Router } from 'express';
import { db } from '../db/index.js';
import { users, products, orders, reviews, coupons, productFeatures, cartItems, wishlistItems } from '../db/schema.js';
import { eq, desc, sql } from 'drizzle-orm';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Apply middleware to all admin routes
router.use(authenticate, requireAdmin);

// ---------------------------------------------------------
// STATS & DASHBOARD
// ---------------------------------------------------------
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = (await db.select({ count: sql<number>`count(*)` }).from(users))[0].count;
    const totalProducts = (await db.select({ count: sql<number>`count(*)` }).from(products))[0].count;
    
    // Total revenue (only for paid/processing/delivered orders)
    const revenueResult = await db.select({ total: sql<number>`sum(total)` }).from(orders).where(
      sql`status IN ('processing', 'shipped', 'delivered')`
    );
    const totalRevenue = revenueResult[0].total || 0;

    const totalOrders = (await db.select({ count: sql<number>`count(*)` }).from(orders))[0].count;

    // Recent orders
    const recentOrders = await db.query.orders.findMany({
      orderBy: [desc(orders.date)],
      limit: 5,
      with: { items: true }
    });

    res.json({
      metrics: {
        totalUsers,
        totalProducts,
        totalRevenue,
        totalOrders
      },
      recentOrders
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ---------------------------------------------------------
// USERS MANAGEMENT
// ---------------------------------------------------------
router.get('/users', async (req, res) => {
  try {
    const allUsers = await db.query.users.findMany({
      orderBy: [desc(users.joinedDate)]
    });
    
    // Omit passwords
    const safeUsers = allUsers.map(u => {
      const { password, ...rest } = u;
      return rest;
    });

    res.json(safeUsers);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    const { id } = req.params;

    if (!role || !['admin', 'user'].includes(role)) {
      return res.status(400).json({ error: 'نقش کاربر نامعتبر است', message: 'Invalid role' });
    }

    const [updated] = await db.update(users).set({ role }).where(eq(users.id, id)).returning();
    if (!updated) {
      return res.status(404).json({ error: 'کاربر یافت نشد', message: 'User not found' });
    }
    res.json({ message: 'User role updated successfully', user: updated });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ---------------------------------------------------------
// PRODUCTS MANAGEMENT
// ---------------------------------------------------------
router.post('/products', async (req, res) => {
  try {
    const { title, category, price, originalPrice, discount, image, brand, warranty, description, stockQuantity, sku } = req.body;
    
    if (!title || !category || price === undefined) {
      return res.status(400).json({ message: 'Title, category, and price are required' });
    }

    const [inserted] = await db.insert(products).values({
      title,
      category,
      price: parseInt(price) || 0,
      originalPrice: originalPrice ? parseInt(originalPrice) : null,
      discount: discount ? parseInt(discount) : 0,
      image: image || '/placeholder.png',
      brand: brand || 'متفرقه',
      warranty: warranty || null,
      description: description || null,
      stockQuantity: stockQuantity !== undefined ? parseInt(stockQuantity) : 10,
      sku: sku || `SKU-${Date.now()}`
    }).returning();

    res.status(201).json(inserted);
  } catch (error) {
    console.error('Add product error:', error);
    res.status(500).json({ message: 'خطای سرور در ایجاد محصول' });
  }
});

router.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, price, originalPrice, discount, image, brand, warranty, description, stockQuantity, sku } = req.body;
    
    const [updated] = await db.update(products).set({
      ...(title !== undefined && { title }),
      ...(category !== undefined && { category }),
      ...(price !== undefined && { price: parseInt(price) || 0 }),
      ...(originalPrice !== undefined && { originalPrice: originalPrice ? parseInt(originalPrice) : null }),
      ...(discount !== undefined && { discount: parseInt(discount) || 0 }),
      ...(image !== undefined && { image }),
      ...(brand !== undefined && { brand }),
      ...(warranty !== undefined && { warranty }),
      ...(description !== undefined && { description }),
      ...(stockQuantity !== undefined && { stockQuantity: parseInt(stockQuantity) || 0 }),
      ...(sku !== undefined && { sku })
    }).where(eq(products.id, parseInt(id))).returning();

    if (!updated) {
      return res.status(404).json({ error: 'محصول یافت نشد', message: 'محصول یافت نشد' });
    }

    res.json(updated);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'خطای سرور در ویرایش محصول' });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const prodId = parseInt(id);

    if (isNaN(prodId)) {
      return res.status(400).json({ error: 'شناسه محصول نامعتبر است', message: 'شناسه محصول نامعتبر است' });
    }

    const existing = await db.query.products.findFirst({
      where: eq(products.id, prodId)
    });
    if (!existing) {
      return res.status(404).json({ error: 'محصول یافت نشد', message: 'محصول یافت نشد' });
    }

    db.transaction((tx) => {
      tx.delete(productFeatures).where(eq(productFeatures.productId, prodId)).run();
      tx.delete(cartItems).where(eq(cartItems.productId, prodId)).run();
      tx.delete(wishlistItems).where(eq(wishlistItems.productId, prodId)).run();
      tx.delete(reviews).where(eq(reviews.productId, prodId)).run();
      tx.delete(products).where(eq(products.id, prodId)).run();
    });

    res.json({ message: 'محصول با موفقیت حذف شد' });
  } catch (error: any) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: error.message || 'خطای سرور در حذف محصول' });
  }
});

// ---------------------------------------------------------
// ORDERS MANAGEMENT
// ---------------------------------------------------------
router.get('/orders', async (req, res) => {
  try {
    const allOrders = await db.query.orders.findMany({
      orderBy: [desc(orders.date)],
      with: { items: true }
    });
    res.json(allOrders);
  } catch (error) {
    res.status(500).json({ message: 'خطای سرور در دریافت سفارشات' });
  }
});

router.put('/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, statusText } = req.body;
    
    const allowedStatuses = ['pending_payment', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'وضعیت سفارش نامعتبر است', message: 'وضعیت سفارش نامعتبر است' });
    }

    const defaultStatusTexts: Record<string, string> = {
      pending_payment: 'در انتظار پرداخت',
      processing: 'در حال پردازش',
      shipped: 'ارسال شده',
      delivered: 'تحویل داده شده',
      cancelled: 'لغو شده'
    };
    const textToSet = statusText || defaultStatusTexts[status] || status;

    const [updated] = await db.update(orders)
      .set({ status, statusText: textToSet })
      .where(eq(orders.id, id))
      .returning();
      
    if (!updated) {
      return res.status(404).json({ error: 'سفارش یافت نشد', message: 'سفارش یافت نشد' });
    }
    
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'خطای سرور در تغییر وضعیت سفارش' });
  }
});

// ---------------------------------------------------------
// COUPONS MANAGEMENT
// ---------------------------------------------------------
router.get('/coupons', async (req, res) => {
  try {
    const allCoupons = await db.select().from(coupons);
    res.json(allCoupons);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/coupons', async (req, res) => {
  try {
    const { code, percent, amount, minTotal, label, active } = req.body;
    if (!code || !label) {
      return res.status(400).json({ message: 'Code and label are required' });
    }

    const inserted = await db.insert(coupons).values({
      code: code.toUpperCase(),
      percent: percent ? parseInt(percent) : null,
      amount: amount ? parseInt(amount) : null,
      minTotal: minTotal ? parseInt(minTotal) : 0,
      label,
      active: active ?? true
    }).returning();

    res.status(201).json(inserted[0]);
  } catch (error) {
    console.error('Create coupon error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/coupons/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const upperCode = code.toUpperCase();
    const existing = await db.query.coupons.findFirst({
      where: eq(coupons.code, upperCode)
    });
    if (!existing) {
      return res.status(404).json({ error: 'کد تخفیف یافت نشد', message: 'Coupon not found' });
    }

    await db.delete(coupons).where(eq(coupons.code, upperCode));
    res.json({ message: 'کد تخفیف با موفقیت حذف شد' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
