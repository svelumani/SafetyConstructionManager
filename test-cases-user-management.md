# User & Site Management Test Cases

## User Management

### Functional Tests
| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|----------------|----------|
| USER-001 | Create new user with all required fields | User account created successfully | High |
| USER-002 | Assign role to new user | Role permissions applied correctly | High |
| USER-003 | Edit existing user information | Changes saved and reflected in system | High |
| USER-004 | Deactivate user account | User cannot login, data preserved | High |
| USER-005 | Reactivate deactivated user | User can login again with existing data | Medium |
| USER-006 | Change user password | New password works for login | High |
| USER-007 | Assign user to multiple sites | Site access granted correctly | High |
| USER-008 | Remove user from site | Site access revoked immediately | High |
| USER-009 | Bulk import users from CSV | Multiple users created from file | Medium |
| USER-010 | Export user list | User data exported correctly | Low |

### Permission Tests
| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|----------------|----------|
| USER-PERM-001 | Admin user full system access | All features accessible | High |
| USER-PERM-002 | Safety Officer role permissions | Safety features accessible only | High |
| USER-PERM-003 | Worker role limited access | Basic reporting and training access | High |
| USER-PERM-004 | Site Manager site-specific access | Only assigned sites visible | High |
| USER-PERM-005 | Team Lead team management access | Team member management available | Medium |

## Site Management

### Functional Tests
| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|----------------|----------|
| SITE-001 | Create new construction site | Site created with all details | High |
| SITE-002 | Edit site information | Changes saved and updated | Medium |
| SITE-003 | Assign personnel to site | Site access granted to users | High |
| SITE-004 | Remove personnel from site | Site access revoked immediately | High |
| SITE-005 | Set site as active/inactive | Status change affects system access | Medium |
| SITE-006 | Upload site documentation | Documents attached to site record | Medium |
| SITE-007 | Configure site-specific settings | Custom settings applied correctly | Low |

## Team Management

### Functional Tests
| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|----------------|----------|
| TEAM-001 | Create new team | Team created with basic information | Medium |
| TEAM-002 | Add members to team | Users assigned to team successfully | Medium |
| TEAM-003 | Remove members from team | Team membership updated | Medium |
| TEAM-004 | Assign team lead | Leadership role established | Medium |
| TEAM-005 | Assign team to specific sites | Site access granted to all members | Medium |
| TEAM-006 | Bulk assign training to team | All members receive training assignment | Medium |