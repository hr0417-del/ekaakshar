document.addEventListener('DOMContentLoaded', () => {
    // ELITE CUSTOM CURSOR
    const cursor = document.getElementById('custom-cursor');
    const magneticElements = document.querySelectorAll('a, button, .glass-card, .program-tile');
    
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    const animateCursor = () => {
        const easing = 0.15;
        cursorX += (mouseX - cursorX) * easing;
        cursorY += (mouseY - cursorY) * easing;
        
        if (cursor) {
            cursor.style.left = `${cursorX}px`;
            cursor.style.top = `${cursorY}px`;
        }
        requestAnimationFrame(animateCursor);
    };
    animateCursor();

    magneticElements.forEach(elem => {
        elem.addEventListener('mouseenter', () => cursor?.classList.add('active'));
        elem.addEventListener('mouseleave', () => cursor?.classList.remove('active'));
    });

    // NAVIGATION SCROLL EFFECT
    const nav = document.getElementById('main-nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
        
        // Scroll Progress
        const progress = document.getElementById('scroll-progress');
        const bottomProgress = document.getElementById('bottom-progress-tracker');
        const height = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = (window.scrollY / height) * 100;
        if (progress) progress.style.width = `${scrolled}%`;
        if (bottomProgress) bottomProgress.style.width = `${scrolled}%`;
    });

    // SMOOTH SCALING SCROLL TO ANCHORS WITH OFFSET
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#' || !href) return;
            
            const targetElement = document.querySelector(href);
            if (targetElement) {
                e.preventDefault();
                
                const header = document.getElementById('main-nav');
                const headerHeight = header ? header.offsetHeight : 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerHeight - 20;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // CINEMATIC WORD SWAPPER
    const swapper = document.getElementById('hero-swapper');
    if (swapper) {
        const spans = swapper.querySelectorAll('.word-swapper-word');
        let index = 0;

        const rotateWords = () => {
            const previous = spans[index];
            previous.classList.remove('active');
            previous.classList.add('exit');
            
            index = (index + 1) % spans.length;
            const current = spans[index];
            current.classList.remove('exit');
            
            setTimeout(() => {
                current.classList.add('active');
            }, 50);

            // Clean up exit class after animation
            setTimeout(() => {
                previous.classList.remove('exit');
            }, 600);
        };

        if (spans.length > 0) {
            spans[0].classList.add('active');
            setInterval(rotateWords, 3000);
        }
    }

    // 4. NAVIGATOR DASHBOARD INTERACTION
    const animateDashboard = (viewId) => {
        const container = document.getElementById(viewId);
        if (!container) return;

        // Animate Matrix Bars (Discover)
        const matrixBars = container.querySelectorAll('.progress-fill');
        matrixBars.forEach((bar, i) => {
            const w = bar.style.width;
            bar.style.width = '0';
            setTimeout(() => {
                bar.style.width = w;
                bar.style.transition = 'width 1.5s cubic-bezier(0.16, 1, 0.3, 1)';
            }, 100);
        });

        // NOTE: Ring animations (Learn) and Chart bars (School) are now primarily handled 
        // by CSS transitions triggered by the .active class on the parent view.
    };

    // PHYSICS SCROLL ENGINE WITH VIEWPORT-LINKED SCALE AND OPACITY
    const revealElements = document.querySelectorAll('.reveal');
    const updatePhysicsScroll = () => {
        const windowHeight = window.innerHeight;
        revealElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            // Calculation: 0 (at bottom of viewport) to 1 (passed 25% of viewport depth)
            const enterPoint = windowHeight;
            const fullyActivePoint = windowHeight * 0.25;
            
            let progress = 0;
            if (rect.top <= enterPoint) {
                progress = (enterPoint - rect.top) / (enterPoint - fullyActivePoint);
                progress = Math.max(0, Math.min(1, progress));
            }
            
            const scale = 0.98 + (0.02 * progress);
            const opacity = progress;
            
            el.style.transform = `scale(${scale})`;
            el.style.opacity = `${opacity}`;
            
            if (progress > 0.1 && !el.classList.contains('active')) {
                el.classList.add('active');
                el.classList.add('reveal-active');
                if (el.id === 'navigator') {
                    animateDashboard('discover-view');
                }
            }
        });
    };

    window.addEventListener('scroll', updatePhysicsScroll);
    window.addEventListener('resize', updatePhysicsScroll);
    updatePhysicsScroll();

    // BULLETPROOF FALLBACK FOR SANDBOXED IFRAMES
    setTimeout(() => {
        revealElements.forEach(el => {
            if (!el.classList.contains('active')) {
                el.style.transform = 'scale(1)';
                el.style.opacity = '1';
                el.classList.add('active');
                el.classList.add('reveal-active');
                if (el.id === 'navigator') {
                    animateDashboard('discover-view');
                }
            }
        });
    }, 1200);

    // FLOATING DEPTH BACKDROP PARALLAX WITH DAMPENED LERP LOOP
    const glowDepth1 = document.getElementById('glow-depth-1');
    const glowDepth2 = document.getElementById('glow-depth-2');
    const glowDepth3 = document.getElementById('glow-depth-3');
    
    let currentScroll = window.scrollY;
    let targetScroll = window.scrollY;
    const dampening = 0.08; // Smooth interpolation factor
    
    // Layered depth speed multipliers (varying speeds to create physical depth)
    const speed1 = 0.15; // Slow deepest background
    const speed2 = 0.35; // Moderate mid-ground depth
    const speed3 = 0.55; // Faster foreground depth
    
    const animateGlowParallax = () => {
        targetScroll = window.scrollY;
        // Apply linear interpolation for buttery smooth dampening
        currentScroll += (targetScroll - currentScroll) * dampening;
        
        if (glowDepth1) {
            glowDepth1.style.transform = `translate3d(0, ${currentScroll * speed1}px, 0)`;
        }
        if (glowDepth2) {
            glowDepth2.style.transform = `translate3d(0, ${currentScroll * speed2}px, 0)`;
        }
        if (glowDepth3) {
            glowDepth3.style.transform = `translate3d(0, ${currentScroll * speed3}px, 0)`;
        }
        
        requestAnimationFrame(animateGlowParallax);
    };
    
    // Start the continuous parallax animation loop
    requestAnimationFrame(animateGlowParallax);

    // VARIABLE WEIGHT HEADERS
    const sectionTitles = document.querySelectorAll('.section-title');
    const weightObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('weight-700');
            } else {
                const rect = entry.target.getBoundingClientRect();
                if (rect.top > window.innerHeight * 0.5) {
                    entry.target.classList.remove('weight-700');
                }
            }
        });
    }, {
        rootMargin: '-50% 0px -50% 0px',
        threshold: 0
    });

    sectionTitles.forEach(title => weightObserver.observe(title));

    // AMBIENT INTELLIGENCE LAYER: GRID-LOCKED CONNECTIVE PARTICLE SWARM CANVAS (#00E5FF)
    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        const particleCount = 75;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        class Particle {
            constructor() {
                this.reset();
            }

            reset() {
                this.colIndex = Math.floor(Math.random() * 12);
                this.x = this.colIndex * (canvas.width / 12) + (canvas.width / 24); // Spawns perfectly on the 12-column grid line centers
                this.y = Math.random() * canvas.height;
                this.vx = 0; // Lock perfectly horizontally, move purely vertically so they stay grid-locked
                this.vy = (Math.random() - 0.5) * 0.4;
                this.radius = Math.random() * 1.5 + 1;
            }

            update() {
                // Keep locked to grid columns dynamically on window resize
                this.x = this.colIndex * (canvas.width / 12) + (canvas.width / 24);
                this.y += this.vy;

                // Wrap-around bounds checking for vertical drift
                if (this.y < 0) this.y = canvas.height;
                if (this.y > canvas.height) this.y = 0;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(37, 99, 235, 0.08)';
                ctx.fill();
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        const animateParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw and update particle swarm
            particles.forEach(p => {
                p.update();
                p.draw();
            });

            // Draw interactive cursor connection lines if cursor is within 150px
            particles.forEach(p1 => {
                const dx = p1.x - mouseX;
                const dy = p1.y - mouseY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 150) {
                    const alpha = (1 - (dist / 150)) * 0.03; // Strict 3% connect opacity
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(mouseX, mouseY);
                    ctx.strokeStyle = `rgba(37, 99, 235, ${alpha})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            });

            requestAnimationFrame(animateParticles);
        };
        animateParticles();
    }



    const navTabs = document.querySelectorAll('.nav-tab-btn');
    const canvasViews = document.querySelectorAll('.canvas-view');

    if (navTabs.length > 0) {
        navTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const viewId = `${tab.getAttribute('data-view')}-view`;
                const targetView = document.getElementById(viewId);
                
                if (!targetView || targetView.classList.contains('active')) return;

                // UI Feedback
                navTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Toggle Views
                canvasViews.forEach(v => v.classList.remove('active'));
                
                setTimeout(() => {
                    targetView.classList.add('active');
                    animateDashboard(viewId);
                }, 50);
            });
        });

        // Initial Animation
        animateDashboard('discover-view');
    }

    // MAGNETIC BUTTON LOGIC
    document.querySelectorAll('.btn, .btn-primary, .btn-primary-glow').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            btn.style.transition = 'none'; // Temporarily disable transition during direct dragging
            const rect = btn.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) * 0.35;
            const y = (e.clientY - rect.top - rect.height / 2) * 0.35;
            btn.style.transform = `translate(${x}px, ${y}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'; // Restore CSS transition from styles
            btn.style.transform = 'translate(0, 0)';
        });
    });

    // 3D TILT EFFECT FOR PROGRAM LENS CARDS WITH CUSTOM CURSOR FOLLOW HIGHLIGHTS
    document.querySelectorAll('.program-lens-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            card.style.transition = 'none'; // Disable transition lag on real-time mouse tracking
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Update CSS variables for radial gradient glow
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Map cursor distance from center to dynamic tilt angles (max 10 degrees)
            const rotateX = ((centerY - y) / centerY) * 10;
            const rotateY = ((x - centerX) / centerX) * 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.015)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease, border-color 0.4s ease, opacity 0.8s ease';
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)';
        });
    });

    // PARALLAX INTENSITY
    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX - window.innerWidth / 2) * 0.005;
        const y = (e.clientY - window.innerHeight / 2) * 0.005;

        const heroVisual = document.querySelector('.hero-visual');
        if (heroVisual) {
            heroVisual.style.transition = 'none'; // Instantly track mouse cursor coordinates
            // Very subtle rotation/tilt
            heroVisual.style.transform = `rotateY(${x * 2}deg) rotateX(${-y * 2}deg) translateX(${x * 10}px) translateY(${y * 10}px)`;
        }

        const orbs = document.querySelectorAll('.orb');
        orbs.forEach((orb, i) => {
            // Restrict maximum movement to ~15px
            const factor = (i + 1) * 5; 
            orb.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
        });
    });

    // BENTO CARD ACCORDION ROTATIONAL TOGGLE
    document.querySelectorAll('.bento-card').forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('is-expanded');
            
            // Smoothly animate the SVG connector lines shifting heights
            let start = null;
            function step(timestamp) {
                if (!start) start = timestamp;
                if (typeof drawEcosystemLines === 'function') {
                    drawEcosystemLines();
                }
                if (timestamp - start < 600) {
                    requestAnimationFrame(step);
                }
            }
            requestAnimationFrame(step);
        });
    });

    // =========================================================================
    // DYNAMIC CONNECTED ECOSYSTEM PATH COORDINATOR
    // =========================================================================
    function drawEcosystemLines() {
        const grid = document.querySelector('.ecosystem-grid');
        const svg = document.querySelector('.ecosystem-connectors');
        if (!grid || !svg) return;

        // Clear previous paths/defs
        svg.innerHTML = '';

        // Only coordinate paths on desktop screens (width >= 992px)
        if (window.innerWidth < 992) {
            return;
        }

        const gridRect = grid.getBoundingClientRect();

        const cardNav = document.querySelector('.navigator-card');
        const cardIntel = document.querySelector('.student-intel-card');
        const cardLife = document.querySelector('.life-skills-card');
        const cardFuture = document.querySelector('.future-skills-card');
        const cardLabs = document.querySelector('.skill-labs-card');
        const cardSchool = document.querySelector('.school-transformation-card');

        if (!cardNav || !cardIntel || !cardLife || !cardFuture || !cardLabs || !cardSchool) return;

        const rects = {
            nav: cardNav.getBoundingClientRect(),
            intel: cardIntel.getBoundingClientRect(),
            life: cardLife.getBoundingClientRect(),
            future: cardFuture.getBoundingClientRect(),
            labs: cardLabs.getBoundingClientRect(),
            school: cardSchool.getBoundingClientRect()
        };

        // Coordinates relative to the parent ecosystem-grid container
        const coords = {};
        for (const key in rects) {
            coords[key] = {
                left: rects[key].left - gridRect.left,
                right: rects[key].right - gridRect.left,
                top: rects[key].top - gridRect.top,
                bottom: rects[key].bottom - gridRect.top,
                width: rects[key].width,
                height: rects[key].height,
                cx: (rects[key].left + rects[key].right) / 2 - gridRect.left,
                cy: (rects[key].top + rects[key].bottom) / 2 - gridRect.top
            };
        }

        // Draw connections from the central Navigator™ hub (Cols 1-2, Rows 1-2) to satellites:
        // 1. Navigator (right edge top) -> Student Intelligence (left edge center)
        createPath('intel', coords.nav.right, coords.nav.top + coords.nav.height * 0.22, coords.intel.left, coords.intel.cy, 'var(--accent)', 'right');
        // 2. Navigator (right edge bottom) -> Life Skills (left edge center)
        createPath('life', coords.nav.right, coords.nav.top + coords.nav.height * 0.65, coords.life.left, coords.life.cy, '#f59e0b', 'right');
        // 3. Navigator (bottom edge left) -> Future Skills (top edge center)
        createPath('future', coords.nav.left + coords.nav.width * 0.2, coords.nav.bottom, coords.future.cx, coords.future.top, '#10b981', 'bottom');
        // 4. Navigator (bottom edge center) -> Skill Labs (top edge center)
        createPath('labs', coords.nav.left + coords.nav.width * 0.6, coords.nav.bottom, coords.labs.cx, coords.labs.top, '#8b5cf6', 'bottom');
        // 5. Navigator (bottom edge right) -> School Transformation (top edge center)
        createPath('school', coords.nav.left + coords.nav.width * 0.85, coords.nav.bottom, coords.school.cx, coords.school.top, 'var(--accent)', 'bottom');

        function createPath(nodeId, x1, y1, x2, y2, color, direction) {
            let d = '';
            
            // Build visually elegant curved cubic-bezier paths
            if (direction === 'bottom') {
                const dy = Math.abs(y2 - y1);
                d = `M ${x1} ${y1} C ${x1} ${y1 + dy * 0.5}, ${x2} ${y2 - dy * 0.5}, ${x2} ${y2}`;
            } else {
                const dx = Math.abs(x2 - x1);
                const dir = direction === 'left' ? -1 : 1;
                const offset = Math.min(dx * 0.45, 120);
                d = `M ${x1} ${y1} C ${x1 + dir * offset} ${y1}, ${x2 - dir * offset} ${y2}, ${x2} ${y2}`;
            }

            // Create gradient definition
            const gradId = `grad-${nodeId}`;
            const grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
            grad.setAttribute('id', gradId);
            if (direction === 'bottom') {
                grad.setAttribute('x1', '0%'); grad.setAttribute('y1', '0%');
                grad.setAttribute('x2', '0%'); grad.setAttribute('y2', '100%');
            } else {
                grad.setAttribute('x1', direction === 'left' ? '100%' : '0%');
                grad.setAttribute('y1', '0%');
                grad.setAttribute('x2', direction === 'left' ? '0%' : '100%');
                grad.setAttribute('y2', '0%');
            }

            const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop1.setAttribute('offset', '0%');
            stop1.setAttribute('stop-color', 'var(--accent)');
            stop1.setAttribute('stop-opacity', '0.45');

            const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop2.setAttribute('offset', '100%');
            stop2.setAttribute('stop-color', color);
            stop2.setAttribute('stop-opacity', '0.08');

            grad.appendChild(stop1);
            grad.appendChild(stop2);
            svg.appendChild(grad);

            // Inactive background path
            const pathBg = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            pathBg.setAttribute('d', d);
            pathBg.classList.add('connector-path-bg');
            
            // Glowing animated overlay path
            const pathGlow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            pathGlow.setAttribute('d', d);
            pathGlow.setAttribute('stroke', `url(#${gradId})`);
            pathGlow.setAttribute('id', `connector-${nodeId}`);
            pathGlow.classList.add('connector-path-glow');

            svg.appendChild(pathBg);
            svg.appendChild(pathGlow);
        }
    }

    // Attach ecosystem redraw listeners
    window.addEventListener('resize', drawEcosystemLines);
    window.addEventListener('load', drawEcosystemLines);
    // Draw immediately and after a short timeout to catch layout settling
    setTimeout(drawEcosystemLines, 100);
    setTimeout(drawEcosystemLines, 600);

    // Interactive Hover Coordinates mapping
    document.querySelectorAll('.bento-card[data-ecosystem-node]').forEach(card => {
        const nodeId = card.getAttribute('data-ecosystem-node');
        if (nodeId === 'nav') return; // Skip central hub hover triggers

        card.addEventListener('mouseenter', () => {
            const glowPath = document.getElementById(`connector-${nodeId}`);
            if (glowPath) {
                glowPath.classList.add('path-active');
            }
            // Shared glow: light up the central Navigator card too!
            const navCard = document.querySelector('.navigator-card');
            if (navCard) {
                navCard.classList.add('hub-glow-active');
            }
        });

        card.addEventListener('mouseleave', () => {
            const glowPath = document.getElementById(`connector-${nodeId}`);
            if (glowPath) {
                glowPath.classList.remove('path-active');
            }
            const navCard = document.querySelector('.navigator-card');
            if (navCard) {
                navCard.classList.remove('hub-glow-active');
            }
        });
    });

    // Special flagship Navigator ecosystem hover reaction
    const navCard = document.querySelector('.navigator-card');
    if (navCard) {
        navCard.addEventListener('mouseenter', () => {
            const grid = document.querySelector('.ecosystem-grid');
            if (grid) {
                grid.classList.add('nav-hover-active');
            }
            document.querySelectorAll('.connector-path-glow').forEach(path => {
                path.classList.add('path-active');
            });
        });

        navCard.addEventListener('mouseleave', () => {
            const grid = document.querySelector('.ecosystem-grid');
            if (grid) {
                grid.classList.remove('nav-hover-active');
            }
            document.querySelectorAll('.connector-path-glow').forEach(path => {
                path.classList.remove('path-active');
            });
        });
    }
    // PROGRAMS EXPAND TO ALL DIALOG TRIGGER (WITH SCALE ORIGIN CALCULATIONS)
    const openBtn = document.getElementById('open-programs-dialog');
    const closeBtn = document.getElementById('close-programs-dialog');
    const overlay = document.getElementById('programs-dialog-overlay');
    const dialogContainer = document.querySelector('.dialog-container');

    if (openBtn && overlay && dialogContainer) {
        openBtn.addEventListener('click', (e) => {
            const rect = openBtn.getBoundingClientRect();
            const originX = rect.left + rect.width / 2;
            const originY = rect.top + rect.height / 2;
            dialogContainer.style.transformOrigin = `${originX}px ${originY}px`;
            
            overlay.classList.add('active');
            document.body.classList.add('dialog-open');
        });
    }

    if (closeBtn && overlay) {
        closeBtn.addEventListener('click', () => {
            overlay.classList.remove('active');
            document.body.classList.remove('dialog-open');
        });
    }

    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
                document.body.classList.remove('dialog-open');
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay && overlay.classList.contains('active')) {
            overlay.classList.remove('active');
            document.body.classList.remove('dialog-open');
        }
    });

    // NAV CAPSULE SLIDING HOVER EFFECT
    const navLinksContainer = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links a');
    const navCapsule = document.getElementById('nav-capsule');

    if (navLinksContainer && navCapsule) {
        navLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
                navCapsule.style.left = `${link.offsetLeft}px`;
                navCapsule.style.width = `${link.offsetWidth}px`;
                navCapsule.style.opacity = '1';
            });
        });

        navLinksContainer.addEventListener('mouseleave', () => {
            navCapsule.style.opacity = '0';
        });
    }

    // SCROLL-TRIGGERED VISUAL PAUSES BLUR REVEALS
    const visualPauses = document.querySelectorAll('.visual-pause-text');
    if ('IntersectionObserver' in window && visualPauses.length > 0) {
        const pauseObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-focus');
                } else {
                    const rect = entry.target.getBoundingClientRect();
                    if (rect.top > window.innerHeight || rect.bottom < 0) {
                        entry.target.classList.remove('in-focus');
                    }
                }
            });
        }, {
            rootMargin: '-15% 0px -15% 0px',
            threshold: 0.05
        });

        visualPauses.forEach(pause => {
            pauseObserver.observe(pause);
        });
    }

    // INTERACTIVE HERO SVG NODE TELEMETRY PACKET PULSES
    const svgNodes = document.querySelectorAll('.svg-interactive-node');
    const paths = document.querySelectorAll('.connection-path');

    if (svgNodes.length > 0 && paths.length > 0) {
        svgNodes.forEach(node => {
            node.addEventListener('mouseenter', () => {
                const idx = parseInt(node.getAttribute('data-index'), 10);
                if (!isNaN(idx) && paths[idx]) {
                    paths[idx].classList.remove('pulse-active');
                    void paths[idx].offsetWidth; // Trigger reflow
                    paths[idx].classList.add('pulse-active');
                }
            });
        });
    }
});
