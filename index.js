let scene, camera, renderer, crystalMesh, gridPoints;
let mouseX = 0, mouseY = 0;

function initThree() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.z = 800;

    renderer = new THREE.WebGLRenderer({ 
        alpha: true, 
        antialias: true 
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // 1. Background Grid/Particles
    const gridGeometry = new THREE.BufferGeometry();
    const gridCount = 2000;
    const gridPos = new Float32Array(gridCount * 3);
    for (let i = 0; i < gridCount; i++) {
        gridPos[i * 3] = (Math.random() - 0.5) * 3000;
        gridPos[i * 3 + 1] = (Math.random() - 0.5) * 3000;
        gridPos[i * 3 + 2] = (Math.random() - 0.5) * 3000;
    }
    gridGeometry.setAttribute('position', new THREE.BufferAttribute(gridPos, 3));
    
    const gridMaterial = new THREE.PointsMaterial({
        color: 0x0ea5e9,
        size: 3,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending
    });
    gridPoints = new THREE.Points(gridGeometry, gridMaterial);
    scene.add(gridPoints);

    // 2. Hero Crystal Object
    const crystalGeometry = new THREE.IcosahedronGeometry(150, 1);
    const crystalMaterial = new THREE.MeshPhongMaterial({
        color: 0x0ea5e9,
        wireframe: true,
        transparent: true,
        opacity: 0.8,
        emissive: 0x0ea5e9,
        emissiveIntensity: 0.5
    });
    crystalMesh = new THREE.Mesh(crystalGeometry, crystalMaterial);
    
    // Position it for the Hero side container (approximate)
    crystalMesh.position.set(400, 0, 0); 
    scene.add(crystalMesh);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x0ea5e9, 2);
    pointLight.position.set(200, 200, 200);
    scene.add(pointLight);

    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX - window.innerWidth / 2) / 100;
        mouseY = (e.clientY - window.innerHeight / 2) / 100;
    });
}

function animate() {
    requestAnimationFrame(animate);
    
    // Smooth rotation
    crystalMesh.rotation.y += 0.005;
    crystalMesh.rotation.x += 0.002;
    
    // Mouse interaction for background
    gridPoints.rotation.y += 0.0005;
    gridPoints.position.x += (mouseX - gridPoints.position.x) * 0.05;
    gridPoints.position.y += (-mouseY - gridPoints.position.y) * 0.05;

    // Pulse effect for crystal
    const time = Date.now() * 0.001;
    crystalMesh.scale.setScalar(1 + Math.sin(time) * 0.05);

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// GSAP Animations
gsap.registerPlugin(ScrollTrigger);

function initAnimations() {
    // Hero Animations
    gsap.from(".hero-title", { duration: 1.5, y: 100, opacity: 0, ease: "expo.out" });
    gsap.from(".hero-tagline, .hero-subtext, .hero-btns", { 
        duration: 1.2, 
        y: 50, 
        opacity: 0, 
        stagger: 0.2, 
        ease: "power4.out",
        delay: 0.6
    });

    // Section Reveal Animations
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        gsap.from(section, {
            scrollTrigger: {
                trigger: section,
                start: "top 85%",
                toggleActions: "play none none reverse"
            },
            y: 80,
            opacity: 0,
            duration: 1.2,
            ease: "power3.out"
        });
    });

    // Stats Counter Animation
    const stats = document.querySelectorAll('.stat-number');
    stats.forEach(stat => {
        const target = +stat.getAttribute('data-target');
        gsap.to(stat, {
            scrollTrigger: {
                trigger: stat,
                start: "top 95%",
            },
            innerText: target,
            duration: 2,
            snap: { innerText: 1 },
            ease: "power1.out"
        });
    });

    // Glass Card Hover Effect (subtle parallax)
    document.querySelectorAll('.glass-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            gsap.to(card, { rotateX, rotateY, duration: 0.5 });
        });
        card.addEventListener('mouseleave', () => {
            gsap.to(card, { rotateX: 0, rotateY: 0, duration: 1 });
        });
    });
}

// AI Assistant Logic
const aiToggle = document.getElementById('ai-toggle');
const aiChatWindow = document.getElementById('ai-chat-window');
const closeChat = document.getElementById('close-chat');
const aiMessages = document.getElementById('ai-messages');

aiToggle.addEventListener('click', () => aiChatWindow.classList.toggle('active'));
closeChat.addEventListener('click', () => aiChatWindow.classList.remove('active'));

function addMessage(text, type) {
    const msg = document.createElement('div');
    msg.className = `message ${type}-msg`;
    msg.innerText = text;
    aiMessages.appendChild(msg);
    aiMessages.scrollTop = aiMessages.scrollHeight;
}

const GEMINI_API_KEY = "AIzaSyDjTQ36fOS0QJsNt4n0F4Wz9iZCcRf2h-s"; 

async function getGeminiResponse(userMessage) {
    try {
        // Using gemini-flash-latest as a stable alias
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
        
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `You are Avika, the highly intelligent and premium AI assistant of Avionix Systems. 
                        Avionix Systems is a leading software development company founded by Avinash Kumar Pandey.
                        We specialize in Web Development (React, Next.js), AI Solutions (Gemini integration, Automation), and Scalable Custom Software (Java, Spring Boot).
                        
                        Tone: Professional, helpful, tech-savvy, and concise. 
                        Context:
                        - Services: Web Apps, AI Tools, ERP Systems, API Development.
                        - Portfolio: EX Chat (Encrypted Chat), Shop Easy (E-commerce), Product Management (ERP).
                        - Contact: hello@Avionixsystems.in
                        
                        User said: ${userMessage}`
                    }]
                }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Gemini API Error Response:", data);
            throw new Error(data.error?.message || `API returned status ${response.status}`);
        }

        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
            return data.candidates[0].content.parts[0].text;
        } else {
            console.error("Unexpected Gemini API response structure:", data);
            throw new Error("Invalid response format from API");
        }
    } catch (error) {
        console.error("Detailed AI Assistant Error:", error);
        return "I'm sorry, I'm having a bit of trouble connecting to my brain right now. Please try again in a moment, or reach out to us directly at hello@Avionixsystems.in!";
    }
}

async function handleAiChat() {
    const input = document.getElementById('ai-input');
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, "user");
    input.value = '';

    const typingMsg = document.createElement('div');
    typingMsg.className = 'message ai-msg typing';
    typingMsg.innerText = 'Avika is thinking...';
    aiMessages.appendChild(typingMsg);
    aiMessages.scrollTop = aiMessages.scrollHeight;

    const response = await getGeminiResponse(text);
    aiMessages.removeChild(typingMsg);
    addMessage(response, "ai");
}

document.getElementById('ai-send').addEventListener('click', handleAiChat);
document.getElementById('ai-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleAiChat();
});

function initVisitorCounter() {
    const counterElement = document.getElementById('visit-count');
    let count = localStorage.getItem('visitCount') || 742; // Starting at a professional number
    count = parseInt(count) + 1;
    localStorage.setItem('visitCount', count);
    counterElement.innerText = count.toLocaleString();
}

function handleAiOption(option) {
    if (option === 'services') {
        addMessage("What services do you offer?", "user");
        setTimeout(() => {
            addMessage("We offer Web Development, AI Solutions, Custom Software, API Development, and Automation Tools. All built with modern tech like Java, React, and Spring Boot.", "ai");
        }, 1000);
    } else if (option === 'projects') {
        addMessage("Show me some projects.", "user");
        setTimeout(() => {
            addMessage("Our featured projects include EX Chat (Android app), Shop Easy (E-commerce platform), and a specialized ERP Product Management System.", "ai");
        }, 1000);
    } else if (option === 'contact') {
        addMessage("How can I contact you?", "user");
        setTimeout(() => {
            addMessage("You can fill out the contact form below or email us at hello@Avionixsystems.in. We'll get back to you within 24 hours!", "ai");
        }, 1000);
    }
}

// Header Scroll Effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Mobile Menu Toggle
const mobileToggle = document.querySelector('.mobile-toggle');
const navLinks = document.querySelector('.nav-links');

mobileToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const icon = mobileToggle.querySelector('i');
    icon.classList.toggle('fa-bars');
    icon.classList.toggle('fa-times');
});

// Close mobile menu when a link is clicked
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        const icon = mobileToggle.querySelector('i');
        icon.classList.add('fa-bars');
        icon.classList.remove('fa-times');
    });
});

// Back to Top Logic
const backToTop = document.createElement('div');
backToTop.className = 'back-to-top';
backToTop.innerHTML = '<i class="fas fa-chevron-up"></i>';
document.body.appendChild(backToTop);

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }
});

backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Copy Protection & Right-Click Disable REMOVED for professional experience

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    initThree();
    animate();
    initAnimations();
    initVisitorCounter();

    // Reveal Animation Observer REMOVED - Handled by GSAP
});
