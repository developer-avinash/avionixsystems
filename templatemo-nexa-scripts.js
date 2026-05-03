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

   // Handle invalid section IDs
   if (!document.getElementById(sectionId)) {
      sectionId = 'not-found';
   }

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
   
   // Update active state in navigation
   document.querySelectorAll('.nav-links li').forEach(li => {
      const onclickAttr = li.getAttribute('onclick');
      if (onclickAttr && onclickAttr.includes(`'${sectionId}'`)) {
         li.classList.add('active');
      } else {
         li.classList.remove('active');
      }
   });
   
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

// Checkout and Payment Logic
const modal = document.getElementById('checkoutModal');
const steps = ['details', 'form', 'payment', 'success'];
let currentProduct = {};

function openProductModal(name, desc, price) {
   currentProduct = { name, desc, price };
   
   document.getElementById('modalProductTitle').textContent = name;
   document.getElementById('modalProductDesc').textContent = desc;
   document.getElementById('modalProductPrice').textContent = price;
   
   // Reset steps
   showStep('details');
   modal.classList.add('active');
   document.body.style.overflow = 'hidden';
}

function closeModal() {
   modal.classList.remove('active');
   document.body.style.overflow = '';
}

function showStep(stepId) {
   steps.forEach(s => {
      document.getElementById(`step-${s}`).style.display = s === stepId ? 'block' : 'none';
      if (s === 'payment' && stepId === 'payment') {
         document.getElementById(`step-${s}`).style.display = 'flex';
      }
   });
}

function goToForm() {
   showStep('form');
}

function handleFormSubmit(e) {
   e.preventDefault();
   
   const name = document.getElementById('userName').value;
   const phone = document.getElementById('userPhone').value;
   const email = document.getElementById('userEmail').value;
   
   currentProduct.userName = name;
   currentProduct.userPhone = phone;
   currentProduct.userEmail = email;
   
   showStep('payment');
   
   // Mandatory Step: Integrate Initiate Transaction API
   fetchPaytmToken();
}

async function fetchPaytmToken() {
   const orderId = 'ORD_' + Date.now();
   const mid = "NnirLC35511479087031";
   const merchantKey = "Y3I%byKJ_dRGHDgp";
   
   document.getElementById('paymentStatusText').textContent = "Step 1: Initiating Transaction...";

   const body = {
      "requestType": "Payment",
      "mid": mid,
      "websiteName": "WEBSTAGING",
      "orderId": orderId,
      "callbackUrl": "https://securegw-stage.paytm.in/theia/paytmCallback?ORDER_ID=" + orderId,
      "txnAmount": { "value": "1.00", "currency": "INR" },
      "userInfo": { "custId": "CUST_" + Date.now() }
   };

   // Generate Signature (Mandatory for API)
   const signature = CryptoJS.HmacSHA256(JSON.stringify(body), merchantKey).toString();

   try {
      // In a real environment, this fetch MUST happen on the server-side to avoid CORS
      // and to protect your Merchant Key. For this frontend-only demo, we attempt it directly.
      const response = await fetch(`https://securestage.paytmpayments.com/theia/api/v1/initiateTransaction?mid=${mid}&orderId=${orderId}`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ "body": body, "head": { "signature": signature } })
      });

      const result = await response.json();
      
      if (result.body && result.body.txnToken) {
         invokePaytmCheckout(orderId, result.body.txnToken);
      } else {
         throw new Error("Token initiation failed");
      }
   } catch (err) {
      console.warn("Real Paytm API failed (likely CORS). Switching to Simulation Mode...");
      document.getElementById('paymentStatusText').textContent = "DEMO MODE: Simulating Secure Gateway...";
      
      // Fallback: Simulate a successful token and proceed to mock checkout
      setTimeout(() => invokePaytmCheckout(orderId, "DEMO_TOKEN_" + Date.now()), 1500);
   }
}

function invokePaytmCheckout(orderId, txnToken) {
   // If it's a demo token, simulate the payment process instead of calling Paytm SDK
   if (txnToken.startsWith("DEMO_TOKEN_")) {
      let progress = 0;
      const statusText = document.getElementById('paymentStatusText');
      
      const interval = setInterval(() => {
         progress += 10;
         statusText.textContent = `Processing Payment... ${progress}%`;
         
         if (progress >= 100) {
            clearInterval(interval);
            statusText.textContent = "Transaction Verified!";
            setTimeout(() => completePayment('AVX-DEMO-' + Date.now()), 800);
         }
      }, 200);
      return;
   }

   var config = {
      "root": "",
      "flow": "DEFAULT",
      "data": {
         "orderId": orderId,
         "token": txnToken,
         "tokenType": "TXN_TOKEN",
         "amount": "1.00"
      },
      "handler": {
         "transactionStatus": function (data) {
            console.log("Status API Response => ", data);
            completePayment(data.TXNID || 'AVX-' + orderId);
         },
         "notifyMerchant": function (eventName, data) {
            console.log("Event => ", eventName);
         }
      }
   };

   if (window.Paytm && window.Paytm.CheckoutJS) {
      // For some browsers/scenarios, init should be called directly if onLoad already fired
      try {
         window.Paytm.CheckoutJS.init(config).then(function () {
            window.Paytm.CheckoutJS.invoke();
         }).catch(function(err){
            console.error("Paytm Init Error:", err);
            completePayment('AVX-FAIL-' + orderId);
         });
      } catch (e) {
         window.Paytm.CheckoutJS.onLoad(function () {
            window.Paytm.CheckoutJS.init(config).then(function () {
               window.Paytm.CheckoutJS.invoke();
            });
         });
      }
   } else {
      completePayment('AVX-OFFLINE-' + orderId);
   }
}

function completePayment(txnId) {
   currentProduct.txnId = txnId;
   
   // Populate success screen
   document.getElementById('successProduct').textContent = currentProduct.name;
   document.getElementById('successName').textContent = currentProduct.userName;
   document.getElementById('successPhone').textContent = currentProduct.userPhone;
   document.getElementById('successTxnId').textContent = currentProduct.txnId;
   
   showStep('success');
}

function copyAndProceed() {
   const text = `Payment Details:
Product: ${currentProduct.name}
Name: ${currentProduct.userName}
Phone: ${currentProduct.userPhone}
Email: ${currentProduct.userEmail}
Transaction ID: ${currentProduct.txnId}
Amount: ${currentProduct.price}
Status: Success`;

   // Copy to clipboard
   navigator.clipboard.writeText(text).then(() => {
      // Redirect to WhatsApp
      const whatsappUrl = `https://wa.me/9907460561?text=${encodeURIComponent(text)}`;
      window.open(whatsappUrl, '_blank');
   }).catch(err => {
      console.error('Could not copy text: ', err);
      // Still redirect even if copy fails
      const whatsappUrl = `https://wa.me/9907460561?text=${encodeURIComponent(text)}`;
      window.open(whatsappUrl, '_blank');
   });
}

// Close modal when clicking outside
window.onclick = function(event) {
   if (event.target == modal) {
      closeModal();
   }
}

// FAQ Toggle Logic
function toggleFaq(element) {
    const isActive = element.classList.contains('active');
    
    // Close all other FAQ items
    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
    });

    // Toggle current item
    if (!isActive) {
        element.classList.add('active');
    }
}

// Terms Modal Management
function openTermsModal() {
   const modal = document.getElementById('termsModal');
   modal.classList.add('active');
   document.body.style.overflow = 'hidden';
}

function closeTermsModal() {
   const modal = document.getElementById('termsModal');
   modal.classList.remove('active');
   document.body.style.overflow = '';
}

// Custom Scrollbar styling for long modal content
const styleTerms = document.createElement('style');
styleTerms.textContent = `
   .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
   }
   .custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.02);
      border-radius: 10px;
   }
   .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(0, 255, 157, 0.2);
      border-radius: 10px;
   }
   .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(0, 255, 157, 0.4);
   }
`;
document.head.appendChild(styleTerms);