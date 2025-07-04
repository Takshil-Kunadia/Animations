/**
 * Lightbox Module - Image Gallery with Animations
 * Handles lightbox functionality for card images with smooth animations
 */

class Lightbox {
	constructor() {
		this.isOpen = false;
		this.currentImageIndex = 0;
		this.images = [];
		this.lightboxElement = null;
		this.imageElement = null;
		this.prevButton = null;
		this.nextButton = null;
		this.closeButton = null;
		this.counter = null;

		// Mobile touch handling
		this.isMobile = this.detectMobile();
		this.cardStates = new Map(); // Track hover/expanded state for each card

		// Swipe handling for lightbox
		this.swipeStartX = 0;
		this.swipeStartY = 0;
		this.swipeEndX = 0;
		this.swipeEndY = 0;
		this.minSwipeDistance = 50; // Minimum distance for a swipe
		this.swipeThreshold = 30; // Maximum Y movement to still be considered horizontal swipe

		this.init();
	}

	/**
	 * Initialize the lightbox
	 */
	init() {
		this.loadLightboxHTML();
		this.collectImages();
		this.bindEvents();
		this.bindKeyboardEvents();
	}

	/**
	 * Detect if the device is mobile
	 */
	detectMobile() {
		// Check for touch capability and screen size
		const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
		const isSmallScreen = window.matchMedia && window.matchMedia("(max-width: 768px)").matches;
		const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

		return hasTouch || isSmallScreen || isMobileUserAgent;
	}

	/**
	 * Create and inject lightbox HTML
	 */
	loadLightboxHTML() {
		const htmlContent = `
			<div id="lightbox" class="lightbox">
				<div class="lightbox-backdrop"></div>
				<div class="lightbox-content">
					<button class="lightbox-close" aria-label="Close lightbox">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<line x1="18" y1="6" x2="6" y2="18"></line>
							<line x1="6" y1="6" x2="18" y2="18"></line>
						</svg>
					</button>
					<div class="lightbox-image-container">
						<img class="lightbox-image" src="" alt="" />
						<div class="lightbox-loader"></div>
					</div>
					<div class="lightbox-nav">
						<button class="lightbox-prev" aria-label="Previous image">
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<polyline points="15,18 9,12 15,6"></polyline>
							</svg>
						</button>
						<button class="lightbox-next" aria-label="Next image">
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<polyline points="9,18 15,12 9,6"></polyline>
							</svg>
						</button>
					</div>
					
					<!-- Swipe Indicators for Mobile -->
					<div class="lightbox-swipe-arrow left" aria-hidden="true">
						<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
							<polyline points="15,18 9,12 15,6"></polyline>
						</svg>
					</div>
					<div class="lightbox-swipe-arrow right" aria-hidden="true">
						<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
							<polyline points="9,18 15,12 9,6"></polyline>
						</svg>
					</div>
					
					<div class="lightbox-counter">
						<span class="current-image">1</span> / <span class="total-images">8</span>
					</div>
				</div>
			</div>
		`;

		document.body.insertAdjacentHTML('beforeend', htmlContent);

		// Cache DOM elements
		this.lightboxElement = document.getElementById('lightbox');
		this.imageElement = this.lightboxElement.querySelector('.lightbox-image');
		this.prevButton = this.lightboxElement.querySelector('.lightbox-prev');
		this.nextButton = this.lightboxElement.querySelector('.lightbox-next');
		this.closeButton = this.lightboxElement.querySelector('.lightbox-close');
		this.counter = this.lightboxElement.querySelector('.lightbox-counter');
		this.loader = this.lightboxElement.querySelector('.lightbox-loader');
		this.backdrop = this.lightboxElement.querySelector('.lightbox-backdrop');
		this.swipeArrows = this.lightboxElement.querySelectorAll('.lightbox-swipe-arrow');
	}

	/**
	 * Collect all card images and their information
	 */
	collectImages() {
		const cards = document.querySelectorAll('.card');
		this.images = [];

		cards.forEach((card, index) => {
			const computedStyle = window.getComputedStyle(card);
			const backgroundImage = computedStyle.backgroundImage;

			if (backgroundImage && backgroundImage !== 'none') {
				const imageUrl = backgroundImage.slice(5, -2); // Remove 'url("' and '")'
				const cardType = card.classList.contains('big-card') ? 'big' : 'little';

				this.images.push({
					url: imageUrl,
					type: cardType,
					element: card,
					index: index
				});
			}
		});

		// Update total images counter
		const totalImagesElement = this.lightboxElement.querySelector('.total-images');
		if (totalImagesElement) {
			totalImagesElement.textContent = this.images.length;
		}
	}

	/**
	 * Bind click events to cards and lightbox controls
	 */
	bindEvents() {
		// Add click/touch listeners to all cards
		const cards = document.querySelectorAll('.card');
		const cardGroup = document.querySelector('.card-group');

		cards.forEach((card, index) => {
			card.style.cursor = 'pointer';

			if (this.isMobile) {
				// Mobile: First touch expands, second touch opens lightbox
				card.addEventListener('touchstart', (e) => {
					e.preventDefault();
					this.handleMobileTouch(card, index, cardGroup);
				});
			} else {
				// Desktop: Single click opens lightbox
				card.addEventListener('click', (e) => {
					e.preventDefault();
					this.openLightbox(index);
				});
			}
		});

		// Close expanded cards when clicking outside on mobile
		if (this.isMobile) {
			document.addEventListener('touchstart', (e) => {
				const cardGroup = document.querySelector('.card-group');
				if (cardGroup && !cardGroup.contains(e.target)) {
					this.collapseAllCards();
				}
			});
		}

		// Lightbox controls
		this.closeButton.addEventListener('click', () => this.closeLightbox());
		this.prevButton.addEventListener('click', () => this.showPrevious());
		this.nextButton.addEventListener('click', () => this.showNext());
		this.backdrop.addEventListener('click', () => this.closeLightbox());

		// Prevent image click from closing lightbox
		this.imageElement.addEventListener('click', (e) => e.stopPropagation());
		
		// Add swipe interactions for lightbox navigation
		this.bindSwipeEvents();
	}

	/**
	 * Bind swipe events for lightbox navigation
	 */
	bindSwipeEvents() {
		if (!this.isMobile) return;
		
		// Add touch event listeners to the lightbox content
		this.lightboxElement.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
		this.lightboxElement.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
		this.lightboxElement.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
	}

	/**
	 * Handle touch start for swipe detection
	 * @param {TouchEvent} e - Touch event
	 */
	handleTouchStart(e) {
		if (!this.isOpen) return;
		
		const touch = e.touches[0];
		this.swipeStartX = touch.clientX;
		this.swipeStartY = touch.clientY;
	}

	/**
	 * Handle touch move for swipe detection
	 * @param {TouchEvent} e - Touch event
	 */
	handleTouchMove(e) {
		if (!this.isOpen) return;
		
		// Prevent scrolling during swipe
		const touch = e.touches[0];
		const deltaX = Math.abs(touch.clientX - this.swipeStartX);
		const deltaY = Math.abs(touch.clientY - this.swipeStartY);
		
		// If horizontal movement is greater than vertical, prevent default scrolling
		if (deltaX > deltaY) {
			e.preventDefault();
		}
	}

	/**
	 * Handle touch end for swipe detection
	 * @param {TouchEvent} e - Touch event
	 */
	handleTouchEnd(e) {
		if (!this.isOpen) return;
		
		const touch = e.changedTouches[0];
		this.swipeEndX = touch.clientX;
		this.swipeEndY = touch.clientY;
		
		this.handleSwipe();
	}

	/**
	 * Process swipe gesture and navigate accordingly
	 */
	handleSwipe() {
		const deltaX = this.swipeEndX - this.swipeStartX;
		const deltaY = Math.abs(this.swipeEndY - this.swipeStartY);
		
		// Check if it's a valid horizontal swipe
		if (Math.abs(deltaX) > this.minSwipeDistance && deltaY < this.swipeThreshold) {
			if (deltaX > 0) {
				// Swipe right - show previous image
				this.showPrevious();
			} else {
				// Swipe left - show next image
				this.showNext();
			}
		}
	}

	/**
	 * Handle mobile touch interactions for cards
	 * @param {HTMLElement} card - The touched card
	 * @param {number} index - Card index
	 * @param {HTMLElement} cardGroup - The card group container
	 */
	handleMobileTouch(card, index, cardGroup) {
		const cardId = `card-${index}`;
		const isExpanded = this.cardStates.get(cardId) || false;

		// Check if any card is currently expanded
		const anyCardExpanded = Array.from(this.cardStates.values()).some(state => state);

		if (!isExpanded && !anyCardExpanded) {

			// First touch: Expand the card group (simulate hover)
			cardGroup.classList.add('mobile-expanded');
			this.cardStates.set(cardId, true);

			// Add visual feedback
			card.style.zIndex = '10';

			// Auto-collapse after 4 seconds if no second touch
			setTimeout(() => {
				if (this.cardStates.get(cardId) && !this.isOpen) {
					this.collapseCard(cardId, cardGroup);
				}
			}, 4000);
		} else if (isExpanded) {
			// Second touch on same card: Open lightbox
			this.openLightbox(index);
			this.collapseCard(cardId, cardGroup);
		} else {
			// Touch on different card while another is expanded: Switch expansion
			this.collapseAllCards();
			cardGroup.classList.add('mobile-expanded');
			this.cardStates.set(cardId, true);
			card.style.zIndex = '10';
		}
	}

	/**
	 * Collapse a specific card
	 * @param {string} cardId - Card identifier
	 * @param {HTMLElement} cardGroup - The card group container
	 */
	collapseCard(cardId, cardGroup) {
		cardGroup.classList.remove('mobile-expanded');
		this.cardStates.set(cardId, false);

		// Reset z-index for all cards
		const cards = document.querySelectorAll('.card');
		cards.forEach(card => {
			card.style.zIndex = '';
		});
	}

	/**
	 * Collapse all expanded cards
	 */
	collapseAllCards() {
		const cardGroup = document.querySelector('.card-group');
		if (cardGroup) {
			cardGroup.classList.remove('mobile-expanded');
		}

		// Reset all card states and z-index
		this.cardStates.clear();
		const cards = document.querySelectorAll('.card');
		cards.forEach(card => {
			card.style.zIndex = '';
		});
	}

	/**
	 * Bind keyboard events for navigation
	 */
	bindKeyboardEvents() {
		document.addEventListener('keydown', (e) => {
			if (!this.isOpen) return;

			switch (e.key) {
				case 'Escape':
					this.closeLightbox();
					break;
				case 'ArrowLeft':
					this.showPrevious();
					break;
				case 'ArrowRight':
					this.showNext();
					break;
			}
		});
	}

	/**
	 * Open lightbox with specific image
	 * @param {number} imageIndex - Index of the image to display
	 */
	openLightbox(imageIndex) {
		if (this.images.length === 0) return;

		this.currentImageIndex = imageIndex;
		this.isOpen = true;

		// Disable body scroll
		document.body.style.overflow = 'hidden';

		// Show lightbox
		this.lightboxElement.classList.add('active');

		// Load and display image
		this.loadImage(this.images[imageIndex]);

		// Update counter
		this.updateCounter();

		// Update navigation visibility
		this.updateNavigation();

		// Add entrance animation
		requestAnimationFrame(() => {
			this.lightboxElement.classList.add('show');
			// Show swipe arrows temporarily on mobile
			this.showSwipeArrowsTemporarily();
		});
	}

	/**
	 * Show swipe arrows temporarily for user guidance
	 */
	showSwipeArrowsTemporarily() {
		if (!this.isMobile || this.images.length <= 1) return;
		
		// Show arrows after a short delay
		setTimeout(() => {
			this.swipeArrows.forEach(arrow => {
				arrow.classList.add('visible');
			});
			
			// Hide arrows after 3 seconds
			setTimeout(() => {
				this.swipeArrows.forEach(arrow => {
					arrow.classList.remove('visible');
				});
			}, 3000);
		}, 500);
	}

	/**
	 * Close the lightbox
	 */
	closeLightbox() {
		if (!this.isOpen) return;

		this.isOpen = false;

		// Start exit animation
		this.lightboxElement.classList.remove('show');

		// After animation completes, hide lightbox
		setTimeout(() => {
			this.lightboxElement.classList.remove('active');
			document.body.style.overflow = '';
		}, 300);
	}

	/**
	 * Show previous image
	 */
	showPrevious() {
		if (this.images.length <= 1) return;

		this.currentImageIndex = (this.currentImageIndex - 1 + this.images.length) % this.images.length;
		this.loadImage(this.images[this.currentImageIndex]);
		this.updateCounter();
		this.updateNavigation();
	}

	/**
	 * Show next image
	 */
	showNext() {
		if (this.images.length <= 1) return;

		this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
		this.loadImage(this.images[this.currentImageIndex]);
		this.updateCounter();
		this.updateNavigation();
	}

	/**
	 * Load and display an image
	 * @param {Object} imageData - Image data object
	 */
	loadImage(imageData) {
		// Show loader
		this.loader.classList.add('active');
		this.imageElement.classList.add('loading');

		// Create new image element to preload
		const img = new Image();

		img.onload = () => {
			// Hide loader
			this.loader.classList.remove('active');
			this.imageElement.classList.remove('loading');
	
			// Set image source and add loaded class
			this.imageElement.src = imageData.url;
			this.imageElement.alt = `Card ${this.currentImageIndex + 1}`;
	
			// Add fade-in animation
			this.imageElement.classList.add('loaded');
	
			// Remove loaded class after animation
			setTimeout(() => {
				this.imageElement.classList.remove('loaded');
			}, 300);
		};

		img.onerror = () => {
			console.error('Failed to load image:', imageData.url);
			this.loader.classList.remove('active');
			this.imageElement.classList.remove('loading');
		};

		img.src = imageData.url;
	}

	/**
	 * Update the image counter
	 */
	updateCounter() {
		const currentImageElement = this.lightboxElement.querySelector('.current-image');
		if (currentImageElement) {
			currentImageElement.textContent = this.currentImageIndex + 1;
		}
	}

	/**
	 * Update navigation button visibility
	 */
	updateNavigation() {
		if (this.images.length <= 1) {
			this.prevButton.style.display = 'none';
			this.nextButton.style.display = 'none';
		} else {
			this.prevButton.style.display = 'flex';
			this.nextButton.style.display = 'flex';
		}
	}

	/**
	 * Refresh the image collection (useful if cards are dynamically added)
	 */
	refresh() {
		this.collectImages();
	}
}

// Initialize lightbox when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
	window.lightbox = new Lightbox();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
	module.exports = Lightbox;
}
