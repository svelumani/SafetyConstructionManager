# EC2 Database CSV Import Format

## Your EC2 Database Column Order (19 columns):
1. id
2. tenant_id
3. username
4. email
5. password
6. first_name
7. last_name
8. phone
9. role
10. is_active
11. last_login
12. created_at
13. emergency_contact
14. safety_certification_expiry
15. job_title
16. department
17. profile_image_url
18. permissions
19. updated_at

## Correct CSV Header for EC2 Import:
```csv
id,tenant_id,username,email,password,first_name,last_name,phone,role,is_active,last_login,created_at,emergency_contact,safety_certification_expiry,job_title,department,profile_image_url,permissions,updated_at
```

## Sample CSV Row:
```csv
1,1,john.doe,john@example.com,hashed_password,John,Doe,555-1234,employee,true,2025-05-28 10:00:00,2025-05-28 09:00:00,,2026-05-28,Site Manager,Operations,,,2025-05-28 10:30:00
```

## Key Differences from Replit Schema:
- **Missing in EC2**: mobile_token, last_mobile_login
- **Different order**: emergency_contact and safety_certification_expiry are in different positions

## To Fix Your CSV Import:
1. Remove columns: mobile_token, last_mobile_login
2. Reorder columns to match EC2 structure above
3. Ensure exactly 19 columns per row