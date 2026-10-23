import type { Property } from '../types';

export type ListingDraft = {
  id: string; property: Property; sourceUrl: string; contactName: string;
  contactPhone: string; notes: string; available: boolean; lastVerified: string;
};
export const newDraft = (): ListingDraft => ({ id: crypto.randomUUID(), property: {
  id: '', title: '', price: 0, type: 'Villa', listingType: 'Buy', city: 'الرياض', district: '', area: 0,
  highlights: [], images: []
}, sourceUrl: '', contactName: '', contactPhone: '', notes: '', available: true, lastVerified: '' });

export function validationErrors(draft: ListingDraft): string[] {
  const p = draft.property, errors: string[] = [];
  if (!p.title?.trim()) errors.push('عنوان العقار مطلوب');
  if (!p.city?.trim() || !p.district?.trim()) errors.push('المدينة والحي مطلوبان');
  if (!Number.isFinite(p.price) || p.price <= 0) errors.push('السعر يجب أن يكون أكبر من صفر');
  if (!Number.isFinite(p.area) || p.area <= 0) errors.push('المساحة يجب أن تكون أكبر من صفر');
  if (!['Villa','Apartment','Land','Townhouse','Office'].includes(p.type)) errors.push('نوع العقار غير صالح');
  if (!['Buy','Rent'].includes(p.listingType)) errors.push('نوع العرض غير صالح');
  for (const key of ['beds','baths'] as const) if (p[key] !== undefined && (!Number.isInteger(p[key]) || p[key]! < 0)) errors.push('عدد الغرف ودورات المياه يجب أن يكون صحيحًا وغير سالب');
  if (!draft.available) errors.push('العقار غير متاح');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.lastVerified) || draft.lastVerified > new Date().toISOString().slice(0,10)) errors.push('حدد تاريخ تحقق صحيحًا لا يتجاوز اليوم');
  if (draft.sourceUrl && !isWebUrl(draft.sourceUrl)) errors.push('رابط المصدر غير صالح');
  if ((p.images || []).some(url => !isWebUrl(url))) errors.push('الصور تحتاج روابط HTTPS صحيحة');
  if ((p.images || []).length > 12 || p.highlights.length > 20) errors.push('الحد الأقصى 12 صورة و20 ميزة');
  if (p.title?.length > 500 || p.city?.length > 128 || p.district?.length > 128 || draft.sourceUrl.length > 2048) errors.push('أحد الحقول يتجاوز الطول المسموح');
  return errors;
}
export function isWebUrl(value: string) { try { const u = new URL(value); return u.protocol === 'https:'; } catch { return false; } }
