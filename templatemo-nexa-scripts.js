// Hamburger Menu Toggle
const hamburger = document.getElementById('hamburger');
const mainNav = document.querySelector('.main-nav');

hamburger.addEventListener('click', () => {
   hamburger.classList.toggle('active');
   mainNav.classList.toggle('active');
});

// Close mobile menu when a link is clicked
const navLinks = document.querySelectorAll('.nav-links li');
navLinks.forEach(link => {
   link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mainNav.classList.remove('active');
   });
});

// Loading Screen
window.addEventListener('load', () => {
   const urlParams = new URLSearchParams(window.location.search);
   const sectionParam = urlParams.get('section');
   
   setTimeout(() => {
      document.getElementById('loadingScreen').classList.add('hidden');
      if (sectionParam) {
         showSection(sectionParam);
      } else {
         showSection('introduction');
      }
   }, 1000);
});

// Section switching logic
const contentSections = document.querySelectorAll('.content-section');
const mainHeader = document.getElementById('mainHeader');
const mainFooter = document.getElementById('mainFooter');
let isTransitioning = false;

function showSection(sectionId) {
   if (isTransitioning) return;
   isTransitioning = true;

   const activeSection = document.querySelector('.content-section.active');
   
   // If we are already on this section, do nothing
   if (activeSection && activeSection.id === sectionId) {
      isTransitioning = false;
      return;
   }

   // Fade out current section if it exists
   if (activeSection) {
      activeSection.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      activeSection.style.opacity = '0';
      activeSection.style.transform = 'translateY(-20px)';
      
      setTimeout(() => {
         activeSection.classList.remove('active');
         activeSection.style.opacity = '';
         activeSection.style.transform = '';
         activeSection.style.transition = '';
         
         revealNewSection(sectionId);
      }, 400);
   } else {
      // If no active section, just reveal new section
      revealNewSection(sectionId);
   }
}

function revealNewSection(sectionId) {
   const section = document.getElementById(sectionId);
   section.classList.add('active');
   
   // Animate stats if introduction section
   if (sectionId === 'introduction') {
      setTimeout(animateStats, 500);
   }

   window.scrollTo({ top: 0, behavior: 'smooth' });
   isTransitioning = false;
}

function backToMenu() {
   // Since the menu is now in the header and home page, 
   // backToMenu just takes you to the introduction section
   showSection('introduction');
}

// Animate Stats
function animateStats() {
   const metricValues = document.querySelectorAll('.metric-value[data-target]');
   metricValues.forEach((el, index) => {
      setTimeout(() => {
         const target = parseInt(el.dataset.target);
         let current = 0;
         const increment = target / 40;
         const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
               current = target;
               clearInterval(timer);
            }
            el.textContent = Math.floor(current);
         }, 30);
      }, index * 200);
   });
}

// Tab Switching
function switchTab(btn, tabId) {
   document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
   btn.classList.add('active');

   document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
   document.getElementById(tabId).classList.add('active');
}

// Gallery Filter
function filterGallery(category, btn) {
   document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
   btn.classList.add('active');

   const items = document.querySelectorAll('.gallery-item');
   items.forEach(item => {
      if (category === 'all' || item.dataset.category === category) {
         item.style.display = 'block';
         item.style.animation = 'tabFade 0.4s ease-out';
      } else {
         item.style.display = 'none';
      }
   });
}