# Jobs Management Guide

This guide explains how to add, update, and manage job listings on the Deccan Bridge Careers website.

## Overview

All job listings are stored in `jobs.json` and displayed on the `Jobs.html` page with advanced filtering capabilities.

## Adding a New Job

To add a new job, edit the `jobs.json` file and add a new job object to the `jobs` array.

### Job Object Structure

```json
{
  "id": "unique-job-id",
  "title": "Job Title",
  "designation": "Job Designation",
  "location": "City Name",
  "state": "State Name (optional)",
  "country": "India",
  "employmentType": "Full-time",
  "workMode": "On-site",
  "experience": {
    "min": 0,
    "max": 3,
    "display": "0-3 years"
  },
  "description": "Short description (shown in job card)",
  "fullDescription": "Full detailed description (shown in modal)",
  "requirements": {
    "jobProvides": ["Benefit 1", "Benefit 2"],
    "responsibilities": ["Responsibility 1", "Responsibility 2"],
    "requirements": ["Requirement 1", "Requirement 2"]
  },
  "skills": ["Skill 1", "Skill 2", "Skill 3"],
  "sector": "IT Technology",
  "datePosted": "2025-01-01",
  "validThrough": "2025-12-31"
}
```

### Required Fields

- `id`: Unique identifier (lowercase, hyphens, no spaces)
- `title`: Job title
- `designation`: Job designation/role
- `location`: City name
- `country`: Country name
- `employmentType`: "Full-time", "Part-time", or "Contract"
- `workMode`: "On-site", "Remote", or "Hybrid"
- `experience`: Object with min, max, and display string
- `description`: Short description for job card
- `fullDescription`: Full description for details modal
- `sector`: "BPO", "Healthcare", or "IT Technology"
- `datePosted`: Date in YYYY-MM-DD format
- `validThrough`: Expiry date in YYYY-MM-DD format

### Optional Fields

- `state`: State/province name
- `requirements`: Object containing jobProvides, responsibilities, and/or requirements arrays
- `skills`: Array of required skills

### Example: Adding a New Job

```json
{
  "id": "senior-developer",
  "title": "Senior Software Developer",
  "designation": "Senior Developer",
  "location": "Hyderabad",
  "state": "Telangana",
  "country": "India",
  "employmentType": "Full-time",
  "workMode": "Hybrid",
  "experience": {
    "min": 5,
    "max": 10,
    "display": "5-10 years"
  },
  "description": "We are looking for an experienced Senior Software Developer to lead our development team.",
  "fullDescription": "We are looking for an experienced Senior Software Developer to lead our development team in Hyderabad. You will be responsible for architecting scalable solutions, mentoring junior developers, and driving technical excellence.",
  "requirements": {
    "responsibilities": [
      "Lead development of complex software solutions",
      "Mentor and guide junior developers",
      "Architect scalable and maintainable systems"
    ],
    "requirements": [
      "5+ years of software development experience",
      "Strong expertise in Node.js and React",
      "Experience with cloud platforms (AWS/Azure)",
      "Excellent leadership and communication skills"
    ]
  },
  "skills": ["Node.js", "React", "AWS", "Leadership", "MongoDB"],
  "sector": "IT Technology",
  "datePosted": "2025-01-15",
  "validThrough": "2025-12-31"
}
```

## Filter Options

The Jobs page supports filtering by:

1. **Search**: Free text search across title, description, and skills
2. **Location**: Filter by city
3. **Designation**: Filter by job designation
4. **Experience**: Filter by years of experience (0-2, 2-5, 5-10, 10+)
5. **Employment Type**: Full-time, Part-time, Contract
6. **Work Mode**: On-site, Remote, Hybrid
7. **Sector**: BPO, Healthcare, IT Technology

## Sorting Options

Jobs can be sorted by:
- **Relevance**: Default order
- **Newest First**: Most recently posted jobs first
- **Experience: Low to High**: Jobs requiring less experience first
- **Experience: High to Low**: Jobs requiring more experience first

## Best Practices

1. **Use descriptive IDs**: Use lowercase with hyphens (e.g., `senior-software-engineer`)
2. **Keep descriptions concise**: Short description should be 1-2 sentences
3. **Include relevant skills**: Add 3-5 key skills for better searchability
4. **Update dates**: Keep `datePosted` current and set appropriate `validThrough` dates
5. **Categorize correctly**: Ensure sector matches the job type
6. **Complete requirements**: Include both responsibilities and requirements when possible

## File Location

- **Job Data**: `jobs.json` (root directory)
- **Jobs Page**: `Jobs.html` (root directory)
- **Server Route**: Configured in `server.js` to serve both files

## Testing

After adding a new job:
1. Refresh the Jobs page
2. Verify the job appears in the list
3. Test filtering by the new job's attributes
4. Click "View Details" to verify the modal displays correctly
5. Test the "Apply Now" button links to Contact page

## Notes

- Jobs are loaded dynamically from `jobs.json` when the page loads
- No server restart needed - just refresh the browser
- All filters work in combination (AND logic)
- Search is case-insensitive and searches across multiple fields

