# Incident Management Test Cases

## Incident Reporting

### Functional Tests
| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|----------------|----------|
| INC-001 | Report new incident with all details | Incident saved with unique ID | High |
| INC-002 | Report incident with missing required fields | Validation errors displayed | High |
| INC-003 | Select incident type and severity | Categories saved correctly | High |
| INC-004 | Upload incident photos | Images attached to incident report | High |
| INC-005 | Record incident date and time | Accurate timestamp captured | High |
| INC-006 | Describe incident in detail | Description text saved with report | High |
| INC-007 | Identify injured persons | Person details linked to incident | High |
| INC-008 | Record witness information | Witness data stored with incident | Medium |
| INC-009 | Immediate action taken field | Initial response documented | Medium |

## Incident Investigation

### Functional Tests
| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|----------------|----------|
| INC-INV-001 | Assign incident for investigation | Investigator notified and assigned | High |
| INC-INV-002 | Update investigation status | Status progression tracked | High |
| INC-INV-003 | Add investigation findings | Detailed findings documented | High |
| INC-INV-004 | Upload investigation documents | Supporting files attached | Medium |
| INC-INV-005 | Identify root cause | Root cause analysis completed | High |
| INC-INV-006 | Recommend corrective actions | Actions documented for follow-up | High |
| INC-INV-007 | Set investigation deadline | Timeline established and tracked | Medium |

## Incident Resolution

### Functional Tests
| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|----------------|----------|
| INC-RES-001 | Implement corrective actions | Actions tracked and verified | High |
| INC-RES-002 | Verify action effectiveness | Follow-up verification completed | High |
| INC-RES-003 | Close resolved incident | Final closure with approval | High |
| INC-RES-004 | Generate incident report | Comprehensive report created | Medium |
| INC-RES-005 | Share lessons learned | Knowledge shared across teams | Medium |

## Incident Analytics

### Functional Tests
| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|----------------|----------|
| INC-ANA-001 | View incident statistics dashboard | Accurate metrics displayed | Medium |
| INC-ANA-002 | Filter incidents by severity | High/Medium/Low filtering works | Medium |
| INC-ANA-003 | Analyze incident trends | Charts show patterns over time | Low |
| INC-ANA-004 | Generate safety performance metrics | KPIs calculated correctly | Medium |