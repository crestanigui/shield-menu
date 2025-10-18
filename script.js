// Shield Hamburgueria - Filter Functionality and Cart Management
document.addEventListener('DOMContentLoaded', function() {
    const filterInput = document.getElementById('burger-filter');
    const clearButton = document.getElementById('clear-filter');
    const noResultsMessage = document.getElementById('no-results');
    const burgerSections = document.querySelectorAll('.painel');
    const adicionaisSection = document.querySelector('.section');

    // Get all burger items (excluding adicionais and observações)
    const burgerItems = document.querySelectorAll('.painel .item');

    // Cart management
    let cart = [];
    const pedidoSection = document.getElementById('pedido-section');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalValue = document.getElementById('cart-total-value');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const finalizeOrderBtn = document.getElementById('finalize-order-btn');
    const deliveryCheckbox = document.getElementById('delivery-checkbox');

    // WhatsApp number (replace with your actual number)
    const WHATSAPP_NUMBER = '554699282707';
    const DELIVERY_FEE = 10.00;

    function filterBurgers() {
        const searchTerm = filterInput.value.toLowerCase().trim();
        let hasVisibleResults = false;

        // Show/hide clear button
        if (searchTerm.length > 0) {
            clearButton.classList.add('show');
        } else {
            clearButton.classList.remove('show');
        }

        // If search is empty, show everything
        if (searchTerm === '') {
            burgerItems.forEach(item => {
                item.classList.remove('hidden');
            });
            burgerSections.forEach(section => {
                section.classList.remove('hidden');
            });
            noResultsMessage.classList.remove('show');
            return;
        }

        // Filter burger items
        burgerItems.forEach(item => {
            const title = item.querySelector('.item-title');
            if (!title) return;
            
            const titleText = title.textContent.toLowerCase();
            const ingredientsList = item.querySelectorAll('.item-ingredients li');
            const ingredients = Array.from(ingredientsList)
                .map(li => li.textContent.toLowerCase())
                .join(' ');
            
            const searchText = titleText + ' ' + ingredients;
            
            if (searchText.includes(searchTerm)) {
                item.classList.remove('hidden');
                hasVisibleResults = true;
            } else {
                item.classList.add('hidden');
            }
        });

        // Hide sections that have no visible items
        burgerSections.forEach(section => {
            const visibleItems = section.querySelectorAll('.item:not(.hidden)');
            if (visibleItems.length === 0) {
                section.classList.add('hidden');
            } else {
                section.classList.remove('hidden');
            }
        });

        // Show/hide no results message
        if (hasVisibleResults) {
            noResultsMessage.classList.remove('show');
        } else {
            noResultsMessage.classList.add('show');
        }
    }

    function clearFilter() {
        filterInput.value = '';
        filterBurgers();
        filterInput.focus();
    }

    // Add to cart functionality
    function addToCart(name, price) {
        const existingItem = cart.find(item => item.name === name);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                name: name,
                price: parseFloat(price),
                quantity: 1,
                observation: ''
            });
        }
        
        updateCart();
        showPedidoSection();
    }

    function removeFromCart(index) {
        cart.splice(index, 1);
        updateCart();
        
        if (cart.length === 0) {
            hidePedidoSection();
        }
    }

    function updateQuantity(index, change) {
        cart[index].quantity += change;
        
        if (cart[index].quantity <= 0) {
            removeFromCart(index);
        } else {
            updateCart();
        }
    }

    function updateObservation(index, observation) {
        cart[index].observation = observation;
    }

    function updateCart() {
        cartItemsContainer.innerHTML = '';
        let total = 0;

        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-header">
                    <h4 class="cart-item-name">${item.name}</h4>
                    <span class="cart-item-price">R$ ${item.price.toFixed(2)}</span>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button class="quantity-btn minus" data-index="${index}">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn plus" data-index="${index}">+</button>
                    </div>
                    <button class="remove-btn" data-index="${index}">Remover</button>
                </div>
                <div class="cart-item-observation">
                    <label>Observação:</label>
                    <textarea class="observation-input" data-index="${index}" placeholder="Ex: sem cebola, ponto da carne...">${item.observation}</textarea>
                </div>
                <div class="cart-item-total">Subtotal: R$ ${itemTotal.toFixed(2)}</div>
            `;

            cartItemsContainer.appendChild(cartItem);
        });

        // Add delivery fee if checkbox is checked
        if (deliveryCheckbox.checked) {
            total += DELIVERY_FEE;
        }

        cartTotalValue.textContent = `R$ ${total.toFixed(2)}`;

        // Add event listeners to quantity buttons
        document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
            btn.addEventListener('click', function() {
                updateQuantity(parseInt(this.dataset.index), 1);
            });
        });

        document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
            btn.addEventListener('click', function() {
                updateQuantity(parseInt(this.dataset.index), -1);
            });
        });

        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                removeFromCart(parseInt(this.dataset.index));
            });
        });

        document.querySelectorAll('.observation-input').forEach(textarea => {
            textarea.addEventListener('input', function() {
                updateObservation(parseInt(this.dataset.index), this.value);
            });
        });
    }

    function showPedidoSection() {
        pedidoSection.style.display = 'block';
        pedidoSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function hidePedidoSection() {
        pedidoSection.style.display = 'none';
    }

    function clearCart() {
        if (confirm('Deseja limpar todo o carrinho?')) {
            cart = [];
            updateCart();
            hidePedidoSection();
        }
    }

    function finalizeOrder() {
        if (cart.length === 0) {
            alert('Seu carrinho está vazio!');
            return;
        }

        let message = '*Pedido - Shield Hamburgueria*%0A%0A';
        let total = 0;

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            message += `*${item.quantity}x ${item.name}*%0A`;
            message += `R$ ${item.price.toFixed(2)} cada = R$ ${itemTotal.toFixed(2)}%0A`;
            
            if (item.observation) {
                message += `_Obs: ${item.observation}__%0A`;
            }
            
            message += '%0A';
        });

        // Add delivery fee if checked
        const isDelivery = deliveryCheckbox.checked;
        if (isDelivery) {
            message += `*Taxa de entrega: R$ ${DELIVERY_FEE.toFixed(2)}*%0A%0A`;
            total += DELIVERY_FEE;
        }

        message += `*Total: R$ ${total.toFixed(2)}*`;
        
        if (isDelivery) {
            message += '%0A%0A_🚚 Para entrega_';
        } else {
            message += '%0A%0A_🏪 Para retirada_';
        }

        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
        window.open(whatsappUrl, '_blank');
    }

    // Event listeners for filter
    filterInput.addEventListener('input', filterBurgers);
    filterInput.addEventListener('keyup', function(e) {
        if (e.key === 'Escape') {
            clearFilter();
        }
    });
    
    clearButton.addEventListener('click', clearFilter);

    // Focus on filter input when pressing '/' key
    document.addEventListener('keydown', function(e) {
        if (e.key === '/' && !filterInput.matches(':focus')) {
            e.preventDefault();
            filterInput.focus();
        }
    });

    // Event listeners for cart
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const item = this.closest('.item');
            const name = item.dataset.name;
            const price = item.dataset.price;
            
            if (name && price) {
                addToCart(name, price);
                
                // Visual feedback
                this.textContent = 'Adicionado!';
                this.style.background = 'var(--primary-gold)';
                this.style.color = 'var(--dark-bg)';
                
                setTimeout(() => {
                    this.textContent = 'Adicionar ao carrinho';
                    this.style.background = '';
                    this.style.color = '';
                }, 1000);
            }
        });
    });

    clearCartBtn.addEventListener('click', clearCart);
    finalizeOrderBtn.addEventListener('click', finalizeOrder);
    
    // Update total when delivery checkbox changes
    deliveryCheckbox.addEventListener('change', updateCart);
});
