// Shield Hamburgueria - Filter Functionality
document.addEventListener('DOMContentLoaded', function() {
    const filterInput = document.getElementById('burger-filter');
    const clearButton = document.getElementById('clear-filter');
    const noResultsMessage = document.getElementById('no-results');
    const burgerSections = document.querySelectorAll('.painel');
    const adicionaisSection = document.querySelector('.section');

    // Get all burger items (excluding adicionais and observações)
    const burgerItems = document.querySelectorAll('.painel .item');

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
            const title = item.querySelector('.item-title').textContent.toLowerCase();
            const ingredients = Array.from(item.querySelectorAll('.item-ingredients li'))
                .map(li => li.textContent.toLowerCase())
                .join(' ');
            
            const searchText = title + ' ' + ingredients;
            
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

    // Event listeners
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
});
