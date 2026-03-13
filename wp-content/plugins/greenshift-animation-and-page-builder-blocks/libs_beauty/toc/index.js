"use strict";
let gstoplist = document.getElementsByClassName('gs-scrollto');
for (let i = 0; i < gstoplist.length; i++) {
	let listNode = gstoplist[i];
	listNode.addEventListener('click', function (ev) {
		ev.preventDefault();
		let targetobj = ev.currentTarget;
		let url = targetobj.href;
		let targetid = url.split('#')[1];
		let target = document.getElementById(targetid);
		if (target) {
			let parent = targetobj.closest('.gs-toc');
			let offset = parent.getAttribute('data-offset') || 50;
			const y = target.getBoundingClientRect().top + window.scrollY - offset;
			window.scroll({
				top: y,
				behavior: 'smooth'
			});
		}
	}, false);
}

if (document.querySelector('.gs-toc-mobile') != null) {
	document.querySelector('.gs-toc-mobile').addEventListener('click', function (ev) {
		ev.preventDefault();
		ev.currentTarget.classList.toggle('open');
		document.querySelector(".gs-section-sticky-nav").classList.toggle('open');
	});

	const mainNavLinks = document.querySelectorAll(".gs-section-sticky-nav ul li a");
	let linksections = [];
	mainNavLinks.forEach(link => {
		linksections.push(document.querySelector(link.hash));
		link.addEventListener('click', function (ev) {
			ev.preventDefault();
			let targetobj = ev.currentTarget;
			mainNavLinks.forEach(link => {
				link.classList.remove('current');
			});
			targetobj.classList.add('current');
		}, false);
	});

	let gspblinknavwobserve = new IntersectionObserver(entries => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				let item = entry.target;
				let hashid = item.getAttribute('id');
				mainNavLinks.forEach(link => {
					link.classList.remove('current');
				});
				let link = document.querySelector('.gs-section-sticky-nav ul li a[href="#'+hashid+'"]');
				if(link) link.classList.add('current');
				//gspblinknavwobserve.disconnect();
			}
		});
	}, { threshold: 1.0 });

	for (let itemobserve of linksections) {
		gspblinknavwobserve.observe(itemobserve);
	}
}