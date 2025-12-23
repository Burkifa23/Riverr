// sidebar/left-panel.js - Task management panel logic

let tasks = [];
let selectedColor = "#3B82F6";
let currentTaskExpanded = null;

// Initialize
document.addEventListener("DOMContentLoaded", async () => {
	await loadTasks();
	setupEventListeners();
	updateStats();
});

function setupEventListeners() {
	// Open workspace
	document.getElementById("open-workspace")?.addEventListener("click", () => {
		chrome.runtime.sendMessage({ action: "open_workspace" });
	});

	document.getElementById("hide-panel-btn").addEventListener("click", () => {
		parent.postMessage({ type: "HIDE_LEFT_PANEL" }, "*");
	});

	// Search
	document
		.getElementById("search-input")
		?.addEventListener("input", handleSearch);

	// New task button
	document
		.getElementById("new-task-btn")
		?.addEventListener("click", showNewTaskModal);
	document
		.getElementById("close-modal")
		?.addEventListener("click", hideNewTaskModal);
	document
		.getElementById("cancel-task-btn")
		?.addEventListener("click", hideNewTaskModal);
	document
		.getElementById("create-task-btn")
		?.addEventListener("click", createNewTask);

	// Color picker
	document.querySelectorAll(".color-option").forEach((option) => {
		option.addEventListener("click", (e) => {
			document
				.querySelectorAll(".color-option")
				.forEach((o) => o.classList.remove("selected"));
			e.target.classList.add("selected");
			selectedColor = e.target.dataset.color;
		});
	});

	// Listen for updates
	chrome.runtime.onMessage.addListener((message) => {
		if (message.action === "tasks_updated") {
			loadTasks();
		}
	});
}

async function loadTasks() {
	try {
		const response = await chrome.runtime.sendMessage({
			action: "get_all_tasks",
		});
		tasks = response.tasks || [];
		renderTasks(tasks);
		updateStats();
	} catch (error) {
		console.error("Error loading tasks:", error);
		tasks = [];
		renderTasks([]);
	}
}

function renderTasks(tasksToRender) {
	const container = document.getElementById("tasks-list");

	console.log(tasksToRender);
	if (!container) return;

	if (tasksToRender.length === 0) {
		container.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
        </svg>
        <p>No tasks yet</p>
        <small>Create your first research task to get started</small>
      </div>
    `;
		return;
	}

	container.innerHTML = "";
	tasksToRender.forEach((task) => {
		const taskEl = createTaskElement(task);
		container.appendChild(taskEl);
	});
}

function createTaskElement(task) {
	const div = document.createElement("div");
	div.className = "task-item";
	div.dataset.taskId = task.id;

	const isExpanded = currentTaskExpanded === task.id;
	const subtaskCount = task.subtasks?.length || 0;
	const tabCount =
		task.subtasks?.reduce((sum, st) => sum + (st.tabs?.length || 0), 0) ||
		0;
	const salience = task.salience || 0.5;

	div.innerHTML = `
    <div class="task-header" style="border-left-color: ${task.color};">
      <div class="task-info">
        <div class="task-title-row">
          <svg class="expand-icon ${
				isExpanded ? "expanded" : ""
			}" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
          <span class="task-title">${task.title}</span>
        </div>
        <div class="task-meta">
          <span>${subtaskCount} subtask${subtaskCount !== 1 ? "s" : ""}</span>
          <span>${tabCount} tab${tabCount !== 1 ? "s" : ""}</span>
        </div>
      </div>
      <div class="task-actions">
        <div class="salience-indicator" title="Task Priority: ${Math.round(
			salience * 100
		)}%">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#e5e7eb" stroke-width="2"></circle>
            <circle cx="12" cy="12" r="10" stroke="${
				task.color
			}" stroke-width="2" 
                    stroke-dasharray="${salience * 62.8} 62.8" 
                    stroke-dashoffset="15.7"
                    transform="rotate(-90 12 12)"></circle>
          </svg>
        </div>
        <button class="icon-btn open-task-btn" data-task-id="${
			task.id
		}" title="Open all tabs">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </button>
      </div>
    </div>
    ${isExpanded ? createSubtasksHTML(task) : ""}
  `;

	// Event listeners
	const header = div.querySelector(".task-header");
	header.addEventListener("click", (e) => {
		if (!e.target.closest(".task-actions")) {
			toggleTask(task.id);
		}
	});

	const openBtn = div.querySelector(".open-task-btn");
	openBtn?.addEventListener("click", (e) => {
		e.stopPropagation();
		openTaskTabs(task.id);
	});

	return div;
}

function createSubtasksHTML(task) {
	if (!task.subtasks || task.subtasks.length === 0) {
		return `<div class="subtasks-container"><p class="empty-subtasks">No subtasks yet</p></div>`;
	}

	let html = '<div class="subtasks-container">';

	task.subtasks.forEach((subtask) => {
		html += `
      <div class="subtask-item">
        <div class="subtask-header">
          <span class="subtask-title">${subtask.title || subtask.id}</span>
          <span class="subtask-count">${subtask.tabs?.length || 0}</span>
        </div>
        ${createTabsHTML(subtask.tabs || [])}
      </div>
    `;
	});

	html += "</div>";
	return html;
}

function createTabsHTML(tabs) {
	if (tabs.length === 0) return "";

	let html = '<div class="tabs-list">';

	tabs.forEach((tab) => {
		const favicon = tab.favicon || "🌐";
		const salience = tab.salienceScore || 0.5;
		html += `
      <div class="tab-item" data-tab-id="${tab.id}">
        <span class="tab-favicon">${favicon}</span>
        <span class="tab-title">${tab.title}</span>
        <div class="tab-salience" style="width: ${salience * 100}%"></div>
      </div>
    `;
	});

	html += "</div>";
	return html;
}

function toggleTask(taskId) {
	if (currentTaskExpanded === taskId) {
		currentTaskExpanded = null;
	} else {
		currentTaskExpanded = taskId;
	}
	renderTasks(tasks);
}

async function openTaskTabs(taskId) {
	try {
		await chrome.runtime.sendMessage({
			action: "open_task_tabs",
			data: { taskId },
		});
	} catch (error) {
		console.error("Error opening task tabs:", error);
	}
}

function handleSearch(e) {
	const query = e.target.value.toLowerCase();

	if (!query) {
		renderTasks(tasks);
		return;
	}

	const filtered = tasks.filter(
		(task) =>
			task.title.toLowerCase().includes(query) ||
			task.subtasks?.some(
				(st) =>
					st.title.toLowerCase().includes(query) ||
					st.tabs?.some((tab) =>
						tab.title.toLowerCase().includes(query)
					)
			)
	);

	renderTasks(filtered);
}

function showNewTaskModal() {
	const modal = document.getElementById("new-task-modal");
	if (modal) {
		modal.style.display = "flex";
		document.getElementById("task-name-input")?.focus();
		document.querySelector(".color-option")?.classList.add("selected");
	}
}

function hideNewTaskModal() {
	const modal = document.getElementById("new-task-modal");
	if (modal) {
		modal.style.display = "none";
		const input = document.getElementById("task-name-input");
		if (input) input.value = "";
		selectedColor = "#3B82F6";
		document
			.querySelectorAll(".color-option")
			.forEach((o) => o.classList.remove("selected"));
	}
}

async function createNewTask() {
	const input = document.getElementById("task-name-input");
	const name = input?.value.trim();

	if (!name) {
		alert("Please enter a task name");
		return;
	}

	try {
		const newTask = {
			id: generateUUID(),
			title: name,
			color: selectedColor,
			createdAt: Date.now(),
			lastActiveAt: Date.now(),
			subtasks: [],
			notes: [],
			priority: 0.5,
			archived: false,
			metadata: {
				totalTimeSpent: 0,
				tabCount: 0,
				noteCount: 0,
			},
			salience: 0.5,
		};

		await chrome.runtime.sendMessage({
			action: "create_task",
			data: newTask,
		});

		hideNewTaskModal();
		await loadTasks();
	} catch (error) {
		console.error("Error creating task:", error);
		alert("Failed to create task");
	}
}

async function updateStats() {
	const totalTasks = tasks.length;
	const totalTabs = tasks.reduce(
		(sum, t) =>
			sum +
			(t.subtasks?.reduce((s, st) => s + (st.tabs?.length || 0), 0) || 0),
		0
	);

	let totalNotes = 0;
	try {
		const response = await chrome.runtime.sendMessage({
			action: "get_notes_count",
		});
		totalNotes = response.count || 0;
	} catch (error) {
		console.error("Error getting notes count:", error);
	}

	const tasksEl = document.getElementById("total-tasks");
	const tabsEl = document.getElementById("total-tabs");
	const notesEl = document.getElementById("total-notes");

	if (tasksEl) tasksEl.textContent = totalTasks;
	if (tabsEl) tabsEl.textContent = totalTabs;
	if (notesEl) notesEl.textContent = totalNotes;
}

function generateUUID() {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}
