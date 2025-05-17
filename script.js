let currentPage = 1;
let currentFilter = 'all';

// Asegurarnos de que cart esté disponible
if (typeof cart === 'undefined') {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
}

document.addEventListener('DOMContentLoaded', () => {
    // Eliminar la parte del menú hamburguesa ya que ahora está en menu.js
    displayProducts();
    setupFilterButtons();
    setupLoadMoreButton();

    // Mejorar manejo táctil para el menú
    if (hamburger && navLinks) {
        let touchstart = 0;
        
        hamburger.addEventListener('touchstart', (e) => {
            touchstart = e.timeStamp;
        });

        hamburger.addEventListener('touchend', (e) => {
            // Prevenir clicks fantasma
            if (e.timeStamp - touchstart < 300) {
                e.preventDefault();
                navLinks.classList.toggle('active');
                const isOpen = navLinks.classList.contains('active');
                hamburger.innerHTML = isOpen ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
            }
        });

        // Cerrar menú al tocar fuera
        document.addEventListener('touchstart', (e) => {
            if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
                navLinks.classList.remove('active');
                hamburger.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    }

    // Mejorar interacción táctil para botones
    document.querySelectorAll('.card-btn, .filter-btn, .btn').forEach(button => {
        button.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.98)';
        });

        button.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        });
    });

    // Agregar scroll suave a los enlaces internos
    document.querySelectorAll('.scroll-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Cerrar el menú móvil si está abierto
                const navLinks = document.querySelector('.nav-links');
                const hamburger = document.querySelector('.hamburger');
                if (navLinks && navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    hamburger.innerHTML = '<i class="fas fa-bars"></i>';
                }
            }
        });
    });

    initializeOffers();
});

function displayProducts() {
    const productsGrid = document.getElementById('productsGrid');
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    
    const filteredProducts = products.filter(product => 
        currentFilter === 'all' || product.category.toLowerCase() === currentFilter
    );

    const productsToShow = filteredProducts.slice(startIndex, endIndex);

    if (currentPage === 1) {
        productsGrid.innerHTML = '';
    }

    productsToShow.forEach(product => {
        const card = createProductCard(product);
        productsGrid.appendChild(card);
    });

    // Mostrar/ocultar botón "Cargar más"
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.style.display = endIndex >= filteredProducts.length ? 'none' : 'block';
    }
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    const hasMultipleImages = Array.isArray(product.images) && product.images.length > 1;
    const imageMarkup = hasMultipleImages ? 
        createCarouselMarkup(product) : 
        createSingleImageMarkup(product);

    card.innerHTML = `
        ${imageMarkup}
        <div class="product-info">
            <h3 class="product-brand">${product.name}</h3>
            <p class="product-desc">${product.description}</p>
            <span class="price">${product.price}</span>
        </div>
        <div class="product-buttons">
            <button class="card-btn view-btn" data-product-id="${product.id}">
                <i class="fas fa-eye"></i> Ver detalles
            </button>
            <button class="card-btn add-to-cart" data-product-id="${product.id}">
                <i class="fas fa-shopping-cart"></i> Añadir al carrito
            </button>
        </div>
    `;

    // Añadir event listeners después de crear el elemento
    const viewBtn = card.querySelector('.view-btn');
    viewBtn.addEventListener('click', () => openModal(product.id));

    const addToCartBtn = card.querySelector('.add-to-cart');
    addToCartBtn.addEventListener('click', () => addToCart(product.id));

    if (hasMultipleImages) {
        setupCarousel(card, product.images);
    }

    return card;
}

function openModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    document.body.style.overflow = 'hidden'; // Prevenir scroll del body

    const colorSelector = product.colors ? `
        <div class="modal-colors">
            <h4>Selecciona un color:</h4>
            <div class="color-options">
                ${product.colors.map(color => `
                    <button class="color-btn" data-color="${color}" 
                            style="background-color: ${color.toLowerCase()}">
                        <span class="color-name">${color}</span>
                    </button>
                `).join('')}
            </div>
        </div>
    ` : '';

    const modelSelector = product.models ? `
        <div class="modal-models">
            <h4>Selecciona el modelo:</h4>
            <div class="model-options">
                ${product.models.map(model => `
                    <button class="model-btn" data-model="${model}">
                        <i class="fas fa-mobile-alt"></i>
                        <span class="model-name">${model}</span>
                    </button>
                `).join('')}
            </div>
        </div>
    ` : '';

    const featuresSection = product.features ? `
        <div class="modal-features">
            ${product.features.map(feature => `
                <div class="feature-item">
                    <i class="fas fa-${feature.icon}"></i>
                    <span>${feature.text}</span>
                </div>
            `).join('')}
        </div>
    ` : '';

    const quantitySelector = `
        <div class="quantity-selector">
            <h4>Selecciona la cantidad y combinación:</h4>
            <div class="quantity-group">
                <div class="quantity-controls">
                    <button class="quantity-btn minus-btn" type="button">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity-display">1</span>
                    <button class="quantity-btn plus-btn" type="button">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <button class="add-combination">
                    <i class="fas fa-plus"></i>
                    Agregar combinación
                </button>
            </div>
            <div class="selected-combinations">
                <h4>Combinaciones seleccionadas:</h4>
                <div class="combinations-list"></div>
            </div>
        </div>
    `;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal">
            <button class="modal-close" onclick="closeModal(this)">
                <i class="fas fa-times"></i>
            </button>
            <div class="modal-content">
                <div class="modal-images">
                    ${product.images ? `
                        <div class="modal-carousel-buttons">
                            <button class="modal-carousel-btn prev-btn">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            <button class="modal-carousel-btn next-btn">
                                <i class="fas fa-chevron-right"></i>
                            </button>
                        </div>
                        <div class="carousel-images">
                            ${product.images.map(img => `
                                <img src="${img}" alt="${product.name}">
                            `).join('')}
                        </div>
                    ` : `
                        <img src="${product.image}" alt="${product.name}">
                    `}
                </div>
                <div class="modal-info">
                    <h2 class="modal-title">${product.name}</h2>
                    <div class="modal-price">${product.price}€</div>
                    <p class="modal-description">${product.description}</p>
                    
                    ${colorSelector}
                    ${modelSelector}
                    ${quantitySelector}
                    ${featuresSection}

                    <div class="modal-buttons">
                        <button class="card-btn add-to-cart" onclick="addToCart(${product.id})">
                            <i class="fas fa-shopping-cart"></i> Añadir al carrito
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    
    // Configurar los eventos de los botones después de añadir el modal al DOM
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => closeModal(modal));

    // Cerrar modal al hacer clic fuera
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal);
        }
    });

    // Configurar los eventos de los botones de color
    if (product.colors) {
        const colorBtns = modal.querySelectorAll('.color-btn');
        colorBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                colorBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                modal.querySelector('.add-to-cart').dataset.selectedColor = btn.dataset.color;
            });
        });
    }

    // Configurar los eventos de los botones de modelo
    if (product.models) {
        const modelBtns = modal.querySelectorAll('.model-btn');
        modelBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                modelBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                modal.querySelector('.add-to-cart').dataset.selectedModel = btn.dataset.model;
            });
        });
    }

    setTimeout(() => {
        modal.classList.add('active');
        modal.querySelector('.modal').classList.add('active');
    }, 10);

    // Si el producto tiene múltiples imágenes, configurar el carrusel
    if (product.images && product.images.length > 1) {
        setupCarousel(modal, product.images);
    }

    // Configurar controles de cantidad
    const minusBtn = modal.querySelector('.minus-btn');
    const plusBtn = modal.querySelector('.plus-btn');
    const quantityDisplay = modal.querySelector('.quantity-display');
    let quantity = 1;

    minusBtn.addEventListener('click', () => {
        if (quantity > 1) {
            quantity--;
            quantityDisplay.textContent = quantity;
        }
    });

    plusBtn.addEventListener('click', () => {
        quantity++;
        quantityDisplay.textContent = quantity;
    });

    // Manejar selección de combinaciones
    const combinations = [];
    const addCombinationBtn = modal.querySelector('.add-combination');
    const combinationsContainer = modal.querySelector('.selected-combinations');

    addCombinationBtn.addEventListener('click', () => {
        const selectedColor = modal.querySelector('.color-btn.active')?.dataset.color;
        const selectedModel = modal.querySelector('.model-btn.active')?.dataset.model;

        if (!selectedColor || !selectedModel) {
            showAlert('Por favor, selecciona color y modelo');
            return;
        }

        const combination = {
            color: selectedColor,
            model: selectedModel,
            quantity: quantity
        };

        combinations.push(combination);
        updateCombinationsDisplay();
    });

    function updateCombinationsDisplay() {
        combinationsContainer.innerHTML = combinations.map((combo, index) => `
            <div class="combination-item">
                <div class="combination-info">
                    ${combo.quantity}x ${combo.model} - ${combo.color}
                </div>
                <button class="combination-delete" data-index="${index}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');

        // Configurar botones de eliminación
        combinationsContainer.querySelectorAll('.combination-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.currentTarget.dataset.index;
                combinations.splice(index, 1);
                updateCombinationsDisplay();
            });
        });
    }

    // Modificar la función de añadir al carrito
    const addToCartBtn = modal.querySelector('.add-to-cart');
    addToCartBtn.addEventListener('click', () => {
        if (combinations.length === 0) {
            showAlert('Por favor, agrega al menos una combinación');
            return;
        }

        combinations.forEach(combo => {
            const cartItem = {
                ...product,
                selectedColor: combo.color,
                selectedModel: combo.model,
                quantity: combo.quantity
            };
            addToCart(cartItem);
        });

        closeModal(modal);
    });
}

function closeModal(modal) {
    document.body.style.overflow = ''; // Restaurar scroll del body
    modal.querySelector('.modal').classList.remove('active');
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
}

function createCarouselMarkup(product) {
    return `
        <div class="product-img-container">
            <div class="carousel-buttons">
                <button class="carousel-btn prev-btn" aria-label="Anterior">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <button class="carousel-btn next-btn" aria-label="Siguiente">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
            <div class="carousel-images">
                ${product.images.map(img => `<img src="${img}" alt="${product.name}" class="product-img" loading="lazy">`).join('')}
            </div>
            <div class="carousel-dots">
                ${product.images.map((_, i) => `
                    <button class="carousel-dot ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Imagen ${i + 1}"></button>
                `).join('')}
            </div>
        </div>
    `;
}

function createSingleImageMarkup(product) {
    const imageSrc = product.image || product.images?.[0];
    return `
        <div class="product-img-container">
            <img src="${imageSrc}" 
                alt="${product.name}" 
                class="product-img single-image"
                loading="lazy">
        </div>
    `;
}

function setupCarousel(card, images) {
    const carousel = card.querySelector('.carousel-images');
    const prevBtn = card.querySelector('.prev-btn');
    const nextBtn = card.querySelector('.next-btn');
    const dots = card.querySelectorAll('.carousel-dot');
    let currentImageIndex = 0;
    let touchStartX = 0;
    let touchEndX = 0;

    function updateCarousel(index) {
        currentImageIndex = index;
        carousel.style.transform = `translateX(-${currentImageIndex * 100}%)`;
        
        // Actualizar dots
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentImageIndex);
        });
    }

    // Eventos para los botones
    prevBtn?.addEventListener('click', () => {
        const newIndex = (currentImageIndex - 1 + images.length) % images.length;
        updateCarousel(newIndex);
    });

    nextBtn?.addEventListener('click', () => {
        const newIndex = (currentImageIndex + 1) % images.length;
        updateCarousel(newIndex);
    });

    // Eventos para los dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => updateCarousel(index));
    });

    // Soporte para touch/swipe
    carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    carousel.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diffX = touchStartX - touchEndX;

        if (Math.abs(diffX) > 50) { // Umbral mínimo para considerar como swipe
            if (diffX > 0) { // Swipe izquierda
                const newIndex = (currentImageIndex + 1) % images.length;
                updateCarousel(newIndex);
            } else { // Swipe derecha
                const newIndex = (currentImageIndex - 1 + images.length) % images.length;
                updateCarousel(newIndex);
            }
        }
    });

    // Autoplay opcional
    let autoplayInterval;
    
    function startAutoplay() {
        autoplayInterval = setInterval(() => {
            const newIndex = (currentImageIndex + 1) % images.length;
            updateCarousel(newIndex);
        }, 3000);
    }

    function stopAutoplay() {
        clearInterval(autoplayInterval);
    }

    card.addEventListener('mouseenter', stopAutoplay);
    card.addEventListener('mouseleave', startAutoplay);

    // Iniciar autoplay
    startAutoplay();
}

function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');
            currentFilter = filter;
            currentPage = 1;
            
            // Actualizar clases activas
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            displayProducts();
        });
    });
}

function setupLoadMoreButton() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            currentPage++;
            displayProducts();
        });
    }
}

function addToCart(item) {
    const cartArray = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Buscar si existe una combinación idéntica
    const existingItemIndex = cartArray.findIndex(cartItem => 
        cartItem.id === item.id && 
        cartItem.selectedColor === item.selectedColor && 
        cartItem.selectedModel === item.selectedModel
    );

    if (existingItemIndex >= 0) {
        cartArray[existingItemIndex].quantity = (parseInt(cartArray[existingItemIndex].quantity) || 1) + (parseInt(item.quantity) || 1);
    } else {
        const newItem = {
            ...item,
            cartItemId: `${item.id}-${Date.now()}`,
            price: parseFloat(item.price),
            quantity: parseInt(item.quantity) || 1
        };
        cartArray.push(newItem);
    }

    // Actualizar el localStorage y el estado global
    localStorage.setItem('cart', JSON.stringify(cartArray));
    window.cart = cartArray;
    
    // Actualizar la interfaz
    if (typeof updateCartCount === 'function') {
        updateCartCount();
    }
    showNotification('Producto añadido al carrito');
}

function showAlert(message) {
    // Crear o obtener el contenedor de alertas
    let alertOverlay = document.querySelector('.alert-overlay');
    if (!alertOverlay) {
        alertOverlay = document.createElement('div');
        alertOverlay.className = 'alert-overlay';
        document.body.appendChild(alertOverlay);
    }

    const alert = document.createElement('div');
    alert.className = 'alert';
    alert.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <span class="alert-message">${message}</span>
        <button class="alert-close">
            <i class="fas fa-times"></i>
        </button>
    `;

    alertOverlay.appendChild(alert);
    
    // Forzar un reflow para que la animación funcione
    alert.offsetHeight;
    alert.classList.add('show');

    // Configurar el botón de cerrar
    const closeBtn = alert.querySelector('.alert-close');
    closeBtn.addEventListener('click', () => {
        alert.classList.remove('show');
        setTimeout(() => alert.remove(), 300);
    });

    // Auto cerrar después de 5 segundos
    setTimeout(() => {
        if (alert.parentElement) {
            alert.classList.remove('show');
            setTimeout(() => alert.remove(), 300);
        }
    }, 5000);
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `
        <i class="fas fa-shopping-cart"></i>
        ${message}
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

function initializeOffers() {
    const offersGrid = document.querySelector('.offers-grid');
    if (!offersGrid || !window.specialOffers) return;

    const mainOffer = window.specialOffers.find(offer => offer.type === 'main');
    const secondaryOffers = window.specialOffers.filter(offer => offer.type === 'secondary');

    // Crear la oferta principal
    const mainOfferHTML = `
        <div class="offer-card main-offer" data-animate="fadeIn">
            <div class="offer-image" style="background-image: url('${mainOffer.image}')"></div>
            <div class="offer-content">
                <div class="offer-badge">
                    <span>${mainOffer.discount}% OFF</span>
                    <i class="fas fa-fire-alt"></i>
                </div>
                <h3 class="offer-title">${mainOffer.title}</h3>
                <p class="offer-desc">${mainOffer.description}</p>
                <div class="offer-details">
                    <div class="offer-timer">
                        <i class="fas fa-clock"></i>
                        <span>Termina en: ${mainOffer.endTime}</span>
                    </div>
                    <a href="#productos" class="btn-modern">
                        <span>${mainOffer.buttonText}</span>
                        <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        </div>
    `;

    // Crear ofertas secundarias
    const secondaryOffersHTML = `
        <div class="offers-secondary">
            ${secondaryOffers.map(offer => `
                <div class="offer-card secondary" data-animate="fadeIn">
                    <div class="offer-image" style="background-image: url('${offer.image}')"></div>
                    <div class="offer-content">
                        <div class="offer-badge ${offer.badge === 'HOT' ? 'hot' : 'new'}">
                            <span>${offer.badge}</span>
                            <i class="fas ${offer.badge === 'HOT' ? 'fa-bolt' : 'fa-tags'}"></i>
                        </div>
                        <h3 class="offer-title">${offer.title}</h3>
                        <p class="offer-desc">${offer.description}</p>
                        <a href="#productos" class="btn-modern ${offer.badge === '2x1' ? 'outline' : ''}">
                            <span>${offer.buttonText}</span>
                            <i class="fas fa-chevron-right"></i>
                        </a>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    offersGrid.innerHTML = mainOfferHTML + secondaryOffersHTML;

    // Iniciar animaciones cuando los elementos sean visibles
    const animateElements = document.querySelectorAll('[data-animate]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, { threshold: 0.1 });

    animateElements.forEach(element => observer.observe(element));
}

// Agregar detección de dispositivo
function isMobile() {
    return window.innerWidth <= 768;
}

// Mejorar el manejo de interacciones táctiles
function setupTouchInteractions() {
    const interactiveElements = document.querySelectorAll(
        '.btn, .card-btn, .filter-btn, .offer-card, .nav-links a'
    );

    interactiveElements.forEach(element => {
        element.addEventListener('touchstart', function(e) {
            this.style.transform = 'scale(0.98)';
        }, { passive: true });

        element.addEventListener('touchend', function(e) {
            this.style.transform = '';
        }, { passive: true });
    });
}

// Optimizar carga de imágenes
function setupLazyLoading() {
    if ('loading' in HTMLImageElement.prototype) {
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach(img => {
            img.src = img.dataset.src;
        });
    } else {
        // Fallback para navegadores que no soportan lazy loading
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
        document.body.appendChild(script);
    }
}

// Inicializar funcionalidades responsive
document.addEventListener('DOMContentLoaded', () => {
    setupTouchInteractions();
    setupLazyLoading();
    
    // Ajustar comportamiento del menú en móvil
    if (isMobile()) {
        const navLinks = document.querySelector('.nav-links');
        const links = navLinks.querySelectorAll('a');
        
        links.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                document.querySelector('.hamburger').innerHTML = '<i class="fas fa-bars"></i>';
            });
        });
    }
    
    // Observar cambios en el viewport
    window.addEventListener('resize', debounce(() => {
        if (isMobile()) {
            // Ajustes específicos para móvil
        } else {
            // Ajustes específicos para desktop
        }
    }, 250));
});

// Utilidad para debounce
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

