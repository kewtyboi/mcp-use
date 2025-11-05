# Epic: Unified Server P3-P4 Improvements

This epic tracks all P3 (medium priority) and P4 (polish) improvements identified during code reviews of PRs #3, #4, #5, and #6.

## Related PRs
- PR #3: feat(app): complete workspace setup - add tsconfig.json [1]
- PR #4: feat(app): hardening and validation improvements [7]
- PR #5: feat(app): add Dockerfile for unified-server [6]
- PR #6: docs: add README for unified-server [8]

## Issues Summary

### P3 Issues (Medium Priority)

1. **Security: Missing input validation for GitHub credentials** (PR #4)
   - Validate credential format (PEM, numeric IDs)
   - Time box: 30m

2. **Observability: Missing health check** (PR #5)
   - Add HEALTHCHECK directive to Dockerfile
   - Time box: 15m

3. **Build: No pnpm version pinning** (PR #5)
   - Pin pnpm to specific version
   - Time box: 10m

4. **Documentation: Context7 URL mentions WebSocket but uses HTTP** (PR #6)
   - Update URL examples and descriptions
   - Time box: 15m

5. **Documentation: Missing troubleshooting for HTTP vs WebSocket** (PR #6)
   - Add HTTP connection troubleshooting section
   - Time box: 10m

### P4 Issues (Polish)

1. **Configuration: Missing extends from base tsconfig** (PR #3)
   - Consider extending workspace base tsconfig if one exists
   - Time box: 15m

2. **Test Strategy: No verification of build output** (PR #3)
   - Add build verification test
   - Time box: 30m

3. **Style: Inconsistent error message format** (PR #4)
   - Standardize error messages across handlers
   - Time box: 10m

4. **Configuration: Missing build arguments for flexibility** (PR #5)
   - Add ARG directives to Dockerfile
   - Time box: 15m

5. **Documentation: Example paths use placeholder format** (PR #6)
   - Use relative paths or clarify path format
   - Time box: 10m

6. **Documentation: Architecture diagram shows WebSocket only** (PR #6)
   - Update diagram to show HTTP option
   - Time box: 10m

## Total Estimated Time
- P3: ~1h 20m
- P4: ~1h 30m
- **Total: ~2h 50m**

## Priority Order
1. P3 Security validation (highest priority)
2. P3 Documentation accuracy (user-facing)
3. P3 Observability (production readiness)
4. P3 Build stability (reproducibility)
5. P4 items (polish and consistency)

## Acceptance Criteria
- All issues addressed with fixes
- Tests added where applicable
- Documentation updated
- No regressions introduced

