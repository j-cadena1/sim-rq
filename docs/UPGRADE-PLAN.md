# Major Dependency Upgrade Plan

**Goal:** Safely upgrade all major dependencies while keeping the app working at every step.

**Approach:** Upgrade in phases, testing thoroughly after each phase. Each phase is independently deployable.

**Related Issue:** <https://github.com/j-cadena1/sim-rq/issues/18>

---

## Phase 1: Redis 8 (Infrastructure)

**Risk: ZERO** - No code changes required

**Changes:**

- `docker-compose.yaml`: Change `redis:${REDIS_VERSION:-7}-alpine` to `redis:${REDIS_VERSION:-8}-alpine`
- `docker-compose.dev.yaml`: Same change

**Why safe:**

- Application uses only basic Redis commands (INCR, EXPIRE, pub/sub)
- node-redis v5.10.0 is already compatible with Redis 8
- rate-limit-redis and @socket.io/redis-adapter work with Redis 8
- Redis 8 is backward compatible with Redis 7 commands

**Testing:**

```bash
make dev                    # Start with Redis 8
# Verify logs show Redis connection
curl http://localhost:3001/ready  # Check redis.connected: true
make test-e2e               # Run full E2E suite
```

---

## Phase 2: Safe Backend Upgrades (No Breaking Changes)

**Risk: LOW** - Direct upgrades, no code changes

**Packages:**

| Package   | From   | To     | Notes                            |
|-----------|--------|--------|----------------------------------|
| dotenv    | 16.6.1 | 17.x   | `.config()` API unchanged        |
| bcrypt    | 5.1.1  | 6.x    | `hash()`/`compare()` unchanged   |
| helmet    | 7.2.0  | 8.x    | Config object API stable         |
| file-type | 20.5.0 | 21.x   | `fileTypeFromBuffer()` unchanged |
| sharp     | 0.33.5 | 0.34.x | Stay on 0.x, not 1.x yet         |

**Commands:**

```bash
cd backend
npm install dotenv@latest bcrypt@latest helmet@latest file-type@latest sharp@0.34
npm install @types/bcrypt@latest  # Update types
```

**Testing:**

```bash
make test                   # Unit tests (423 backend)
make test-e2e               # E2E tests (86 tests)
```

---

## Phase 3: Zod 4 Migration

**Risk: LOW-MEDIUM** - Minor API changes possible

**Package:** zod 3.25.76 → 4.x

**Files to review after upgrade:**

- `backend/src/middleware/validation.ts` - Main validation schemas
- `backend/src/middleware/errorHandler.ts` - ZodError handling
- `backend/src/services/websocketService.ts` - Cookie parsing

**Commands:**

```bash
cd backend
npm install zod@latest
```

**Testing:**

```bash
make test                   # Backend unit tests
make test-e2e               # Full E2E (tests all validation paths)
```

---

## Phase 4: Express 5 Migration

**Risk: LOW** - Codebase already Express 5-ready

**Package:** express 4.22.1 → 5.x

**Why low risk:**

- All middleware uses standard 3-param signature
- Error handler uses 4-param signature (correct)
- No deprecated Express 4 patterns found
- `asyncHandler()` wrapper handles promises correctly
- Route parameters use standard patterns

**Commands:**

```bash
cd backend
npm install express@latest
npm install @types/express@latest
```

**Testing:**

```bash
make test                   # Backend unit tests
make test-e2e               # Full E2E (tests all API endpoints)
```

---

## Phase 5: express-rate-limit 8 Migration

**Risk: LOW-MEDIUM** - Config changes possible

**Package:** express-rate-limit 7.5.1 → 8.x

**File:** `backend/src/middleware/rateLimiter.ts`

**Potential changes:**

- Review `windowMs` and `max` configuration
- Verify `standardHeaders` and `legacyHeaders` options
- Check Redis store compatibility

**Commands:**

```bash
cd backend
npm install express-rate-limit@latest
```

**Testing:**

```bash
make test                   # Backend unit tests
make test-e2e               # Tests rate limiting behavior
```

---

## Phase 6: Frontend Upgrades

**Risk: MEDIUM** - Vite 7 has config changes

### 6a: TypeScript 5.9

**Package:** typescript 5.8.3 → 5.9.x

```bash
npm install typescript@latest
npx tsc --noEmit            # Type check
```

### 6b: lucide-react

**Package:** lucide-react 0.555.0 → 0.561.x

```bash
npm install lucide-react@latest
```

### 6c: Vite 7 (Most Complex)

**Package:** vite 6.4.1 → 7.x

**File:** `vite.config.ts`

**Potential changes:**

- Review `defineConfig` API
- Check proxy configuration syntax
- Verify plugin compatibility (@vitejs/plugin-react, @tailwindcss/vite)
- Review build/rollup options

**Commands:**

```bash
npm install vite@latest @vitejs/plugin-react@latest
```

**Testing:**

```bash
npm run build               # Production build
make dev                    # Dev server with hot reload
make test-e2e               # Full E2E
```

---

## Phase 7: Multer 2 (Optional - Highest Risk)

**Risk: MEDIUM-HIGH** - File upload API changes

**Package:** multer 1.4.5-lts → 2.x

**Files:**

- `backend/src/routes/attachments.ts`
- `backend/src/controllers/attachmentsController.ts`

**Recommendation:** Skip unless security issue. v1.4.5-lts is still maintained.

---

## Execution Order

```text
Phase 1: Redis 8           → Test → Commit
Phase 2: Safe backend deps → Test → Commit
Phase 3: Zod 4             → Test → Commit
Phase 4: Express 5         → Test → Commit
Phase 5: Rate limiter 8    → Test → Commit
Phase 6a: TypeScript 5.9   → Test → Commit
Phase 6b: lucide-react     → Test → Commit
Phase 6c: Vite 7           → Test → Commit
Phase 7: Multer 2          → (Optional, skip for now)
```

**Each phase:**

1. Make changes
2. Run `make test` (unit tests)
3. Run `make test-e2e` (E2E tests)
4. If tests pass → commit
5. If tests fail → debug and fix before continuing

---

## Rollback Strategy

Each phase is a separate commit. If issues arise in production:

```bash
git revert <commit-hash>
make prod-build && make prod
```

---

## Files Modified

**Phase 1:**

- `docker-compose.yaml`
- `docker-compose.dev.yaml`

**Phase 2-5:**

- `backend/package.json`
- `backend/package-lock.json`

**Phase 6:**

- `package.json`
- `package-lock.json`
- Possibly `vite.config.ts` (if Vite 7 requires changes)

---

## Success Criteria

- [ ] All 661 tests passing (86 E2E + 152 frontend + 423 backend)
- [ ] `npm audit` shows 0 vulnerabilities
- [ ] Application starts and functions correctly
- [ ] Redis connection works
- [ ] File uploads work
- [ ] SSO authentication works
- [ ] Real-time notifications work
