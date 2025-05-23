# Hazard Management Test Cases

## Hazard Reporting Screen Tests

### Functional Tests
| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|----------------|----------|
| HAZ-001 | Create new hazard with all required fields | Hazard saved and ID generated | High |
| HAZ-002 | Create hazard with missing required fields | Validation errors displayed | High |
| HAZ-003 | Upload photo attachment to hazard report | Photo saved and linked to hazard | High |
| HAZ-004 | Upload multiple photos (up to limit) | All photos saved successfully | Medium |
| HAZ-005 | Upload oversized photo file | Error message about file size | Medium |
| HAZ-006 | Upload invalid file type as photo | Only image files accepted | Medium |
| HAZ-007 | Set hazard severity level | Severity saved correctly | High |
| HAZ-008 | Assign hazard to team member | Assignment notification sent | High |
| HAZ-009 | Set due date for hazard resolution | Date validation and storage | Medium |
| HAZ-010 | Add recommended action text | Action text saved with hazard | Medium |

### Workflow Tests
| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|----------------|----------|
| HAZ-WF-001 | Hazard status progression: Open → Assigned | Status update successful | High |
| HAZ-WF-002 | Hazard status progression: Assigned → In Progress | Status update with timestamp | High |
| HAZ-WF-003 | Hazard status progression: In Progress → Resolved | Resolution details captured | High |
| HAZ-WF-004 | Hazard status progression: Resolved → Closed | Final closure confirmation | High |
| HAZ-WF-005 | Email notification on hazard assignment | Assigned user receives email | High |
| HAZ-WF-006 | Email notification on status changes | Stakeholders notified of updates | Medium |
| HAZ-WF-007 | Overdue hazard identification | System flags overdue items | Medium |

## Hazard Dashboard Tests

### Display Tests
| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|----------------|----------|
| HAZ-DASH-001 | Display hazard statistics summary | Correct counts for each status | High |
| HAZ-DASH-002 | Filter hazards by status | List updates correctly | High |
| HAZ-DASH-003 | Filter hazards by severity | High/Medium/Low filtering works | High |
| HAZ-DASH-004 | Filter hazards by site | Site-specific hazards shown | High |
| HAZ-DASH-005 | Filter hazards by assigned person | User-specific assignments shown | Medium |
| HAZ-DASH-006 | Search hazards by description | Text search returns relevant results | Medium |
| HAZ-DASH-007 | Sort hazards by date created | Chronological ordering works | Low |
| HAZ-DASH-008 | Sort hazards by due date | Due date ordering works | Medium |
| HAZ-DASH-009 | Pagination for large hazard lists | Page navigation functions | Low |

### Data Integrity Tests
| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|----------------|----------|
| HAZ-DATA-001 | Tenant data isolation | Users only see their tenant's hazards | Critical |
| HAZ-DATA-002 | Site-specific permissions | Users see only authorized sites | High |
| HAZ-DATA-003 | Hazard edit permissions | Only authorized users can modify | High |
| HAZ-DATA-004 | Hazard deletion restrictions | Proper authorization required | High |
| HAZ-DATA-005 | Audit trail for hazard changes | All modifications logged | Medium |