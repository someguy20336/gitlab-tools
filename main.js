
// Logs a debug message
let debug = false;
let logDebug = (msg) => {	
	if (debug) {
		console.log(msg);
	}
};

let hideResolvedMain = () => {

	// Find the notes list
	let el = document.getElementById("notes-list");

	let toggleState = () => {
		findResolved(el);
		el.classList.toggle("hide-resolved");
	};
	
	// Refresh the resolved notes
	let findResolved = (updateClasses) => {
		let notes = el.querySelectorAll(".note-discussion");
		
		logDebug(`Found ${notes.length} note-discussion elements`);
		
		let cnt = 0;
		updateClasses = updateClasses ?? true;
		for (let oneNote of notes) {
			let headline = oneNote.querySelector(".js-discussion-headline");
			let isResolved = false;

			// Actually seems like the presence of this is good, but lets just check text
			// just in case
			if (headline !== null) {
				if (headline.textContent.trim().startsWith("Resolved")) {
					cnt++;
					isResolved = true;
				}
			}
			
			if (updateClasses) {
				oneNote.classList.toggle("hf-resolved", isResolved);
			}
		}
		
		updateResolvedCnt(cnt);
		logDebug(`Found ${cnt} resolved discussions`);
	};	

	let failureCount = 0;
	let updateResolvedCnt = (cnt) => {

		logDebug("Adding resolved count button");
		if (lblToggleResolve.parentElement !== null) {
			// Find the element to inject the "Show X Resolved" next to
			// This is the element as of GitLab 15.
			let resolveCntContainer = document.querySelector(".discussions-counter");

			if (resolveCntContainer !== null) {
				resolveCntContainer.prepend(toggleContainer);
				logDebug("Found container and appended button");
				failureCount = 0;
			} else {				
				logDebug("Failed to find container for show resolved toggle");
				failureCount++;

				if (failureCount < 10) {
					logDebug("Trying again in 1 second");
					setTimeout(() => {
						updateResolvedCnt(cnt);
					}, 1000);
				} else {					
					logDebug("Failed too many times");
				}
			
			}
		}

		lblToggleResolve.innerText = `Show ${cnt} resolved`;	
	};

	if (el === null) {		
		logDebug("Failed to find notes-list");
		return;
	}
	
	// Checkbox
	let chkToggleResolve = document.createElement("input");
	chkToggleResolve.type = "checkbox";
	chkToggleResolve.id = "show-resolved-threads";
	chkToggleResolve.addEventListener("change", toggleState);

	// Label
	let lblToggleResolve = document.createElement("label");
	lblToggleResolve.innerText = `Show 0 resolved`;
	lblToggleResolve.setAttribute("for", "show-resolved-threads");

	// ToggleContainer
	let toggleContainer = document.createElement("div");
	toggleContainer.classList.add("line-resolve-all", "gl-display-flex", "gl-align-items-center", "gl-pl-4", "gl-rounded-base", "gl-mr-3", "gl-bg-gray-50", "gl-pr-4");
	toggleContainer.appendChild(chkToggleResolve);
	toggleContainer.appendChild(lblToggleResolve);
	
	logDebug("Found notes-list");

	if (location.hash.includes("note_")) {
		chkToggleResolve.checked = true;
		findResolved(true);
	} else {
		toggleState();  // starts in "hidden" state
	}

	// Options for the observer (which mutations to observe)
	const config = { childList: true };

	// Callback function to execute when mutations are observed
	const callback = function(mutationsList, observer) {		
		findResolved();
	};

	// Create an observer instance linked to the callback function
	const observer = new MutationObserver(callback);

	// Start observing the target node for configured mutations
	observer.observe(el, config);

	// Look for button clicks for resolve/unresolve
	el.addEventListener("click", (ev) => {
		var btn = ev.target.closest("button");

		if (btn !== null) {
			// Hack to account for the network delay
			setTimeout(() => {				
				var val = btn.dataset.qaSelector;
				if (val === "resolve_discussion_button") {
					findResolved(false);
				}
			}, 3000);
		}
		
	});
};

hideResolvedMain();
