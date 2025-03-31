// Hamburger menu functionality
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.getElementById('hamburger-menu');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            navLinks.classList.toggle('active');
            const isOpen = navLinks.classList.contains('active');
            hamburger.innerHTML = isOpen ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        });

        // Cerrar menú cuando se hace clic en cualquier lugar fuera
        document.addEventListener('click', function(e) {
            if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
                navLinks.classList.remove('active');
                hamburger.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });

        // Cerrar menú cuando se hace clic en un enlace
        const navLinksItems = navLinks.querySelectorAll('a');
        navLinksItems.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                hamburger.innerHTML = '<i class="fas fa-bars"></i>';
            });
        });
    }
});

// Hacer las funciones disponibles globalmente
window.cart = JSON.parse(localStorage.getItem('cart')) || [];
window.updateCartCount = updateCartCount;
window.saveCart = saveCart;
window.updateCartDisplay = updateCartDisplay;

function updateCartDisplay() {
    const cartItemsDiv = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    let total = 0;

    if (!cartItemsDiv) return; // Si no estamos en la página del carrito

    cartItemsDiv.innerHTML = '';

    cart.forEach((item, index) => {
        const itemTotal = item.price * (item.quantity || 1);
        total += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image || item.images[0]}" alt="${item.name}">
            <div class="cart-item-info">
                <h3>${item.name}</h3>
                <p class="item-price">$${item.price} x ${item.quantity || 1}</p>
                <p class="item-total">Total: $${itemTotal.toFixed(2)}</p>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${index}, -1)">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity">${item.quantity || 1}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${index}, 1)">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
            <button class="remove-btn" onclick="removeFromCart(${index})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        cartItemsDiv.appendChild(cartItem);
    });

    if (cartTotal) {
        cartTotal.textContent = `$${total.toFixed(2)}`;
    }
    
    updateCartCount();
}

function updateQuantity(index, change) {
    cart[index].quantity = Math.max(1, (cart[index].quantity || 1) + change);
    saveCart();
    updateCartDisplay();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartDisplay();
}

function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        cartCount.textContent = totalItems;
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function shareOrder(platform) {
    const items = cart.map(item => 
        `${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const message = `Mi orden de CaseArt:\n\n${items}\n\nTotal: $${total.toFixed(2)}`;

    switch(platform) {
        case 'whatsapp':
            window.open(`https://wa.me/?text=${encodeURIComponent(message)}`);
            break;
        case 'email':
            window.open(`mailto:?subject=Mi orden de CaseArt&body=${encodeURIComponent(message)}`);
            break;
        case 'instagram':
            // Aquí podrías implementar la lógica para compartir en Instagram
            alert('Compartir en Instagram aún no está implementado');
            break;
    }
}

// Inicializar carrito cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    updateCartDisplay();
    updateCartCount(); // Actualizar contador inicial
});
