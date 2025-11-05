# P3-P4 Issues for Unified Server Improvements

Since GitHub Issues are disabled, this file tracks all P3 and P4 improvements identified during code reviews.

## P3 Issues (Medium Priority)

### [P3-1] Security: Validate GitHub credential format (PR #4)
**Category:** Security  
**Time Box:** 30 minutes  
**Owner:** Dev

**Context:** GitHub App credentials are validated for presence but not format. Empty strings or invalid formats could pass validation.

**Evidence:**
- `libraries/typescript/apps/unified-server/src/server.ts:28-30`

**Acceptance Checks:**
- [ ] GITHUB_APP_ID validated as numeric string
- [ ] GITHUB_INSTALLATION_ID validated as numeric string
- [ ] GITHUB_PRIVATE_KEY validated as PEM format
- [ ] Clear error messages for invalid formats
- [ ] Tests added

**Related:** PR #4

---

### [P3-2] Observability: Add Docker health check (PR #5)
**Category:** Observability  
**Time Box:** 15 minutes  
**Owner:** DevOps

**Context:** Dockerfile lacks HEALTHCHECK directive for container orchestration.

**Evidence:**
- `libraries/typescript/apps/unified-server/Dockerfile:35`

**Acceptance Checks:**
- [ ] HEALTHCHECK directive added
- [ ] Health check endpoint/command defined
- [ ] Interval and timeout configured
- [ ] Documentation updated

**Related:** PR #5

---

### [P3-3] Build: Pin pnpm version in Dockerfile (PR #5)
**Category:** Build  
**Time Box:** 10 minutes  
**Owner:** DevOps

**Context:** Uses `pnpm@latest` causing non-reproducible builds.

**Evidence:**
- `libraries/typescript/apps/unified-server/Dockerfile:4`

**Acceptance Checks:**
- [ ] pnpm version pinned (e.g., `pnpm@9.15.0`)
- [ ] Version matches workspace requirements
- [ ] Documentation notes rationale

**Related:** PR #5

---

### [P3-4] Docs: Update Context7 URL documentation (PR #6)
**Category:** Documentation  
**Time Box:** 15 minutes  
**Owner:** Docs

**Context:** Documentation mentions WebSocket but Context7 uses HTTP.

**Evidence:**
- `libraries/typescript/apps/unified-server/README.md:8,38,172`

**Acceptance Checks:**
- [ ] README updated to reflect HTTP support
- [ ] Examples use correct URL format
- [ ] Documentation clarifies HTTP vs WebSocket
- [ ] Architecture diagram updated if needed

**Related:** PR #6

---

### [P3-5] Docs: Add HTTP vs WebSocket troubleshooting (PR #6)
**Category:** Documentation  
**Time Box:** 10 minutes  
**Owner:** Docs

**Context:** Troubleshooting section lacks HTTP-specific guidance.

**Evidence:**
- `libraries/typescript/apps/unified-server/README.md:145-165`

**Acceptance Checks:**
- [ ] HTTP connection troubleshooting added
- [ ] WebSocket connection troubleshooting added
- [ ] Common errors documented

**Related:** PR #6

---

## P4 Issues (Polish)

### [P4-1] Config: Consider extending base tsconfig (PR #3)
**Category:** Configuration  
**Time Box:** 15 minutes  
**Owner:** Dev

**Context:** tsconfig.json doesn't extend workspace base if one exists.

**Evidence:**
- `libraries/typescript/apps/unified-server/tsconfig.json:1`

**Acceptance Checks:**
- [ ] Check if base tsconfig exists
- [ ] If exists, add extends field
- [ ] Verify build succeeds
- [ ] Ensure no conflicts

**Related:** PR #3

---

### [P4-2] Test: Add build verification test (PR #3)
**Category:** Test Strategy  
**Time Box:** 30 minutes  
**Owner:** Dev

**Context:** No automated verification that build succeeds.

**Evidence:**
- PR #3 diff

**Acceptance Checks:**
- [ ] Build test added
- [ ] Verifies `pnpm build` succeeds
- [ ] Verifies `pnpm tsc --noEmit` succeeds
- [ ] Runs in CI

**Related:** PR #3

---

### [P4-3] Style: Standardize error message format (PR #4)
**Category:** Style  
**Time Box:** 10 minutes  
**Owner:** Dev

**Context:** Error messages have inconsistent formats.

**Evidence:**
- `libraries/typescript/apps/unified-server/src/github-tools.ts:27,46,64`

**Acceptance Checks:**
- [ ] Error messages use consistent format
- [ ] All handlers updated
- [ ] Format documented
- [ ] Tests verify format

**Related:** PR #4

---

### [P4-4] Config: Add Dockerfile build arguments (PR #5)
**Category:** Configuration  
**Time Box:** 15 minutes  
**Owner:** DevOps

**Context:** Dockerfile has hardcoded values that could be parameterized.

**Evidence:**
- `libraries/typescript/apps/unified-server/Dockerfile:1`

**Acceptance Checks:**
- [ ] ARG directives added for key values
- [ ] Default values provided
- [ ] Documentation updated
- [ ] Build works with defaults

**Related:** PR #5

---

### [P4-5] Docs: Clarify example path format (PR #6)
**Category:** Documentation  
**Time Box:** 10 minutes  
**Owner:** Docs

**Context:** Examples use placeholder paths that may confuse users.

**Evidence:**
- `libraries/typescript/apps/unified-server/README.md:120`

**Acceptance Checks:**
- [ ] Examples use relative/absolute paths
- [ ] Path format explained
- [ ] Examples are copy-paste ready

**Related:** PR #6

---

### [P4-6] Docs: Update architecture diagram for HTTP support (PR #6)
**Category:** Documentation  
**Time Box:** 10 minutes  
**Owner:** Docs

**Context:** Diagram shows WebSocket only but HTTP is supported.

**Evidence:**
- `libraries/typescript/apps/unified-server/README.md:172-186`

**Acceptance Checks:**
- [ ] Diagram updated to show HTTP option
- [ ] Diagram clarifies HTTP vs WebSocket usage
- [ ] Diagram remains clear

**Related:** PR #6

---

## Summary

- **P3 Issues:** 5 items (~1h 20m total)
- **P4 Issues:** 6 items (~1h 30m total)
- **Total:** 11 items (~2h 50m)

## Priority Order

1. P3-1: Security validation (highest)
2. P3-4, P3-5: Documentation accuracy (user-facing)
3. P3-2: Observability (production readiness)
4. P3-3: Build stability (reproducibility)
5. P4 items: Polish and consistency

