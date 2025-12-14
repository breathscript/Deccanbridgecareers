# Odoo CRM Integration Setup

This document explains how to set up the Odoo CRM integration for job applications.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
ODOO_API_KEY=dbcd979e3152705d48c230885aa27b97f9a958c2
ODOO_DOMAIN=https://deccanbridgecareers1.odoo.com/
```

## Installation

1. Install dependencies:
```bash
npm install
```

This will install:
- `express` - Web server
- `dotenv` - Environment variable management
- `axios` - HTTP client for API calls

## Odoo API Configuration

The integration attempts to submit job applications to Odoo CRM using the following methods:

1. **REST API** (`/api/v1/crm.lead`) - Primary method
2. **Alternative REST endpoint** (`/web/dataset/call_kw/crm.lead/create`) - Fallback method

### Data Sent to Odoo

Each job application includes:
- **Job ID** - Unique identifier for the position
- **Job Title** - Title of the position
- **Personal Information** - Name, email, phone, location
- **Professional Information** - Experience, current company, designation, cover letter
- **Job-Specific Questions** - Answers to custom questions for each job

### Custom Fields in Odoo

The integration uses custom fields (if available):
- `x_studio_job_id` - Stores the job ID
- `x_studio_job_title` - Stores the job title

If these custom fields don't exist in your Odoo instance, the data will still be included in the description field.

## API Endpoint

The server exposes a POST endpoint at `/api/submit-application` that:
1. Validates the application data
2. Formats it for Odoo CRM
3. Submits it to Odoo
4. Returns success/error response

## Testing

To test the integration:

1. Start the server:
```bash
npm start
```

2. Submit a job application through the JobApplication.html page
3. Check server logs for Odoo API responses
4. Verify the lead appears in your Odoo CRM

## Troubleshooting

### API Key Issues
- Verify the API key is correct in `.env`
- Check if the API key has proper permissions in Odoo
- Ensure the API key format matches Odoo's requirements

### Domain Issues
- Verify the Odoo domain is accessible
- Check if the domain requires authentication
- Ensure no trailing slashes in the domain URL

### API Endpoint Issues
- Check Odoo logs for API call errors
- Verify REST API is enabled in Odoo
- Check if custom fields exist in Odoo CRM model

### Fallback Behavior
If Odoo API calls fail, the application will:
- Still save the application data (logged on server)
- Return success to the user
- Log errors for manual review

## Security Notes

- The `.env` file is in `.gitignore` and should not be committed
- API keys should be kept secure
- Consider using environment variables in production (Heroku, etc.)

## Production Deployment

For Heroku or other platforms:

1. Set environment variables in your platform's dashboard:
   - `ODOO_API_KEY`
   - `ODOO_DOMAIN`

2. The `.env` file is not needed in production if using platform environment variables

3. Restart the application after setting environment variables

