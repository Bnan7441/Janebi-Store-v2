import { describe, it, expect } from 'vitest';
import {
  toPersianDigits,
  toEnglishDigits,
  normalizeIranianMobile,
  isValidIranianMobile,
  formatPrice
} from '../../src/lib/utils';

describe('Persian Utilities & Iranian Normalization Tests', () => {
  // -------------------------------------------------------------
  // toPersianDigits
  // -------------------------------------------------------------
  describe('toPersianDigits', () => {
    it('converts number primitives to Persian digits', () => {
      expect(toPersianDigits(0)).toBe('۰');
      expect(toPersianDigits(1234567890)).toBe('۱۲۳۴۵۶۷۸۹۰');
      expect(toPersianDigits(42)).toBe('۴۲');
    });

    it('converts string containing English digits to Persian digits', () => {
      expect(toPersianDigits('0123456789')).toBe('۰۱۲۳۴۵۶۷۸۹');
      expect(toPersianDigits('کد پیگیری: 98765')).toBe('کد پیگیری: ۹۸۷۶۵');
    });

    it('preserves non-digit Persian and Latin characters', () => {
      expect(toPersianDigits('تومان 50000')).toBe('تومان ۵۰۰۰۰');
      expect(toPersianDigits('iPhone 15 Pro')).toBe('iPhone ۱۵ Pro');
    });

    it('handles empty strings and falsy-like inputs', () => {
      expect(toPersianDigits('')).toBe('');
      expect(toPersianDigits(null as any)).toBe('');
      expect(toPersianDigits(undefined as any)).toBe('');
    });
  });

  // -------------------------------------------------------------
  // toEnglishDigits
  // -------------------------------------------------------------
  describe('toEnglishDigits', () => {
    it('converts Persian digits to English digits', () => {
      expect(toEnglishDigits('۰۱۲۳۴۵۶۷۸۹')).toBe('0123456789');
      expect(toEnglishDigits('۱۲۳۴۵')).toBe('12345');
    });

    it('converts Arabic Eastern digits to English digits', () => {
      expect(toEnglishDigits('٠١٢٣٤٥٦٧٨٩')).toBe('0123456789');
      expect(toEnglishDigits('١٢٣٤٥')).toBe('12345');
    });

    it('converts mixed Persian, Arabic, and English digits', () => {
      expect(toEnglishDigits('۰1٢3۴5٦7۸9')).toBe('0123456789');
    });

    it('preserves letters and symbols unchanged', () => {
      expect(toEnglishDigits('قیمت: ۵۰۰۰ تومان')).toBe('قیمت: 5000 تومان');
      expect(toEnglishDigits('TEL: ۰۹۱۲۳۴۵۶۷۸۹')).toBe('TEL: 09123456789');
    });

    it('handles empty and edge-case inputs gracefully', () => {
      expect(toEnglishDigits('')).toBe('');
      expect(toEnglishDigits(null as any)).toBe('');
      expect(toEnglishDigits(undefined as any)).toBe('');
    });
  });

  // -------------------------------------------------------------
  // normalizeIranianMobile
  // -------------------------------------------------------------
  describe('normalizeIranianMobile', () => {
    it('normalizes canonical 11-digit mobile starting with 09', () => {
      expect(normalizeIranianMobile('09123456789')).toBe('09123456789');
      expect(normalizeIranianMobile('09351112233')).toBe('09351112233');
    });

    it('normalizes Persian and Arabic Eastern digits', () => {
      expect(normalizeIranianMobile('۰۹۱۲۳۴۵۶۷۸۹')).toBe('09123456789');
      expect(normalizeIranianMobile('٠٩١٢٣٤٥٦٧٨٩')).toBe('09123456789');
      expect(normalizeIranianMobile('۰۹۳۵۱۱۱۲۲۳۳')).toBe('09351112233');
    });

    it('normalizes +98 international prefix', () => {
      expect(normalizeIranianMobile('+989123456789')).toBe('09123456789');
      expect(normalizeIranianMobile('+۹۸۹۱۲۳۴۵۶۷۸۹')).toBe('09123456789');
    });

    it('normalizes 0098 international prefix', () => {
      expect(normalizeIranianMobile('00989123456789')).toBe('09123456789');
      expect(normalizeIranianMobile('۰۰۹۸۹۱۲۳۴۵۶۷۸۹')).toBe('09123456789');
    });

    it('normalizes 98 prefix (12-digit number)', () => {
      expect(normalizeIranianMobile('989123456789')).toBe('09123456789');
    });

    it('normalizes 10-digit number missing leading 0', () => {
      expect(normalizeIranianMobile('9123456789')).toBe('09123456789');
      expect(normalizeIranianMobile('۹۱۲۳۴۵۶۷۸۹')).toBe('09123456789');
    });

    it('strips all delimiters, spaces, dashes, parentheses and slashes', () => {
      expect(normalizeIranianMobile('0912 345 6789')).toBe('09123456789');
      expect(normalizeIranianMobile('0912-345-6789')).toBe('09123456789');
      expect(normalizeIranianMobile('(0912) 345-6789')).toBe('09123456789');
      expect(normalizeIranianMobile('+98 (912) 345-6789')).toBe('09123456789');
      expect(normalizeIranianMobile('0912/345/6789')).toBe('09123456789');
      expect(normalizeIranianMobile('  09123456789  ')).toBe('09123456789');
    });

    it('handles empty and nullish inputs safely', () => {
      expect(normalizeIranianMobile('')).toBe('');
      expect(normalizeIranianMobile(null as any)).toBe('');
      expect(normalizeIranianMobile(undefined as any)).toBe('');
    });
  });

  // -------------------------------------------------------------
  // isValidIranianMobile
  // -------------------------------------------------------------
  describe('isValidIranianMobile', () => {
    it('returns true for valid mobile formats across representations', () => {
      expect(isValidIranianMobile('09123456789')).toBe(true);
      expect(isValidIranianMobile('09351234567')).toBe(true);
      expect(isValidIranianMobile('+989123456789')).toBe(true);
      expect(isValidIranianMobile('00989123456789')).toBe(true);
      expect(isValidIranianMobile('9123456789')).toBe(true);
      expect(isValidIranianMobile('۰۹۱۲۳۴۵۶۷۸۹')).toBe(true);
      expect(isValidIranianMobile('+۹۸ (۹۱۲) ۳۴۵-۶۷۸۹')).toBe(true);
    });

    it('returns false for invalid phone numbers', () => {
      expect(isValidIranianMobile('12345')).toBe(false);
      expect(isValidIranianMobile('08123456789')).toBe(false); // Non-09 prefix
      expect(isValidIranianMobile('02188776655')).toBe(false); // Landline
      expect(isValidIranianMobile('0912345678901')).toBe(false); // Too long
      expect(isValidIranianMobile('0912345')).toBe(false); // Too short
      expect(isValidIranianMobile('abcdefghijk')).toBe(false);
      expect(isValidIranianMobile('')).toBe(false);
    });
  });

  // -------------------------------------------------------------
  // formatPrice
  // -------------------------------------------------------------
  describe('formatPrice', () => {
    it('formats price with تومان suffix and locale separators', () => {
      const formatted = formatPrice(50000);
      expect(formatted).toContain('تومان');
      expect(formatted).toContain('۵۰');
    });

    it('formats large numbers correctly', () => {
      const formatted = formatPrice(15000000);
      expect(formatted).toContain('تومان');
    });

    it('formats zero correctly', () => {
      const formatted = formatPrice(0);
      expect(formatted).toContain('تومان');
      expect(formatted).toContain('۰');
    });
  });
});
