// Smooth Cursor Effect
class SmoothCursor {
    constructor() {
        this.cursor = document.querySelector('.custom-cursor');
        this.cursorArrow = document.querySelector('.cursor-arrow');
        
        // Position tracking
        this.mousePos = { x: 0, y: 0 };
        this.cursorPos = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
        
        // Animation state
        this.lastTime = Date.now();
        this.lastMousePos = { x: 0, y: 0 };
        this.rotation = 0;
        this.targetRotation = 0;
        this.scale = 1;
        this.targetScale = 1;
        this.isHovering = false;
        
        // Spring config (similar to framer-motion)
        this.damping = 0.15; // Lower = smoother but slower
        this.stiffness = 0.25; // Higher = faster response
        this.rotationDamping = 0.12;
        
        this.init();
    }
    
    init() {
        // Hide cursor initially
        this.cursor.style.opacity = '0';
        
        // Event listeners
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('mouseover', (e) => this.onMouseOver(e));
        
        // Start animation loop
        requestAnimationFrame(() => this.animate());
        
        // Show cursor after initial position is set
        setTimeout(() => {
            this.cursor.style.transition = 'opacity 0.3s ease';
            this.cursor.style.opacity = '1';
        }, 100);
    }
    
    onMouseMove(e) {
        this.mousePos.x = e.clientX;
        this.mousePos.y = e.clientY;
        
        // Calculate velocity
        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastTime;
        
        if (deltaTime > 0) {
            this.velocity.x = (this.mousePos.x - this.lastMousePos.x) / deltaTime;
            this.velocity.y = (this.mousePos.y - this.lastMousePos.y) / deltaTime;
        }
        
        this.lastTime = currentTime;
        this.lastMousePos.x = this.mousePos.x;
        this.lastMousePos.y = this.mousePos.y;
        
        // Calculate rotation from velocity
        const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
        
        if (speed > 0.1 && !this.isHovering) {
            const angle = Math.atan2(this.velocity.y, this.velocity.x) * (180 / Math.PI) + 90;
            this.targetRotation = angle;
            this.targetScale = 0.95;
        } else {
            this.targetScale = 1;
        }
    }
    
    onMouseOver(e) {
        const target = e.target;
        this.isHovering = this.isInteractiveElement(target);
        
        if (this.isHovering) {
            this.cursor.classList.add('hovering');
            this.targetRotation = 0; // Reset rotation when hovering
        } else {
            this.cursor.classList.remove('hovering');
        }
    }
    
    isInteractiveElement(element) {
        if (!element) return false;
        
        const tagName = element.tagName.toLowerCase();
        const interactiveTags = ['a', 'button', 'input', 'textarea', 'select'];
        
        // Check tag name
        if (interactiveTags.includes(tagName)) return true;
        
        // Check attributes and classes
        if (element.getAttribute('role') === 'button') return true;
        if (element.hasAttribute('onclick')) return true;
        if (element.classList.contains('cursor-pointer')) return true;
        if (element.getAttribute('draggable') === 'true') return true;
        
        // Check computed styles
        const computedStyle = window.getComputedStyle(element);
        const cursor = computedStyle.cursor;
        if (cursor === 'pointer' || cursor === 'grab' || cursor === 'move') return true;
        
        // Check parent elements (up to 3 levels)
        let parent = element.parentElement;
        let depth = 0;
        while (parent && depth < 3) {
            if (this.isInteractiveElement(parent)) return true;
            parent = parent.parentElement;
            depth++;
        }
        
        return false;
    }
    
    lerp(start, end, factor) {
        return start + (end - start) * factor;
    }
    
    animate() {
        // Smooth position following (spring physics simulation)
        this.cursorPos.x = this.lerp(this.cursorPos.x, this.mousePos.x, this.damping);
        this.cursorPos.y = this.lerp(this.cursorPos.y, this.mousePos.y, this.damping);
        
        // Smooth rotation
        let rotationDiff = this.targetRotation - this.rotation;
        
        // Handle rotation wrapping
        if (rotationDiff > 180) rotationDiff -= 360;
        if (rotationDiff < -180) rotationDiff += 360;
        
        this.rotation += rotationDiff * this.rotationDamping;
        
        // Smooth scale
        this.scale = this.lerp(this.scale, this.targetScale, 0.15);
        
        // Apply transforms
        const translateX = this.cursorPos.x;
        const translateY = this.cursorPos.y;
        const rotate = this.isHovering ? 0 : this.rotation;
        const scale = this.scale;
        
        this.cursor.style.transform = `translate(${translateX}px, ${translateY}px) rotate(${rotate}deg) scale(${scale})`;
        
        // Continue animation loop
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize smooth cursor when DOM is loaded
let smoothCursor;

// Theme detection and management
function detectTheme() {
    // Check if user has a saved preference
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
        return savedTheme;
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    
    return 'light';
}

function setTheme(theme) {
    const body = document.body;
    
    // Remove existing theme classes
    body.classList.remove('light', 'dark');
    
    // Add new theme class
    body.classList.add(theme);
    
    // Save preference
    localStorage.setItem('theme', theme);
}

function initTheme() {
    const theme = detectTheme();
    setTheme(theme);
}

// Listen for system theme changes
if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        // Only auto-switch if user hasn't manually set a preference
        if (!localStorage.getItem('theme')) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });
}

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    // Initialize cursor
    smoothCursor = new SmoothCursor();
});

// Optional: Add keyboard shortcut to toggle theme (Ctrl/Cmd + Shift + T)
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
        const currentTheme = document.body.classList.contains('dark') ? 'dark' : 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    }
});

// Prevent scrolling entirely
document.addEventListener('wheel', (e) => {
    e.preventDefault();
}, { passive: false });

document.addEventListener('keydown', (e) => {
    // Prevent arrow keys, page up/down, home, end from scrolling
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'].includes(e.key)) {
        e.preventDefault();
    }
});

// Prevent touch scrolling on mobile
document.addEventListener('touchmove', (e) => {
    e.preventDefault();
}, { passive: false });
