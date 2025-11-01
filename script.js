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
    const deliveryRadio = document.getElementById('delivery-radio');
    const pickupRadio = document.getElementById('pickup-radio');

    // WhatsApp number (replace with your actual number)
    const WHATSAPP_NUMBER = '554699282707';

    // Adicionais list with prices
    const ADICIONAIS = [
        { name: 'Smash burger', price: 5.00 },
        { name: 'Batata', price: 5.00 },
        { name: 'Picles', price: 2.00 },
        { name: 'Queijo cheddar', price: 2.00 },
        { name: 'Queijo muçarela', price: 2.00 },
        { name: 'Bacon', price: 2.00 },
        { name: 'Ovo', price: 2.00 },
        { name: 'Cebola roxa', price: 2.00 },
        { name: 'Cebola caramelizada', price: 2.00 },
        { name: 'Alface', price: 2.00 },
        { name: 'Tomate', price: 2.00 },
        { name: 'Abacaxi', price: 2.00 },
        { name: 'Abacaxi grelhado', price: 2.00 },
        { name: 'Calabresa', price: 2.00 },
        { name: 'Doritos', price: 2.00 },
        { name: 'Anéis de cebola roxa', price: 2.00 },
        { name: 'Molho da casa', price: 2.00 },
        { name: 'Molho barbecue', price: 2.00 }
    ];

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
        const existingItem = cart.find(item => item.name === name && item.adicionais.length === 0);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                name: name,
                price: parseFloat(price),
                quantity: 1,
                observation: '',
                adicionais: [] // Array to store selected adicionais
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

    function toggleAdicional(cartIndex, adicionalName, adicionalPrice) {
        const item = cart[cartIndex];
        const existingIndex = item.adicionais.findIndex(a => a.name === adicionalName);
        
        if (existingIndex >= 0) {
            // Remove adicional
            item.adicionais.splice(existingIndex, 1);
        } else {
            // Add adicional
            item.adicionais.push({ name: adicionalName, price: adicionalPrice });
        }
        
        updateCart();
    }

    function calculateItemTotal(item) {
        let total = item.price * item.quantity;
        const adicionaisTotal = item.adicionais.reduce((sum, a) => sum + a.price, 0);
        total += adicionaisTotal * item.quantity;
        return total;
    }

    function updateCart() {
        cartItemsContainer.innerHTML = '';
        let total = 0;

        cart.forEach((item, index) => {
            const itemTotal = calculateItemTotal(item);
            total += itemTotal;

            // Build adicionais checkboxes HTML
            let adicionaisHTML = '<div class="adicionais-section">';
            adicionaisHTML += '<button class="adicionais-toggle" data-cart-index="${index}" type="button">';
            adicionaisHTML += '<span class="adicionais-toggle-text">Vai um adicional?</span>';
            adicionaisHTML += '<span class="adicionais-toggle-icon">▼</span>';
            adicionaisHTML += '</button>';
            adicionaisHTML += '<div class="adicionais-content" data-cart-index="${index}">';
            adicionaisHTML += '<div class="adicionais-grid">';
            
            ADICIONAIS.forEach(adicional => {
                const isChecked = item.adicionais.some(a => a.name === adicional.name);
                adicionaisHTML += `
                    <label class="adicional-checkbox">
                        <input type="checkbox" 
                               class="adicional-input" 
                               data-cart-index="${index}" 
                               data-name="${adicional.name}" 
                               data-price="${adicional.price}"
                               ${isChecked ? 'checked' : ''}>
                        <span class="adicional-label">${adicional.name} (+R$ ${adicional.price.toFixed(2)})</span>
                    </label>
                `;
            });
            
            adicionaisHTML += '</div></div></div>';

            // Build selected adicionais summary
            let adicionaisSummary = '';
            if (item.adicionais.length > 0) {
                adicionaisSummary = '<div class="selected-adicionais">';
                adicionaisSummary += '<strong>Selecionados:</strong> ';
                adicionaisSummary += item.adicionais.map(a => a.name).join(', ');
                adicionaisSummary += '</div>';
            }

            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-header">
                    <h4 class="cart-item-name">${item.name}</h4>
                    <span class="cart-item-price">Base: R$ ${item.price.toFixed(2)}</span>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button class="quantity-btn minus" data-index="${index}">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn plus" data-index="${index}">+</button>
                    </div>
                    <button class="remove-btn" data-index="${index}">Remover</button>
                </div>
                ${adicionaisHTML}
                ${adicionaisSummary}
                <div class="cart-item-observation">
                    <label>Observação:</label>
                    <textarea class="observation-input" data-index="${index}" placeholder="Ex: sem cebola, ponto da carne...">${item.observation}</textarea>
                </div>
                <div class="cart-item-total">Subtotal: R$ ${itemTotal.toFixed(2)}</div>
            `;

            cartItemsContainer.appendChild(cartItem);
        });

        // No delivery fee added to subtotal - will be combined via WhatsApp
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

        // Add event listeners to adicional checkboxes
        document.querySelectorAll('.adicional-input').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const cartIndex = parseInt(this.dataset.cartIndex);
                const adicionalName = this.dataset.name;
                const adicionalPrice = parseFloat(this.dataset.price);
                toggleAdicional(cartIndex, adicionalName, adicionalPrice);
            });
        });

        // Add event listeners to adicionais toggle buttons
        document.querySelectorAll('.adicionais-toggle').forEach(button => {
            button.addEventListener('click', function() {
                const cartIndex = this.dataset.cartIndex;
                const content = document.querySelector(`.adicionais-content[data-cart-index="${cartIndex}"]`);
                const icon = this.querySelector('.adicionais-toggle-icon');
                
                content.classList.toggle('expanded');
                icon.classList.toggle('rotated');
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

        let message = 'Olá, gostaria de pedir: %0A%0A';
        let total = 0;

        cart.forEach(item => {
            const itemTotal = calculateItemTotal(item);
            total += itemTotal;
            
            message += `${item.quantity}x ${item.name}%0A`;
            
            // Add adicionais to message
            if (item.adicionais.length > 0) {
                message += `_Adicionais:_%0A`;
                item.adicionais.forEach(adicional => {
                    message += `  • ${adicional.name}%0A`;
                });
            }
            
            message += `= R$ ${itemTotal.toFixed(2)}%0A`;
            
            if (item.observation) {
                message += `*Obs: ${item.observation}*%0A`;
            }
            
            message += '%0A';
        });

        message += `*Subtotal: R$ ${total.toFixed(2)}*%0A%0A`;
        
        // Add delivery type
        const isDelivery = deliveryRadio.checked;
        if (isDelivery) {
            message += 'Para entrega';
        } else {
            message += 'Para retirada';
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
});
