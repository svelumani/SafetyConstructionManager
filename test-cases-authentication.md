# Authentication & Authorization Test Cases

## Login Screen Tests

### Functional Tests
| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|----------------|----------|
| AUTH-001 | Valid login with correct username/password | User redirected to dashboard | High |
| AUTH-002 | Invalid login with wrong password | Error message displayed | High |
| AUTH-003 | Invalid login with non-existent username | Error message displayed | High |
| AUTH-004 | Login with empty username field | Validation error shown | Medium |
| AUTH-005 | Login with empty password field | Validation error shown | Medium |
| AUTH-006 | Login with SQL injection attempt | Login rejected, no security breach | High |
| AUTH-007 | Login with XSS attempt | Input sanitized, no script execution | High |
| AUTH-008 | Session timeout after inactivity | User redirected to login | Medium |
| AUTH-009 | Remember me functionality | Session persists across browser close | Low |
| AUTH-010 | Multiple failed login attempts | Account lockout after threshold | High |

### UI/UX Tests
| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|----------------|----------|
| AUTH-UI-001 | Login form displays correctly on desktop | All fields visible and properly aligned | Medium |
| AUTH-UI-002 | Login form responsive on mobile devices | Form adapts to screen size | Medium |
| AUTH-UI-003 | Password field masks input | Characters shown as dots/asterisks | Medium |
| AUTH-UI-004 | Form validation messages display clearly | Error messages in red, clear text | Low |
| AUTH-UI-005 | Loading state during authentication | Spinner/loading indicator shown | Low |

## Registration Tests

### Functional Tests
| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|----------------|----------|
| REG-001 | Valid tenant registration with all fields | New tenant and admin user created | High |
| REG-002 | Registration with existing email | Error message about duplicate email | High |
| REG-003 | Registration with invalid email format | Email validation error shown | Medium |
| REG-004 | Password strength validation | Weak passwords rejected | Medium |
| REG-005 | Required field validation | Missing fields highlighted | Medium |
| REG-006 | Phone number format validation | Invalid formats rejected | Low |
| REG-007 | Company name uniqueness check | Duplicate company names handled | Medium |

## Role-Based Access Control

### Permission Tests
| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|----------------|----------|
| RBAC-001 | Admin user access to all features | Full system access granted | High |
| RBAC-002 | Safety Officer access to safety features | Limited to assigned permissions | High |
| RBAC-003 | Worker access to assigned tasks only | Restricted view of relevant data | High |
| RBAC-004 | Site Manager access to site-specific data | Only assigned sites visible | High |
| RBAC-005 | Cross-tenant data isolation | Users cannot see other tenant data | Critical |
| RBAC-006 | API endpoint protection | Unauthorized access blocked | Critical |
| RBAC-007 | Direct URL access prevention | Protected routes redirect to login | High |