# Anshuman Cybersecurity Portfolio

A modern, responsive portfolio website for cybersecurity professionals built with vanilla HTML, CSS, and JavaScript.

## Features

- 📱 **Fully Responsive Design** - Works on all devices from mobile to desktop
- 🎨 **Modern UI/UX** - Clean, professional cybersecurity-themed design
- 🚀 **PWA Ready** - Progressive Web App with offline capabilities
- ♿ **Accessible** - WCAG compliant with keyboard navigation and screen reader support
- 📊 **Project Management** - Dynamic project showcase with CRUD operations
- 🔧 **Skills Editor** - Editable skills section
- 📄 **PDF Merge Tool** - Client-side PDF merging functionality
- 🎯 **Performance Optimized** - Fast loading with optimized assets

## Production Deployment

### GitHub Pages
1. Push code to GitHub repository
2. Go to Settings > Pages
3. Select source branch (main/master)
4. Your site will be available at `https://username.github.io/repository-name`

### Netlify
1. Connect your GitHub repository to Netlify
2. Build settings: Leave empty (static site)
3. Deploy directory: `/` (root)
4. Auto-deploy on git push

### Vercel
1. Import project from GitHub
2. Framework preset: Other
3. Build command: Leave empty
4. Output directory: `./`

### Custom Server
1. Upload all files to web server
2. Ensure server supports HTTPS for PWA features
3. Configure proper MIME types for `.json` and `.js` files

## File Structure

```
├── index.html          # Main HTML file
├── styles.css          # All CSS styles
├── script.js           # Main JavaScript functionality
├── data-manager.js     # Data persistence layer
├── sw.js              # Service worker for PWA
├── manifest.json      # Web app manifest
├── no_bg.png          # Profile image
├── Anshuman_Resume.pdf # Resume file
└── data/
    └── portfolio-data.json # Data file for GitHub Pages
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Performance Features

- CSS Grid for modern layouts
- Intersection Observer for lazy loading
- RequestAnimationFrame for smooth animations
- Service Worker for caching
- Preloaded critical resources
- Optimized images and fonts

## Accessibility Features

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Skip links for screen readers
- High contrast mode support
- Reduced motion support

## Development vs Production

The app automatically detects the environment:
- **Development**: Shows edit buttons and project management features
- **Production**: Hides edit functionality for clean presentation

## Customization

1. **Profile Information**: Update personal details in `index.html`
2. **Projects**: Modify `data/portfolio-data.json` or use the built-in editor
3. **Skills**: Edit skills list in the data file or use the skills editor
4. **Styling**: Customize colors and layout in `styles.css`
5. **Resume**: Replace `Anshuman_Resume.pdf` with your resume

## License

MIT License - Feel free to use this template for your own portfolio.