import './index.css';

document.addEventListener('DOMContentLoaded', () => {
  /* ==========================================================================
     MOBILE NAVIGATION TOGGLE
     ========================================================================== */
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      mobileToggle.classList.toggle('open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when clicking links
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        mobileToggle.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ==========================================================================
     HEADER SCROLL EFFECT
     ========================================================================== */
  const header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  /* ==========================================================================
     LIVE OCCUPANCY SIMULATOR
     ========================================================================== */
  const occupancyCountEl = document.getElementById('occupancy-count');
  const occupancyBarEl = document.getElementById('occupancy-bar');
  const occupancyDescEl = document.getElementById('occupancy-status-desc');
  const platformsCountEl = document.getElementById('platforms-count');

  const maxCapacity = 80;
  const totalPlatforms = 8;

  function updateOccupancy() {
    if (!occupancyCountEl || !occupancyBarEl) return;

    const now = new Date();
    const hour = now.getHours();
    
    // Estimate occupancy base depending on hour
    let baseOccupancy = 6; // late night baseline
    
    if (hour >= 6 && hour < 9) {
      baseOccupancy = 40 + Math.floor(Math.random() * 15); // Morning rush
    } else if (hour >= 9 && hour < 12) {
      baseOccupancy = 25 + Math.floor(Math.random() * 10); // Late morning
    } else if (hour >= 12 && hour < 15) {
      baseOccupancy = 15 + Math.floor(Math.random() * 10); // Afternoon drop
    } else if (hour >= 15 && hour < 17) {
      baseOccupancy = 28 + Math.floor(Math.random() * 12); // Pre-evening build
    } else if (hour >= 17 && hour < 20) {
      baseOccupancy = 55 + Math.floor(Math.random() * 18); // Evening peak
    } else if (hour >= 20 && hour < 22) {
      baseOccupancy = 30 + Math.floor(Math.random() * 12); // Wind down
    } else if (hour >= 22 || hour < 6) {
      baseOccupancy = 5 + Math.floor(Math.random() * 5); // Night warriors
    }

    // Add a small live fluctuation (+/- 2 people)
    let variance = Math.floor(Math.random() * 5) - 2;
    let liveOccupancy = Math.max(2, Math.min(maxCapacity - 2, baseOccupancy + variance));

    // Calculate details
    const percentage = (liveOccupancy / maxCapacity) * 100;
    
    // Calculate platform counts
    let freePlatforms = totalPlatforms - Math.floor((liveOccupancy / maxCapacity) * totalPlatforms);
    freePlatforms = Math.max(0, Math.min(totalPlatforms, freePlatforms));
    // Ensure at least one platform is theoretically open if occupancy isn't slammed
    if (freePlatforms === 0 && liveOccupancy < maxCapacity - 10) {
      freePlatforms = 1;
    }

    // Update UI elements
    animateCounter(occupancyCountEl, liveOccupancy);
    occupancyBarEl.style.width = `${percentage}%`;
    platformsCountEl.textContent = `${freePlatforms} / ${totalPlatforms}`;

    // Status description
    if (percentage > 75) {
      occupancyDescEl.textContent = 'Peak Rush: Platforms highly active. Brief wait times.';
      occupancyBarEl.style.backgroundColor = '#ff4d4d'; // Red alert
      occupancyBarEl.style.boxShadow = '0 0 8px #ff4d4d';
    } else if (percentage > 45) {
      occupancyDescEl.textContent = 'Moderate Activity: High energy. Standard platform access.';
      occupancyBarEl.style.backgroundColor = 'var(--accent)'; // Standard lime
      occupancyBarEl.style.boxShadow = '0 0 8px var(--accent)';
    } else {
      occupancyDescEl.textContent = 'Quiet Session: Perfect conditions. All platforms open.';
      occupancyBarEl.style.backgroundColor = '#00e5ff'; // Chill cyan
      occupancyBarEl.style.boxShadow = '0 0 8px #00e5ff';
    }
  }

  // Periodic occupancy update
  if (occupancyCountEl) {
    updateOccupancy();
    setInterval(updateOccupancy, 6000);
  }

  /* ==========================================================================
     SWEAT & FUEL INTERACTIVE CALCULATOR
     ========================================================================== */
  const weightSlider = document.getElementById('weight-slider');
  const weightVal = document.getElementById('weight-val');
  const durationSlider = document.getElementById('duration-slider');
  const durationVal = document.getElementById('duration-val');
  
  const goalButtons = document.querySelectorAll('.goal-btn');
  const intensityButtons = document.querySelectorAll('.intensity-btn');

  const proteinResult = document.getElementById('protein-result');
  const hydrationResult = document.getElementById('hydration-result');
  const plungeResult = document.getElementById('plunge-result');

  const proteinBar = document.getElementById('protein-bar');
  const hydrationBar = document.getElementById('hydration-bar');
  const plungeBar = document.getElementById('plunge-bar');

  const proteinDesc = document.getElementById('protein-desc');
  const plungeDesc = document.getElementById('plunge-desc');

  let activeGoal = 'muscle';
  let activeIntensity = 2; // Default Heavy Grind

  function initCalculator() {
    if (!weightSlider || !durationSlider) return;

    // Sliders input events
    weightSlider.addEventListener('input', (e) => {
      weightVal.textContent = e.target.value;
      calculateProtocols();
    });

    durationSlider.addEventListener('input', (e) => {
      durationVal.textContent = e.target.value;
      calculateProtocols();
    });

    // Goal buttons events
    goalButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        goalButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeGoal = btn.dataset.goal;
        calculateProtocols();
      });
    });

    // Intensity buttons events
    intensityButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        intensityButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeIntensity = parseInt(btn.dataset.intensity);
        calculateProtocols();
      });
    });

    // Initial calculation
    calculateProtocols();
  }

  function calculateProtocols() {
    if (!weightSlider || !proteinResult) return;

    const weight = parseFloat(weightSlider.value);
    const duration = parseFloat(durationSlider.value);

    // 1. Protein target calculation (g)
    let proteinMultiplier = 0.35;
    if (activeGoal === 'muscle') {
      proteinMultiplier = 0.38 + activeIntensity * 0.04; // High protein focus
    } else if (activeGoal === 'fat') {
      proteinMultiplier = 0.34 + activeIntensity * 0.03; // Calorie deficit preservation
    } else {
      proteinMultiplier = 0.30 + activeIntensity * 0.03; // Endurance preservation
    }
    
    let protein = Math.round(weight * proteinMultiplier);
    
    // Description text updates
    if (activeGoal === 'muscle') {
      proteinDesc.textContent = 'High-dose protein: optimal for muscle protein synthesis.';
    } else if (activeGoal === 'fat') {
      proteinDesc.textContent = 'Moderate-high protein: preserves lean mass during deficit.';
    } else {
      proteinDesc.textContent = 'Moderate protein: supports recovery of glycogen storage.';
    }

    // 2. Hydration Target (ml)
    let sweatRate = 450; // ml per hour base
    if (activeIntensity === 1) sweatRate = 350;
    else if (activeIntensity === 3) sweatRate = 750;

    let hydration = Math.round((duration / 60) * sweatRate + weight * 2);
    // Round to nearest 50ml
    hydration = Math.round(hydration / 50) * 50;

    // 3. Cold Plunge Target (minutes)
    let plungeTime = 0;
    let temperature = '8';
    if (activeIntensity === 1) {
      plungeTime = 3;
      temperature = '8';
      plungeDesc.textContent = 'Gentle recovery: reduces DOMS and regulates nervous system.';
    } else if (activeIntensity === 2) {
      plungeTime = 5;
      temperature = '6';
      plungeDesc.textContent = 'Standard contrast: reduces vascular inflammation and swells.';
    } else {
      plungeTime = 8;
      temperature = '4';
      plungeDesc.textContent = 'Elite recovery: high metabolic booster, system-wide recovery.';
    }

    // Update counter displays
    proteinResult.textContent = `${protein} g`;
    hydrationResult.textContent = `${hydration} ml`;
    plungeResult.textContent = `${plungeTime} mins`;

    // Max cap references for bars
    const maxProteinRef = 65;
    const maxHydrationRef = 1800;
    const maxPlungeRef = 10;

    // Update progress bars widths
    proteinBar.style.width = `${Math.min(100, (protein / maxProteinRef) * 100)}%`;
    hydrationBar.style.width = `${Math.min(100, (hydration / maxHydrationRef) * 100)}%`;
    plungeBar.style.width = `${Math.min(100, (plungeTime / maxPlungeRef) * 100)}%`;
  }

  // Init calculator execution
  initCalculator();

  /* ==========================================================================
     AMBIENCE AUDIO TOGGLE
     ========================================================================== */
  const soundToggleBtn = document.getElementById('sound-toggle-btn');
  const soundStatusText = document.getElementById('sound-status');
  const gymAmbience = document.getElementById('gym-ambience');
  const playIcon = document.getElementById('play-icon');
  const pauseIcon = document.getElementById('pause-icon');
  const soundBtnText = document.getElementById('sound-btn-text');

  if (soundToggleBtn && gymAmbience) {
    // Set low volume to avoid blasting the user
    gymAmbience.volume = 0.25;

    soundToggleBtn.addEventListener('click', () => {
      if (gymAmbience.paused) {
        gymAmbience.play()
          .then(() => {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
            soundBtnText.textContent = 'Stop Live';
            soundStatusText.textContent = 'Sound system: Heavy Gym playlist streaming LIVE 🔊';
            soundToggleBtn.style.backgroundColor = '#ff4d4d';
            soundToggleBtn.style.color = '#fff';
            soundToggleBtn.style.boxShadow = '0 4px 10px rgba(255, 77, 77, 0.2)';
          })
          .catch(err => {
            console.error('Audio playback failed: ', err);
            soundStatusText.textContent = 'Audio blocked by browser. Please interact with the page first.';
          });
      } else {
        gymAmbience.pause();
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        soundBtnText.textContent = 'Listen Live';
        soundStatusText.textContent = 'Sound system: Heavy Rock & Metal playlist active';
        soundToggleBtn.style.backgroundColor = 'var(--accent)';
        soundToggleBtn.style.color = 'var(--bg-main)';
        soundToggleBtn.style.boxShadow = '0 4px 10px rgba(210, 255, 0, 0.1)';
      }
    });
  }

  /* ==========================================================================
     CONTACT FORM SUBMISSION
     ========================================================================== */
  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');

  if (contactForm && formSuccess) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Simulate submission animation
      const submitBtn = contactForm.querySelector('.btn-submit');
      const origText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Registering...</span>⚡';

      setTimeout(() => {
        // Hide form and show success message
        contactForm.style.display = 'none';
        formSuccess.style.display = 'block';
        
        // Auto scroll to success message
        formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 1200);
    });
  }

  /* ==========================================================================
     HELPER UTILITY FUNCTIONS
     ========================================================================== */
  function animateCounter(element, targetValue) {
    let currentValue = parseInt(element.textContent) || 0;
    if (currentValue === targetValue) return;

    const duration = 800; // ms
    const startTime = performance.now();

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easeOutQuad = progress * (2 - progress);
      const value = Math.floor(currentValue + (targetValue - currentValue) * easeOutQuad);
      
      element.textContent = value;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = targetValue;
      }
    }

    requestAnimationFrame(step);
  }
});
