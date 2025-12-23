// content-script.js - Injected into every page to track interactions and inject UI
// Handles annotation, interaction tracking, and sidebar injection

(function () {
	"use strict";

	// ============================================================================
	// STATE MANAGEMENT
	// ============================================================================

	const state = {
		tabId: null,
		taskId: null,
		annotationMode: null,
		notesSidebarOpen: false,
		salienceStripOpen: true,
		selection: null,
		annotations: [],
		scrollData: {
			lastScrollTop: 0,
			maxScrollDepth: 0,
		},
		interactionCounts: {
			clicks: 0,
			copies: 0,
			keystrokes: 0,
		},
	};

	// ============================================================================
	// INITIALIZATION
	// ============================================================================

	async function init() {
		console.log("Research Assistant content script loaded");

		// Get current tab info
		const response = await chrome.runtime.sendMessage({
			action: "get_current_task",
		});
		state.tabId = response?.tabId;
		state.taskId = response?.task?.id;

		// TODO: have a better way to filter out non-content pages or even have an excludes list
		// if (
		// 	!(
		// 		// If the current page url is youtube, email or pdf viewer, skip injection
		// 		(
		// 			window.location.href.includes("youtube.com") ||
		// 			window.location.href.includes("mail.google.com") ||
		// 			window.location.href.endsWith(".pdf")
		// 		)
		// 	)
		// )

		// Inject UI elements
		await injectSalienceStrip();

		await injectLeftPanel();

		await loadAnnotations();

		// Setup event listeners
		setupEventListeners();

		// Start tracking
		startInteractionTracking();
	}

	// ============================================================================
	// UI INJECTION
	// ============================================================================

	async function injectSalienceStrip() {
		if (document.getElementById("ra-salience-strip")) return;

		const strip = document.createElement("div");
		strip.id = "ra-salience-strip";
		strip.className = "ra-salience-strip";
		strip.innerHTML = `
      <div class="ra-strip-content">
        <div class="ra-strip-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span id="ra-time-spent">0m 0s</span>
        </div>
        <div class="ra-strip-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
          <span id="ra-origin" class="ra-origin-text">Direct</span>
        </div>
        <div class="ra-strip-item">
          <span class="ra-visits-badge" id="ra-visits">0</span>
          <span class="ra-label">visits</span>
        </div>
        <div class="ra-strip-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 20V10"></path>
            <path d="M12 20V4"></path>
            <path d="M6 20v-6"></path>
          </svg>
          <div class="ra-productivity-bar">
            <div class="ra-productivity-fill" id="ra-productivity" style="width: 0%"></div>
          </div>
        </div>
        <button class="ra-strip-close" id="ra-close-strip">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `;

		document.body.appendChild(strip);

		// --- Floating toggle button (top center) ---
		const toggleBtn = document.createElement("div");
		toggleBtn.id = "ra-salience-toggle";
		toggleBtn.textContent = "▼";
		toggleBtn.style.position = "fixed";
		toggleBtn.style.top = "0";
		toggleBtn.style.left = "50%";
		toggleBtn.style.transform = "translate(-50%, 0)";
		toggleBtn.style.width = "26px";
		toggleBtn.style.height = "22px";
		toggleBtn.style.borderRadius = "0 0 6px 6px";
		toggleBtn.style.background =
			"linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
		toggleBtn.style.color = "white";
		toggleBtn.style.fontSize = "14px";
		toggleBtn.style.display = "flex";
		toggleBtn.style.alignItems = "center";
		toggleBtn.style.justifyContent = "center";
		toggleBtn.style.cursor = "pointer";
		toggleBtn.style.zIndex = "1000000";
		toggleBtn.style.transition = "opacity 0.3s ease";
		toggleBtn.style.opacity = "0"; // hidden until strip hides
		document.body.appendChild(toggleBtn);

		// Setup close button
		const closeBtn = document.getElementById("ra-close-strip");
		closeBtn.addEventListener("click", hideStrip);

		toggleBtn.addEventListener("click", showStrip);

		function hideStrip() {
			strip.style.transform = "translate(-50%, -100%)"; // slide up & out of view
			toggleBtn.style.opacity = "1"; // show toggle button
			state.salienceStripOpen = false;
		}

		function showStrip() {
			strip.style.transform = "translate(-50%, 0)"; // slide back into view
			toggleBtn.style.opacity = "0"; // hide toggle button again
			state.salienceStripOpen = true;

			// Auto-hide again after a few seconds if desired
			setTimeout(() => {
				if (state.salienceStripOpen) hideStrip();
			}, 3000);
		}
		// Update strip periodically
		updateSalienceStrip();
		setInterval(updateSalienceStrip, 1000);

		// Auto-show briefly, then hide after 1.5 seconds
		setTimeout(() => hideStrip(), 1500);
	}

	async function updateSalienceStrip() {
		const metrics = await getTabMetrics();

		// Update time spent
		const timeEl = document.getElementById("ra-time-spent");
		if (timeEl) {
			const mins = Math.floor(metrics.timeSpent / 60);
			const secs = metrics.timeSpent % 60;
			timeEl.textContent = `${mins}m ${secs}s`;
		}

		// Update origin
		const originEl = document.getElementById("ra-origin");
		if (originEl) {
			originEl.textContent = metrics.origin || "Direct";
		}

		// Update visits
		const visitsEl = document.getElementById("ra-visits");
		if (visitsEl) {
			visitsEl.textContent = metrics.visits || 0;
		}

		// Update productivity
		const prodEl = document.getElementById("ra-productivity");
		if (prodEl) {
			const productivity = Math.round(metrics.productivity * 100);
			prodEl.style.width = `${productivity}%`;
		}
	}

	async function injectNotesSidebar() {
		if (document.getElementById("ra-notes-sidebar")) return;

		const sidebar = document.createElement("div");
		sidebar.id = "ra-notes-sidebar";
		sidebar.className = "ra-notes-sidebar";
		sidebar.innerHTML = `
      <div class="ra-sidebar-header">
        <h3>Notes & Annotations</h3>
        <button class="ra-sidebar-close" id="ra-close-sidebar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="ra-annotation-tools">
        <button class="ra-tool-btn" data-mode="highlight" title="Highlight">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          </svg>
        </button>
        <button class="ra-tool-btn" data-mode="underline" title="Underline">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path>
            <line x1="4" y1="21" x2="20" y2="21"></line>
          </svg>
        </button>
        <button class="ra-tool-btn" data-mode="note" title="Add Note">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="12" y1="18" x2="12" y2="12"></line>
            <line x1="9" y1="15" x2="15" y2="15"></line>
          </svg>
        </button>
        <button class="ra-tool-btn" data-mode="clip" title="Save Clip">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
        </button>
      </div>
      <div class="ra-notes-list" id="ra-notes-list">
        <!-- Notes will be dynamically added here -->
      </div>
      <button class="ra-new-note-btn" id="ra-new-note">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        New Note
      </button>
    `;

		document.body.appendChild(sidebar);

		// Setup event listeners
		setupSidebarListeners();
		await loadNotes();
	}

	function setupSidebarListeners() {
		// Close button
		document
			.getElementById("ra-close-sidebar")
			?.addEventListener("click", () => {
				toggleNotesSidebar();
			});

		// Annotation tool buttons
		document.querySelectorAll(".ra-tool-btn").forEach((btn) => {
			btn.addEventListener("click", () => {
				const mode = btn.dataset.mode;
				setAnnotationMode(mode);

				// Update active state
				document
					.querySelectorAll(".ra-tool-btn")
					.forEach((b) => b.classList.remove("active"));
				btn.classList.add("active");
			});
		});

		// New note button
		document
			.getElementById("ra-new-note")
			?.addEventListener("click", () => {
				openNotePopup();
			});
	}

	// ============================================================================
	// ANNOTATION SYSTEM
	// ============================================================================

	function setAnnotationMode(mode) {
		state.annotationMode = mode;
		document.body.classList.add("ra-annotation-mode");
		document.body.style.cursor = "crosshair";
	}

	function clearAnnotationMode() {
		state.annotationMode = null;
		document.body.classList.remove("ra-annotation-mode");
		document.body.style.cursor = "default";
	}

	async function handleTextSelection() {
		const selection = window.getSelection();
		if (!selection || selection.isCollapsed) return;

		state.selection = {
			text: selection.toString(),
			range: selection.getRangeAt(0),
			xpath: getXPath(selection.anchorNode),
		};

		// Show annotation menu
		showAnnotationMenu(selection);
	}

	async function injectLeftPanel() {
		if (document.getElementById("ra-left-panel")) return;

		// --- Main iframe ---
		const iframe = document.createElement("iframe");
		iframe.id = "ra-left-panel";
		iframe.src = chrome.runtime.getURL("content/left-panel.html");
		iframe.style.position = "fixed";
		iframe.style.top = "0";
		iframe.style.left = "0";
		iframe.style.width = "300px";
		iframe.style.height = "100vh";
		iframe.style.border = "none";
		iframe.style.zIndex = "2147483646";
		iframe.style.transition = "transform 0.3s ease";
		iframe.style.transform = "translateX(0)";
		document.body.appendChild(iframe);

		// --- Utility handle button ---
		const toggleBtn = document.createElement("div");
		toggleBtn.id = "ra-panel-toggle";
		toggleBtn.innerHTML = "›"; // arrow shape
		toggleBtn.style.position = "fixed";
		toggleBtn.style.left = "300px";
		toggleBtn.style.top = "50%";
		toggleBtn.style.transform = "translateY(-50%)";
		toggleBtn.style.width = "18px";
		toggleBtn.style.height = "50px";
		toggleBtn.style.background = "#3B82F6";
		toggleBtn.style.color = "white";
		toggleBtn.style.fontSize = "16px";
		toggleBtn.style.display = "flex";
		toggleBtn.style.alignItems = "center";
		toggleBtn.style.justifyContent = "center";
		toggleBtn.style.borderTopRightRadius = "6px";
		toggleBtn.style.borderBottomRightRadius = "6px";
		toggleBtn.style.cursor = "pointer";
		toggleBtn.style.zIndex = "2147483647";
		toggleBtn.style.transition = "left 0.3s ease";
		document.body.appendChild(toggleBtn);

		let panelVisible = true;

		toggleBtn.addEventListener("click", () => {
			panelVisible = !panelVisible;
			if (panelVisible) {
				iframe.style.transform = "translateX(0)";
				toggleBtn.style.left = "300px";
				toggleBtn.innerHTML = "›";
			} else {
				iframe.style.transform = "translateX(-100%)";
				toggleBtn.style.left = "0";
				toggleBtn.innerHTML = "‹";
			}
		});

		window.addEventListener("message", (event) => {
			if (event.data?.type === "HIDE_LEFT_PANEL") {
				document.getElementById("ra-panel-toggle").click();
			}
		});
	}

	// ============================================================================
	// NOTE POPUP HANDLING
	// ============================================================================

	async function openNotePopup(preFilledText = "") {
		// Remove existing popup if one is open
		document.getElementById("ra-note-popup")?.remove();

		// Create iframe container
		const iframe = document.createElement("iframe");
		iframe.id = "ra-note-popup";
		iframe.src = chrome.runtime.getURL("content/notes-popup.html");
		iframe.style.position = "fixed";
		iframe.style.top = "50%";
		iframe.style.left = "50%";
		iframe.style.transform = "translate(-50%, -50%)";
		iframe.style.width = "420px";
		iframe.style.height = "340px";
		iframe.style.border = "none";
		iframe.style.zIndex = "999999";
		iframe.style.boxShadow = "0 4px 20px rgba(0,0,0,0.25)";
		iframe.style.borderRadius = "8px";
		iframe.style.background = "white";

		document.body.appendChild(iframe);

		// Wait for iframe to load before injecting content
		iframe.onload = () => {
			iframe.contentWindow.postMessage(
				{
					type: "INIT_NOTE_POPUP",
					selectedText: preFilledText,
					pageTitle: document.title,
					pageUrl: window.location.href,
				},
				"*"
			);
		};

		// Listen for popup messages (save/cancel)
		window.addEventListener("message", async (event) => {
			const msg = event.data;
			if (!msg || typeof msg !== "object") return;

			if (msg.type === "SAVE_NOTE") {
				await handleSaveNote(msg.note);
				iframe.remove();
			} else if (msg.type === "CLOSE_NOTE_POPUP") {
				iframe.remove();
			}
		});
	}

	async function handleSaveNote(noteData) {
		try {
			const note = {
				id: generateUUID(),
				type: "note",
				title: noteData.title || "Untitled Note",
				content: noteData.content || "",
				pageUrl: noteData.pageUrl,
				pageTitle: noteData.pageTitle,
				taskId: state.taskId,
				createdAt: Date.now(),
			};

			await chrome.runtime.sendMessage({
				action: "create_note",
				data: note,
			});

			showNotification("Note saved!");
			await loadNotes(); // refresh sidebar
		} catch (err) {
			console.error("Error saving note:", err);
			showNotification("Failed to save note");
		}
	}

	async function loadNotes() {
		try {
			// Ask background for all notes linked to this page
			const response = await chrome.runtime.sendMessage({
				action: "get_notes_for_page",
				data: { url: window.location.href },
			});

			const notes = response?.notes || [];
			console.log("Loaded notes:", notes);

			const notesList = document.getElementById("ra-notes-list");
			if (!notesList) return;

			notesList.innerHTML = "";

			if (notes.length === 0) {
				notesList.innerHTML = `<p class="ra-empty">No notes for this page.</p>`;
				return;
			}

			for (const note of notes) {
				const item = document.createElement("div");
				item.className = "ra-note-item";

				item.innerHTML = `
				<div class="ra-note-tags-label">
					<strong>${note.title || "Untitled Note"}</strong>
					<span class="ra-note-date">${new Date(note.createdAt).toLocaleString()}</span>
				</div>
				<div class="ra-note-label">${note.content || note.excerpt || ""}</div>
			`;

				notesList.appendChild(item);
			}
		} catch (err) {
			console.error("Error loading notes:", err);
		}
	}

	function showAnnotationMenu(selection) {
		// Remove existing menu
		const existingMenu = document.getElementById("ra-annotation-menu");
		if (existingMenu) existingMenu.remove();

		const range = selection.getRangeAt(0);
		const rect = range.getBoundingClientRect();

		const menu = document.createElement("div");
		menu.id = "ra-annotation-menu";
		menu.className = "ra-annotation-menu";
		menu.style.left = `${rect.left + rect.width / 2}px`;
		menu.style.top = `${rect.bottom + window.scrollY + 5}px`;
		menu.innerHTML = `
      <button data-action="highlight" title="Highlight">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        </svg>
      </button>
      <button data-action="note" title="Add Note">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
        </svg>
      </button>
      <button data-action="clip" title="Save Clip">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
        </svg>
      </button>
    `;

		document.body.appendChild(menu);

		// Add event listeners
		menu.querySelectorAll("button").forEach((btn) => {
			btn.addEventListener("click", async (e) => {
				e.stopPropagation();
				const action = btn.dataset.action;
				await handleAnnotationAction(action);
				menu.remove();
			});
		});

		// Remove menu on click outside
		setTimeout(() => {
			document.addEventListener("click", function removeMenu() {
				menu.remove();
				document.removeEventListener("click", removeMenu);
			});
		}, 100);
	}

	async function handleAnnotationAction(action) {
		if (!state.selection) return;

		switch (action) {
			case "highlight":
				await createHighlight("#FFEB3B");
				break;
			case "note":
				await openNotePopup(state.selection.text);
				break;
			case "clip":
				await createClip(state.selection.text);
				break;
		}

		// Clear selection
		window.getSelection().removeAllRanges();
		state.selection = null;
	}

	async function createHighlight(color) {
		if (!state.selection) return;

		const annotation = {
			id: generateUUID(),
			type: "highlight",
			color,
			selectedText: state.selection.text,
			xpath: state.selection.xpath,
			pageUrl: window.location.href,
			pageTitle: document.title,
			range: serializeRange(state.selection.range),
		};

		// Apply highlight visually
		const span = document.createElement("span");
		span.className = "ra-highlight";
		span.style.backgroundColor = color;
		span.dataset.annotationId = annotation.id;

		try {
			state.selection.range.surroundContents(span);
			state.annotations.push(annotation);

			// Save to storage
			await chrome.runtime.sendMessage({
				action: "create_annotation",
				data: annotation,
			});

			// Log event
			await logEvent("annotation_created", {
				annotationId: annotation.id,
				type: "highlight",
			});
		} catch (e) {
			console.error("Error creating highlight:", e);
		}
	}

	async function createClip(text) {
		const clip = {
			type: "clip",
			excerpt: text,
			content: text,
			title: `Clip from ${document.title}`,
			sourceTabId: state.tabId,
			taskId: state.taskId,
			pageUrl: window.location.href,
		};

		await chrome.runtime.sendMessage({
			action: "create_note",
			data: clip,
		});

		showNotification("Clip saved!");
	}

	async function loadAnnotations() {
		const response = await chrome.runtime.sendMessage({
			action: "get_annotations_for_page",
			data: { url: window.location.href },
		});

		if (response?.annotations) {
			state.annotations = response.annotations;
			renderAnnotations();
		}
	}

	function renderAnnotations() {
		// TODO: what about notes and clips
		// Render saved annotations on the page
		state.annotations.forEach((annotation) => {
			if (annotation.type === "highlight") {
				try {
					const range = deserializeRange(annotation.range);
					if (range) {
						const span = document.createElement("span");
						span.className = "ra-highlight";
						span.style.backgroundColor = annotation.color;
						span.dataset.annotationId = annotation.id;
						range.surroundContents(span);
					}
				} catch (e) {
					console.error("Error rendering annotation:", e);
				}
			}
		});
	}

	// ============================================================================
	// INTERACTION TRACKING
	// ============================================================================

	function setupEventListeners() {
		// Text selection
		document.addEventListener("mouseup", handleTextSelection);

		// Scroll tracking
		let scrollTimeout;
		window.addEventListener("scroll", () => {
			clearTimeout(scrollTimeout);
			scrollTimeout = setTimeout(trackScroll, 150);
		});

		// Click tracking
		document.addEventListener("click", trackClick);

		// Copy/paste tracking
		document.addEventListener("copy", trackCopy);
		document.addEventListener("paste", trackPaste);

		// Keyboard tracking
		document.addEventListener("keydown", trackKeyboard);

		// Listen for messages from background
		chrome.runtime.onMessage.addListener(handleBackgroundMessage);
	}

	function startInteractionTracking() {
		// Start dwell time tracking
		logEvent("page_view", {
			url: window.location.href,
			title: document.title,
		});
	}

	async function trackScroll() {
		const scrollTop =
			window.pageYOffset || document.documentElement.scrollTop;
		const scrollHeight = document.documentElement.scrollHeight;
		const clientHeight = document.documentElement.clientHeight;
		const scrollDepth =
			scrollHeight > clientHeight
				? scrollTop / (scrollHeight - clientHeight)
				: 0;

		// Update max scroll depth
		if (scrollDepth > state.scrollData.maxScrollDepth) {
			state.scrollData.maxScrollDepth = scrollDepth;
		}

		state.scrollData.lastScrollTop = scrollTop;

		await logEvent("scroll", {
			scrollTop,
			scrollHeight,
			clientHeight,
			scrollDepth,
		});
	}

	async function trackClick(e) {
		state.interactionCounts.clicks++;

		await logEvent("click", {
			x: e.clientX,
			y: e.clientY,
			target: e.target.tagName,
			classList: Array.from(e.target.classList),
			href: e.target.href,
		});
	}

	async function trackCopy(e) {
		state.interactionCounts.copies++;
		const text = window.getSelection().toString();

		await logEvent("copy", {
			text: text.substring(0, 500),
			textLength: text.length,
		});
	}

	async function trackPaste(e) {
		await logEvent("paste", {
			target: e.target.tagName,
		});
	}

	async function trackKeyboard(e) {
		state.interactionCounts.keystrokes++;

		// Only log special keys to avoid capturing sensitive data
		if (e.ctrlKey || e.metaKey || e.altKey) {
			await logEvent("keyboard", {
				key: e.key,
				ctrlKey: e.ctrlKey,
				shiftKey: e.shiftKey,
				altKey: e.altKey,
			});
		}
	}

	async function logEvent(eventType, data) {
		try {
			await chrome.runtime.sendMessage({
				action: "log_event",
				data: {
					eventType,
					tabId: state.tabId,
					taskId: state.taskId,
					data,
				},
			});
		} catch (e) {
			console.error("Error logging event:", e);
		}
	}

	// ============================================================================
	// MESSAGE HANDLING
	// ============================================================================

	async function handleBackgroundMessage(message) {
		const { action, data } = message;

		switch (action) {
			case "show_salience_strip":
				await injectSalienceStrip();
				break;
			case "toggle_notes_sidebar":
				await toggleNotesSidebar();
				break;
			case "show_task_suggestion":
				showTaskSuggestion(data.suggestion);
				break;
			case "workspace_update":
				handleWorkspaceUpdate(data.update);
				break;
			case "create_highlight":
				state.selection = { text: data.selectedText };
				await createHighlight(data.color);
				break;
		}
	}

	// TODO: the use of shadowdom or sumn

	async function toggleNotesSidebar() {
		const sidebar = document.getElementById("ra-notes-sidebar");

		if (!sidebar) {
			await injectNotesSidebar();
			state.notesSidebarOpen = true;
		} else {
			if (state.notesSidebarOpen) {
				sidebar.style.right = "-320px";
				state.notesSidebarOpen = false;
			} else {
				sidebar.style.right = "0";
				state.notesSidebarOpen = true;
			}
		}
	}

	// ============================================================================
	// HELPER FUNCTIONS
	// ============================================================================

	function generateUUID() {
		return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
			const r = (Math.random() * 16) | 0;
			const v = c === "x" ? r : (r & 0x3) | 0x8;
			return v.toString(16);
		});
	}

	function getXPath(node) {
		if (node.id) {
			return `//*[@id="${node.id}"]`;
		}

		const paths = [];
		for (
			;
			node && node.nodeType === Node.ELEMENT_NODE;
			node = node.parentNode
		) {
			let index = 0;
			for (
				let sibling = node.previousSibling;
				sibling;
				sibling = sibling.previousSibling
			) {
				if (
					sibling.nodeType === Node.ELEMENT_NODE &&
					sibling.nodeName === node.nodeName
				) {
					index++;
				}
			}
			const tagName = node.nodeName.toLowerCase();
			const pathIndex = `[${index + 1}]`;
			paths.unshift(`${tagName}${pathIndex}`);
		}
		return paths.length ? `/${paths.join("/")}` : "";
	}

	function serializeRange(range) {
		return {
			startContainer: getXPath(range.startContainer.parentElement),
			startOffset: range.startOffset,
			endContainer: getXPath(range.endContainer.parentElement),
			endOffset: range.endOffset,
		};
	}

	function deserializeRange(serialized) {
		try {
			const startNode = document.evaluate(
				serialized.startContainer,
				document,
				null,
				XPathResult.FIRST_ORDERED_NODE_TYPE,
				null
			).singleNodeValue;
			const endNode = document.evaluate(
				serialized.endContainer,
				document,
				null,
				XPathResult.FIRST_ORDERED_NODE_TYPE,
				null
			).singleNodeValue;

			if (!startNode || !endNode) return null;

			const range = document.createRange();
			range.setStart(startNode.firstChild, serialized.startOffset);
			range.setEnd(endNode.firstChild, serialized.endOffset);
			return range;
		} catch (e) {
			return null;
		}
	}

	async function getTabMetrics() {
		// Get metrics from background
		const response = await chrome.runtime.sendMessage({
			action: "calculate_salience",
			data: { tabId: state.tabId },
		});

		return {
			timeSpent: response?.timeSpent || 0,
			origin: response?.origin || "Direct",
			visits: response?.visits || 0,
			productivity: response?.productivity || 0,
		};
	}

	function showNotification(message) {
		const notification = document.createElement("div");
		notification.className = "ra-notification";
		notification.textContent = message;
		document.body.appendChild(notification);

		setTimeout(() => {
			notification.classList.add("show");
		}, 100);

		setTimeout(() => {
			notification.classList.remove("show");
			setTimeout(() => notification.remove(), 300);
		}, 3000);
	}

	// ============================================================================
	// INITIALIZATION
	// ============================================================================

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
