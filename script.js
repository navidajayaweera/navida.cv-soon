// Animated Theme Toggle with View Transition API
class AnimatedThemeToggle {
    constructor() {
        this.duration = 400;
        this.init();
    }

    init() {
        document.addEventListener('click', (e) => this.toggleTheme(e));
    }

    async toggleTheme(event) {
        // Get click coordinates
        const x = event.clientX;
        const y = event.clientY;

        // Determine current and new theme
        const isDark = document.body.classList.contains('dark');
        const newTheme = isDark ? 'light' : 'dark';

        // Check if browser supports View Transition API
        if (!document.startViewTransition) {
            // Fallback for browsers without View Transition API
            this.toggleThemeWithoutAnimation(newTheme);
            return;
        }

        // Start view transition
        const transition = document.startViewTransition(() => {
            this.toggleThemeWithoutAnimation(newTheme);
        });

        // Wait for transition to be ready
        await transition.ready;

        // Calculate the radius for the circle animation
        const maxRadius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y)
        );

        // Animate the expanding circle from click point
        document.documentElement.animate(
            {
                clipPath: [
                    `circle(0px at ${x}px ${y}px)`,
                    `circle(${maxRadius}px at ${x}px ${y}px)`,
                ],
            },
            {
                duration: this.duration,
                easing: 'ease-in-out',
                pseudoElement: '::view-transition-new(root)',
            }
        );
    }

    toggleThemeWithoutAnimation(theme) {
        document.body.classList.remove('light', 'dark');
        document.body.classList.add(theme);
        localStorage.setItem('theme', theme);
    }
}

// Initialize animated theme toggle
let animatedThemeToggle;

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
    // Initialize animated theme toggle
    animatedThemeToggle = new AnimatedThemeToggle();

    // Initialize fluid text effect
    // Wait for fonts to load to ensure correct text rendering
    document.fonts.ready.then(() => {
        new FluidTextEffect();
    });
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


// Fluid Text Distortion Effect
class FluidTextEffect {
    constructor() {
        this.container = document.getElementById('webgl-container');
        if (!this.container) return;

        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.aspect = this.width / this.height;

        // Configuration
        this.settings = {
            dissipation: 0.96,
            radius: 0.05,
            distortion: 0.02
        };

        this.mouse = new THREE.Vector2(10000, 10000); // Start off-screen
        this.time = 0;

        this.init();
    }

    init() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(
            -this.aspect, this.aspect,
            1, -1,
            0.1, 100
        );
        this.camera.position.z = 1;

        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        this.initSimulation();
        this.createTextTexture();
        this.initScene();
        this.addEventListeners();
        this.animate();
    }

    initSimulation() {
        // Simulation Scene (for the trail)
        this.simScene = new THREE.Scene();
        this.simCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        // Render Targets (Ping-Pong)
        const options = {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            type: THREE.FloatType, // High precision for smooth trails
        };

        this.rtA = new THREE.WebGLRenderTarget(256, 256, options);
        this.rtB = new THREE.WebGLRenderTarget(256, 256, options);

        // Simulation Shader
        this.simMaterial = new THREE.ShaderMaterial({
            uniforms: {
                textureA: { value: null },
                mouse: { value: this.mouse },
                resolution: { value: new THREE.Vector2(this.width, this.height) },
                time: { value: 0 },
                dissipation: { value: this.settings.dissipation },
                radius: { value: this.settings.radius }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D textureA;
                uniform vec2 mouse;
                uniform vec2 resolution;
                uniform float time;
                uniform float dissipation;
                uniform float radius;
                varying vec2 vUv;

                void main() {
                    vec2 uv = vUv;
                    vec4 color = texture2D(textureA, uv);
                    
                    // Mouse interaction
                    vec2 aspect = vec2(resolution.x / resolution.y, 1.0);
                    vec2 mousePos = mouse * 0.5 + 0.5;
                    
                    // Correct aspect ratio for distance calculation
                    float dist = distance(uv * aspect, mousePos * aspect);
                    
                    // Create trail
                    float intensity = smoothstep(radius, 0.0, dist);
                    
                    // Add to existing color (accumulate)
                    color.r += intensity * 0.5;
                    
                    // Clamp
                    color.r = min(color.r, 1.0);
                    
                    // Dissipate
                    color.r *= dissipation;
                    
                    gl_FragColor = color;
                }
            `
        });

        this.simQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.simMaterial);
        this.simScene.add(this.simQuad);
    }

    createTextTexture() {
        // Create canvas for text
        this.textCanvas = document.createElement('canvas');
        this.textCtx = this.textCanvas.getContext('2d');

        // Match window size for pixel-perfect text
        this.textCanvas.width = this.width * this.renderer.getPixelRatio();
        this.textCanvas.height = this.height * this.renderer.getPixelRatio();

        // Draw text
        this.updateTextCanvas();

        // Create texture
        this.textTexture = new THREE.CanvasTexture(this.textCanvas);
        this.textTexture.minFilter = THREE.LinearFilter;
        this.textTexture.magFilter = THREE.LinearFilter;
    }

    updateTextCanvas() {
        const width = this.textCanvas.width;
        const height = this.textCanvas.height;
        const ctx = this.textCtx;

        ctx.clearRect(0, 0, width, height);

        // Get styles from DOM to match exactly
        const mainText = document.querySelector('.main-text');
        const bottomText = document.querySelector('.bottom-text');
        const body = document.body;

        // Determine colors based on theme
        const isDark = body.classList.contains('dark');
        const color = isDark ? '#ffffff' : '#0B0B0B';

        // Helper to draw text
        const drawText = (el, fontSizeScale = 1) => {
            const rect = el.getBoundingClientRect();
            const style = window.getComputedStyle(el);

            // Calculate position relative to canvas
            // We need to account for the pixel ratio
            const pixelRatio = this.renderer.getPixelRatio();
            const x = (rect.left + rect.width / 2) * pixelRatio;
            const y = (rect.top + rect.height / 2) * pixelRatio;

            // Font settings
            const fontSize = parseFloat(style.fontSize) * pixelRatio;
            const fontWeight = style.fontWeight;
            const fontFamily = style.fontFamily;
            const letterSpacing = style.letterSpacing;

            ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
            ctx.fillStyle = color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Canvas doesn't support letter-spacing natively well, but we can try
            // For now, standard fillText
            ctx.fillText(el.innerText, x, y);
        };

        if (mainText) drawText(mainText);
        if (bottomText) drawText(bottomText);

        // Update texture if it exists
        if (this.textTexture) this.textTexture.needsUpdate = true;

        // Hide original text visually
        document.querySelector('.container').classList.add('text-hidden');
    }

    initScene() {
        // Main Scene Shader
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                tDiffuse: { value: this.textTexture },
                tFluid: { value: null },
                distortion: { value: this.settings.distortion }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D tDiffuse;
                uniform sampler2D tFluid;
                uniform float distortion;
                varying vec2 vUv;

                void main() {
                    vec2 uv = vUv;
                    
                    // Sample fluid
                    float fluid = texture2D(tFluid, uv).r;
                    
                    // Distort
                    vec2 offset = vec2(fluid * distortion);
                    
                    // Apply distortion
                    vec4 color = texture2D(tDiffuse, uv - offset);
                    
                    gl_FragColor = color;
                }
            `,
            transparent: true
        });

        // Fullscreen quad
        const geometry = new THREE.PlaneGeometry(this.aspect * 2, 2);
        this.mesh = new THREE.Mesh(geometry, this.material);
        this.scene.add(this.mesh);
    }

    addEventListeners() {
        window.addEventListener('mousemove', (e) => {
            // Normalize mouse to -1..1
            this.mouse.x = (e.clientX / this.width) * 2 - 1;
            this.mouse.y = -(e.clientY / this.height) * 2 + 1;
        });

        window.addEventListener('resize', () => {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.aspect = this.width / this.height;

            // Update cameras
            this.camera.left = -this.aspect;
            this.camera.right = this.aspect;
            this.camera.updateProjectionMatrix();

            // Update renderer
            this.renderer.setSize(this.width, this.height);

            // Update simulation uniforms
            this.simMaterial.uniforms.resolution.value.set(this.width, this.height);

            // Update text canvas
            this.textCanvas.width = this.width * this.renderer.getPixelRatio();
            this.textCanvas.height = this.height * this.renderer.getPixelRatio();
            this.updateTextCanvas();

            // Update mesh
            this.mesh.geometry.dispose();
            this.mesh.geometry = new THREE.PlaneGeometry(this.aspect * 2, 2);
        });

        // Listen for theme changes to update text color
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    this.updateTextCanvas();
                }
            });
        });
        observer.observe(document.body, { attributes: true });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        this.time += 0.01;

        // 1. Simulate Fluid (Ping-Pong)
        const currentRt = this.rtA;
        const nextRt = this.rtB;

        this.simMaterial.uniforms.textureA.value = currentRt.texture;
        this.simMaterial.uniforms.mouse.value = this.mouse;
        this.simMaterial.uniforms.time.value = this.time;

        this.renderer.setRenderTarget(nextRt);
        this.renderer.render(this.simScene, this.simCamera);

        // Swap buffers
        this.rtA = nextRt;
        this.rtB = currentRt;

        // 2. Render Main Scene
        this.material.uniforms.tFluid.value = this.rtA.texture;
        this.renderer.setRenderTarget(null);
        this.renderer.render(this.scene, this.camera);
    }
}
