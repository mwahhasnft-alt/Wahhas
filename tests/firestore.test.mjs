import { after, before, test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, where, writeBatch } from 'firebase/firestore';
let env;
const property={id:'listing-1',title:'فيلا',price:2500000,type:'Villa',listingType:'Buy',city:'الرياض',district:'الملقا',area:320,highlights:[],images:[],status:'published',sourceUrl:'',lastVerified:'2026-10-23'};
before(async()=>{
 env=await initializeTestEnvironment({projectId:'demo-aqar-admin',firestore:{host:'127.0.0.1',port:8085,rules:await readFile('firestore.rules','utf8')}});
 await env.withSecurityRulesDisabled(async context=>{
  const db=context.firestore();await setDoc(doc(db,'listing_drafts','listing-1'),{id:'listing-1',notes:'private',contactPhone:'private'});
  await setDoc(doc(db,'properties','listing-1'),property);
  await setDoc(doc(db,'admins','delegated-admin'),{});
 });
});
after(async()=>{if(env)await env.cleanup()});
test('visitors can query published listings but cannot read or list drafts',async()=>{
 const db=env.unauthenticatedContext().firestore();
 await assertSucceeds(getDocs(query(collection(db,'properties'),where('status','==','published'))));
 await assertFails(getDoc(doc(db,'listing_drafts','listing-1')));await assertFails(getDocs(collection(db,'listing_drafts')));
});
test('a normal account cannot modify inventory or grant admin rights',async()=>{
 const db=env.authenticatedContext('normal',{email:'normal@example.com',email_verified:true}).firestore();
 await assertFails(setDoc(doc(db,'properties','listing-1'),{...property,updatedAt:serverTimestamp()}));
 await assertFails(setDoc(doc(db,'admins','normal'),{}));
 await assertFails(setDoc(doc(db,'users','normal'),{uid:'normal',email:'normal@example.com',name:'Normal',role:'admin'}));
});
test('unverified bootstrap email does not grant administration',async()=>{
 const db=env.authenticatedContext('unverified',{email:'m-w781@hotmail.com',email_verified:false}).firestore();
 await assertFails(getDocs(collection(db,'listing_drafts')));
});
test('verified bootstrap, custom-claim and delegated admins can read drafts',async()=>{
 for(const [uid,claims] of [['owner',{email:'m-w781@hotmail.com',email_verified:true}],['claim-admin',{admin:true}],['delegated-admin',{}]]){
  await assertSucceeds(getDocs(collection(env.authenticatedContext(uid,claims).firestore(),'listing_drafts')));
 }
});
test('admin publication is atomic and public documents reject private contacts',async()=>{
 const db=env.authenticatedContext('claim-admin',{admin:true}).firestore();const batch=writeBatch(db);
 batch.set(doc(db,'listing_drafts','listing-2'),{id:'listing-2',property:{...property,id:'listing-2'},sourceUrl:'',contactName:'Owner',contactPhone:'private',notes:'private',available:true,lastVerified:'2026-10-23',updatedAt:serverTimestamp()});
 batch.set(doc(db,'properties','listing-2'),{...property,id:'listing-2',updatedAt:serverTimestamp()});await assertSucceeds(batch.commit());
 await assertFails(setDoc(doc(db,'properties','listing-2'),{...property,id:'listing-2',contactPhone:'leak',updatedAt:serverTimestamp()}));
 await assertFails(setDoc(doc(db,'properties','listing-2'),{...property,id:'listing-2',price:0,updatedAt:serverTimestamp()}));
});
