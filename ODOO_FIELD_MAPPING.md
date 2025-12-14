# Odoo CRM Field Mapping Guide

This document explains how job application form data is mapped to Odoo CRM lead/opportunity fields.

## Standard Odoo CRM Fields Used

### Required Fields
- **`name`** (required): Opportunity/Lead name
  - Format: `{Full Name} - Application for {Job Title}`
  - Example: "John Doe - Application for Software Developer"

- **`type`**: Lead or Opportunity type
  - Value: `'opportunity'` (creates as opportunity)

### Contact Information Fields
- **`partner_name`**: Contact/Partner name
  - Mapped from: `personalInfo.fullName`
  - Example: "John Doe"

- **`email_from`**: Email address
  - Mapped from: `personalInfo.email`
  - Example: "john.doe@example.com"

- **`phone`**: Phone number
  - Mapped from: `personalInfo.phone`
  - Example: "+91 9876543210"

### Professional Information Fields
- **`function`**: Job title/Function
  - Mapped from: `professionalInfo.currentDesignation`
  - Example: "Senior Software Engineer"
  - Note: This is a standard Odoo field for job title/position

- **`contact_name`**: Company/Contact name
  - Mapped from: `professionalInfo.currentCompany`
  - Example: "ABC Technologies"
  - Note: Used for company name if the contact is not yet a partner

### Location Fields
- **`city`**: City name
  - Mapped from: `personalInfo.currentLocation` (parsed)
  - Example: "Hyderabad"
  - Note: Extracted from "City, State" format

### Description Field
- **`description`**: Detailed description/notes
  - Contains: All application details including:
    - Job application details (Job ID, Job Title)
    - Personal information
    - Professional information
    - Resume file information
    - Application questions (formatted as plain text)

## Field Mapping Details

### Personal Information Mapping
```
Form Field → Odoo Field
─────────────────────────
fullName → partner_name
email → email_from
phone → phone
currentLocation → city (parsed)
```

### Professional Information Mapping
```
Form Field → Odoo Field
─────────────────────────
currentDesignation → function
currentCompany → contact_name
totalExperience → (in description)
coverLetter → (in description)
```

### Job Information Mapping
```
Form Field → Odoo Field
─────────────────────────
jobId → (in description)
jobTitle → (in name and description)
```

### Application Questions
- All questions are formatted as plain text and included in the `description` field
- Format: `{question_key}: {answer}`
- Example: "location confirm: Yes"

## Optional Fields (Not Currently Used)

These fields can be added if needed in your Odoo instance:

- **`source_id`**: Source of the lead/opportunity
  - Could be set to "Website" or "Job Portal"
  - Requires creating a source in Odoo first

- **`medium_id`**: Medium of the lead/opportunity
  - Could be set to "Online Application"
  - Requires creating a medium in Odoo first

- **`user_id`**: Assign to a specific salesperson
  - Format: User ID (integer)
  - Example: `user_id: 2`

- **`team_id`**: Assign to a specific sales team
  - Format: Team ID (integer)
  - Example: `team_id: 1`

- **`stage_id`**: Set initial stage
  - Format: Stage ID (integer)
  - Example: `stage_id: 1`

- **`probability`**: Set probability percentage
  - Format: Integer (0-100)
  - Example: `probability: 50`

- **`state_id`**: State/Province
  - Format: State ID (integer, requires lookup)
  - Note: Requires matching state name to Odoo state ID

- **`country_id`**: Country
  - Format: Country ID (integer, requires lookup)
  - Note: Requires matching country name to Odoo country ID

## Custom Fields

If you need to store additional information, you can create custom fields in Odoo:

1. Go to **Settings** → **Technical** → **Database Structure** → **Models**
2. Search for `crm.lead`
3. Add custom fields (e.g., `x_studio_job_id`, `x_studio_job_title`, `x_studio_total_experience`)

Then update the code to include these fields in `odooOpportunityData`.

## Location Parsing

The `currentLocation` field is parsed to extract the city:
- Input: "Hyderabad, Telangana"
- Output: `city: "Hyderabad"`

If you need state and country IDs, you would need to:
1. Look up the state ID from Odoo's `res.country.state` model
2. Look up the country ID from Odoo's `res.country` model
3. Add `state_id` and `country_id` to the opportunity data

## Notes

- Empty fields are automatically removed before sending to Odoo
- All detailed information is preserved in the `description` field
- Application questions are formatted as plain text in the description
- Resume files are attached as `ir.attachment` records linked to the opportunity

