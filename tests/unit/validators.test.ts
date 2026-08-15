import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema, addressSchema, cartItemSchema } from '../../server/validators/index';

describe('Zod Validation Schemas Unit Tests', () => {
  it('registerSchema accepts valid registration payload', () => {
    const validPayload = {
      body: {
        name: 'علی رضایی',
        phone: '09121234567',
        password: 'password123'
      }
    };
    const result = registerSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('registerSchema rejects invalid phone and short password', () => {
    const invalidPayload = {
      body: {
        name: 'ا',
        phone: '12345',
        password: '123'
      }
    };
    const result = registerSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });

  it('loginSchema accepts valid mobile format', () => {
    const validPayload = {
      body: {
        phone: '09351234567',
        password: 'myPassword'
      }
    };
    const result = loginSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('cartItemSchema enforces positive quantity and max limit', () => {
    const valid = cartItemSchema.safeParse({ body: { productId: 1, quantity: 2 } });
    expect(valid.success).toBe(true);

    const invalidMax = cartItemSchema.safeParse({ body: { productId: 1, quantity: 99 } });
    expect(invalidMax.success).toBe(false);
  });

  it('addressSchema validates required Iranian address fields', () => {
    const validAddress = {
      body: {
        title: 'خانه',
        name: 'علی رضایی',
        phone: '09121234567',
        province: 'تهران',
        city: 'تهران',
        address: 'خیابان ولیعصر کوچه اول پلاک ۱۰'
      }
    };
    const result = addressSchema.safeParse(validAddress);
    expect(result.success).toBe(true);
  });
});
