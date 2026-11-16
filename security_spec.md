# Meraki Spa — Firestore Security Specification (Phase 0 TDD)

## 1. Data Invariants

1. **Default Deny & Validated IDs**: Every document path not explicitly matched is denied (`match /{document=**} { allow read, write: if false; }`). Every single-document operation (`get`, `create`, `update`, `delete`) enforces `isValidId(id)` matching `^[a-zA-Z0-9_\-]+$` (max 128 chars).
2. **Central Owner Authority (No Spoofing)**: Central Owner privileges belong exclusively to `meraki.spa.pe@gmail.com` with `request.auth.token.email_verified == true`. Unverified email claims or client-supplied role fields are always rejected.
3. **Zero-Trust Loyalty (`/users/{userId}`)**:
   - Users can only `get` or `list` their own profile (`uid == request.auth.uid`), unless read by the Central Owner or verified `canStampVip` staff.
   - New profiles (`create`) are strictly capped at `stamps == 1`, `rewardsClaimed == 0`, `history.size() <= 1`, `uid == request.auth.uid`, and `updatedAt == request.time`.
   - Regular users CANNOT self-award stamps (`stamps` cannot increase via user update). Users may ONLY claim a reward when `existing().stamps == 5` (resetting `stamps` to `0` and incrementing `rewardsClaimed` by `1`) OR sync their Google profile fields (`email`, `displayName`, `photoURL`, `updatedAt`).
   - Only Central Owner or verified active staff (`canStampVip == true`) may increment `stamps` or append treatment entries to `history`.
4. **Pancake-Style Delegated Staff Access (`/staffAccess/{staffId}`)**:
   - Only the Central Owner (`meraki.spa.pe@gmail.com`, `email_verified == true`) can create, list, update, or revoke staff access records.
   - Active staff members can read (`get`) only their own deterministic record (`emailToStaffId(request.auth.token.email)`).
5. **Booking PII Isolation (`/bookings/{bookingId}` vs `/slotLocks/{lockId}`)**:
   - `/slotLocks/{lockId}` contains **zero PII** (`bookingCode`, `date`, `timeSlot`, `locationType`, `district`, `totalPEN`, `estimatedDurationMin`, `status`, `createdAt`) so the public booking calendar can check real-time slot availability and spatial-temporal travel feasibility without exposing client phone numbers, emails, or home addresses.
   - `/bookings/{bookingId}` contains client PII (`clientName`, `clientPhone`, `clientEmail`, `address`) and can only be read by the booking owner (`uid == request.auth.uid && uid != ''`), Central Owner, or verified active staff with `canManageBookings == true`.
   - Client/guest bookings must lock `status` to initial states (`pending_yape` or `manual_code_submitted`) and `createdAt == request.time`. Terminal statuses (`completed`, `cancelled`) cannot be mutated by non-admin clients.
6. **Public Agenda Config (`/scheduleConfig/global`)**:
   - Strictly single-document read (`allow get: if configId == 'global'`), `allow list: if false`.
   - Mutations (`blockedDates`, `blockedSlots`, geo thresholds, `paymentMode`) restricted to Central Owner or verified active staff with `canManageAgenda == true`.
7. **INDECOPI Complaints Book (`/complaints/{claimId}`)**:
   - Creation enforces `status == 'pendiente'`, `adminResponse == ''`, and `createdAt == request.time` with strict string bounds.
   - Read and update (`pendiente` -> `atendido`) are restricted to Central Owner or verified `canManageBookings` staff (no public PII leaks).

---

## 2. Adversarial "Dirty Dozen" Payloads (Must Return `PERMISSION_DENIED`)

1. **Privilege Escalation on User Profile (`users/{uid}` create)**:
   ```json
   { "uid": "attacker1", "email": "x@gmail.com", "displayName": "X", "stamps": 5, "rewardsClaimed": 10, "history": [], "updatedAt": "SERVER_TIMESTAMP" }
   ```
   *Rejected because `stamps != 1 || rewardsClaimed != 0` on user create.*

2. **Self-Stamping Fraud (`users/{uid}` update)**:
   ```json
   { "stamps": 5, "history": [{"id":"hack","date":"hoy","service":"Free","price":0}], "updatedAt": "SERVER_TIMESTAMP" }
   ```
   *Rejected because non-staff updates cannot modify `stamps` unless claiming an existing 5-stamp card (`existing().stamps == 5 && incoming().stamps == 0`).*

3. **Unverified Admin Email Spoof (`staffAccess` write)**:
   Auth token `{ "email": "meraki.spa.pe@gmail.com", "email_verified": false }` attempting `setDoc('/staffAccess/hacker_gmail_com', ...)`.
   *Rejected because `isCentralOwner()` mandates `request.auth.token.email_verified == true`.*

4. **Staff Escalating Own Permissions (`staffAccess/{myStaffId}` update)**:
   Verified staff `{ "email": "staff@gmail.com" }` updating `canManageAgenda: true` or `isActive: true`.
   *Rejected because only `isCentralOwner()` can write `/staffAccess`.*

5. **Shadow / Ghost Field Injection (`bookings/{id}` create)**:
   ```json
   { "bookingCode": "MRK-1", "isVerifiedAdmin": true, "uid": "", "status": "confirmed", ... }
   ```
   *Rejected by strict `data.keys().hasOnly([...])` blueprint and forbidden `'confirmed'` status on client create.*

6. **Blanket Booking PII Scraping (`bookings` list)**:
   Anonymous or customer user calling `getDocs(collection(db, 'bookings'))` without ownership.
   *Rejected because `allow list` enforces `isCentralOwner() || isStaffOrOwner('canManageBookings') || (isSignedIn() && resource.data.uid == request.auth.uid)`.*

7. **ID Poisoning / Resource Exhaustion (`slotLocks/{maliciousId}` create)**:
   Doc ID = `'../../etc/passwd?a=' + 'x'.repeat(500)`.
   *Rejected by `isValidId(lockId)` (`^[a-zA-Z0-9_\-]+$`, max 128 chars).*

8. **String Payload Overflow (`complaints/{id}` create)**:
   `{ "detail": "<50KB string>", ... }`
   *Rejected by `data.detail.size() <= 2000` (and `.size()` bounds on every string).*

9. **Immutable Field Tampering (`bookings/{id}` update by owner)**:
   Attempting to alter `createdAt` or `uid` after creation.
   *Rejected because `incoming().createdAt == existing().createdAt && incoming().uid == existing().uid`.*

10. **Fake Server Timestamp Backdating (`slotLocks/{id}` create)**:
    Sending `createdAt: "2020-01-01T00:00:00Z"` instead of `request.time`.
    *Rejected because `incoming().createdAt == request.time`.*

11. **PII Leak in `slotLocks/{id}` create**:
    Injecting `"clientPhone": "+51999999999"` or `"address": "Av..."` into `/slotLocks`.
    *Rejected by `hasOnly(['bookingCode', 'date', 'timeSlot', 'locationType', 'district', 'totalPEN', 'estimatedDurationMin', 'status', 'createdAt'])`.*

12. **Public Mutation of `scheduleConfig/global`**:
    Authenticated customer unblocking `'2026-12-25'` or changing `paymentMode` to `'manual_yape'`.
    *Rejected because `write` requires `isStaffOrOwner('canManageAgenda')`.*
