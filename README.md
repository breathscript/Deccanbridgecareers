# Deccan Bridge Careers

Professional recruitment and consulting services website for Deccan Bridge Careers.

## Features

- Modern, responsive design
- Job listings with expandable descriptions
- Contact form
- About Us page
- Optimized for fast loading times
- Ready for Heroku deployment

## Quick Start

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open http://localhost:3000 in your browser

### Deploy to Heroku

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

Quick deployment:
```bash
heroku create your-app-name
git push heroku main
heroku open
```

## Performance Optimizations

- Lazy loading for images
- Async resource loading
- Optimized CSS and JavaScript
- Resource preconnect for faster external resource loading
- Local image references instead of external URLs

## Project Structure

```
.
├── index.html          # Main homepage
├── AboutUS.html        # About Us page
├── Contact.html        # Contact page
├── Images/             # Image assets
├── server.js           # Express server
├── package.json        # Dependencies
├── Procfile           # Heroku process file
└── DEPLOYMENT.md      # Deployment guide
```

## Technologies Used

- HTML5
- CSS3
- JavaScript (Vanilla)
- Express.js (for Heroku deployment)
- Font Awesome (for icons)

## License

ISC
