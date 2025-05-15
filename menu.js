function initializeMenu() {
    const hamburger = document.getElementById('hamburger-menu');
    const navLinks = document.querySelector('.nav-links');

    if (!hamburger || !navLinks) return;

    function toggleMenu(e) {
        e.stopPropagation();
        navLinks.classList.toggle('active');
        const isOpen = navLinks.classList.contains('active');
        hamburger.innerHTML = isOpen ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    }

    function closeMenu() {
        navLinks.classList.remove('active');
        hamburger.innerHTML = '<i class="fas fa-bars"></i>';
    }

    // Event Listeners
    hamburger.addEventListener('click', toggleMenu);
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
            closeMenu();
        }
    });

    // Close menu when clicking on links
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Handle touch events
    let touchStartX = 0;
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    document.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > 50) { // Swipe threshold
            if (diff > 0 && navLinks.classList.contains('active')) {
                closeMenu(); // Swipe left to close
            }
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeMenu);
