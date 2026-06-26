/* 
   AI PASSPORT™ Immersive Engine
   Handles: Preloading, Canvas Gold Particles, GSAP ScrollTrigger transitions, Mouse Parallax
*/

// --- Global Diagnostic Log & Error Catching ---
const errorsLog = [];
window.addEventListener("error", (e) => {
  const errorMsg = `${e.message} at ${e.filename || 'app.js'}:${e.lineno || 0}:${e.colno || 0}`;
  errorsLog.push(errorMsg);
  console.error("Diagnostic error caught:", errorMsg);
  
  const diagErrors = document.getElementById("diag-errors");
  if (diagErrors) diagErrors.textContent = errorsLog.join("\n");
  const diagPanel = document.getElementById("diagnostics-panel");
  if (diagPanel) diagPanel.style.display = "block";
});

window.addEventListener("unhandledrejection", (e) => {
  const errorMsg = `Unhandled Promise Rejection: ${e.reason}`;
  errorsLog.push(errorMsg);
  console.error("Promise rejection caught:", errorMsg);
  
  const diagErrors = document.getElementById("diag-errors");
  if (diagErrors) diagErrors.textContent = errorsLog.join("\n");
  const diagPanel = document.getElementById("diagnostics-panel");
  if (diagPanel) diagPanel.style.display = "block";
});

document.addEventListener("DOMContentLoaded", () => {
  // Diagnostics Panel selectors
  const diagPanel = document.getElementById("diagnostics-panel");
  const diagStatus = document.getElementById("diag-status");
  const diagScroll = document.getElementById("diag-scroll");
  const diagGsap = document.getElementById("diag-gsap");

  // Toggle with Ctrl+Shift+D
  window.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === "D") {
      if (diagPanel) diagPanel.style.display = diagPanel.style.display === "none" ? "block" : "none";
    }
  });

  // Track window scroll positions
  window.addEventListener("scroll", () => {
    if (diagScroll) {
      diagScroll.textContent = `ScrollY: ${window.scrollY}px | Max: ${document.documentElement.scrollHeight - window.innerHeight}px`;
    }
  });

  // --- Asset Preloader ---
  const assets = [
    "01 Hero.png",
    "02 Activation.png",
    "03 Vault.png",
    "04 Journey.png",
    "05 Identity.png",
    "06 Verified Citizen.png",
    "Hitesh_new.png",
    "Nishant_new.png"
  ];

  let loadedCount = 0;
  const totalAssets = assets.length;
  const loaderProgress = document.getElementById("loader-progress");
  const loaderText = document.getElementById("loader-text");
  const loader = document.getElementById("loader");

  // Safety timer: Force launch if loading takes more than 4.5 seconds
  const loaderSafetyTimeout = setTimeout(() => {
    console.warn("Preloader safety timeout triggered. Force-launching exhibition.");
    if (diagStatus) diagStatus.textContent = `Status: Safety Timeout (Loaded ${loadedCount}/${totalAssets})`;
    if (diagPanel) diagPanel.style.display = "block";
    launchWebsite();
  }, 4500);

  // Preload Images
  assets.forEach((src) => {
    const img = new Image();
    img.onload = () => {
      loadedCount++;
      const percent = Math.round((loadedCount / totalAssets) * 100);
      if (loaderProgress) loaderProgress.style.width = `${percent}%`;
      
      // Update loading status message
      if (loaderText) {
        if (percent < 30) {
          loaderText.textContent = "DECRYPTING ACCESS PROTOCOLS...";
        } else if (percent < 60) {
          loaderText.textContent = "SYNCHRONISING VAULT DATABASES...";
        } else if (percent < 90) {
          loaderText.textContent = "ESTABLISHING AI SECURE IDENTITIES...";
        } else {
          loaderText.textContent = "LAUNCHING EXHIBITION...";
        }
      }

      if (loadedCount === totalAssets) {
        clearTimeout(loaderSafetyTimeout);
        setTimeout(launchWebsite, 800);
      }
    };
    img.onerror = () => {
      loadedCount++;
      if (loadedCount === totalAssets) {
        clearTimeout(loaderSafetyTimeout);
        setTimeout(launchWebsite, 800);
      }
    };
    img.src = src; // Set src AFTER assigning event handlers to prevent cached race conditions
  });

  function launchWebsite() {
    clearTimeout(loaderSafetyTimeout);
    
    // Update Diagnostics
    if (diagStatus) diagStatus.textContent = "Status: Launched";
    if (diagGsap) {
      diagGsap.textContent = `GSAP: ${typeof gsap !== "undefined" ? "Loaded" : "Missing"} | ScrollTrigger: ${typeof ScrollTrigger !== "undefined" ? "Loaded" : "Missing"}`;
    }

    // Fade out preloader
    if (loader) {
      loader.style.opacity = "0";
      loader.style.visibility = "hidden";
    }    // Initialize all components safely
    try { initParticles(); } catch (e) { console.error("Particles initialization error:", e); }
    try { initRegistrationModal(); } catch (e) { console.error("Modal initialization error:", e); }
    try { initCountdown(); } catch (e) { console.error("Countdown initialization error:", e); }
    try { initFinalForm(); } catch (e) { console.error("Final form initialization error:", e); }
    
    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      try { initSmoothScroll(); } catch(e) { console.error("Smooth scroll initialization error:", e); }
      initScrollAnimations();
      initMouseInteraction();
      initNavigationLinks();
      
      // Reveal header navigation after short delay if already scrolled
      setTimeout(() => {
        if (window.scrollY > 50) {
          document.getElementById("global-header").classList.add("reveal");
        }
      }, 1000);
    } else {
      console.warn("GSAP or ScrollTrigger not loaded. Activating fallback scroll layout.");
      
      // Reveal header immediately
      const header = document.getElementById("global-header");
      if (header) header.classList.add("reveal");
      
      // Transform viewport to normal relative blocks
      const viewport = document.getElementById("exhibition-viewport");
      if (viewport) {
        viewport.style.position = "relative";
        viewport.style.overflow = "visible";
        viewport.style.height = "auto";
        viewport.style.pointerEvents = "auto";
      }
      
      const scenes = document.querySelectorAll(".chapter-scene");
      scenes.forEach((scene) => {
        scene.style.position = "relative";
        scene.style.opacity = "1";
        scene.style.visibility = "visible";
        scene.style.pointerEvents = "auto";
        scene.style.height = "auto";
        scene.style.minHeight = "100vh";
        scene.style.padding = "10vh 8vw";
      });
      
      const scrollSections = document.getElementById("scroll-sections");
      if (scrollSections) {
        scrollSections.style.display = "none";
      }
    }
  }

  // --- HTML5 Canvas Gold Particles System ---
  const canvas = document.getElementById("particle-canvas");
  const ctx = canvas.getContext("2d");
  const particles = [];
  const particleCount = window.innerWidth < 768 ? 60 : 120;
  let gMouseX = null;
  let gMouseY = null;

  class GoldParticle {
    constructor(canvasEl) {
      this.canvas = canvasEl;
      this.reset();
      this.y = Math.random() * this.canvas.height; // initial random spread
    }

    reset() {
      this.x = Math.random() * this.canvas.width;
      this.y = this.canvas.height + 20;
      this.size = Math.random() * 1.5 + 0.6; // 0.6px to 2.1px
      this.speedY = -(Math.random() * 0.4 + 0.2); // Slow upward drift
      this.swaySpeed = Math.random() * 0.015 + 0.005;
      this.swayAmplitude = Math.random() * 1.2 + 0.4;
      this.swayOffset = Math.random() * Math.PI * 2;
      this.baseOpacity = Math.random() * 0.4 + 0.15;
      this.opacity = this.baseOpacity;
      this.color = this.getRandomGoldColor();
    }

    getRandomGoldColor() {
      const goldColors = [
        "#dfb76c", // soft gold
        "#fcf6ba", // bright gold
        "#b38728", // dark gold
        "#fbf5b7", // warm gold
        "#d4af37"  // pure gold
      ];
      return goldColors[Math.floor(Math.random() * goldColors.length)];
    }

    update() {
      this.y += this.speedY;
      this.swayOffset += this.swaySpeed;

      // Calculate base horizontal position with sine sway
      let targetX = this.x + Math.sin(this.swayOffset) * this.swayAmplitude;

      // Mouse repel logic
      if (gMouseX !== null && gMouseY !== null) {
        const dx = targetX - gMouseX;
        const dy = this.y - gMouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 140) {
          const force = (140 - dist) / 140;
          const pushX = (dx / dist) * force * 35;
          const pushY = (dy / dist) * force * 15;
          targetX += pushX;
          this.y += pushY;
        }
      }

      this.currentX = targetX;

      // Recycle if off screen
      if (this.y < -10 || this.currentX < -10 || this.currentX > this.canvas.width + 10) {
        this.reset();
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.currentX, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.opacity;
      ctx.fill();
    }
  }

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.scale(dpr, dpr);
  }

  function initParticles() {
    resizeCanvas();
    window.addEventListener("resize", () => {
      resizeCanvas();
    });

    for (let i = 0; i < particleCount; i++) {
      particles.push(new GoldParticle(canvas));
    }

    function animate() {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animate);
    }
    animate();
  }

  // Track mouse coordinates globally
  window.addEventListener("mousemove", (e) => {
    gMouseX = e.clientX;
    gMouseY = e.clientY;
  });

  window.addEventListener("mouseleave", () => {
    gMouseX = null;
    gMouseY = null;
  });


  let lenisInstance = null;

  function initSmoothScroll() {
    if (typeof Lenis !== "undefined") {
      lenisInstance = new Lenis({
        duration: 1.8,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // premium cinematic easing
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1.05,
        smoothTouch: false,
        touchMultiplier: 1.5,
        infinite: false,
      });

      // Synchronize Lenis scrolling with GSAP ScrollTrigger
      lenisInstance.on('scroll', ScrollTrigger.update);

      gsap.ticker.add((time) => {
        lenisInstance.raf(time * 1000);
      });

      gsap.ticker.lagSmoothing(0);
    }
  }

  function initScrollAnimations() {
    const activePlugins = [ScrollTrigger];
    if (typeof ScrollToPlugin !== "undefined") {
      activePlugins.push(ScrollToPlugin);
    }
    gsap.registerPlugin(...activePlugins);

    // Set initial classes for animations
    gsap.set(".chapter-scene:not(#chapter-01)", { autoAlpha: 0 });
    gsap.set("#chapter-01 .chapter-content", { opacity: 1, scale: 1, y: 0 });

    // Global timeline triggered by native GSAP pinning of the exhibition viewport
    const masterTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: "#exhibition-viewport",
        start: "top top",
        end: "+=1100%", // Extended to cover 8 chapters
        pin: true,
        scrub: 2.2,    // Smooth inertia and interpolation scrub
        onUpdate: (self) => {
          const progress = self.progress;
          updateActiveNav(progress);
          
          // Toggle active classes on scenes
          const index = Math.min(Math.floor(progress * 8), 7);
          const scenes = document.querySelectorAll(".chapter-scene");
          scenes.forEach((scene, idx) => {
            if (idx === index) {
              scene.classList.add("active");
            } else {
              scene.classList.remove("active");
            }
          });
        }
      }
    });

    // Chapter 1 -> Chapter Countdown (Overlapping Crossfades with Camera Glide)
    masterTimeline
      .to("#chapter-01 .chapter-content", { opacity: 0, scale: 1.05, y: -45, duration: 4, ease: "power1.inOut" })
      .to("#chapter-01", { autoAlpha: 0, duration: 4, ease: "power1.inOut" }, "<")
      
      .fromTo("#chapter-countdown", { autoAlpha: 0 }, { autoAlpha: 1, duration: 4, ease: "power1.inOut" }, "+=1.5")
      .fromTo(".countdown-strip-container", 
        { opacity: 0, scale: 0.95, y: 35 }, 
        { opacity: 1, scale: 1, y: 0, duration: 4, ease: "power1.inOut" }, "<")
      
      .to(".blue-glow-1", { scale: 1.15, x: 50, duration: 4, ease: "power1.inOut" }, "<")
      .to(".blue-glow-2", { scale: 1.05, y: -10, duration: 4, ease: "power1.inOut" }, "<");

    // Chapter Countdown -> Chapter 2 (Why Every Student Needs AI Literacy)
    masterTimeline
      .to(".countdown-strip-container", { opacity: 0, scale: 1.05, y: -35, duration: 4, ease: "power1.inOut" })
      .to("#chapter-countdown", { autoAlpha: 0, duration: 4, ease: "power1.inOut" }, "<")
      
      .fromTo("#chapter-02", { autoAlpha: 0 }, { autoAlpha: 1, duration: 4, ease: "power1.inOut" }, "+=1.5")
      .fromTo("#chapter-02 .chapter-content", 
        { opacity: 0, scale: 0.95, y: 45 }, 
        { opacity: 1, scale: 1, y: 0, duration: 4, ease: "power1.inOut" }, "<")
      
      .to(".blue-glow-1", { scale: 1.35, x: 120, duration: 4, ease: "power1.inOut" }, "<")
      .to(".blue-glow-2", { scale: 1.15, y: -30, duration: 4, ease: "power1.inOut" }, "<");

    // Chapter 2 -> Chapter 3 (Guides)
    masterTimeline
      .to("#chapter-02 .chapter-content", { opacity: 0, scale: 1.05, y: -45, duration: 4, ease: "power1.inOut" })
      .to("#chapter-02", { autoAlpha: 0, duration: 4, ease: "power1.inOut" }, "<")
      
      .fromTo("#chapter-guides", { autoAlpha: 0 }, { autoAlpha: 1, duration: 4, ease: "power1.inOut" }, "+=1.5")
      .fromTo("#chapter-guides .chapter-content", 
        { opacity: 0, scale: 0.95, y: 45 }, 
        { opacity: 1, scale: 1, y: 0, duration: 4, ease: "power1.inOut" }, "<")
      .to(".blue-glow-1", { scale: 1.45, x: 40, duration: 4, ease: "power1.inOut" }, "<")
      .to(".blue-glow-2", { scale: 1.25, y: 15, duration: 4, ease: "power1.inOut" }, "<");

    // Chapter 3 (Guides) -> Chapter 4 (Vault)
    masterTimeline
      .to("#chapter-guides .chapter-content", { opacity: 0, scale: 1.05, y: -45, duration: 4, ease: "power1.inOut" })
      .to("#chapter-guides", { autoAlpha: 0, duration: 4, ease: "power1.inOut" }, "<")
      
      .fromTo("#chapter-03", { autoAlpha: 0 }, { autoAlpha: 1, duration: 4, ease: "power1.inOut" }, "+=1.5")
      .fromTo("#chapter-03 .chapter-content", 
        { opacity: 0, scale: 0.95, y: 45 }, 
        { opacity: 1, scale: 1, y: 0, duration: 4, ease: "power1.inOut" }, "<")
      .to(".gold-glow-1", { opacity: 0.65, scale: 1.25, duration: 4, ease: "power1.inOut" }, "<")
      
      // Progressive reveal animations for all 8 floating cards around the passport centerpiece
      // Max 3 cards visible at any time, appearing progressively as the user scrolls
      
      // Step 1: Reveal 1 & 2
      .fromTo("#chapter-03 .card-learning-1", { x: -160, z: -80, rotation: -1.5, opacity: 0 }, { x: 0, z: -80, rotation: -1.5, opacity: 0.9, duration: 4, ease: "power2.out" }, "<=1")
      .fromTo("#chapter-03 .card-learning-2", { x: 160, z: -120, rotation: 1, opacity: 0 }, { x: 0, z: -120, rotation: 1, opacity: 0.8, duration: 4, ease: "power2.out" }, "<=0.5")
      
      // Step 2: Reveal 7 (now 3 cards visible: 1, 2, 7)
      .fromTo("#chapter-03 .card-learning-7", { x: -160, z: -100, rotation: -1, opacity: 0 }, { x: 0, z: -100, rotation: -1, opacity: 0.9, duration: 4, ease: "power2.out" }, "+=1.5")
      
      // Step 3: Hide 1 & 2, Reveal 3 & 4 (now 3 cards visible: 7, 3, 4)
      .to("#chapter-03 .card-learning-1", { x: -160, opacity: 0, duration: 3, ease: "power2.in" }, "+=1.5")
      .to("#chapter-03 .card-learning-2", { x: 160, opacity: 0, duration: 3, ease: "power2.in" }, "<")
      .fromTo("#chapter-03 .card-learning-3", { x: -180, z: -40, rotation: -0.5, opacity: 0 }, { x: 0, z: -40, rotation: -0.5, opacity: 0.95, duration: 4, ease: "power2.out" }, "<=0.5")
      .fromTo("#chapter-03 .card-learning-4", { x: 180, z: -100, rotation: 1.5, opacity: 0 }, { x: 0, z: -100, rotation: 1.5, opacity: 0.85, duration: 4, ease: "power2.out" }, "<")
      
      // Step 4: Hide 7, Reveal 8 (now 3 cards visible: 3, 4, 8)
      .to("#chapter-03 .card-learning-7", { x: -160, opacity: 0, duration: 3, ease: "power2.in" }, "+=1.5")
      .fromTo("#chapter-03 .card-learning-8", { x: 160, z: -80, rotation: 1, opacity: 0 }, { x: 0, z: -80, rotation: 1, opacity: 0.9, duration: 4, ease: "power2.out" }, "<=0.5")
      
      // Step 5: Hide 3 & 4, Reveal 5 & 6 (now 3 cards visible: 8, 5, 6)
      .to("#chapter-03 .card-learning-3", { x: -180, opacity: 0, duration: 3, ease: "power2.in" }, "+=1.5")
      .to("#chapter-03 .card-learning-4", { x: 180, opacity: 0, duration: 3, ease: "power2.in" }, "<")
      .fromTo("#chapter-03 .card-learning-5", { x: -160, z: -150, rotation: -2, opacity: 0 }, { x: 0, z: -150, rotation: -2, opacity: 0.75, duration: 4, ease: "power2.out" }, "<=0.5")
      .fromTo("#chapter-03 .card-learning-6", { x: 160, z: -60, rotation: 0.5, opacity: 0 }, { x: 0, z: -60, rotation: 0.5, opacity: 0.9, duration: 4, ease: "power2.out" }, "<")
      
      // Step 6: Hide 8 (now 2 cards visible: 5, 6)
      .to("#chapter-03 .card-learning-8", { x: 160, opacity: 0, duration: 3, ease: "power2.in" }, "+=1.5");

    // Chapter 4 (Vault) -> Chapter 5 (Journey)
    masterTimeline
      .to("#chapter-03 .card-learning-5", { x: -160, opacity: 0, duration: 3, ease: "power2.in" })
      .to("#chapter-03 .card-learning-6", { x: 160, opacity: 0, duration: 3, ease: "power2.in" }, "<")
      .to("#chapter-03 .chapter-content", { opacity: 0, scale: 1.05, y: -45, duration: 4, ease: "power1.inOut" })
      .to("#chapter-03", { autoAlpha: 0, duration: 4, ease: "power1.inOut" }, "<")
      
      .fromTo("#chapter-04", { autoAlpha: 0 }, { autoAlpha: 1, duration: 4, ease: "power1.inOut" }, "+=1.5")
      .fromTo("#chapter-04 .chapter-content", 
        { opacity: 0, scale: 0.95, y: 45 }, 
        { opacity: 1, scale: 1, y: 0, duration: 4, ease: "power1.inOut" }, "<")
      .to("#journey-progress-line", { height: "100%", duration: 4, ease: "none" }, "<=0.8")
      .to(".timeline-step", {
        className: "timeline-step active",
        stagger: 0.6,
        duration: 1.2
      }, "<=0.8");

    // Chapter 5 (Journey) -> Chapter 6 (Identity)
    masterTimeline
      .to("#chapter-04 .chapter-content", { opacity: 0, scale: 1.05, y: -45, duration: 4, ease: "power1.inOut" })
      .to("#chapter-04", { autoAlpha: 0, duration: 4, ease: "power1.inOut" }, "<")
      
      .fromTo("#chapter-05", { autoAlpha: 0 }, { autoAlpha: 1, duration: 4, ease: "power1.inOut" }, "+=1.5")
      .fromTo("#chapter-05 .chapter-content", 
        { opacity: 0, scale: 0.95, y: 45 }, 
        { opacity: 1, scale: 1, y: 0, duration: 4, ease: "power1.inOut" }, "<")
      .to(".gold-glow-1", { opacity: 0.25, duration: 4, ease: "power1.inOut" }, "<")
      .to(".blue-glow-1", { scale: 1.05, x: -80, duration: 4, ease: "power1.inOut" }, "<");

    // Chapter 6 (Identity) -> Chapter 7 (Become)
    masterTimeline
      .to("#chapter-05 .chapter-content", { opacity: 0, scale: 1.05, y: -45, duration: 4, ease: "power1.inOut" })
      .to("#chapter-05", { autoAlpha: 0, duration: 4, ease: "power1.inOut" }, "<")
      
      .fromTo("#chapter-06", { autoAlpha: 0 }, { autoAlpha: 1, duration: 4, ease: "power1.inOut" }, "+=1.5")
      .fromTo("#chapter-06 .chapter-content", 
        { opacity: 0, scale: 0.95, y: 45 }, 
        { opacity: 1, scale: 1, y: 0, duration: 4, ease: "power1.inOut" }, "<")
      .to(".blue-glow-2", { scale: 1.45, opacity: 0.4, duration: 4, ease: "power1.inOut" }, "<");

    // Reveal header navigation after leaving the Hero screen (scrolled past 50px)
    ScrollTrigger.create({
      trigger: "#exhibition-viewport",
      start: "top top",
      end: "+=1100%",
      onUpdate: (self) => {
        const header = document.getElementById("global-header");
        if (header) {
          if (self.scroll() > 50) {
            header.classList.add("reveal");
          } else {
            header.classList.remove("reveal");
          }
        }
      }
    });
  }

  // Map scroll progress to the active header navigation link
  function updateActiveNav(progress) {
    // progress is 0.0 to 1.0. We map it to 8 indices (0 to 7)
    const index = Math.min(Math.floor(progress * 8), 7);
    const links = document.querySelectorAll(".nav-link");
    
    links.forEach((link, idx) => {
      const targetChap = parseInt(link.getAttribute("data-chapter"));
      if (targetChap === index) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

    // Check header outline CTA active state if on index 7 (Chapter 8 Register)
    const registerCTA = document.querySelector(".cta-outline");
    if (index === 7) {
      registerCTA.classList.add("active-state");
      registerCTA.style.borderColor = "var(--accent-gold)";
    } else {
      registerCTA.classList.remove("active-state");
      registerCTA.style.borderColor = "";
    }
  }


  // --- Interactive Mouse Parallax & 3D Tilt ---
  function initMouseInteraction() {
    window.addEventListener("mousemove", (e) => {
      // Normalized mouse coordinates: -0.5 to 0.5
      const mouseX = (e.clientX / window.innerWidth) - 0.5;
      const mouseY = (e.clientY / window.innerHeight) - 0.5;

      // Find the active chapter scene
      const activeScene = document.querySelector(".chapter-scene.active");
      if (!activeScene) return;

      // 3D tilt on card inner containers (supports multiple portraits in guides chapter)
      const cardContainers = activeScene.querySelectorAll(".card-inner-container");
      cardContainers.forEach((cardContainer) => {
        // Calculate tilt angles (max 12 degrees)
        const tiltX = -mouseY * 12;
        const tiltY = mouseX * 12;

        // Apply smooth transition using GSAP
        gsap.to(cardContainer, {
          rotateX: tiltX,
          rotateY: tiltY,
          duration: 0.8,
          ease: "power2.out",
          overwrite: "auto"
        });
      });

      // Parallax translation on text blocks (subtle shift opposite to mouse)
      const textBlock = activeScene.querySelector(".text-block");
      if (textBlock) {
        const transX = -mouseX * 15;
        const transY = -mouseY * 10;

        gsap.to(textBlock, {
          x: transX,
          y: transY,
          duration: 0.8,
          ease: "power2.out",
          overwrite: "auto"
        });
      }

      // Parallax layer depth effect on Chapter 3's floating glass cards (only on desktop)
      if (activeScene.id === "chapter-03" && window.innerWidth >= 968) {
        const glassCards = activeScene.querySelectorAll(".glass-card");
        glassCards.forEach((card) => {
          // Only apply parallax to cards that are currently visible/active in scroll progression
          if (gsap.getProperty(card, "opacity") < 0.05) return;

          const depth = parseFloat(card.getAttribute("data-depth")) || 0.3;
          // Use xPercent/yPercent to avoid overwriting x/y controlled by scroll timeline
          const shiftXPercent = mouseX * depth * 15;
          const shiftYPercent = mouseY * depth * 15;

          gsap.to(card, {
            xPercent: shiftXPercent,
            yPercent: shiftYPercent,
            duration: 1.0,
            ease: "power2.out",
            overwrite: "auto"
          });
        });
      }
    });

    // Reset rotation when mouse leaves window
    document.addEventListener("mouseleave", () => {
      const cardContainers = document.querySelectorAll(".card-inner-container");
      cardContainers.forEach((container) => {
        gsap.to(container, {
          rotateX: 0,
          rotateY: 0,
          duration: 1.2,
          ease: "power2.out"
        });
      });

      const textBlocks = document.querySelectorAll(".text-block");
      textBlocks.forEach((block) => {
        gsap.to(block, {
          x: 0,
          y: 0,
          duration: 1.2,
          ease: "power2.out"
        });
      });

      const glassCards = document.querySelectorAll(".glass-card");
      glassCards.forEach((card) => {
        gsap.to(card, {
          xPercent: 0,
          yPercent: 0,
          duration: 1.5,
          ease: "power2.out",
          overwrite: "auto"
        });
      });
    });
  }


  function initNavigationLinks() {
    const navItems = document.querySelectorAll(".nav-link, .btn-secondary");

    navItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        const href = item.getAttribute("href");
        if (href && href.startsWith("#")) {
          e.preventDefault();
          let chapterIndex = 0;
          
          if (href === "#discover") chapterIndex = 0;
          else if (href === "#activate") chapterIndex = 2;
          else if (href === "#guides") chapterIndex = 3;
          else if (href === "#vault") chapterIndex = 4;
          else if (href === "#journey") chapterIndex = 5;
          else if (href === "#identity") chapterIndex = 6;
          else if (href === "#register") chapterIndex = 7;

          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          const scrollTarget = (chapterIndex / 7) * maxScroll;
          
          if (lenisInstance) {
            lenisInstance.scrollTo(scrollTarget, {
              duration: 2.0,
              ease: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
            });
          } else if (gsap.plugins.scrollTo) {
            gsap.to(window, {
              scrollTo: scrollTarget,
              duration: 2.0,
              ease: "power4.inOut"
            });
          } else {
            window.scrollTo({
              top: scrollTarget,
              behavior: "smooth"
            });
          }
        }
      });
    });
  }

  // --- Premium Glass Registration Modal ---
  function initRegistrationModal() {
    const modal = document.getElementById("registration-modal");
    const openBtns = document.querySelectorAll(".trigger-modal-btn");
    const closeBtn = document.getElementById("close-modal-btn");
    const form = document.getElementById("webinar-register-form");
    const formView = document.getElementById("modal-form-view");
    const successView = document.getElementById("modal-success-view");
    const successStudentName = document.getElementById("success-student-name");
    const successCitizenId = document.getElementById("success-citizen-id");

    if (!modal) return;

    // Open Modal
    openBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        modal.classList.add("active");
        document.body.style.overflow = "hidden"; // disable background scrolling
      });
    });

    // Close Modal
    function closeModal() {
      modal.classList.remove("active");
      document.body.style.overflow = ""; // restore background scrolling
      
      // Reset form and views after close animation
      setTimeout(() => {
        if (form) form.reset();
        const groups = form ? form.querySelectorAll(".form-group") : [];
        groups.forEach((g) => g.classList.remove("invalid"));
        if (formView) formView.classList.add("active");
        if (successView) successView.classList.remove("active");
      }, 600);
    }

    if (closeBtn) closeBtn.addEventListener("click", closeModal);

    // Close on click outside content
    const blurBg = modal.querySelector(".modal-blur-bg");
    if (blurBg) {
      blurBg.addEventListener("click", closeModal);
    }

    // Form validation and submit
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        
        let isFormValid = true;
        const inputs = form.querySelectorAll(".form-input");

        inputs.forEach((input) => {
          const group = input.closest(".form-group");
          let isInputValid = true;

          // Required Check
          if (input.hasAttribute("required") && !input.value.trim()) {
            isInputValid = false;
          } 
          // Email Format Check
          else if (input.getAttribute("type") === "email") {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value.trim())) {
              isInputValid = false;
            }
          } 
          // Phone Number Format Check
          else if (input.getAttribute("type") === "tel") {
            const phoneRegex = /^[0-9]{10}$/;
            if (!phoneRegex.test(input.value.trim().replace(/\D/g, ""))) {
              isInputValid = false;
            }
          }

          if (group) {
            if (!isInputValid) {
              group.classList.add("invalid");
              isFormValid = false;
            } else {
              group.classList.remove("invalid");
            }
          }
        });

        // If form is valid, trigger success transition
        if (isFormValid) {
          const studentName = document.getElementById("reg-name").value.trim();
          if (successStudentName) successStudentName.textContent = studentName;
          
          // Generate unique Citizen ID: random 6 digits
          const citizenIdVal = Math.floor(100000 + Math.random() * 900000);
          if (successCitizenId) successCitizenId.textContent = citizenIdVal;

          // Transition Modal Views
          if (formView) formView.classList.remove("active");
          if (successView) successView.classList.add("active");
        }
      });

      // Remove invalid class on input typing
      const inputs = form.querySelectorAll(".form-input");
      inputs.forEach((input) => {
        input.addEventListener("input", () => {
          const group = input.closest(".form-group");
          if (group && group.classList.contains("invalid")) {
            group.classList.remove("invalid");
          }
        });
        if (input.tagName === "SELECT") {
          input.addEventListener("change", () => {
            const group = input.closest(".form-group");
            if (group && group.classList.contains("invalid")) {
              group.classList.remove("invalid");
            }
          });
        }
      });
    }
  }

  // --- Final Full-Screen Conversion Form ---
  function initFinalForm() {
    const form = document.getElementById("final-register-form");
    const formView = document.getElementById("final-form-view");
    const successView = document.getElementById("final-success-view");
    const passportImg = document.querySelector(".final-passport-img");
    const passportContainer = document.getElementById("final-passport-container");

    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      let isFormValid = true;
      const inputs = form.querySelectorAll(".field-input");
      const termsCheckbox = document.getElementById("fin-terms");
      const termsRow = termsCheckbox ? termsCheckbox.closest(".form-terms-row") : null;

      // Validate inputs
      inputs.forEach((input) => {
        const field = input.closest(".form-field");
        let isInputValid = true;

        if (input.hasAttribute("required") && !input.value.trim()) {
          isInputValid = false;
        } else if (input.getAttribute("type") === "email") {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(input.value.trim())) {
            isInputValid = false;
          }
        } else if (input.getAttribute("type") === "tel" && input.hasAttribute("required")) {
          const phoneRegex = /^[0-9]{10}$/;
          if (!phoneRegex.test(input.value.trim().replace(/\D/g, ""))) {
            isInputValid = false;
          }
        }

        if (field) {
          if (!isInputValid) {
            field.classList.add("invalid");
            isFormValid = false;
          } else {
            field.classList.remove("invalid");
          }
        }
      });

      // Validate Terms Checkbox
      if (termsCheckbox) {
        if (!termsCheckbox.checked) {
          if (termsRow) termsRow.classList.add("invalid");
          isFormValid = false;
        } else {
          if (termsRow) termsRow.classList.remove("invalid");
        }
      }

      if (isFormValid) {
        // Transition Views with Smooth GSAP Fade
        gsap.to(formView, {
          opacity: 0,
          y: -10,
          duration: 0.6,
          ease: "power2.inOut",
          onComplete: () => {
            formView.classList.remove("active");
            successView.classList.add("active");
            gsap.fromTo(successView, 
              { opacity: 0, y: 15 }, 
              { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
            );
          }
        });

        // Activated Passport Cinematic Animation
        if (passportImg) {
          passportImg.classList.add("illuminated");
        }
        if (passportContainer) {
          // Rises slightly
          gsap.to(passportContainer, {
            y: "-=30px",
            duration: 2.0,
            ease: "power2.out"
          });
        }
        
        // Intensify blue glow briefly
        gsap.to(".blue-glow-2", {
          scale: 1.8,
          opacity: 0.65,
          duration: 2.0,
          ease: "power2.out"
        });
      }
    });

    // Remove invalid highlights on user input
    const inputs = form.querySelectorAll(".field-input");
    inputs.forEach((input) => {
      input.addEventListener("input", () => {
        const field = input.closest(".form-field");
        if (field && field.classList.contains("invalid")) {
          field.classList.remove("invalid");
        }
      });
      if (input.tagName === "SELECT") {
        input.addEventListener("change", () => {
          const field = input.closest(".form-field");
          if (field && field.classList.contains("invalid")) {
            field.classList.remove("invalid");
          }
        });
      }
    });

    const termsCheckbox = document.getElementById("fin-terms");
    if (termsCheckbox) {
      termsCheckbox.addEventListener("change", () => {
        const termsRow = termsCheckbox.closest(".form-terms-row");
        if (termsRow && termsCheckbox.checked) {
          termsRow.classList.remove("invalid");
        }
      });
    }

    // Success CTA Buttons Binding
    const returnBtn = document.querySelector(".return-home-btn");
    const exploreBtn = document.querySelector(".explore-vault-btn");

    if (returnBtn) {
      returnBtn.addEventListener("click", (e) => {
        e.preventDefault();
        // Scroll to the very beginning (index 0)
        scrollToChapter(0);
      });
    }

    if (exploreBtn) {
      exploreBtn.addEventListener("click", (e) => {
        e.preventDefault();
        // Scroll to the Vault section (index 4)
        scrollToChapter(4);
      });
    }
  }

  // Helper Scroll Function using existing Lenis instance or ScrollTrigger logic
  function scrollToChapter(chapterIndex) {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const scrollTarget = (chapterIndex / 7) * maxScroll;
    
    if (lenisInstance) {
      lenisInstance.scrollTo(scrollTarget, {
        duration: 2.2,
        ease: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
      });
    } else {
      window.scrollTo({
        top: scrollTarget,
        behavior: "smooth"
      });
    }
  }

  // --- Countdown Timer ---
  function initCountdown() {
    const targetDate = new Date(2026, 5, 28, 10, 0, 0).getTime();

    // Helper function to update element with a brief glow if the value changed
    function setValWithGlow(el, val) {
      if (el.textContent !== val) {
        el.textContent = val;
        el.classList.add("active-digit-glow");
        setTimeout(() => {
          el.classList.remove("active-digit-glow");
        }, 300);
      }
    }

    function updateCounter() {
      const now = new Date().getTime();
      const difference = targetDate - now;

      const daysEl = document.getElementById("strip-days");
      const hoursEl = document.getElementById("strip-hours");
      const minsEl = document.getElementById("strip-mins");
      const secsEl = document.getElementById("strip-secs");

      if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

      if (difference <= 0) {
        setValWithGlow(daysEl, "00");
        setValWithGlow(hoursEl, "00");
        setValWithGlow(minsEl, "00");
        setValWithGlow(secsEl, "00");
        clearInterval(timerInterval);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setValWithGlow(daysEl, String(days).padStart(2, "0"));
      setValWithGlow(hoursEl, String(hours).padStart(2, "0"));
      setValWithGlow(minsEl, String(minutes).padStart(2, "0"));
      setValWithGlow(secsEl, String(seconds).padStart(2, "0"));
    }

    updateCounter();
    const timerInterval = setInterval(updateCounter, 1000);
  }

  // Dynamic ScrollTrigger refresh callback (empty fallback)
  ScrollTrigger.addEventListener("refresh", () => {});

});


