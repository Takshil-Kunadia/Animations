/**
 * Enlightenment - Card Animation Interface
 * Main JavaScript functionality for entrance screen and animations
 */

// DOM Elements
const entranceScreen = document.getElementById('entrance-screen');
const mainContent = document.getElementById('main-content');
const bgVideo = document.getElementById('bg-video');
const animationTitle = document.getElementById('animation-title');
const enterButton = document.getElementById('enter-button');

// Animation Configuration
const ANIMATION_CONFIG = {
	entranceExitDuration: 1000,
	videoStartDelay: 500,
	fadeInDuration: 1500
};

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
	initializeApp();
});

/**
 * Initialize application functionality
 */
function initializeApp() {
	setupEventListeners();
	preloadVideo();
}

/**
 * Setup event listeners for user interactions
 */
function setupEventListeners() {
	enterButton.addEventListener('click', handleEnterClick);
	
	// Add ripple effect on button click
	enterButton.addEventListener('click', createRippleEffect);
	
	// Handle video loading events
	bgVideo.addEventListener('loadedmetadata', onVideoLoaded);
	bgVideo.addEventListener('error', onVideoError);
}

/**
 * Handle the enter button click event
 */
function handleEnterClick() {
	startEntranceAnimation();
}

/**
 * Create ripple effect on button click
 * @param {Event} event - Click event
 */
function createRippleEffect(event) {
	const button = event.currentTarget;
	const ripple = button.querySelector('.button-ripple');
	
	// Reset ripple animation
	ripple.style.animation = 'none';
	ripple.offsetHeight; // Trigger reflow
	ripple.style.animation = null;
}

/**
 * Start the entrance animation sequence
 */
function startEntranceAnimation() {
	// Disable button to prevent multiple clicks
	enterButton.disabled = true;
	
	// Add exit animation to entrance screen
	entranceScreen.classList.add('exit-animation');
	
	// After animation completes, switch to main content
	setTimeout(() => {
		hideEntranceScreen();
		showMainContent();
	}, ANIMATION_CONFIG.entranceExitDuration);
}

/**
 * Hide the entrance screen
 */
function hideEntranceScreen() {
	entranceScreen.style.display = 'none';
}

/**
 * Show and animate the main content
 */
function showMainContent() {
	// Show and animate the title
	animationTitle.classList.add('show');
	
	// Show and animate the video
	bgVideo.classList.add('show');
	
	// Show main content with animation
	mainContent.classList.remove('hidden');
	mainContent.classList.add('enter-animation');
	
	// Start video with audio after a brief delay
	setTimeout(() => {
		startVideoPlayback();
	}, ANIMATION_CONFIG.videoStartDelay);
}

/**
 * Start video playback with audio handling
 */
async function startVideoPlayback() {
	try {
		// Try to play with audio first
		bgVideo.muted = false;
		await bgVideo.play();
		console.log('Video playing with audio');
	} catch (error) {
		console.warn('Audio autoplay blocked, falling back to muted playback:', error);
		// Fallback: if unmuted autoplay fails, play muted
		bgVideo.muted = true;
		try {
			await bgVideo.play();
			console.log('Video playing muted');
		} catch (mutedError) {
			console.error('Video playback failed:', mutedError);
		}
	}
}

/**
 * Preload video for smoother playback
 */
function preloadVideo() {
	bgVideo.preload = 'metadata';
}

/**
 * Handle video loaded event
 */
function onVideoLoaded() {
	console.log('Video metadata loaded successfully');
}

/**
 * Handle video error event
 * @param {Event} event - Error event
 */
function onVideoError(event) {
	console.error('Video loading error:', event);
}

/**
 * Utility function to add class with animation callback
 * @param {HTMLElement} element - Target element
 * @param {string} className - Class to add
 * @param {Function} callback - Callback function after animation
 * @param {number} delay - Delay before callback
 */
function addClassWithCallback(element, className, callback, delay = 0) {
	element.classList.add(className);
	if (callback) {
		setTimeout(callback, delay);
	}
}

/**
 * Check if user prefers reduced motion
 * @returns {boolean} - True if user prefers reduced motion
 */
function prefersReducedMotion() {
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Handle responsive design changes
 */
function handleResponsiveChanges() {
	const mediaQuery = window.matchMedia('(max-width: 768px)');
	
	function handleMediaQueryChange(e) {
		if (e.matches) {
			// Mobile styles
			console.log('Switched to mobile view');
		} else {
			// Desktop styles
			console.log('Switched to desktop view');
		}
	}
	
	mediaQuery.addListener(handleMediaQueryChange);
	handleMediaQueryChange(mediaQuery);
}

// Initialize responsive handling
handleResponsiveChanges();
