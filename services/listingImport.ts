import type { ListingDraft } from './listingModel.ts';
import { newDraft, isWebUrl } from './listingModel.ts';

const normalize = (v:unknown) => String(v ?? '').trim();
export function parseNumber(v:unknown): number {
  const value=normalize(v).replace(/[٠-٩]/g,c=>String(c.charCodeAt(0)-1632)).replace(/[۰-۹]/g,c=>String(c.charCodeAt(0)-1776)).replace(/[,٬\s]/g,'').replace('٫','.');
  return value ? Number(value) : 0;
}
export function rowsToDrafts(rows:Record<string,unknown>[], existing:ListingDraft[]=[]) {
  if(rows.length > 500)throw Error('الحد الأقصى 500 عقار لكل ملف.');
  const seen=new Set(existing.map(d=>fingerprint(d)));
  let duplicates=0;
  const drafts:ListingDraft[]=rows.map((row,index)=>{
    const clean:Record<string,unknown>={};for(const [k,v] of Object.entries(row))clean[k.trim().toLowerCase()]=v;
    const get=(...keys:string[])=>{for(const key of keys)if(clean[key]!==undefined)return clean[key];return ''};
    const d=newDraft();
    d.property.title=normalize(get('title','العنوان','عنوان العقار'));
    if(!d.property.title)throw Error(`الصف ${index+2}: عنوان العقار مفقود.`);
    d.property.price=parseNumber(get('price','السعر'));d.property.area=parseNumber(get('area','المساحة'));
    d.property.city=normalize(get('city','المدينة'));
    d.property.district=normalize(get('district','الحي'));
    const type=normalize(get('type','النوع','نوع العقار'));
    d.property.type=({'فيلا':'Villa','شقة':'Apartment','أرض':'Land','ارض':'Land','مكتب':'Office','تاون هاوس':'Townhouse'}[type] || type || 'Villa') as any;
    const mode=normalize(get('listingtype','العرض','نوع العرض'));
    d.property.listingType=({'بيع':'Buy','للبيع':'Buy','إيجار':'Rent','ايجار':'Rent','للإيجار':'Rent'}[mode] || mode || 'Buy') as any;
    for(const [key,arabic] of [['beds','الغرف'],['baths','دورات المياه']] as const) {const value=get(key,arabic);if(value!=='')d.property[key]=parseNumber(value);}
    d.property.images=normalize(get('images','الصور')).split(/[|\n]/).map(x=>x.trim()).filter(Boolean);
    d.property.highlights=normalize(get('highlights','المميزات')).split('|').filter(Boolean);
    d.sourceUrl=normalize(get('sourceurl','المصدر'));d.contactName=normalize(get('contactname','اسم المعلن'));d.contactPhone=normalize(get('contactphone','رقم التواصل'));
    d.lastVerified=normalize(get('lastverified','تاريخ التحقق'));
    return d;
  }).filter(d=>{const key=fingerprint(d);if(seen.has(key)){duplicates++;return false}seen.add(key);return true});
  return {drafts,duplicates};
}
export function fingerprint(d:ListingDraft) {return d.sourceUrl || [d.property.title,d.property.city,d.property.district,d.property.price,d.property.area].map(v=>String(v).trim().toLowerCase()).join('|');}
export function mergeAssistantDraft(raw:Partial<ListingDraft>):ListingDraft {
 const d=newDraft();const p=raw.property || {} as any;
 // AI output is untrusted input; only known fields and safe links are accepted.
 d.property={...d.property,title:String(p.title||''),price:parseNumber(p.price),area:parseNumber(p.area),city:String(p.city||''),district:String(p.district||''),
 type:p.type || 'Villa',listingType:p.listingType || 'Buy',highlights:Array.isArray(p.highlights)?p.highlights.map(String).slice(0,20):[],
 images:Array.isArray(p.images)?p.images.filter(isWebUrl).slice(0,12):[]};
 for(const k of ['beds','baths'] as const)if(p[k]!=null)d.property[k]=parseNumber(p[k]);
 d.sourceUrl=raw.sourceUrl && isWebUrl(raw.sourceUrl)?raw.sourceUrl:'';
 d.contactName=String(raw.contactName||'');d.contactPhone=String(raw.contactPhone||'');
 d.notes='مستخرج آليًا؛ يحتاج مراجعة وتأكيد التوفر قبل النشر.';d.lastVerified='';return d;
}
