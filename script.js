// Variables globales
let scene, camera, renderer, particles;
let currentSlide = 0;
let carouselInterval;
let isDarkMode = false;

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    initializeCarousel();
    initializeThreeJS();
    initializeSmoothScrolling();
    initializeMobileMenu();
    initializeFormValidation();
    initializeIntersectionObserver();
    loadDarkModePreference();
});

// Inicialización cuando la ventana está completamente cargada
window.addEventListener('load', function() {
    if (!scene) {
        initializeThreeJS();
    }
});

// ===== INTERSECTION OBSERVER PARA SERVICIOS =====
function initializeIntersectionObserver() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    if (serviceCards.length === 0) return;
    
    const observerOptions = {
        threshold: 0.3, // Aumentado para que se active cuando más del elemento sea visible
        rootMargin: '0px 0px -50px 0px' // Activar cuando el elemento esté más visible
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                // Animar inmediatamente la tarjeta que está siendo observada
                entry.target.classList.add('animate');
                
                // Dejar de observar una vez animado
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    serviceCards.forEach(card => {
        observer.observe(card);
    });
}

// ===== FUNCIONALIDAD DE MODO OSCURO =====
function toggleDarkMode() {
    const body = document.body;
    const toggle = document.querySelector('.dark-mode-toggle');
    const toggleIcon = toggle.querySelector('i');
    const toggleText = toggle.querySelector('span');
    
    body.classList.toggle('dark-mode');
    isDarkMode = !isDarkMode;
    
    if (isDarkMode) {
        toggleIcon.className = 'fas fa-sun';
        toggleText.textContent = 'Modo Claro';
        // Cambiar color de partículas en modo oscuro
        if (particles && particles.material) {
            particles.material.color.setHex(0xC084FC);
        }
        // Guardar preferencia
        localStorage.setItem('darkMode', 'true');
    } else {
        toggleIcon.className = 'fas fa-moon';
        toggleText.textContent = 'Modo Nocturno';
        // Cambiar color de partículas en modo claro
        if (particles && particles.material) {
            particles.material.color.setHex(0x9333EA);
        }
        // Guardar preferencia
        localStorage.setItem('darkMode', 'false');
    }
    
    // Actualizar iconos de servicios para modo oscuro
    updateServiceIcons();
}

// Cargar preferencia de modo oscuro guardada
function loadDarkModePreference() {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'true') {
        toggleDarkMode();
    }
}

// Actualizar iconos de servicios para modo oscuro
function updateServiceIcons() {
    const serviceIcons = document.querySelectorAll('.service-icon i, .slide-content i, .footer-section i');
    serviceIcons.forEach(icon => {
        // Los iconos ya cambian de color automáticamente con CSS
        // Esta función está disponible para futuras mejoras
        icon.style.transition = 'all 0.3s ease';
    });
}

// ===== FUNCIONALIDAD THREE.JS =====
function initializeThreeJS() {
    try {
        // Configuración de la escena
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        renderer = new THREE.WebGLRenderer({ 
            alpha: true,
            antialias: true 
        });
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        const canvasContainer = document.getElementById('canvas-container');
        if (canvasContainer) {
            canvasContainer.appendChild(renderer.domElement);
        }

        // Crear partículas flotantes
        createParticles();
        
        // Posicionar cámara
        camera.position.z = 8;

        // Iniciar animación
        animate();
        
        console.log('Three.js inicializado correctamente');
    } catch (error) {
        console.warn('Error al inicializar Three.js:', error);
    }
}

function createParticles() {
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 100;
    const positions = new Float32Array(particlesCount * 3);
    const velocities = new Float32Array(particlesCount * 3);
    const sizes = new Float32Array(particlesCount);

    for (let i = 0; i < particlesCount * 3; i += 3) {
        // Posiciones aleatorias
        positions[i] = (Math.random() - 0.5) * 20;
        positions[i + 1] = (Math.random() - 0.5) * 20;
        positions[i + 2] = (Math.random() - 0.5) * 20;
        
        // Velocidades aleatorias
        velocities[i] = (Math.random() - 0.5) * 0.02;
        velocities[i + 1] = (Math.random() - 0.5) * 0.02;
        velocities[i + 2] = (Math.random() - 0.5) * 0.02;
        
        // Tamaños aleatorios
        sizes[i / 3] = Math.random() * 0.1 + 0.05;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const particlesMaterial = new THREE.PointsMaterial({
        color: isDarkMode ? 0xC084FC : 0x9333EA,
        size: 0.05,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true
    });

    particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
}

function animate() {
    requestAnimationFrame(animate);
    
    if (particles) {
        const positions = particles.geometry.attributes.position.array;
        const velocities = particles.geometry.attributes.velocity.array;
        
        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += velocities[i];
            positions[i + 1] += velocities[i + 1];
            positions[i + 2] += velocities[i + 2];
            
            // Wrap around screen
            if (positions[i] > 10) positions[i] = -10;
            if (positions[i] < -10) positions[i] = 10;
            if (positions[i + 1] > 10) positions[i + 1] = -10;
            if (positions[i + 1] < -10) positions[i + 1] = 10;
            if (positions[i + 2] > 10) positions[i + 2] = -10;
            if (positions[i + 2] < -10) positions[i + 2] = 10;
        }
        
        particles.geometry.attributes.position.needsUpdate = true;
        particles.rotation.y += 0.001;
        particles.rotation.x += 0.0005;
    }

    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

// ===== FUNCIONALIDAD DEL CARRUSEL =====
function initializeCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.carousel-indicator');
    
    if (slides.length === 0) return;
    
    // Mostrar primera diapositiva
    showSlide(0);
    
    // Iniciar carrusel automático
    startAutoCarousel();
    
    // Pausar carrusel al hacer hover
    const carouselContainer = document.querySelector('.carousel-container');
    if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', stopAutoCarousel);
        carouselContainer.addEventListener('mouseleave', startAutoCarousel);
        
        // Soporte para touch en móviles
        let startX = 0;
        let endX = 0;
        
        carouselContainer.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
        });
        
        carouselContainer.addEventListener('touchend', function(e) {
            endX = e.changedTouches[0].clientX;
            handleSwipe();
        });
        
        function handleSwipe() {
            const threshold = 50;
            const diff = startX - endX;
            
            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    changeSlide(1); // Swipe left - next slide
                } else {
                    changeSlide(-1); // Swipe right - previous slide
                }
            }
        }
    }
}

function showSlide(index) {
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.carousel-indicator');
    const totalSlides = slides.length;
    
    if (totalSlides === 0) return;
    
    // Asegurar que el índice esté dentro de los límites
    if (index >= totalSlides) index = 0;
    if (index < 0) index = totalSlides - 1;
    
    // Ocultar todas las diapositivas
    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(indicator => indicator.classList.remove('active'));
    
    // Mostrar diapositiva actual
    if (slides[index]) {
        slides[index].classList.add('active');
    }
    if (indicators[index]) {
        indicators[index].classList.add('active');
    }
    
    currentSlide = index;
}

function changeSlide(direction) {
    const newSlide = currentSlide + direction;
    showSlide(newSlide);
}

function goToSlide(index) {
    showSlide(index);
}

function startAutoCarousel() {
    stopAutoCarousel(); // Limpiar intervalo existente
    carouselInterval = setInterval(() => {
        changeSlide(1);
    }, 5000);
}

function stopAutoCarousel() {
    if (carouselInterval) {
        clearInterval(carouselInterval);
        carouselInterval = null;
    }
}

// ===== FUNCIONALIDAD DE WHATSAPP =====
function sendWhatsApp() {
    const form = document.querySelector('.appointment-form');
    if (!form) return;
    
    const inputs = form.querySelectorAll('input, select, textarea');
    const formData = {};
    
    // Recopilar datos del formulario
    inputs.forEach((input, index) => {
        switch(index) {
            case 0: formData.nombre = input.value; break;
            case 1: formData.telefono = input.value; break;
            case 2: formData.email = input.value; break;
            case 3: formData.servicio = input.value; break;
            case 4: formData.fecha = input.value; break;
            case 5: formData.hora = input.value; break;
            case 6: formData.mensaje = input.value; break;
        }
    });

    // Validar campos obligatorios
    if (!formData.nombre || !formData.telefono || !formData.servicio || !formData.fecha || !formData.hora) {
        showNotification('Por favor completa todos los campos obligatorios.', 'error');
        return;
    }

    // Validar formato de fecha
    const selectedDate = new Date(formData.fecha);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
        showNotification('La fecha seleccionada no puede ser anterior a hoy.', 'error');
        return;
    }

    // Formatear mensaje para WhatsApp
    const servicios = {
        'manicura': 'Manicura',
        'pedicura': 'Pedicura',
        'disenos': 'Diseños Artísticos',
        'lifting': 'Lifting de Pestañas',
        'laminado': 'Laminado de Cejas',
        'combo': 'Combo Especial'
    };

    const whatsappMessage = `¡Hola! Me gustaría reservar una cita en Lía Nails 💅

📋 *Datos de la cita:*
• Nombre: ${formData.nombre}
• Teléfono: ${formData.telefono}
${formData.email ? `• Email: ${formData.email}` : ''}
• Servicio: ${servicios[formData.servicio] || formData.servicio}
• Fecha: ${formatDate(formData.fecha)}
• Hora: ${formData.hora}
${formData.mensaje ? `• Mensaje: ${formData.mensaje}` : ''}

¡Espero su confirmación! ✨`;

    // Número de WhatsApp (cambiar por el número real)
    const phoneNumber = '5493873446995';
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(whatsappMessage)}`;
    
    // Abrir WhatsApp
    window.open(whatsappURL, '_blank');
    
    // Mostrar confirmación
    showNotification('Redirigiendo a WhatsApp...', 'success');
    
    // Limpiar formulario después de enviar
    setTimeout(() => {
        form.reset();
    }, 1000);
}

// ===== FUNCIONES AUXILIARES =====
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return date.toLocaleDateString('es-ES', options);
}

function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Estilos de la notificación
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-family: var(--font-secondary);
        font-weight: 500;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// ===== NAVEGACIÓN SUAVE MEJORADA =====
function initializeSmoothScrolling() {
    // Polyfill para navegadores que no soportan scroll-behavior: smooth
    if (!('scrollBehavior' in document.documentElement.style)) {
        // Implementar scroll suave manual
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const headerHeight = document.querySelector('header').offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight - 20;
                    
                    smoothScrollTo(targetPosition, 800);
                }
            });
        });
    } else {
        // Usar scroll-behavior nativo con ajuste de posición
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const headerHeight = document.querySelector('header').offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
}

// Función de scroll suave manual para mejor compatibilidad
function smoothScrollTo(targetPosition, duration) {
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    function easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    requestAnimationFrame(animation);
}

// ===== MENÚ MÓVIL =====
function initializeMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', function() {
            navLinks.classList.toggle('mobile-active');
            const icon = this.querySelector('i');
            
            if (navLinks.classList.contains('mobile-active')) {
                icon.className = 'fas fa-times';
            } else {
                icon.className = 'fas fa-bars';
            }
        });
        
        // Cerrar menú al hacer clic en un enlace
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('mobile-active');
                mobileToggle.querySelector('i').className = 'fas fa-bars';
            });
        });
    }
}

// ===== VALIDACIÓN DE FORMULARIO =====
function initializeFormValidation() {
    const form = document.querySelector('.appointment-form');
    if (!form) return;
    
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
}

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    
    // Limpiar errores previos
    clearFieldError(e);
    
    // Validaciones específicas
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'Este campo es obligatorio');
        return false;
    }
    
    if (field.type === 'email' && value && !isValidEmail(value)) {
        showFieldError(field, 'Ingresa un email válido');
        return false;
    }
    
    if (field.type === 'tel' && value && !isValidPhone(value)) {
        showFieldError(field, 'Ingresa un teléfono válido');
        return false;
    }
    
    if (field.type === 'date' && value) {
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            showFieldError(field, 'La fecha no puede ser anterior a hoy');
            return false;
        }
    }
    
    return true;
}

function showFieldError(field, message) {
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;
    
    // Remover error existente
    const existingError = formGroup.querySelector('.field-error');
    if (existingError) {
        existingError.classList.remove('show');
        setTimeout(() => {
            if (existingError.parentNode) {
                existingError.remove();
            }
        }, 300);
    }
    
    // Crear nuevo error
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    
    formGroup.appendChild(errorElement);
    field.style.borderColor = '#EF4444';
    
    // Mostrar error con animación
    setTimeout(() => {
        errorElement.classList.add('show');
    }, 10);
}

function clearFieldError(e) {
    const field = e.target;
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;
    
    const errorElement = formGroup.querySelector('.field-error');
    if (errorElement) {
        errorElement.classList.remove('show');
        setTimeout(() => {
            if (errorElement.parentNode) {
                errorElement.remove();
            }
        }, 300);
    }
    
    field.style.borderColor = '';
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
    return phoneRegex.test(phone);
}

// ===== MANEJO DE REDIMENSIONAMIENTO =====
window.addEventListener('resize', function() {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
});

// ===== MANEJO DE VISIBILIDAD DE LA PÁGINA =====
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        stopAutoCarousel();
    } else {
        startAutoCarousel();
    }
});

// ===== EFECTOS DE SCROLL =====
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    if (window.scrollY > 100) {
        header.style.background = isDarkMode ? 
            'rgba(45, 27, 61, 0.95)' : 
            'rgba(255, 255, 255, 0.95)';
    } else {
        header.style.background = isDarkMode ? 
            'rgba(45, 27, 61, 0.9)' : 
            'rgba(255, 255, 255, 0.9)';
    }
});

// ===== MANEJO DE ERRORES GLOBALES =====
window.addEventListener('error', function(e) {
    console.warn('Error capturado:', e.error);
});

// ===== OPTIMIZACIÓN DE RENDIMIENTO =====
// Throttle function para optimizar eventos de scroll y resize
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Aplicar throttle a eventos costosos
window.addEventListener('scroll', throttle(function() {
    // Código de scroll optimizado
}, 16)); // ~60fps

window.addEventListener('resize', throttle(function() {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
}, 100));