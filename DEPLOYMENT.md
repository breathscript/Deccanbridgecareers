# Heroku Deployment Guide

This guide will help you deploy the Deccan Bridge Careers website to Heroku.

## Prerequisites

1. A Heroku account (sign up at https://www.heroku.com)
2. Heroku CLI installed (download from https://devcenter.heroku.com/articles/heroku-cli)
3. Git installed on your system
4. Node.js installed (version 18.x or higher)

## Deployment Steps

### 1. Install Dependencies Locally (Optional - for testing)

```bash
npm install
```

### 2. Test Locally (Optional)

```bash
npm start
```

Visit http://localhost:3000 to verify everything works.

### 3. Login to Heroku

```bash
heroku login
```

### 4. Create a Heroku App

```bash
heroku create your-app-name
```

Replace `your-app-name` with your desired app name (or leave it blank for a random name).

### 5. Deploy to Heroku

```bash
git init
git add .
git commit -m "Initial commit - Deccan Bridge Careers website"
git push heroku main
```

If you're using the `master` branch instead of `main`:

```bash
git push heroku master
```

### 6. Open Your App

```bash
heroku open
```

## Performance Optimizations Applied

The following optimizations have been implemented to improve loading time:

1. **Lazy Loading**: Images now load lazily to improve initial page load
2. **Resource Preconnect**: Added preconnect and DNS prefetch for external resources
3. **Async Font Loading**: Font Awesome loads asynchronously
4. **Optimized JavaScript**: Removed console logs and optimized event handlers
5. **Local Image References**: Changed from GitHub raw URLs to local image paths
6. **Fixed CSS Issues**: Corrected syntax errors and typos
7. **Image Dimensions**: Added width/height attributes for better layout stability

## File Structure

```
.
├── index.html          # Main homepage
├── AboutUS.html        # About Us page
├── Contact.html        # Contact page
├── Images/             # Image assets
├── server.js           # Express server for Heroku
├── package.json        # Node.js dependencies
├── Procfile           # Heroku process file
└── .gitignore         # Git ignore file
```

## Troubleshooting

### Port Already in Use
If you get a port error locally, change the PORT in server.js or set an environment variable.

### Build Fails
- Ensure all files are committed to git
- Check that package.json has correct Node.js version
- Verify Procfile exists and is correct

### Images Not Loading
- Ensure Images folder is in the root directory
- Check image file names match exactly (case-sensitive)

## Updating the Site

After making changes:

```bash
git add .
git commit -m "Your commit message"
git push heroku main
```

## Environment Variables

If you need to set environment variables:

```bash
heroku config:set VARIABLE_NAME=value
```

## View Logs

To see application logs:

```bash
heroku logs --tail
```

## Additional Resources

- [Heroku Node.js Support](https://devcenter.heroku.com/articles/nodejs-support)
- [Heroku Getting Started](https://devcenter.heroku.com/articles/getting-started-with-nodejs)

