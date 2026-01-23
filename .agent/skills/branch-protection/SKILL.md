---name: branch-protectiondescription: Configure and manage Git branch protection rules and policieslicense: MITcompatibility: antigravity, opencodemetadata:  audience: developers  domain: git-security  project: arunachala-web---
## What I do
- Set up branch protection rules for main and develop branches
- Configure required status checks and reviews
- Implement code quality gates
- Manage release workflow restrictions
- Set up automated security scans
- Handle emergency bypass procedures

## When to use me
Use this when you need to:
- Configure repository security rules
- Set up code review requirements
- Implement automated testing gates
- Prevent direct pushes to critical branches
- Set up release management policies
- Configure emergency override procedures

## Branch Protection Strategy

### Protected Branches
```yaml
main/master:
  # Highest security - Production code
  protection: strict
  reviewers: 2+
  checks: all_required
  bypass: admin_only

develop:
  # Moderate security - Integration code  
  protection: standard
  reviewers: 1+
  checks: core_required
  bypass: maintainers_plus

feature/*:
  # No protection - Development branches
  protection: none
  reviewers: optional
  checks: optional
  bypass: author
```

### Required Status Checks

### Production (main/master)
```yaml
required_checks:
  - name: "Build and Test"
    type: build_test
    required: true
    
  - name: "Code Linting"
    type: lint
    required: true
    
  - name: "Security Scan"
    type: security
    required: true
    
  - name: "Code Coverage"
    type: coverage
    threshold: 85%
    required: true
    
  - name: "API Testing"
    type: integration
    required: true
    
  - name: "Performance Testing"
    type: performance
    required: false  # recommended
```

### Integration (develop)
```yaml
required_checks:
  - name: "Unit Tests"
    type: test
    required: true
    
  - name: "Code Linting"
    type: lint
    required: true
    
  - name: "Build Success"
    type: build
    required: true
```

### GitHub Configuration

### Branch Protection Settings (GitHub UI)
```yaml
# 1. Go to Settings > Branches
# 2. Add branch protection rule

Protection Rule for main:
- Branch name pattern: main
- Require pull request reviews before merging: ✓
    - Required approvals: 2
    - Dismiss stale PR approvals when new commits are pushed: ✓
    - Require review from Code Owners: ✓
- Require status checks to pass before merging: ✓
    - Required status checks:
      ✓ Build and Test
      ✓ Code Linting  
      ✓ Security Scan
      ✓ Code Coverage
- Require branches to be up to date before merging: ✓
- Do not allow bypassing the above settings: ❌ (for admins)

Protection Rule for develop:
- Branch name pattern: develop
- Require pull request reviews before merging: ✓
    - Required approvals: 1
- Require status checks to pass before merging: ✓
    - Required status checks:
      ✓ Unit Tests
      ✓ Code Linting
      ✓ Build Success
- Require branches to be up to date before merging: ✓
- Allow admins to bypass: ✓
```

### GitHub Actions Workflow
```yaml
# .github/workflows/branch-protection.yml
name: Branch Protection Checks

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  quality-checks:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
          
      - name: Install dependencies
        run: |
          cd frontend && npm install
          cd ../backend && pip install -r requirements.txt
          
      - name: Run frontend tests
        run: cd frontend && npm test
        
      - name: Run backend tests  
        run: cd backend && pytest
        
      - name: Run linting
        run: |
          cd frontend && npm run lint
          cd ../backend && flake8 app/
          
      - name: Security scan
        run: |
          cd backend && safety check
          npx audit-ci
          
      - name: Code coverage
        run: |
          cd backend && pytest --cov=app
          cd ../frontend && npm run test:coverage
          
      - name: Build check
        run: |
          cd frontend && npm run build
          cd ../backend && python -m py_compile app/
```

### Code Owners File
```yaml
# .github/CODEOWNERS

# Default approvers for entire repo
* @AlbertoSanzAlonso @maintainer-team

# Specific directories
/backend/ @backend-team @AlbertoSanzAlonso
/frontend/ @frontend-team
/docs/ @docs-team
/infraestructura/ @devops-team

# Critical files requiring extra approval
/.github/ @AlbertoSanzAlonso
/backend/app/core/ @backend-lead
/frontend/src/auth/ @security-lead

# Emergency bypass
SECURITY.md @AlbertoSanzAlonso @security-lead
```

## Review Policies

### Reviewer Requirements
```yaml
main branch:
  - Required reviewers: 2
  - Must include: 1 senior reviewer
  - Review types: 
    ✓ Code review
    ✓ Security review (for auth/data changes)
    ✓ Performance review (for DB/API changes)
  - Time required: Minimum 24 hours

develop branch:
  - Required reviewers: 1
  - Review types:
    ✓ Code review
    ✓ Basic security check
  - Time required: Minimum 4 hours
```

### Auto-Assignment Rules
```yaml
# Based on file changes
frontend/components/*:
  reviewers: @frontend-team
  
backend/app/api/*:
  reviewers: @backend-team
  
backend/app/models/*:
  reviewers: @backend-lead, @security-lead
  
.env.example:
  reviewers: @security-lead, @devops-lead
```

## Bypass Procedures

### Emergency Bypass (Production)
```yaml
conditions:
  - Critical security fix
  - Production down issue
  - Data corruption issue
  - Payment processing failure

process:
  1. Document emergency in #incidents channel
  2. Get approval from @AlbertoSanzAlonso
  3. Use force push with clear justification
  4. Schedule retrospective within 48 hours
  5. Create post-mortem document

command:
  git push --force-with-lease origin main
  # Must include: [EMERGENCY] in commit message
```

### Maintenance Window Bypass
```yaml
conditions:
  - Scheduled maintenance (approved in advance)
  - Database migrations
  - Major version updates

process:
  1. Create maintenance announcement
  2. Schedule maintenance window
  3. Disable user-facing features temporarily
  4. Deploy with reduced checks
  5. Monitor and rollback if needed
```

## Quality Gates

### Automated Quality Checks
```yaml
code_quality:
  - No new linting violations
  - Test coverage >= 85%
  - No new security vulnerabilities
  - Build must pass
  - API must respond within 200ms
  
security_gates:
  - No hardcoded secrets
  - All dependencies scanned
  - Authentication properly implemented
  - SQL injection protection verified
  - XSS protection in frontend
```

### Performance Gates
```yaml
performance_thresholds:
  - API response time: <200ms
  - Database query time: <100ms  
  - Frontend bundle size: <1MB
  - Page load time: <2s
  - Memory usage: <512MB
```

## Monitoring and Alerts

### Notification Setup
```yaml
alerts:
  - PR to main without required reviews: @AlbertoSanzAlonso
  - Failed security scan: @security-team
  - Coverage drop below 85%: @all-developers
  - Failed deployment: @devops-team
  - Emergency bypass used: @AlbertoSanzAlonso
```

### Daily Reports
```yaml
automated_reports:
  - Branch health summary
  - Open PR aging report  
  - Failed checks summary
  - Coverage trend analysis
  - Security scan results
```

## Integration with Arunachala Web

### Feature-Specific Protection
```yaml
authentication_changes:
  additional_reviewers: @security-lead
  additional_checks: 
    - Security scan
    - Penetration testing
    
payment_integration:
  additional_reviewers: @payment-lead, @security-lead
  additional_checks:
    - PCI compliance check
    - Payment gateway testing
    
database_schema:
  additional_reviewers: @backend-lead
  additional_checks:
    - Migration testing
    - Performance benchmarking
```

### Environment-Specific Rules
```yaml
production_deployments:
  - Must originate from release/* branches
  - All tests passing
  - Security scan passing
  - Documentation updated
  - Change log updated
  - Release notes prepared

staging_deployments:
  - Can originate from develop or feature branches
  - Core tests passing
  - Manual approval by team lead
  - Rollback plan documented
```

## Troubleshooting

### Common Issues
```yaml
# 1. "Required status check failed"
solution: |
  Check Actions tab for failed job
  Fix the failing tests or linting
  Push new commit to update status

# 2. "Cannot push to protected branch"  
solution: |
  Create PR instead of direct push
  For emergency, use bypass procedure

# 3. "Reviewers not available"
solution: |
  Use emergency override if critical
  Reassign to available reviewer
  Consider temporary rule modification
```

### Recovery Procedures
```yaml
if_branch_protection_blocks_deployment:
  1. Assess urgency and impact
  2. Try fixing failed checks first
  3. Request temporary rule relaxation
  4. Document any bypasses taken
  5. Schedule retrospective review
```

## Best Practices

### Development Guidelines
1. **Never work directly on main**: Always use feature branches
2. **Keep PRs small**: Easier to review and faster to merge
3. **Write tests first**: Ensure coverage stays high
4. **Document changes**: Keep README and comments updated
5. **Review your own code**: Self-review before requesting others

### Release Management
1. **Use release branches**: Isolate production deployments
2. **Tag releases**: Semantic versioning with clear tags
3. **Update changelog**: Document all changes
4. **Test thoroughly**: Multiple environments before production
5. **Monitor after deployment**: Watch for issues

### Security Practices
1. **Never commit secrets**: Use environment variables
2. **Review data handling**: Ensure proper validation
3. **Regular security scans**: Automated and manual
4. **Keep dependencies updated**: Security patches
5. **Educate team**: Security awareness training