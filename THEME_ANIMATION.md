# Animated Theme Toggle

## Overview
The website now features an animated theme toggle that activates when clicking anywhere on the screen. The theme transitions using an expanding circle animation that originates from the exact point where you click.

## How It Works

### View Transition API
The animation uses the modern **View Transition API** which creates smooth, GPU-accelerated transitions between page states. The expanding circle effect is achieved by animating a `clip-path` property.

### Click Anywhere
- Click anywhere on the page to toggle between light and dark themes
- The animation expands from your exact click position
- The circle grows until it covers the entire viewport
- Duration: 400ms with ease-in-out easing

### Features
1. **Smooth circular expansion** - Creates a ripple effect from click point
2. **Theme persistence** - Your preference is saved to localStorage
3. **Graceful fallback** - Works in browsers without View Transition API support
4. **Cursor styles preserved** - The custom cursor remains unaffected

## Browser Support
- **Full support**: Chrome 111+, Edge 111+
- **Fallback**: Instant theme switch (no animation) in other browsers

## Technical Details

### CSS
```css
::view-transition-old(root),
::view-transition-new(root) {
    animation: none;
    mix-blend-mode: normal;
}
```

### JavaScript
- Uses `document.startViewTransition()` API
- Calculates maximum radius using `Math.hypot()`
- Animates `clipPath` on `::view-transition-new(root)` pseudo-element

## Testing
1. Open the page in Chrome or Edge (latest version)
2. Click anywhere to toggle theme
3. Notice the expanding circle animation from your click point
4. Theme persists on page reload
