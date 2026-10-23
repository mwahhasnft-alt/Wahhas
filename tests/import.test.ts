import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseNumber, rowsToDrafts, mergeAssistantDraft } from '../services/listingImport.ts';
import { newDraft, validationErrors } from '../services/listingModel.ts';

test('Arabic and Persian numeric imports preserve values',()=>{
 assert.equal(parseNumber('٢٬٥٠٠٬٠٠٠'),2500000);assert.equal(parseNumber('۳۲۰٫۵'),320.5);
 assert.ok(Number.isNaN(parseNumber('غير محدد')));
});
test('Arabic spreadsheet rows become private drafts and duplicates are skipped',()=>{
 const row={'العنوان':'فيلا بالملقا','السعر':'٢٬٥٠٠٬٠٠٠','المدينة':'الرياض','الحي':'الملقا','المساحة':320,'النوع':'فيلا','العرض':'بيع','المصدر':'https://example.com/listing/1'};
 const result=rowsToDrafts([row,row]);assert.equal(result.drafts.length,1);assert.equal(result.duplicates,1);
 assert.equal(result.drafts[0].property.price,2500000);assert.equal(result.drafts[0].lastVerified,'');
 assert.ok(validationErrors(result.drafts[0]).length>0);
 assert.equal(rowsToDrafts([row],result.drafts).drafts.length,0);
});
test('an incomplete or unavailable listing cannot pass publication validation',()=>{
 const draft=newDraft();assert.ok(validationErrors(draft).length>0);
 Object.assign(draft.property,{title:'فيلا',city:'الرياض',district:'الملقا',price:2500000,area:320});
 draft.lastVerified=new Date().toISOString().slice(0,10);assert.deepEqual(validationErrors(draft),[]);
 draft.available=false;assert.ok(validationErrors(draft).includes('العقار غير متاح'));
 draft.available=true;draft.property.images=['javascript:alert(1)'];assert.ok(validationErrors(draft).length>0);
});
test('AI output cannot set identity, verification, or unsafe images',()=>{
 const draft=mergeAssistantDraft({id:'injected',lastVerified:'2026-01-01',property:{title:'عقار',price:1,area:100,images:['javascript:alert(1)','https://example.com/photo.jpg']} as any});
 assert.notEqual(draft.id,'injected');assert.equal(draft.lastVerified,'');assert.deepEqual(draft.property.images,['https://example.com/photo.jpg']);
});
test('imports fail clearly for missing titles and excessive file rows',()=>{
 assert.throws(()=>rowsToDrafts([{'السعر':3}]),/عنوان العقار/);
 assert.throws(()=>rowsToDrafts(Array(501).fill({title:'x'})),/500/);
});
