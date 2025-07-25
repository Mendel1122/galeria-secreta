// DOM Elements
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const applicationForm = document.getElementById('application-form');
const photoInput = document.getElementById('foto');
const photoPreview = document.getElementById('photo-preview');

// Enhanced Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle with enhanced animations
    navToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        if (navMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });

    // Enhanced navbar scroll effect
    let lastScrollTop = 0;
    window.addEventListener('scroll', debounce(function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Hide/show navbar on scroll
        if (scrollTop > lastScrollTop && scrollTop > 200) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    }, 10));

    // Smooth scrolling for anchor links with offset
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 100; // Enhanced offset
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Enhanced photo preview functionality
    photoInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        const fileUploadText = document.querySelector('.file-upload-text');
        
        if (file) {
            // Enhanced file validation
            if (!file.type.startsWith('image/')) {
                showNotification('Por favor, selecione apenas arquivos de imagem.', 'error');
                this.value = '';
                fileUploadText.style.display = 'flex';
                photoPreview.style.display = 'none';
                return;
            }

            // Enhanced file size validation (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                showNotification('O arquivo deve ter no máximo 10MB.', 'error');
                this.value = '';
                fileUploadText.style.display = 'flex';
                photoPreview.style.display = 'none';
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                // Hide the upload text and show the image
                fileUploadText.style.display = 'none';
                photoPreview.src = e.target.result;
                photoPreview.style.display = 'block';
                photoPreview.style.opacity = '0';
                photoPreview.style.transform = 'scale(0.8)';
                
                // Animate preview appearance
                setTimeout(() => {
                    photoPreview.style.transition = 'all 0.3s ease';
                    photoPreview.style.opacity = '1';
                    photoPreview.style.transform = 'scale(1)';
                }, 100);
            };
            reader.readAsDataURL(file);
        } else {
            // Show upload text and hide image
            fileUploadText.style.display = 'flex';
            photoPreview.style.display = 'none';
            photoPreview.src = '#';
        }
    });

    // Enhanced form submission with better error handling
    applicationForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Enhanced age validation
        const idade = parseInt(document.getElementById('idade').value);
        if (idade < 18) {
            showNotification('Deve ter pelo menos 18 anos para se candidatar.', 'error');
            return;
        }

        if (idade > 65) {
            showNotification('A idade máxima para candidatura é 65 anos.', 'error');
            return;
        }

        // Enhanced form validation
        if (!validateForm()) {
            return;
        }

        // Enhanced loading state
        const submitBtn = document.querySelector('.btn-submit');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');
        
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-block';
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';

        // Prepare enhanced form data
        const formData = new FormData(applicationForm);
        
        // Add timestamp
        formData.append('timestamp', new Date().toISOString());

        try {
            // Enhanced API call with retry mechanism
            const response = await fetchWithRetry('https://galeria-secreta-backend.onrender.com/api/candidatura', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                // Enhanced success handling
                showNotification('✨ Candidatura enviada com sucesso! Entraremos em contacto em breve.', 'success');
                applicationForm.reset();
                // Reset photo preview
                document.querySelector('.file-upload-text').style.display = 'flex';
                photoPreview.style.display = 'none';
                
                // Clear form auto-save
                clearFormAutoSave();
                
                // Scroll to top of form
                document.getElementById('application').scrollIntoView({ behavior: 'smooth' });
            } else {
                // Enhanced error handling
                const result = await response.json();
                showNotification('❌ Erro ao enviar: ' + (result.detalhe || result.error || 'Erro desconhecido'), 'error');
            }
        } catch (error) {
            // Enhanced network error handling
            showNotification('❌ Erro de conexão: ' + error.message, 'error');
        } finally {
            // Reset enhanced button state
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
        }
    });

    // Enhanced intersection observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                entry.target.classList.add('loaded');
            }
        });
    }, observerOptions);

    // Observe elements for enhanced animation
    document.querySelectorAll('.value-item, .service-card, .benefit-card, .contact-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(50px)';
        el.style.transition = 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(el);
    });

    // Enhanced form validation
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });

    // Enhanced file upload drag and drop
    const fileUpload = document.querySelector('.file-upload');
    
    if (fileUpload) {
        fileUpload.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.style.borderColor = 'var(--primary-color)';
            this.style.background = 'rgba(201, 168, 118, 0.1)';
            this.style.transform = 'scale(1.02)';
        });

        fileUpload.addEventListener('dragleave', function(e) {
            e.preventDefault();
            this.style.borderColor = 'var(--border-color)';
            this.style.background = 'rgba(255, 255, 255, 0.02)';
            this.style.transform = 'scale(1)';
        });

        fileUpload.addEventListener('drop', function(e) {
            e.preventDefault();
            this.style.borderColor = 'var(--border-color)';
            this.style.background = 'rgba(255, 255, 255, 0.02)';
            this.style.transform = 'scale(1)';
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                photoInput.files = files;
                photoInput.dispatchEvent(new Event('change'));
            }
        });
    }

    // Enhanced page loading animation
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);

    // Enhanced form auto-save
    initFormAutoSave();
});

// Enhanced Utility Functions
function showNotification(message, type = 'info') {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(notification => {
        notification.remove();
    });

    // Create enhanced notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;

    // Enhanced styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #4CAF50, #45a049)' : 'linear-gradient(135deg, #f44336, #d32f2f)'};
        color: white;
        padding: 1.2rem 1.8rem;
        border-radius: 15px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        max-width: 400px;
        transform: translateX(120%);
        transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
    `;

    // Add to DOM
    document.body.appendChild(notification);

    // Enhanced animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Enhanced close functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        margin-left: 1rem;
        opacity: 0.7;
        transition: opacity 0.2s ease;
    `;
    
    closeBtn.addEventListener('click', () => {
        removeNotification(notification);
    });

    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.opacity = '1';
    });

    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.opacity = '0.7';
    });

    // Enhanced auto remove after 6 seconds
    setTimeout(() => {
        removeNotification(notification);
    }, 6000);
}

function removeNotification(notification) {
    if (notification.parentNode) {
        notification.style.transform = 'translateX(120%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 400);
    }
}

function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    // Remove existing error
    clearFieldError(event);

    // Enhanced validation rules
    switch (field.type) {
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (value && !emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Por favor, insira um email válido.';
            }
            break;
        
        case 'tel':
            const phoneRegex = /^[+]?[\d\s\-\(\)]{9,}$/;
            if (value && !phoneRegex.test(value)) {
                isValid = false;
                errorMessage = 'Por favor, insira um número de telefone válido.';
            }
            break;
        
        case 'number':
            if (field.name === 'idade' && value) {
                const age = parseInt(value);
                if (age < 18) {
                    isValid = false;
                    errorMessage = 'A idade mínima é 18 anos.';
                } else if (age > 65) {
                    isValid = false;
                    errorMessage = 'A idade máxima é 65 anos.';
                }
            }
            break;
        
        case 'text':
            if (field.name === 'nome' && value) {
                if (value.length < 2) {
                    isValid = false;
                    errorMessage = 'O nome deve ter pelo menos 2 caracteres.';
                }
            }
            break;
    }

    // Enhanced required field validation
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'Este campo é obrigatório.';
    }

    // Enhanced textarea validation
    if (field.tagName === 'TEXTAREA' && field.hasAttribute('required')) {
        if (value.length < 10) {
            isValid = false;
            errorMessage = 'Por favor, forneça uma descrição mais detalhada (mínimo 10 caracteres).';
        }
    }

    // Show error if invalid
    if (!isValid) {
        showFieldError(field, errorMessage);
    }

    return isValid;
}

function showFieldError(field, message) {
    field.style.borderColor = '#f44336';
    field.style.boxShadow = '0 0 0 3px rgba(244, 67, 54, 0.1)';
    
    // Create enhanced error message element
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.style.cssText = `
        color: #f44336;
        font-size: 0.875rem;
        margin-top: 0.5rem;
        display: block;
        padding: 0.25rem 0.5rem;
        background: rgba(244, 67, 54, 0.1);
        border-radius: 5px;
        border: 1px solid rgba(244, 67, 54, 0.2);
        animation: slideIn 0.3s ease;
    `;
    
    // Insert after the field
    field.parentNode.insertBefore(errorElement, field.nextSibling);
}

function clearFieldError(event) {
    const field = event.target;
    field.style.borderColor = 'var(--border-color)';
    field.style.boxShadow = 'none';
    
    // Remove error message
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
        errorElement.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            errorElement.remove();
        }, 300);
    }
}

function validateForm() {
    const inputs = document.querySelectorAll('#application-form input, #application-form select, #application-form textarea');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateField({ target: input })) {
            isValid = false;
        }
    });
    
    return isValid;
}

// Enhanced performance optimization: Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Enhanced fetch with retry mechanism
async function fetchWithRetry(url, options, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url, options);
            return response;
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
        }
    }
}

// Enhanced form auto-save functionality
function initFormAutoSave() {
    const formFields = document.querySelectorAll('#application-form input, #application-form select, #application-form textarea');
    
    formFields.forEach(field => {
        // Load saved data
        const savedValue = localStorage.getItem(`galeria_secreta_form_${field.name}`);
        if (savedValue && field.type !== 'file' && field.type !== 'checkbox') {
            field.value = savedValue;
        }
        
        // Save data on change with debounce
        field.addEventListener('input', debounce(function() {
            if (this.type !== 'file' && this.type !== 'checkbox') {
                localStorage.setItem(`galeria_secreta_form_${this.name}`, this.value);
            }
        }, 500));
    });
}

function clearFormAutoSave() {
    const formFields = document.querySelectorAll('#application-form input, #application-form select, #application-form textarea');
    formFields.forEach(field => {
        localStorage.removeItem(`galeria_secreta_form_${field.name}`);
    });
}

// Enhanced preload critical resources
function preloadCriticalResources() {
    const criticalImages = [
        'https://images.pexels.com/photos/1722198/pexels-photo-1722198.jpeg'
    ];
    
    criticalImages.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}

// Enhanced page performance monitoring
function initPerformanceMonitoring() {
    // Monitor page load time
    window.addEventListener('load', () => {
        const loadTime = performance.now();
        console.log(`Galeria Secreta loaded in ${loadTime.toFixed(2)}ms`);
    });
}

// Enhanced keyboard navigation support
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        // Close mobile menu
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        // Close any open notifications
        document.querySelectorAll('.notification').forEach(notification => {
            removeNotification(notification);
        });
    }
});

// Enhanced focus management for accessibility
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('focus', function() {
        if (window.innerWidth <= 768) {
            navMenu.classList.add('active');
        }
    });
});

// Enhanced scroll to top functionality
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Add scroll to top button
const scrollTopBtn = document.createElement('button');
scrollTopBtn.innerHTML = '↑';
scrollTopBtn.className = 'scroll-top-btn';
scrollTopBtn.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: none;
    background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
    color: var(--background-dark);
    font-size: 1.5rem;
    cursor: pointer;
    z-index: 1000;
    opacity: 0;
    transform: scale(0.8);
    transition: all 0.3s ease;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
`;

document.body.appendChild(scrollTopBtn);

scrollTopBtn.addEventListener('click', scrollToTop);

// Show/hide scroll to top button
window.addEventListener('scroll', debounce(() => {
    if (window.scrollY > 500) {
        scrollTopBtn.style.opacity = '1';
        scrollTopBtn.style.transform = 'scale(1)';
    } else {
        scrollTopBtn.style.opacity = '0';
        scrollTopBtn.style.transform = 'scale(0.8)';
    }
}, 100));

// Initialize enhanced features
document.addEventListener('DOMContentLoaded', function() {
    preloadCriticalResources();
    initPerformanceMonitoring();
});

// Enhanced loading animation
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
    
    // Add staggered animation to hero elements
    const heroElements = document.querySelectorAll('.hero-title .title-line, .hero-subtitle, .hero-buttons');
    heroElements.forEach((element, index) => {
        element.style.animationDelay = `${index * 0.3}s`;
    });
});

// Enhanced error boundary
window.addEventListener('error', function(e) {
    console.error('Galeria Secreta Error:', e.error);
    showNotification('Ocorreu um erro inesperado. Por favor, recarregue a página.', 'error');
});

// Enhanced service worker registration (if available)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(error => {
        console.log('Service Worker registration failed:', error);
    });
}

// Add CSS animations for enhanced UX
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes slideOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-10px); }
    }
    
    .scroll-top-btn:hover {
        transform: scale(1.1) !important;
        box-shadow: 0 6px 25px rgba(0, 0, 0, 0.4) !important;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
`;
document.head.appendChild(style);