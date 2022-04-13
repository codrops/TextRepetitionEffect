import { getHeight } from '../utils';
import { gsap } from 'gsap';

/**
 * Class representing an element with multiple text child elements that translate up/down when scrolling
 */
export class RepeatTextScrollFx {
    // DOM elements
	DOM = {
		// main element ([data-text-rep])
		el: null,
        // all text spans except the last one (this will be the centered one and doesn't translate
        words: null,
	}
	totalWords = 8;
    tyIncrement = 16;
	txIncrement = 2;
	opacityIncrement = 0.15;
	delayIncrement = 0.01;
    scrollTimeline;
    observer;

    /**
	 * Constructor.
	 * @param {NodeList} Dom_el - main element ([data-text-rep])
	 */
	constructor(Dom_el) {
		this.DOM.el = Dom_el;
        this.layout();
        this.setBoundaries();
        this.createScrollTimeline();
        this.createObserver();

        window.addEventListener('resize', () => this.setBoundaries());
	}
    /**
     * Creates the text spans inside the main element
     */
    layout() {
        const halfWordsCount = Math.floor(this.totalWords/2);
        let innerHTML = '';
	    
        for (let i = 0; i < this.totalWords; ++i) {
            const tx = i === this.totalWords-1 ? 0 : -1* (this.totalWords-i)*this.txIncrement;
			const ty = i === this.totalWords-1 ? 0 : -1* (this.totalWords-i)*this.tyIncrement;
			const opacity = i === this.totalWords-1 ? 1 : Math.min(i*this.opacityIncrement,1);
			const delay = i === this.totalWords-1 ? 0 :  (this.totalWords-i)*this.delayIncrement;
			
			innerHTML += `<span data-delay="${delay}" data-opacity="${opacity}" data-ty="${ty}" data-tx="${tx}">${this.DOM.el.innerHTML}</span>`;
		}
		
		this.DOM.el.innerHTML = innerHTML;
		this.DOM.el.classList.add('text-rep');

        this.DOM.words = [...this.DOM.el.querySelectorAll('span')].slice(0, -1);
    }
    /**
     * sets the padding bottom and margin top given the amount that the words will translate up/down
     */
    setBoundaries() {
        // Set up the margin top and padding bottom values
        const paddingBottomMarginTop = getHeight(this.DOM.el) * Math.floor(this.totalWords) * this.tyIncrement/100;
		gsap.set(this.DOM.el, {
			//marginTop: paddingBottomMarginTop,
			paddingBottom: paddingBottomMarginTop
		});
    }
    /**
     * gsap animation timeline
	 * translates the text spans when the element enters the viewport
     */
    createScrollTimeline() {
        this.scrollTimeline = gsap.timeline({paused: true})
		
        .to(this.DOM.words, {
			duration: 1,
			ease: 'none',
			yPercent: (_,target) => -1*target.dataset.ty,
			xPercent: (_,target) => -1*target.dataset.tx,	
			startAt: {opacity: 0},
			opacity: (_,target) => target.dataset.opacity,
			delay: (_,target) => target.dataset.delay
		})
    }
    /**
     * Intersection Observer 
	 * Updates the timeline progress when the element is in the viewport
     */
    createObserver() {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px',
            threshold: 0
        };
        
		// credits: from https://medium.com/elegant-seagulls/parallax-and-scroll-triggered-animations-with-the-intersection-observer-api-and-gsap3-53b58c80b2fa
		this.observer = new IntersectionObserver(entry => {
			if (entry[0].intersectionRatio > 0) {
				
				if ( !this.isLoaded ) {
					this.isLoaded = true;
				}
				gsap.ticker.add(this.progressTween);

			} 
			else {

				if ( this.isLoaded ) {
					gsap.ticker.remove(this.progressTween);
				}
				else {
					this.isLoaded = true;
					// add and remove immediately
					gsap.ticker.add(this.progressTween, true);
				}
				
			}
		}, observerOptions);

        this.progressTween = () => {
			// Get scroll distance to bottom of viewport.
			const scrollPosition = (window.scrollY + window.innerHeight);
			// Get element's position relative to bottom of viewport.
			const elPosition = (scrollPosition - this.DOM.el.offsetTop);
			// Set desired duration.
			const durationDistance = (window.innerHeight + this.DOM.el.offsetHeight);
			// Calculate tween progresss.
			const currentProgress = (elPosition / durationDistance);
			// Set progress of gsap timeline.
			this.scrollTimeline.progress(currentProgress);
		}
		
		this.observer.observe(this.DOM.el);
    }
}