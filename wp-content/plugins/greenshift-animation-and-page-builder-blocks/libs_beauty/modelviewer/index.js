"use strict";
var loadedtdel = false;

const onGSModelInteraction = () => {
	if (loadedtdel === true) {
		return;
	}
	loadedtdel = true;

	if (document.getElementById('gsmodelviewerscript') !== null) {
		return;
	}

	const modelViewerScript = document.createElement("script");
	modelViewerScript.type = "module";
	modelViewerScript.id = 'gsmodelviewerscript';
	modelViewerScript.src = gs_model_params.pluginURL + "libs/modelviewer/model-viewer.min.js";
	document.body.appendChild(modelViewerScript);

};

const onGSModelProgress = (event) => {
	const progressBar = event.target.querySelector(".progress-bar");
	const updatingBar = event.target.querySelector(".update-bar");
	updatingBar.style.width = `${event.detail.totalProgress * 100}%`;
	if (event.detail.totalProgress == 1) {
		progressBar.classList.add("hide");
	}
};

document.body.addEventListener("mouseover", onGSModelInteraction, { once: true });
document.body.addEventListener("touchmove", onGSModelInteraction, { once: true });
window.addEventListener("scroll", onGSModelInteraction, { once: true });
document.body.addEventListener("keydown", onGSModelInteraction, { once: true });
var requestIdleCallback = window.requestIdleCallback || function (cb) {
	const start = Date.now();
	return setTimeout(function () {
		cb({
			didTimeout: false,
			timeRemaining: function () {
				return Math.max(0, 50 - (Date.now() - start));
			},
		});
	}, 1);
};

var gsmodel = document.getElementsByClassName('gspb_modelBox');
for (let i = 0; i < gsmodel.length; i++) {
	let modelNode = gsmodel[i];
	(() => {
		const modelViewer = modelNode.querySelector(".gsmodelviewer");
		modelViewer.addEventListener("progress", onGSModelProgress);
		const time = performance.now();
		let td_rx = modelViewer.getAttribute("data-rx");
		let td_ry = modelViewer.getAttribute("data-ry");
		let td_rz = modelViewer.getAttribute("data-rz");
		let td_scale = modelViewer.getAttribute("data-scale");
		let td_camera = modelViewer.getAttribute("data-camera");
		let td_variants = modelViewer.getAttribute("data-variants");
		let td_mousemove = modelViewer.getAttribute("data-mousemove");
		let td_loaditer = modelViewer.getAttribute("data-loaditer");
		if(td_scale){
			td_scale = parseFloat(td_scale);
		}
		if (td_loaditer) {
		} else {
			requestIdleCallback(function () {
				onGSModelInteraction();
			}, {
				timeout: 2500
			});
		}
		let mouseX = 0;
		let mouseY = 0;
		let windowHalfX = window.innerWidth / 2;
		let windowHalfY = window.innerHeight / 2;
		document.addEventListener("mousemove", function (event) {

			mouseX = (event.clientX - windowHalfX);
			mouseY = (event.clientY - windowHalfY);

		});
		if (td_scale) {
			modelViewer.scale = `${td_scale} ${td_scale} ${td_scale}`;
		}
		if (td_variants) {
			const select = modelNode.querySelector(".gsvariantselect");
			modelViewer.addEventListener("load", () => {
				const names = modelViewer.availableVariants;
				if (typeof names !== "undefined" && names.length > 0) {
					select.classList.remove("rhhidden");
					for (const name of names) {
						const option = document.createElement("option");
						option.value = name;
						option.textContent = name;
						select.appendChild(option);
					}
				}
			});
			select.addEventListener("input", (event) => {
				modelViewer.variantName = event.target.value;
			});
		}
		if (td_rx || td_ry || td_rz || td_mousemove) {
			const animate = (now) => {
				requestAnimationFrame(animate);
				if (typeof modelViewer.orientation !== "undefined") {
					let spaceorient = modelViewer.orientation.split(" ");
					if (typeof td_rx === "undefined") td_rx = 0;
					if (typeof td_ry === "undefined") td_ry = 0;
					if (typeof td_rz === "undefined") td_rz = 0;
					let rx = parseFloat(spaceorient[0]) + td_rx / 50;
					let ry = parseFloat(spaceorient[1]) + td_ry / 50;
					let rz = parseFloat(spaceorient[2]) + td_rz / 50;
					if (td_mousemove) {
						rz += 0.05 * (mouseX * td_mousemove / 1000 - rz);
						ry += 0.05 * (mouseY * td_mousemove / 1000 - ry);
					}
					modelViewer.orientation = `${rx}deg ${ry}deg ${rz}deg`;
					if (!td_camera) {
						modelViewer.updateFraming();
					}

				}
			};
			animate();
		}
	})();
}