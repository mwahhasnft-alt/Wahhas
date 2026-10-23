import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, deleteDoc, doc, getDocFromServer, getDocs, onSnapshot, query, serverTimestamp, setDoc, where, writeBatch } from 'firebase/firestore';
import { auth, db } from './firebase';
import { Property } from '../types';

import { ListingDraft, validationErrors } from './listingModel';
export { newDraft, validationErrors, isWebUrl } from './listingModel';
export type { ListingDraft } from './listingModel';

export async function hasAdminAccess(user: User | null): Promise<boolean> {
  if (!user) return false;
  const token = await user.getIdTokenResult();
  if (token.claims.admin === true || (user.emailVerified && user.email?.toLowerCase() === 'm-w781@hotmail.com')) return true;
  try { return (await getDocFromServer(doc(db, 'admins', user.uid))).exists(); } catch { return false; }
}
export function watchAdminAccess(callback: (allowed: boolean, user: User | null) => void) {
  let generation = 0;
  const stop = onAuthStateChanged(auth, async user => {
    const current = ++generation;
    callback(false, user);
    try { const allowed = await hasAdminAccess(user); if (current === generation) callback(allowed, user); }
    catch { if (current === generation) callback(false, user); }
  });
  return () => { generation++; stop(); };
}
async function requireAdmin() {
  if (!await hasAdminAccess(auth.currentUser)) throw new Error('يلزم تسجيل الدخول بحساب الإدارة.');
}
export const Inventory = {
  async list() { await requireAdmin(); return (await getDocs(collection(db, 'listing_drafts'))).docs.map(d => ({...d.data(), id:d.id} as ListingDraft)); },
  async save(draft: ListingDraft) {
    await requireAdmin();
    const clean = JSON.parse(JSON.stringify({...draft, property:{...draft.property,id:draft.id}}));
    await setDoc(doc(db,'listing_drafts',draft.id), {...clean,updatedAt:serverTimestamp()});
  },
  async publish(draft: ListingDraft) {
    await requireAdmin(); const errors = validationErrors(draft); if(errors.length) throw Error(errors.join('، '));
    // Public documents deliberately exclude owner contact details and internal notes.
    const property = JSON.parse(JSON.stringify({...draft.property,id:draft.id}));
    const batch = writeBatch(db);
    batch.set(doc(db,'listing_drafts',draft.id), {...JSON.parse(JSON.stringify(draft)),property,updatedAt:serverTimestamp()});
    batch.set(doc(db,'properties',draft.id), {...property,status:'published',sourceUrl:draft.sourceUrl,lastVerified:draft.lastVerified,updatedAt:serverTimestamp()});
    await batch.commit();
  },
  async unpublish(id: string) { await requireAdmin(); await deleteDoc(doc(db,'properties',id)); },
  async remove(id: string) { await requireAdmin(); const b=writeBatch(db); b.delete(doc(db,'properties',id)); b.delete(doc(db,'listing_drafts',id)); await b.commit(); },
  subscribe(callback:(properties:Property[])=>void, error:(error:Error)=>void) {
    return onSnapshot(query(collection(db,'properties'),where('status','==','published')), snapshot => callback(snapshot.docs.map(d=>({...d.data(),id:d.id} as Property))), error);
  }
};

export async function callListingAssistant(action: 'extract'|'discover', input: string, image?: string) {
  await requireAdmin();
  const token = await auth.currentUser!.getIdToken();
  const base = `https://us-central1-${db.app.options.projectId}.cloudfunctions.net/listingAssistant`;
  const response = await fetch(base,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({action,input,image})});
  const body = await response.json(); if(!response.ok) throw Error(body.error || 'تعذر تشغيل مساعد الإدخال. تأكد من نشر وظائف Firebase وإعداد Gemini.');
  return body as {listings:Partial<ListingDraft>[]; sources:{title:string;url:string}[]};
}

export const ADMIN_VISIBILITY_KEY = 'AQAR_ADMIN_BUTTON_VISIBLE';
export function setAdminButtonVisible(visible:boolean) {
  localStorage.setItem(ADMIN_VISIBILITY_KEY,String(visible)); window.dispatchEvent(new Event('admin-visibility'));
}
