// Hacer las funciones disponibles globalmente
window.cart = JSON.parse(localStorage.getItem('cart')) || [];
window.updateCartCount = updateCartCount;
window.saveCart = saveCart;
window.updateCartDisplay = updateCartDisplay;

function updateCartDisplay() {
    const cartItemsDiv = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    let total = 0;

    if (!cartItemsDiv) return;

    // Obtener el carrito actualizado del localStorage
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];

    if (cartItems.length === 0) {
        cartItemsDiv.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Tu carrito está vacío</p>
                <a href="index.html" class="btn">Ver productos</a>
            </div>
        `;
        if (cartTotal) cartTotal.textContent = '€0.00';
        updateCartCount();
        return;
    }

    cartItemsDiv.innerHTML = '';

    cartItems.forEach((item, index) => {
        // Asegurar que price y quantity sean números válidos
        const price = typeof item.price === 'string' ? parseFloat(item.price.replace('€', '')) : parseFloat(item.price);
        const quantity = parseInt(item.quantity) || 1;
        const itemTotal = price * quantity;
        
        // Solo sumar al total si itemTotal es un número válido
        if (!isNaN(itemTotal)) {
            total += itemTotal;
        }
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image || (item.images && item.images[0])}" alt="${item.name}">
            </div>
            <div class="cart-item-info">
                <h3 class="item-name">${item.name}</h3>
                <div class="item-details">
                    ${item.selectedColor ? `<span class="item-color">Color: ${item.selectedColor}</span>` : ''}
                    ${item.selectedModel ? `<span class="item-model">Modelo: ${item.selectedModel}</span>` : ''}
                </div>
                <div class="item-price-info">
                    <span class="item-price">€${price.toFixed(2)}</span>
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateQuantity(${index}, -1)">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity">${quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${index}, 1)">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                <div class="item-subtotal">
                    Subtotal: €${itemTotal.toFixed(2)}
                </div>
            </div>
            <div class="cart-item-actions">
                <button class="edit-btn" onclick="openEditModal(${index})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="remove-btn" onclick="removeFromCart(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        cartItemsDiv.appendChild(cartItem);
    });

    if (cartTotal) {
        cartTotal.textContent = `€${total.toFixed(2)}`;
    }

    updateCartCount();
}

function updateQuantity(index, change) {
    cart[index].quantity = Math.max(1, (cart[index].quantity || 1) + change);
    saveCart();
    updateCartDisplay();
}

function removeFromCart(index) {
    const item = document.querySelectorAll('.cart-item')[index];
    item.classList.add('removing');
    
    setTimeout(() => {
        cart.splice(index, 1);
        saveCart();
        updateCartDisplay();
    }, 300);
}

function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        // Calcular el total real de items considerando la cantidad de cada uno
        const totalItems = cart.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);
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

function addToCart(item) {
    const cartArray = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Asegurarnos de que el precio sea un número antes de guardar
    const price = typeof item.price === 'string' ? 
        parseFloat(item.price.replace('€', '')) : 
        parseFloat(item.price);

    const existingItemIndex = cartArray.findIndex(cartItem => 
        cartItem.id === item.id && 
        cartItem.selectedColor === item.selectedColor && 
        cartItem.selectedModel === item.selectedModel
    );

    if (existingItemIndex >= 0) {
        cartArray[existingItemIndex].quantity = parseInt(cartArray[existingItemIndex].quantity || 1) + parseInt(item.quantity || 1);
    } else {
        const newItem = {
            ...item,
            cartItemId: `${item.id}-${Date.now()}`,
            price: price,
            quantity: parseInt(item.quantity || 1)
        };
        cartArray.push(newItem);
    }

    localStorage.setItem('cart', JSON.stringify(cartArray));
    window.cart = cartArray;
    
    updateCartCount();
    showNotification('Producto añadido al carrito');
}

function openEditModal(index) {
    const item = cart[index];
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal edit-modal">
            <button class="modal-close">
                <i class="fas fa-times"></i>
            </button>
            <div class="modal-content">
                <div class="modal-images">
                    <img src="${item.image || (item.images && item.images[0])}" alt="${item.name}">
                </div>
                <div class="modal-info">
                    <h2 class="modal-title">${item.name}</h2>
                    <div class="modal-price">€${item.price}</div>
                    
                    ${item.colors ? `
                        <div class="modal-colors">
                            <h4>Color seleccionado:</h4>
                            <div class="color-options">
                                ${item.colors.map(color => `
                                    <button class="color-btn ${color === item.selectedColor ? 'active' : ''}" 
                                            data-color="${color}" 
                                            style="background-color: ${color.toLowerCase()}">
                                        <span class="color-name">${color}</span>
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${item.models ? `
                        <div class="modal-models">
                            <h4>Modelo:</h4>
                            <div class="model-options">
                                ${item.models.map(model => `
                                    <button class="model-btn ${model === item.selectedModel ? 'active' : ''}" 
                                            data-model="${model}">
                                        <i class="fas fa-mobile-alt"></i>
                                        ${model}
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="quantity-selector">
                        <h4>Cantidad:</h4>
                        <div class="quantity-controls">
                            <button class="quantity-btn minus-btn">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="quantity-display">${item.quantity}</span>
                            <button class="quantity-btn plus-btn">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>

                    <div class="edit-modal-buttons">
                        <button class="card-btn save-changes">
                            <i class="fas fa-check"></i> Guardar cambios
                        </button>
                        <button class="card-btn remove-item">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    
    // Resto del código de configuración del modal...
    setupEditModalEvents(modal, index);
    
    requestAnimationFrame(() => {
        modal.classList.add('active');
        modal.querySelector('.edit-modal').classList.add('active');
    });
}

function setupEditModalEvents(modal, index) {
    const item = cart[index];
    let currentColor = item.selectedColor;
    let currentModel = item.selectedModel;
    let currentQuantity = item.quantity;

    // Color selection
    modal.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            modal.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentColor = btn.dataset.color;
        });
    });

    // Model selection
    modal.querySelectorAll('.model-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            modal.querySelectorAll('.model-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentModel = btn.dataset.model;
        });
    });

    // Quantity controls
    const quantityDisplay = modal.querySelector('.quantity-display');
    
    modal.querySelector('.minus-btn').addEventListener('click', () => {
        if (currentQuantity > 1) {
            currentQuantity--;
            quantityDisplay.textContent = currentQuantity;
        }
    });

    modal.querySelector('.plus-btn').addEventListener('click', () => {
        currentQuantity++;
        quantityDisplay.textContent = currentQuantity;
    });

    // Save changes
    modal.querySelector('.save-changes').addEventListener('click', () => {
        cart[index] = {
            ...item,
            selectedColor: currentColor,
            selectedModel: currentModel,
            quantity: currentQuantity
        };
        saveCart();
        updateCartDisplay();
        closeEditModal(modal);
        showNotification('Producto actualizado');
    });

    // Remove item
    modal.querySelector('.remove-item').addEventListener('click', () => {
        removeFromCart(index);
        closeEditModal(modal);
        showNotification('Producto eliminado del carrito');
    });

    // Close modal
    modal.querySelector('.modal-close').addEventListener('click', () => closeEditModal(modal));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeEditModal(modal);
    });

    setTimeout(() => {
        modal.classList.add('active');
        modal.querySelector('.modal').classList.add('active');
    }, 10);
}

function closeEditModal(modal) {
    modal.querySelector('.modal').classList.remove('active');
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
}

// Inicializar carrito cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    window.cart = JSON.parse(localStorage.getItem('cart')) || [];
    updateCartDisplay();
    updateCartCount();
});
