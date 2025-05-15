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
            <button class="card-btn view-btn">Ver detalles</button>
            <button class="card-btn add-to-cart" data-product-id="${product.id}" onclick="addToCart(${product.id})">
                Añadir al carrito
            </button>
        </div>
    `;

    if (hasMultipleImages) {
        setupCarousel(card, product.images);
    }

    return card;
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

function addToCart(productId) {
    const button = document.querySelector(`[data-product-id="${productId}"]`);
    const originalText = button.textContent;
    
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
        product.quantity = 1;
        cart.push({...product}); // Crear copia del producto
    }
    
    // Animación del botón
    button.classList.add('btn-added');
    button.innerHTML = `
        <i class="fas fa-check"></i>
        Añadido
    `;
    
    button.style.animation = 'addedAnimation 0.5s ease';
    
    setTimeout(() => {
        button.classList.remove('btn-added');
        button.textContent = originalText;
        button.style.animation = '';
    }, 2000);
    
    // Actualizar carrito
    if (typeof updateCartCount === 'function') {
        updateCartCount();
    }
    if (typeof saveCart === 'function') {
        saveCart();
    }
    
    showNotification('Producto añadido al carrito');
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

