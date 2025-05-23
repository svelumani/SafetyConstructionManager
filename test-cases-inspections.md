# Inspection Management Test Cases

## Inspection Creation & Scheduling

### Functional Tests
| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|----------------|----------|
| INS-001 | Create new inspection with template | Inspection created with checklist items | High |
| INS-002 | Schedule inspection for future date | Date saved and notification created | High |
| INS-003 | Assign inspection to team member | Assignment saved and user notified | High |
| INS-004 | Create inspection without template | Manual checklist creation allowed | Medium |
| INS-005 | Set inspection location details | Location information stored correctly | Medium |
| INS-006 | Upload inspection documentation | Files attached to inspection record | Medium |
| INS-007 | Set inspection priority level | Priority affects scheduling and notifications | Low |

## Inspection Execution

### Functional Tests
| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|----------------|----------|
| INS-EX-001 | Complete inspection checklist items | All responses recorded correctly | High |
| INS-EX-002 | Mark checklist item as "Yes" | Compliant status recorded | High |
| INS-EX-003 | Mark checklist item as "No" | Non-compliant status with action required | High |
| INS-EX-004 | Mark checklist item as "N/A" | Not applicable status recorded | Medium |
| INS-EX-005 | Add notes to inspection items | Comments saved with inspection | Medium |
| INS-EX-006 | Take photos during inspection | Images linked to specific checklist items | High |
| INS-EX-007 | Calculate inspection score | Scoring algorithm works correctly | Medium |
| INS-EX-008 | Submit completed inspection | Status changes to "Completed" | High |
| INS-EX-009 | Save inspection progress | Partial completion saved for later | Medium |

## Inspection Reporting

### Functional Tests
| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|----------------|----------|
| INS-REP-001 | Generate inspection summary report | PDF report created with all details | High |
| INS-REP-002 | View inspection compliance statistics | Accurate percentage calculations | High |
| INS-REP-003 | Filter inspections by completion status | Completed/Pending/Overdue filtering | High |
| INS-REP-004 | Filter inspections by site | Site-specific inspection lists | High |
| INS-REP-005 | Filter inspections by inspector | User-specific inspection history | Medium |
| INS-REP-006 | Export inspection data to Excel | Data export in correct format | Medium |
| INS-REP-007 | View inspection trend analysis | Charts show compliance trends over time | Low |

## Inspection Templates

### Functional Tests
| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|----------------|----------|
| INS-TEMP-001 | Create new inspection template | Template saved with checklist items | Medium |
| INS-TEMP-002 | Edit existing template | Changes saved and applied to new inspections | Medium |
| INS-TEMP-003 | Delete unused template | Template removed from system | Low |
| INS-TEMP-004 | Copy template for modification | Duplicate created for customization | Low |
| INS-TEMP-005 | Set template as default for site | New inspections use default template | Medium |