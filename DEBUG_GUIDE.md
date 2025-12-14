# Debugging Job Application Submission Errors

## Common Issues and Solutions

### 1. JSON Parsing Errors
**Symptom**: Error parsing personalInfo, professionalInfo, or jobQuestions

**Solution**: The server now handles both string and object formats. Check server logs for:
- "Raw data received:" - Shows what data was received
- "Error parsing..." - Shows specific parsing errors

### 2. Missing Required Fields
**Symptom**: "Missing required fields" error

**Check**:
- Server logs will show which fields are missing
- Verify form is sending: jobId, jobTitle, fullName, email

### 3. File Upload Errors
**Symptom**: Resume not uploading or file type error

**Check**:
- File must be PDF, DOC, or DOCX
- File size must be < 5MB
- Check server logs for "Resume uploaded:" message

### 4. Odoo API Errors
**Symptom**: Application saved locally but not in Odoo

**Check**:
- Verify `.env` file has correct Odoo credentials
- Check server logs for "Odoo API Error Details:"
- Verify Odoo domain is accessible
- Check if REST API is enabled in Odoo

## Server Logs to Check

When submitting an application, look for these log messages:

1. `=== Application Submission Started ===` - Request received
2. `Request body keys:` - Shows what data was sent
3. `File uploaded:` - Confirms file was received
4. `Raw data received:` - Shows data types
5. `Parsed personalInfo:` - Shows parsed data keys
6. `Validating required fields...` - Validation step
7. `Validation passed` - All required fields present
8. `Resume uploaded:` - File processing
9. `Application submitted to Odoo CRM successfully:` - Odoo success
10. `Resume attached to Odoo lead successfully:` - Resume attached

## Error Logs Location

- Application errors: `./application-logs/error-*.json`
- Successful applications (if Odoo fails): `./application-logs/application-*.json`
- Resume files: `./uploads/resume-*.pdf` (or .doc, .docx)

## Testing Steps

1. **Check Server is Running**
   ```bash
   npm start
   ```

2. **Check Environment Variables**
   ```bash
   Get-Content .env
   ```

3. **Submit Test Application**
   - Open http://localhost:3000/Jobs.html
   - Click "Apply Now" on any job
   - Fill form and submit
   - Watch server console for logs

4. **Check Error Logs**
   ```bash
   Get-Content application-logs\*.json
   ```

## Quick Fixes

### If JSON parsing fails:
- The server now handles both string and object formats
- Check browser console for form data format

### If validation fails:
- Check server logs for which field is missing
- Verify form is sending all required fields

### If Odoo API fails:
- Application is still saved locally
- Check `application-logs/` directory
- Resume is saved in `uploads/` directory
- Can be manually processed later

