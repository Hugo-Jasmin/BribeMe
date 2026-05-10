import { customAlphabet } from "nanoid";

const id = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 12);
const coupon = customAlphabet("23456789ABCDEFGHJKLMNPQRSTUVWXYZ", 8);

export function createId(prefix: string) {
  return `${prefix}_${id()}`;
}

export function createCouponCode() {
  return `BRIBE-${coupon()}`;
}

export function slugify(input: string) {
  const slug = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || `venue-${id()}`;
}
