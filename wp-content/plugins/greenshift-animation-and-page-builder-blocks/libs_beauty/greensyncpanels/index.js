class GreenLightSyncPanels {
	constructor() {
		this.initSyncPanels();
	}

	initSyncPanels() {
		document.addEventListener('click', this.handleClick.bind(this));
		// Update: Use querySelectorAll to select all .gs_click_sync elements
		const triggers = document.querySelectorAll('.gs_click_sync');
		triggers.forEach(trigger => {
			trigger.addEventListener('keydown', this.handleKeyDown.bind(this));
		});

		// Add mouse enter event for gs_hover_sync
		const hoverTriggers = document.querySelectorAll('.gs_hover_sync');
		hoverTriggers.forEach(trigger => {
			trigger.addEventListener('mouseenter', this.handleHover.bind(this));
		});

		const contents = document.querySelectorAll('.gs_content');
		contents.forEach(content => {
			if(content.closest('.gs_item.active')){
				content.style.maxHeight = content.scrollHeight + 'px';
			}
			if(content.classList.contains('active')){
				content.style.maxHeight = content.scrollHeight + 'px';
			}
		});
		// Function to initialize tabs
		const initializeTabs = () => {
			const tabLists = document.querySelectorAll('.gs_tabs_list');
			tabLists.forEach(tabList => {
				const tabs = tabList.querySelectorAll('.gs_tab');
				const activeTab = tabList.querySelector('.gs_tab.active');

				if (!activeTab && tabs.length > 0) {
					// If no active tab, set the first one as active
					tabs[0].classList.add('active');

					// Find the closest gs_root
					const gsRoot = tabList.closest('.gs_root');
					if (gsRoot) {
						const contents = gsRoot.querySelectorAll('.gs_content');
						if (contents.length > 0) {
							// Set the first content as active
							contents[0].classList.add('active');
							contents[0].style.maxHeight = contents[0].scrollHeight + 'px';
						}
					}
				}
			});
		};

		// Call the function to initialize tabs
		initializeTabs();
	}

	handleClick(event) {
		let target = event.target;
		if (target.classList.contains('gs_click_sync') || target.closest('.gs_click_sync')) {
			this.toggleSyncPanels(target);
		}
	}

	handleKeyDown(event) {
		// Update: Remove the closest() call since we're already on the trigger
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			this.toggleSyncPanels(event.target);
		}
	}

	toggleSyncPanels(trigger) {
		const item = trigger.closest('.gs_item');

		if (item) {
			// Scenario 1: .gs_item found
			const content = item.querySelector('.gs_content');
			const isExpanded = !item.classList.contains('active');
			const parentClose = item.closest('.gs_collapsible');

			// Toggle active class and aria-expanded attribute
			item.classList.toggle('active');
			trigger.classList.toggle('active');
			trigger.setAttribute('aria-expanded', isExpanded);

			if (isExpanded) {
				// Expanding
				item.setAttribute('data-active', true);
				const height = content.scrollHeight;
				content.style.maxHeight = `${height}px`;
				content.setAttribute('aria-hidden', 'false');
				if(parentClose){
					const closeItems = parentClose.querySelectorAll('.gs_item');
					closeItems.forEach(item => {
						if(item !== trigger.closest('.gs_item')){
							item.classList.remove('active');
							item.removeAttribute('data-active');
							item.querySelector('.gs_content').style.maxHeight = '0px';
							item.querySelector('.gs_content').setAttribute('aria-hidden', 'true');
							let triggers = item.querySelectorAll('.gs_click_sync');
							triggers.forEach(trigger => {
								trigger.classList.remove('active');
								trigger.setAttribute('aria-expanded', 'false');
							});
						}
					});
				}
			} else {
				// Collapsing
				item.removeAttribute('data-active');
				content.style.maxHeight = '0px';
				content.setAttribute('aria-hidden', 'true');
			}

		} else {
			if (!trigger.classList.contains('gs_tab')) {
				trigger = trigger.closest('.gs_tab');
			}
			// Scenario 2: .gs_item not found
			const parentBlock = trigger.closest('.gs_root');
			if (!parentBlock) return;

			const triggers = Array.from(parentBlock.querySelector('.gs_tabs_list').children).filter(child => child.classList.contains('gs_tab'));
			const index = triggers.indexOf(trigger);

			// Update aria-selected for triggers
			triggers.forEach((t, i) => {
				if (i === index) {
					t.setAttribute('aria-selected', 'true');
					t.classList.add('active');
				} else {
					t.setAttribute('aria-selected', 'false');
					t.classList.remove('active');
				}
			});

			const contents = Array.from(parentBlock.querySelector('.gs_content_area').children).filter(child => child.classList.contains('gs_content'));
            console.log(contents);
			contents.forEach((content, i) => {
				if (i === index) {
					content.classList.add('active');
					content.setAttribute('aria-hidden', 'false');
					content.style.maxHeight = content.scrollHeight + 'px';
				} else {
					content.classList.remove('active');
					content.setAttribute('aria-hidden', 'true');
					content.style.maxHeight = '0px';
				}
			});

		}
	}

	handleHover(event) {
		this.toggleSyncPanels(event.target);
	}
}

// Initialize SyncPanels on page load
document.addEventListener('DOMContentLoaded', () => {
	window.greenlight_SyncPanels = new GreenLightSyncPanels();
});
