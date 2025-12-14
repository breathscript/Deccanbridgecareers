# Testing Odoo CRM Integration

## Prerequisites

1. Ensure the server is running:
   ```bash
   npm start
   ```

2. Verify `.env` file exists with:
   ```
   ODOO_API_KEY=dbcd979e3152705d48c230885aa27b97f9a958c2
   ODOO_DOMAIN=https://deccanbridgecareers1.odoo.com/
   ```

## Manual Testing Steps

### 1. Test via Browser

1. Open `http://localhost:3000/Jobs.html`
2. Click on any job listing
3. Click "Apply Now"
4. Fill out the application form:
   - Personal Information (Name, Email, Phone, Location)
   - Professional Information (Experience, Company, Designation, Cover Letter)
   - Upload a resume (PDF, DOC, or DOCX - max 5MB)
   - Answer job-specific questions
5. Submit the form

### 2. Check Server Logs

After submission, check the server console for:
- ✅ "Resume uploaded:" - Confirms file was received
- ✅ "Resume prepared for Odoo attachment:" - Confirms file was processed
- ✅ "Application submitted to Odoo CRM successfully:" - Confirms Odoo API call
- ✅ "Resume attached to Odoo lead successfully:" - Confirms resume was attached

### 3. Verify in Odoo CRM

1. Log in to [https://deccanbridgecareers1.odoo.com/](https://deccanbridgecareers1.odoo.com/)
2. Navigate to CRM > Leads
3. Look for the new lead with format: "[Name] - Application for [Job Title]"
4. Open the lead and verify:
   - All application details are in the description
   - Job ID and Job Title are in custom fields (if configured)
   - Resume file is attached in the attachments section

### 4. Check Local Storage

- Resume files are saved in: `./uploads/` directory
- Application logs (if Odoo API fails) are saved in: `./application-logs/` directory

## Expected Behavior

### Success Case
- Form submits successfully
- User sees success message
- Server logs show successful Odoo submission
- Lead appears in Odoo CRM with resume attached

### Fallback Case (if Odoo API fails)
- Form still submits successfully to user
- Application data is saved locally in `application-logs/`
- Resume file is saved in `uploads/`
- Server logs show error details for manual review

## Troubleshooting

### Resume Not Uploading
- Check file size (must be < 5MB)
- Check file type (PDF, DOC, DOCX only)
- Check server logs for multer errors

### Odoo API Errors
- Verify API key is correct
- Verify Odoo domain is accessible
- Check if REST API is enabled in Odoo
- Review server logs for specific error messages

### File Storage Issues
- Ensure `uploads/` directory exists and is writable
- Check disk space
- Verify file permissions

## Test Script

Run the automated test script:
```bash
node test-integration.js
```

This will:
- Create a test PDF file
- Submit a test application
- Verify the response
- Clean up test files

