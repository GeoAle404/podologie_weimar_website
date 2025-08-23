# Podologie Weimar Website

A modern, accessible, and performance-optimized website for the podological practice of Larisa & Vitalij Alekseev in Weimar.

## 🚀 Features

### ✨ Modern Architecture
- **Separated Concerns**: CSS, JavaScript, and HTML in separate files
- **Modular CSS**: Organized with BEM methodology and CSS custom properties
- **ES6+ JavaScript**: Modern patterns with error handling and accessibility

### 🎯 Accessibility (WCAG 2.1 AA Compliant)
- **ARIA Labels**: Comprehensive screen reader support
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Proper focus handling for modal and carousel
- **Skip Links**: Easy navigation for screen readers
- **High Contrast Support**: Respects user preferences
- **Reduced Motion**: Honors prefers-reduced-motion setting

### 📱 Progressive Web App (PWA)
- **Service Worker**: Offline functionality and caching
- **App Manifest**: Installable on mobile devices
- **Performance**: Fast loading with resource preloading
- **Responsive**: Optimized for all screen sizes

### 🎨 Enhanced User Experience
- **Image Carousel**: Touch and keyboard friendly
- **Tab Navigation**: Semantic and accessible
- **Modal Dialogs**: ARIA compliant with focus trapping
- **Smooth Animations**: Performance optimized with CSS transforms
- **Loading States**: Lazy loading for images

### 🔧 Technical Improvements
- **SEO Optimized**: Meta tags, structured data, semantic HTML
- **Performance**: Minified assets, optimized images, caching
- **Error Handling**: Graceful degradation and error recovery
- **Cross-browser**: Compatible with modern browsers
- **Security**: Best practices implemented

## 📁 File Structure

```
podologie_weimar_website/
├── index.html          # Main HTML file with semantic structure
├── styles.css          # Comprehensive CSS with custom properties
├── script.js           # Modern JavaScript with accessibility features
├── sw.js              # Service Worker for offline functionality
├── manifest.json      # PWA manifest for app installation
├── README.md          # This documentation file
└── images/            # Image assets
    ├── about1.jpeg    # Practice photos
    ├── about2.jpeg
    ├── about3.jpeg
    ├── about4.jpeg
    └── about5.jpeg
```

## 🛠️ Setup Instructions

### 1. Local Development

For local development, serve the files through a local server (required for Service Worker):

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (http-server)
npx http-server -p 8000

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

### 2. Production Deployment

1. **Upload all files** to your web server
2. **Configure HTTPS** (required for Service Worker and PWA features)
3. **Set proper MIME types** in your server configuration:
   ```apache
   # Apache .htaccess
   AddType application/manifest+json .webmanifest .json
   AddType text/cache-manifest .appcache
   ```

4. **Add security headers** (recommended):
   ```apache
   # Security headers
   Header always set X-Frame-Options DENY
   Header always set X-Content-Type-Options nosniff
   Header always set Referrer-Policy strict-origin-when-cross-origin
   ```

### 3. Image Optimization

To optimize images for better performance:

```bash
# Convert JPEG images to WebP format (optional)
# Requires imagemagick or similar tool
for file in images/*.jpeg; do
    convert "$file" -quality 80 "${file%.*}.webp"
done
```

## 🎨 Customization

### CSS Custom Properties

The design system uses CSS custom properties for easy theming:

```css
:root {
    --primary-color: #2c5aa0;      /* Main brand color */
    --secondary-color: #DBF3FA;    /* Light blue background */
    --accent-color: #A3D5E8;       /* Accent blue */
    --text-dark: #333;             /* Main text color */
    --border-radius: 8px;          /* Standard border radius */
    --transition-fast: 0.3s ease;  /* Standard transition */
}
```

### Responsive Breakpoints

The site uses a mobile-first approach with these breakpoints:

- **Mobile**: < 480px
- **Tablet**: 481px - 768px
- **Desktop**: > 768px

### Adding New Content

#### Adding New Images to Carousel

1. Place new images in the `images/` folder
2. Add to the carousel HTML:
   ```html
   <div class="carousel-slide" aria-hidden="true">
       <img src="images/new-image.jpeg" 
            alt="Descriptive alt text" 
            class="carousel-slide__image" 
            loading="lazy">
   </div>
   ```
3. Add corresponding dot:
   ```html
   <button class="carousel-dot" onclick="currentSlide(6)" 
           role="tab" aria-selected="false" 
           aria-label="Zu Bild 6 wechseln" 
           title="Bild 6"></button>
   ```

## 🔧 Browser Support

### Minimum Requirements
- **Chrome**: 60+
- **Firefox**: 60+
- **Safari**: 12+
- **Edge**: 79+

### Progressive Enhancement
- Service Worker features require HTTPS
- CSS Grid fallback for older browsers
- JavaScript features degrade gracefully

## ⚡ Performance Optimizations

### Implemented
- ✅ Resource preloading for critical assets
- ✅ Lazy loading for images
- ✅ Service Worker caching
- ✅ CSS and JavaScript minification ready
- ✅ Optimized font loading
- ✅ Efficient image formats

### Recommendations
- 🔄 Convert images to WebP format
- 🔄 Implement critical CSS inlining
- 🔄 Add CDN for static assets
- 🔄 Enable Gzip/Brotli compression

## 🛡️ Security Features

- **Content Security Policy** ready
- **HTTPS required** for PWA features
- **No inline scripts** (CSP compliant)
- **Secure headers** implementation ready
- **Input sanitization** (when forms are added)

## 📊 SEO Features

- **Structured Data**: Ready for implementation
- **Meta Tags**: Comprehensive Open Graph tags
- **Semantic HTML**: Proper heading hierarchy
- **Alt Text**: Descriptive image alternative text
- **URL Structure**: Clean, semantic URLs ready

## 🧪 Testing

### Manual Testing Checklist

#### Accessibility
- [ ] Screen reader navigation (NVDA/JAWS)
- [ ] Keyboard-only navigation
- [ ] High contrast mode
- [ ] Focus indicators visible
- [ ] ARIA labels announced correctly

#### Responsive Design
- [ ] Mobile devices (320px - 768px)
- [ ] Tablets (768px - 1024px)
- [ ] Desktop (1024px+)
- [ ] Orientation changes
- [ ] Touch interactions

#### PWA Features
- [ ] Service Worker installation
- [ ] Offline functionality
- [ ] App installation prompt
- [ ] Cache updates properly

### Automated Testing Tools

Recommended tools for testing:

```bash
# Lighthouse CLI for performance and accessibility
npm install -g lighthouse
lighthouse http://localhost:8000 --view

# axe-core for accessibility testing
npm install -g @axe-core/cli
axe http://localhost:8000
```

## 🚀 Deployment Checklist

Before going live:

- [ ] **Images optimized** (WebP format recommended)
- [ ] **HTTPS configured** (required for PWA)
- [ ] **Service Worker tested** in production
- [ ] **Mobile-friendly test** passed
- [ ] **Accessibility audit** completed
- [ ] **Performance score** > 90 (Lighthouse)
- [ ] **SEO audit** completed
- [ ] **Cross-browser testing** done
- [ ] **Error pages** configured (404, 500)
- [ ] **Analytics** configured (GDPR compliant)

## 📞 Support

For technical support or questions about this implementation:

1. **Check browser console** for JavaScript errors
2. **Test in incognito mode** to rule out extensions
3. **Clear cache and cookies** if experiencing issues
4. **Check network panel** for failed resource loads

## 📄 License

This code is provided for the Podologie Weimar practice. All rights reserved.

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Compatibility**: Modern browsers with ES6+ support