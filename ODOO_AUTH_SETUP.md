# Odoo Authentication Setup Guide

## Current Issue
The "Session expired" error indicates that Odoo requires proper authentication. The API key alone may not be sufficient for all authentication methods.

## Authentication Methods

### Option 1: XML-RPC Authentication (Recommended)
XML-RPC is the most reliable method for external API access and doesn't require session management.

**Required Environment Variables:**
```env
ODOO_DOMAIN=https://deccanbridgecareers1.odoo.com/
ODOO_USERNAME=your_odoo_username
ODOO_PASSWORD=your_odoo_password
ODOO_API_KEY=dbcd979e3152705d48c230885aa27b97f9a958c2
```

**How to get your Odoo username and password:**
1. Log in to your Odoo instance: `https://deccanbridgecareers1.odoo.com/`
2. Go to **Settings** > **Users & Companies** > **Users**
3. Find or create a user with API access permissions
4. Use that user's login credentials

### Option 2: External API Key (If configured)
If your Odoo instance has external API access configured, you can use the API key directly. However, this requires:
1. External API module to be installed in Odoo
2. API key to be configured in Odoo settings
3. Proper permissions set for the API key

## Current Configuration

The code now supports both methods:
- **Primary**: XML-RPC with username/password (most reliable)
- **Fallback**: REST API with API key (if external API is configured)

## Next Steps

1. **Add username and password to `.env` file:**
   ```env
   ODOO_USERNAME=your_username
   ODOO_PASSWORD=your_password
   ```

2. **If you don't have a username/password:**
   - Create a new user in Odoo with API access
   - Or use your admin credentials (not recommended for production)

3. **Test the integration:**
   - Submit a job application
   - Check server logs for authentication status
   - Verify the lead is created in Odoo CRM

## Troubleshooting

### "Session expired" error
- **Cause**: Authentication failed or session expired
- **Solution**: Use XML-RPC with username/password

### "Access denied" error
- **Cause**: User doesn't have permissions to create CRM leads
- **Solution**: Grant the user "Create" permission on `crm.lead` model

### "Database not found" error
- **Cause**: Database name extracted incorrectly from domain
- **Solution**: Verify the database name matches your Odoo instance

## Security Notes

- Never commit `.env` file to version control
- Use a dedicated API user (not admin account)
- Restrict API user permissions to only what's needed
- Rotate passwords regularly

