# Security Specification & Threat Model for Aqar AI

## 1. Data Invariants
1. **User Identity Invariant**: A user document at `/users/{userId}` can only be read and written by the authenticated owner where `request.auth.uid == userId`.
2. **Admin Role Protection**: The `role` field cannot be self-elevated to `admin` by regular users. The bootstrapped admin (`m-w781@hotmail.com`) is verified via secure database lookup or email assertion.
3. **Saved Property Ownership**: Documents in `/saved_properties/{savedPropertyId}` must have `userId == request.auth.uid`. Users cannot read, modify, or delete another user's saved properties.
4. **Chat Sessions & Messages**: Every chat session must be owned by `userId == request.auth.uid`. Messages under `/chat_sessions/{sessionId}/messages/{messageId}` require the parent session to belong to the requesting user (`get(/databases/$(database)/documents/chat_sessions/$(sessionId)).data.userId == request.auth.uid`).
5. **Inquiries & Leads**: Inquiries can be created by authenticated users for their own UID. Updates are restricted to changing status or admin review.
6. **Immutable Fields**: `createdAt` and `userId` fields cannot be mutated after creation.
7. **Temporal Integrity**: `createdAt` on creation and `updatedAt` on mutation must equal `request.time`.

## 2. The "Dirty Dozen" Malicious Payloads
1. **Payload 1: Identity Spoofing in User Profile**: User attempts to create `/users/{otherUid}` with `request.auth.uid != otherUid`. Expected: `PERMISSION_DENIED`.
2. **Payload 2: Role Escalation**: User creates `/users/{uid}` with `role: "admin"` when not authorized. Expected: `PERMISSION_DENIED`.
3. **Payload 3: Ghost Field Injection**: User sends an unallowed key `hackToken: "secret"` in `/users/{uid}` payload. Expected: `PERMISSION_DENIED`.
4. **Payload 4: ID Path Traversal / Poisoning**: User uses illegal characters in document ID `users/../../bad-doc`. Expected: `PERMISSION_DENIED`.
5. **Payload 5: Foreign Saved Property Reading**: User A queries `/saved_properties` belonging to User B (`resource.data.userId == userB`). Expected: `PERMISSION_DENIED`.
6. **Payload 6: Foreign Saved Property Overwrite**: User A writes to `/saved_properties/prop123` with `userId: userB`. Expected: `PERMISSION_DENIED`.
7. **Payload 7: Unauthenticated Saved Property Read**: An unauthenticated client attempts to read `/saved_properties`. Expected: `PERMISSION_DENIED`.
8. **Payload 8: Orphaned Chat Message Injection**: User attempts to write to `/chat_sessions/sessionOfUserB/messages/msg1`. Expected: `PERMISSION_DENIED`.
9. **Payload 9: Chat Session Ownership Tampering**: User attempts to update `userId` of an existing session to another UID. Expected: `PERMISSION_DENIED`.
10. **Payload 10: Massive Buffer Overflow Attack**: User sends a 2MB string in `content` or `message` exceeding `maxLength` boundary limit. Expected: `PERMISSION_DENIED`.
11. **Payload 11: Fake Timestamp Spoofing**: User supplies a past or future timestamp `createdAt: "2020-01-01"` instead of `request.time`. Expected: `PERMISSION_DENIED`.
12. **Payload 12: Inactive User Blanket Listing**: Client attempts `allow list` without restricting `where("userId", "==", request.auth.uid)`. Expected: `PERMISSION_DENIED`.
