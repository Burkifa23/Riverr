// workspace.js - Research workspace main logic with full implementations

// ============================================================================
// SAMPLE DATA FOR DEMO
// ============================================================================

const SAMPLE_DATA = {
	tasks: [
		{
			id: "task-1",
			title: "AI Research Paper",
			color: "#3B82F6",
			createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
			lastActiveAt: Date.now() - 2 * 60 * 60 * 1000,
			subtasks: [
				{
					id: "sub-1",
					title: "Transformer Models",
					tabs: [
						{
							id: "tab-1",
							title: "Attention Is All You Need",
							url: "arxiv.org/paper1",
							favicon: "📄",
							salienceScore: 0.9,
							timeSpent: 1247,
						},
						{
							id: "tab-2",
							title: "BERT: Pre-training",
							url: "arxiv.org/paper2",
							favicon: "📄",
							salienceScore: 0.75,
							timeSpent: 892,
						},
					],
				},
				{
					id: "sub-2",
					title: "Background Reading",
					tabs: [
						{
							id: "tab-3",
							title: "Neural Networks Intro",
							url: "wikipedia.org",
							favicon: "🌐",
							salienceScore: 0.5,
							timeSpent: 456,
						},
					],
				},
			],
			salience: 0.85,
			metadata: { totalTimeSpent: 8340, tabCount: 3, noteCount: 5 },
		},
		{
			id: "task-2",
			title: "Product Design Research",
			color: "#10B981",
			createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
			lastActiveAt: Date.now() - 5 * 60 * 60 * 1000,
			subtasks: [
				{
					id: "sub-3",
					title: "Competitor Analysis",
					tabs: [
						{
							id: "tab-4",
							title: "Figma Design System",
							url: "figma.com",
							favicon: "🎨",
							salienceScore: 0.8,
							timeSpent: 2340,
						},
						{
							id: "tab-5",
							title: "Adobe XD Features",
							url: "adobe.com",
							favicon: "🎨",
							salienceScore: 0.6,
							timeSpent: 1120,
						},
					],
				},
				{
					id: "sub-4",
					title: "User Research",
					tabs: [
						{
							id: "tab-6",
							title: "UX Best Practices",
							url: "nngroup.com",
							favicon: "📊",
							salienceScore: 0.7,
							timeSpent: 1890,
						},
					],
				},
			],
			salience: 0.7,
			metadata: { totalTimeSpent: 5350, tabCount: 3, noteCount: 8 },
		},
		{
			id: "task-3",
			title: "Meeting Preparation",
			color: "#F59E0B",
			createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
			lastActiveAt: Date.now() - 30 * 60 * 1000,
			subtasks: [
				{
					id: "sub-5",
					title: "Agenda Items",
					tabs: [
						{
							id: "tab-7",
							title: "Q4 Strategy Doc",
							url: "docs.google.com",
							favicon: "📝",
							salienceScore: 0.9,
							timeSpent: 780,
						},
					],
				},
			],
			salience: 0.65,
			metadata: { totalTimeSpent: 780, tabCount: 1, noteCount: 3 },
		},
	],
	notes: [
		{
			id: "note-1",
			title: "Key Transformer Insights",
			content: "Self-attention mechanism allows...",
			type: "note",
			taskId: "task-1",
			tags: ["important", "cite"],
			createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
			citations: 3,
		},
		{
			id: "note-2",
			title: "Research Questions",
			content: "How does attention mechanism improve over RNNs?",
			type: "note",
			taskId: "task-1",
			tags: ["todo", "question"],
			createdAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
			citations: 0,
		},
		{
			id: "note-3",
			title: "BERT Training Details",
			content: "Pre-training on large corpus, then fine-tuning...",
			type: "clip",
			taskId: "task-1",
			tags: ["technical"],
			createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
			citations: 2,
		},
		{
			id: "note-4",
			title: "Design System Patterns",
			content: "Atomic design principles, component libraries...",
			type: "note",
			taskId: "task-2",
			tags: ["design", "patterns"],
			createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
			citations: 1,
		},
		{
			id: "note-5",
			title: "User Feedback Summary",
			content: "Users want simpler navigation, better search...",
			type: "note",
			taskId: "task-2",
			tags: ["feedback", "important"],
			createdAt: Date.now() - 6 * 60 * 60 * 1000,
			citations: 0,
		},
		{
			id: "note-6",
			title: "Meeting Action Items",
			content:
				"1. Review budget proposal\n2. Assign team leads\n3. Set Q1 goals",
			type: "note",
			taskId: "task-3",
			tags: ["todo", "meeting"],
			createdAt: Date.now() - 1 * 60 * 60 * 1000,
			citations: 0,
		},
	],
	recentActivity: [
		{
			type: "note_created",
			title: "Created note: Meeting Action Items",
			time: Date.now() - 1 * 60 * 60 * 1000,
			icon: "📝",
		},
		{
			type: "tab_opened",
			title: "Opened: Q4 Strategy Doc",
			time: Date.now() - 2 * 60 * 60 * 1000,
			icon: "🔗",
		},
		{
			type: "annotation_created",
			title: "Highlighted text in BERT paper",
			time: Date.now() - 3 * 60 * 60 * 1000,
			icon: "✏️",
		},
		{
			type: "task_updated",
			title: "Updated task: Product Design Research",
			time: Date.now() - 5 * 60 * 60 * 1000,
			icon: "📋",
		},
		{
			type: "note_created",
			title: "Created note: User Feedback Summary",
			time: Date.now() - 6 * 60 * 60 * 1000,
			icon: "📝",
		},
	],
	inbox: [
		{
			id: "inbox-1",
			title: "Screenshot from lecture",
			type: "image",
			source: "phone",
			time: Date.now() - 2 * 60 * 60 * 1000,
		},
		{
			id: "inbox-2",
			title: "Voice memo: Research ideas",
			type: "audio",
			source: "phone",
			time: Date.now() - 4 * 60 * 60 * 1000,
		},
		{
			id: "inbox-3",
			title: "Quick note about paper",
			type: "text",
			source: "clipboard",
			time: Date.now() - 1 * 24 * 60 * 60 * 1000,
		},
	],
};

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

let currentView = "dashboard";
let currentData = SAMPLE_DATA;

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
	//initializeWorkspace();
	setupEventListeners();
	loadData();
});

// ============================================================================
// EVENT LISTENERS
// ============================================================================

function setupEventListeners() {
	document
		.querySelectorAll(".view-tab")
		.forEach((tab) =>
			tab.addEventListener("click", () => switchView(tab.dataset.view))
		);

	document
		.getElementById("global-search")
		?.addEventListener("input", handleGlobalSearch);
	document
		.getElementById("new-task-from-dashboard")
		?.addEventListener("click", createNewTask);
	document
		.getElementById("settings-btn")
		?.addEventListener("click", openSettings);
}

// ============================================================================
// VIEW SWITCHING
// ============================================================================

function switchView(viewName) {
	currentView = viewName;
	document
		.querySelectorAll(".view-tab")
		.forEach((tab) =>
			tab.classList.toggle("active", tab.dataset.view === viewName)
		);
	document
		.querySelectorAll(".view-container")
		.forEach((view) => view.classList.remove("active"));
	document.getElementById(`${viewName}-view`)?.classList.add("active");

	switch (viewName) {
		case "dashboard":
			renderDashboard();
			break;
		case "graph":
			renderGraph();
			break;
		case "notes":
			renderNotes();
			break;
		case "replay":
			renderReplay();
			break;
	}
}

// ============================================================================
// DASHBOARD
// ============================================================================

function renderDashboard() {
	renderDashboardTasks();
	renderRecentActivity();
	renderQuickStats();
	renderQuickNotes();
	renderInbox();
}

function renderDashboardTasks() {
	const container = document.getElementById("dashboard-tasks");
	container.innerHTML = "";
	currentData.tasks.forEach((task) => {
		const taskEl = document.createElement("div");
		taskEl.className = "task-preview";
		taskEl.innerHTML = `
      <div class="task-preview-header" style="border-left-color: ${
			task.color
		};">
        <span class="task-preview-title">${task.title}</span>
        <span class="task-preview-count">${task.metadata.tabCount} tabs</span>
      </div>
      <div class="task-preview-meta">
        <span>${task.metadata.noteCount} notes</span>
        <span>${formatTime(task.metadata.totalTimeSpent)}</span>
      </div>
    `;
		taskEl.addEventListener("click", () => openTask(task.id));
		container.appendChild(taskEl);
	});
}

function renderRecentActivity() {
	const container = document.getElementById("recent-activity");
	container.innerHTML = "";

	if (
		!currentData.recentActivity ||
		currentData.recentActivity.length === 0
	) {
		container.innerHTML = '<p class="empty-message">No recent activity</p>';
		return;
	}
	currentData.recentActivity?.forEach((activity) => {
		const el = document.createElement("div");
		el.className = "activity-item";
		el.innerHTML = `<span class="activity-icon">${activity.icon}</span>
      <div class="activity-content">
        <div class="activity-title">${activity.title}</div>
        <div class="activity-time">${formatRelativeTime(activity.time)}</div>
      </div>`;
		container.appendChild(el);
	});
}

function renderQuickStats() {
	const totalTabs = currentData.tasks.reduce(
		(sum, t) => sum + t.metadata.tabCount,
		0
	);
	const totalTime = currentData.tasks.reduce(
		(sum, t) => sum + t.metadata.totalTimeSpent,
		0
	);
	document.getElementById("stat-tasks").textContent =
		currentData.tasks.length;
	document.getElementById("stat-tabs").textContent = totalTabs;
	document.getElementById("stat-notes").textContent =
		currentData.notes.length;
	document.getElementById("stat-time").textContent = `${Math.round(
		totalTime / 3600
	)}h`;
}

function renderQuickNotes() {
	const container = document.getElementById("quick-notes");
	container.innerHTML = "";
	currentData.notes
		.sort((a, b) => b.createdAt - a.createdAt)
		.slice(0, 3)
		.forEach((note) => {
			const el = document.createElement("div");
			el.className = "note-preview";
			el.innerHTML = `<div class="note-preview-title">${note.title}</div>
      <div class="note-preview-content">${note.content.substring(
			0,
			80
		)}...</div>
      <div class="note-preview-tags">${note.tags
			.map((tag) => `<span class="tag">${tag}</span>`)
			.join("")}</div>`;
			el.addEventListener("click", () => openNote(note.id));
			container.appendChild(el);
		});
}

function renderInbox() {
	const container = document.getElementById("inbox-items");
	const countBadge = document.getElementById("inbox-count");
	container.innerHTML = "";

	if (!currentData.inbox || currentData.inbox.length === 0) {
		currentData.inbox = [
			{
				id: "inbox-sample",
				title: "Inbox from iphone",
				type: "text",
				source: "",
				time: Date.now(),
			},
			{
				id: "inbox-sample-2",
				title: "Voice memo from meeting",
				type: "text",
				source: "",
				time: Date.now(),
			},
		];
	}

	countBadge.textContent = currentData.inbox.length;
	if (currentData.inbox.length === 0) {
		container.innerHTML = '<p class="empty-message">No items in inbox</p>';
		return;
	}
	currentData.inbox.forEach((item) => {
		const el = document.createElement("div");
		el.className = "inbox-item";
		el.innerHTML = `<div class="inbox-icon">${getInboxIcon(item.type)}</div>
      <div class="inbox-content"><div class="inbox-title">${item.title}</div>
      <div class="inbox-meta">${item.source} • ${formatRelativeTime(
			item.time
		)}</div></div>
      <button class="inbox-action" data-id="${item.id}">Process</button>`;
		container.appendChild(el);
	});
}

// ============================================================================
// NOTES VIEW
// ============================================================================

function renderNotes() {
	const container = document.getElementById("notes-list");
	container.innerHTML = "";
	currentData.notes.forEach((note) => {
		const el = document.createElement("div");
		el.className = "note-list-item";
		el.innerHTML = `<div class="note-list-title">${note.title}</div>
      <div class="note-list-preview">${note.content.substring(0, 100)}...</div>
      <div class="note-list-meta">
        <span class="note-type">${note.type}</span>
        ${note.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
      </div>`;
		el.addEventListener("click", () => openNoteInEditor(note));
		container.appendChild(el);
	});
}

function openNoteInEditor(note) {
	const editor = document.getElementById("note-editor");
	editor.innerHTML = `<div class="note-editor-header">
    <input type="text" class="note-title-input" value="${note.title}">
    <button class="save-note-btn">Save</button>
  </div>
  <div class="note-editor-body">
    <textarea class="note-content-textarea">${note.content}</textarea>
  </div>
  <div class="note-editor-footer">
    <div class="note-tags">${note.tags
		.map(
			(tag) =>
				`<span class="tag">${tag} <button class="remove-tag">×</button></span>`
		)
		.join("")}<button class="add-tag-btn">+ Add Tag</button></div>
    <div class="note-meta-info"><span>Created: ${new Date(
		note.createdAt
	).toLocaleDateString()}</span><span>${note.citations} citations</span></div>
  </div>`;

	// Save button handler
	editor.querySelector(".save-note-btn").addEventListener("click", () => {
		note.title = editor.querySelector(".note-title-input").value;
		note.content = editor.querySelector(".note-content-textarea").value;
		renderNotes();
		renderQuickNotes();
	});
}

// ============================================================================
// TASK ACTIONS (CHROME TAB GROUPS)
// ============================================================================

async function openTask(taskId) {
	const task = currentData.tasks.find((t) => t.id === taskId);
	if (!task) return;

	try {
		for (const subtask of task.subtasks) {
			// Open all tabs of this subtask and collect their IDs
			const tabIds = [];
			for (const tab of subtask.tabs) {
				const createdTab = await chrome.tabs.create({
					url: `https://${tab.url}`,
					active: false,
				});
				tabIds.push(createdTab.id);
			}

			// Group the tabs into a new tab group
			if (tabIds.length > 0) {
				const groupId = await chrome.tabs.group({ tabIds });
				// Optional: set group color and title
				await chrome.tabGroups.update(groupId, {
					title: subtask.title,
					color: task.color.replace("#", ""), // remove # for Chrome API
				});
			}
		}
	} catch (err) {
		console.error("Failed to open task tabs:", err);
	}
}

function openNote(noteId) {
	switchView("notes");
	const note = currentData.notes.find((n) => n.id === noteId);
	if (note) openNoteInEditor(note);
}

function createNewTask() {
	const name = prompt("Enter task name:");
	if (name) {
		const newTask = {
			id: "task-" + Date.now(),
			title: name,
			color: "#888",
			createdAt: Date.now(),
			lastActiveAt: Date.now(),
			subtasks: [],
			metadata: { totalTimeSpent: 0, tabCount: 0, noteCount: 0 },
		};
		currentData.tasks.push(newTask);
		renderDashboard();
	}
}

function openSettings() {
	alert("Settings panel would open here!");
}

function handleGlobalSearch(e) {
	const query = e.target.value.toLowerCase();
	console.log("Search for:", query);
	// Filter notes
	const filteredNotes = currentData.notes.filter(
		(n) =>
			n.title.toLowerCase().includes(query) ||
			n.content.toLowerCase().includes(query)
	);
	const container = document.getElementById("notes-list");
	container.innerHTML = "";
	filteredNotes.forEach((note) => {
		const el = document.createElement("div");
		el.className = "note-list-item";
		el.innerHTML = `<div class="note-list-title">${note.title}</div>
      <div class="note-list-preview">${note.content.substring(
			0,
			100
		)}...</div>`;
		el.addEventListener("click", () => openNoteInEditor(note));
		container.appendChild(el);
	});
}

// ============================================================================
// GRAPH & REPLAY PLACEHOLDER
// ============================================================================

function renderGraph() {
	const container = document.getElementById("graph-canvas");
	container.innerHTML = "<p class='coming-soon'>Graph view coming soon!</p>";
}

function renderReplay() {
	const container = document.getElementById("timeline-events");
	container.innerHTML =
		"<p class='info-message'>Session replay will show your complete research journey</p>";
}

// ============================================================================
// DATA LOADING
// ============================================================================

async function loadData() {
	// try {
	// 	const response = await chrome.runtime.sendMessage({
	// 		action: "get_workspace_state",
	// 	});
	// 	if (response && response.tasks && response.tasks.length > 0)
	// 		currentData = response;
	// 	else currentData = SAMPLE_DATA;
	// } catch (e) {
	// 	currentData = SAMPLE_DATA;
	// }

	currentData = SAMPLE_DATA;
	renderDashboard();
}

// Formats seconds into human-readable time, e.g., 1247 -> "20m 47s"
function formatTime(seconds) {
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = seconds % 60;
	let parts = [];
	if (h > 0) parts.push(`${h}h`);
	if (m > 0) parts.push(`${m}m`);
	if (s > 0 && h === 0) parts.push(`${s}s`); // show seconds only if less than 1 hour
	return parts.join(" ") || "0s";
}

// Formats a timestamp into a relative string, e.g., "2h ago"
function formatRelativeTime(timestamp) {
	const diff = Date.now() - timestamp;
	const sec = Math.floor(diff / 1000);
	const min = Math.floor(sec / 60);
	const hr = Math.floor(min / 60);
	const day = Math.floor(hr / 24);

	if (day > 0) return `${day}d ago`;
	if (hr > 0) return `${hr}h ago`;
	if (min > 0) return `${min}m ago`;
	return `${sec}s ago`;
}

// Optional: icon for inbox items
function getInboxIcon(type) {
	switch (type) {
		case "image":
			return "🖼️";
		case "audio":
			return "🎵";
		case "text":
			return "📝";
		default:
			return "📎";
	}
}
