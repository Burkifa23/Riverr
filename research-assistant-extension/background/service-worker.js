// background/service-worker.js - Main background service worker
// Handles all extension events, tab monitoring, and coordination

// Import modules
import { SessionLogger } from "./session-logger.js";
import { initializeSampleData } from "../lib/sample-data.js";

// ============================================================================
// INITIALIZATION
// ============================================================================

const sessionLogger = new SessionLogger();
let currentSessionId = null;
let activeTasks = new Map();
let globalActiveTaskId = null; 
let db = null;

// Initialize IndexedDB connection
async function initDB() {
	return new Promise((resolve, reject) => {
		
		const request = indexedDB.open("ResearchAssistantDB", 1);

		request.onerror = () => reject(request.error);
		request.onsuccess = () => {
			db = request.result;
			resolve(db);
		};

		request.onupgradeneeded = (event) => {
			const database = event.target.result;

			if (!database.objectStoreNames.contains("tasks")) {
				const taskStore = database.createObjectStore("tasks", {
					keyPath: "id",
				});
				taskStore.createIndex("lastActiveAt", "lastActiveAt", {
					unique: false,
				});
			}

			if (!database.objectStoreNames.contains("subTasks")) {
				const subTaskStore = database.createObjectStore("subTasks", {
					keyPath: "id",
				});
				subTaskStore.createIndex("lastActiveAt", "lastActiveAt", {
					unique: false,
				});
				subTaskStore.createIndex("taskId", "taskId", { unique: false });
			}

			if (!database.objectStoreNames.contains("tabs")) {
				const tabStore = database.createObjectStore("tabs", {
					keyPath: "id",
				});
				tabStore.createIndex("taskId", "taskId", { unique: false });
				tabStore.createIndex("chromeTabId", "chromeTabId", {
					unique: false,
				});
			}

			if (!database.objectStoreNames.contains("notes")) {
				const noteStore = database.createObjectStore("notes", {
					keyPath: "id",
				});
				noteStore.createIndex("taskId", "taskId", { unique: false });
			}

			if (!database.objectStoreNames.contains("sessionEvents")) {
				const eventStore = database.createObjectStore("sessionEvents", {
					keyPath: "id",
				});
				eventStore.createIndex("sessionId", "sessionId", {
					unique: false,
				});
				eventStore.createIndex("timestamp", "timestamp", {
					unique: false,
				});
			}

			if (!database.objectStoreNames.contains("settings")) {
				database.createObjectStore("settings", { keyPath: "key" });
			}

			// TODO: Resolve with DB if this is an intermittent request (i.e separate request response other than
			// onSuccess or sumn IDK when function is called)
		};
	});
}

// Initialize on extension load
chrome.runtime.onInstalled.addListener(async (details) => {
	console.log("Research Assistant installed:", details.reason);

	// TODO: db = initDB(); instead of doing it within the initDB() function
	await initDB();

	// if (details.reason === "install") {
	// 	await initializeExtension();
	// }
	await initializeExtension();
});

chrome.runtime.onStartup.addListener(async () => {
	// TODO: db = initDB(); same comment as above
	await initDB();
	await startNewSession();
});

async function initializeExtension() {
	// Create default settings
	await saveToStorage("settings", {
		key: "settings",
		value: {
			autoGroupTabs: true,
			salienceIndicators: true,
			showProductivityReports: true,
			edgeLighting: false,
		},
		}
	);

	// Initialize sample data for demo
	// const { initializeSampleData } = await import("../lib/sample-data.js");
	if (db) {
		await initializeSampleData({
			add: (store, item) => saveToStorage(store, item),
			get: (store, id) => getFromStorage(store, id),
			getAll: (store) => getAllFromStorage(store),
		});
	}

	// Open welcome page
	chrome.tabs.create({
		url: chrome.runtime.getURL("workspace/workspace.html?welcome=true"),
	});

	await startNewSession();

	const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (activeTab) {
        activeTabId = activeTab.id;
        await sessionLogger.startDwellTime(activeTabId.toString());
    }
}

async function startNewSession() {
	currentSessionId = generateUUID();
	await sessionLogger.startSession(currentSessionId);
	console.log("New session started:", currentSessionId);
}

// ============================================================================
// TAB MONITORING & EVENT TRACKING
// ============================================================================

let activeTabId = null; // Track the currently viewed tab

chrome.tabs.onCreated.addListener(async (tab) => {
    await sessionLogger.logEvent({
        sessionId: currentSessionId,
        eventType: "tab_open", 
        tabId: tab.id.toString(),
        data: { url: tab.url, title: tab.title, openerTabId: tab.openerTabId },
    });
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url) {
        await sessionLogger.logEvent({
            sessionId: currentSessionId,
            eventType: "tab_loaded",
            tabId: tabId.toString(),
            data: { url: tab.url, title: tab.title },
        });
        
        // Start timing if this tab loaded in the foreground
        if (activeTabId === tabId) {
            await sessionLogger.startDwellTime(tabId.toString());
        }
    }
});

chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
    await sessionLogger.endDwellTime(tabId.toString());
    if (activeTabId === tabId) activeTabId = null;
    
    await sessionLogger.logEvent({
        sessionId: currentSessionId,
        eventType: "tab_close",
        tabId: tabId.toString(),
        data: { windowClosing: removeInfo.windowClosing },
    });
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
    // Stop the timer on the previous tab
    if (activeTabId) {
        await sessionLogger.endDwellTime(activeTabId.toString());
    }
    
    // Start the timer on the new tab
    activeTabId = activeInfo.tabId;
    await sessionLogger.startDwellTime(activeTabId.toString());

    const tab = await chrome.tabs.get(activeInfo.tabId);
    await sessionLogger.logEvent({
        sessionId: currentSessionId,
        eventType: "tab_switch", 
        tabId: activeInfo.tabId.toString(),
        data: { url: tab.url, title: tab.title },
    });
});

// ============================================================================
// CONTEXT MENU
// ============================================================================

chrome.runtime.onInstalled.addListener(() => {
	chrome.contextMenus.create({
		id: "save-clip",
		title: "Save as Clip",
		contexts: ["selection"],
	});

	chrome.contextMenus.create({
		id: "add-note",
		title: "Add Note",
		contexts: ["selection"],
	});

	chrome.contextMenus.create({
		id: "highlight-yellow",
		title: "Highlight (Yellow)",
		contexts: ["selection"],
	});
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
	const action = info.menuItemId;
	const selection = info.selectionText;

	switch (action) {
		case "save-clip":
			await handleSaveClip(tab, selection);
			break;
		case "add-note":
			await chrome.tabs.sendMessage(tab.id, {
				action: "open_note_popup",
				data: { selectedText: selection },
			});
			break;
		case "highlight-yellow":
			await chrome.tabs.sendMessage(tab.id, {
				action: "create_highlight",
				data: { selectedText: selection, color: "#FFEB3B" },
			});
			break;
	}
});

// ============================================================================
// MESSAGE HANDLING
// ============================================================================

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	handleMessage(message, sender)
		.then(sendResponse)
		.catch((error) => {
			console.error("Message handling error:", error);
			sendResponse({ error: error.message });
		});
	return true; // Keep channel open for async response
});

async function handleMessage(message, sender) {
	const { action, data } = message;

	switch (action) {
		case "log_event":
			await sessionLogger.logEvent({
				sessionId: currentSessionId,
				...data,
			});
			return { success: true };

		case "get_all_tasks":
			const tasks = await getAllTasksWithDetails();
			return { tasks };

		case "get_current_task":
            return { 
                tabId: sender.tab?.id,
                task: null
            };

		case "get_active_task_id":
            return { taskId: globalActiveTaskId };

        case "set_active_task":
            globalActiveTaskId = data.taskId;
            console.log("Context switched. Active Task ID:", globalActiveTaskId);
            return { success: true };
			
		case "create_note": {
			const noteId = generateUUID();
			const allTabs = await getAllFromStorage("tabs");
			const allSubtasks = await getAllFromStorage("subtasks");
			const allTasks = await getAllFromStorage("tasks");

			const normalize = (url) => {
				try {
					const u = new URL(url);
					return u.origin + u.pathname.replace(/\/$/, "");
				} catch {
					return url.split("?")[0];
				}
			};

			const pageUrl = (data.pageUrl || "").trim();
			const normalizedUrl = normalize(pageUrl);

			// 1 Try to find the matching tab
			let matchedTab = allTabs.find(
				(t) => t.url && normalize(t.url) === normalizedUrl
			);

			// Fallback: check provenance relationships
			if (!matchedTab) {
				matchedTab = allTabs.find(
					(t) =>
						t.provenance?.sourceUrl &&
						normalize(t.provenance.sourceUrl) === normalizedUrl
				);
			}

			// 2️Infer subtask & task from the matched tab
			let subtaskId = matchedTab?.subtaskId || null;
			let taskId = matchedTab?.taskId || null;

			// 3️ If no tab found, try guessing from active context (e.g. lastActive task)
			if (!taskId) {
				const recentTask = allTasks.sort(
					(a, b) => (b.lastActiveAt || 0) - (a.lastActiveAt || 0)
				)[0];
				taskId = recentTask?.id || null;
			}

			if (!subtaskId && taskId) {
				const relatedSubtask = allSubtasks.find(
					(s) => s.taskId === taskId
				);
				subtaskId = relatedSubtask?.id || null;
			}

			// 4️ Construct the full note object
			const note = {
				id: noteId,
				type: "note",
				title: data.title || "Untitled Note",
				content: data.content || "",
				pageUrl,
				pageTitle: data.pageTitle || "",
				taskId,
				subtaskId,
				sourceTabId: matchedTab?.id || null,
				linkedTabs: matchedTab ? [matchedTab.id] : [],
				tags: [],
				createdAt: Date.now(),
				updatedAt: Date.now(),
			};

			// 5️ Save note and update references
			await saveToStorage("notes", note);

			// Optionally update parent structures
			if (taskId) {
				const task = await getFromStorage("tasks", taskId);
				if (task) {
					task.lastActiveAt = Date.now();
					await saveToStorage("tasks", task);
				}
			}

			if (subtaskId) {
				const subtask = await getFromStorage("subtasks", subtaskId);
				if (subtask) {
					subtask.lastUpdated = Date.now();
					await saveToStorage("subtasks", subtask);
				}
			}

			console.log(
				`Created note ${note.id} linked to task=${taskId}, subtask=${subtaskId}, tab=${matchedTab?.id}`
			);
			return { success: true, note };
		}

		case "create_note":
			const noteId = generateUUID();
			const note = { id: noteId, ...data, createdAt: Date.now() };
			await saveToStorage("notes", note);
			return { success: true, note };

		case "get_notes_count":
			const notes = await getAllFromStorage("notes");
			return { count: notes.length };

		case "open_task_tabs":
			await openTaskTabs(data.taskId);
			return { success: true };

		case "open_workspace":
			await chrome.tabs.create({
				url: chrome.runtime.getURL("workspace/workspace.html"),
			});
			return { success: true };

		case "get_workspace_state":
			const state = await getWorkspaceState();
			return state;

		case "calculate_salience":
			const salience = await calculateTabSalience(data.tabId);
			return salience;

		case "get_notes_for_page": {
			const allNotes = await getAllFromStorage("notes");
			const allTabs = await getAllFromStorage("tabs");

			const pageUrl = (data?.url || "").trim();

			// Normalized URL helper
			const normalize = (url) => {
				try {
					const u = new URL(url);
					return u.origin + u.pathname.replace(/\/$/, ""); // remove trailing slash
				} catch {
					return url.split("?")[0]; // fallback for malformed URLs
				}
			};

			const normalizedPageUrl = normalize(pageUrl);

			const notesForPage = allNotes.filter((note) => {
				if (!note.pageUrl && !note.sourceTabId) return false;

				// Direct URL match
				const noteUrl = normalize(note.pageUrl || "");
				if (noteUrl === normalizedPageUrl) return true;

				// Fuzzy prefix/contains match
				if (note.pageUrl?.includes(normalizedPageUrl)) return true;

				// Match via sourceTabId
				if (note.sourceTabId) {
					const tab = allTabs.find((t) => t.id === note.sourceTabId);
					if (tab && normalize(tab.url) === normalizedPageUrl)
						return true;
				}

				// Match via linkedTabs
				if (Array.isArray(note.linkedTabs)) {
					const linkedTabMatch = note.linkedTabs.some((tabId) => {
						const t = allTabs.find((tt) => tt.id === tabId);
						return t && normalize(t.url) === normalizedPageUrl;
					});
					if (linkedTabMatch) return true;
				}

				// Match via provenance (tab’s sourceUrl)
				const provenanceMatch = allTabs.some(
					(t) =>
						t.provenance?.sourceUrl &&
						normalize(t.provenance.sourceUrl) ===
							normalizedPageUrl &&
						(note.sourceTabId === t.id ||
							note.linkedTabs?.includes(t.id))
				);
				if (provenanceMatch) return true;

				return false;
			});

			return { notes: notesForPage };
		}

		case "get_top_tasks":
			const allTasks = await getAllFromStorage("tasks");
			// Sort by recency or salience
			const sorted = allTasks
				.sort((a, b) => (b.lastActiveAt || 0) - (a.lastActiveAt || 0))
				.slice(0, 4);
			return { topTasks: sorted };

		default:
			return { error: "Unknown action" };
	}
}

// ============================================================================
// COMMANDS
// ============================================================================

chrome.commands.onCommand.addListener(async (command) => {
	const [tab] = await chrome.tabs.query({
		active: true,
		currentWindow: true,
	});

	switch (command) {
		case "toggle-notes-sidebar":
			await chrome.tabs.sendMessage(tab.id, {
				action: "toggle_notes_sidebar",
			});
			break;
		case "open-workspace":
			await chrome.tabs.create({
				url: chrome.runtime.getURL("workspace/workspace.html"),
			});
			break;
	}
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function handleSaveClip(tab, selection) {
	// TODO: check note on clip vs annotation/note
	const clip = {
		id: generateUUID(),
		type: "clip",
		excerpt: selection,
		content: selection,
		title: `Clip from ${tab.title}`,
		sourceTabId: tab.id.toString(),
		taskId: null,
		tags: [],
		createdAt: Date.now(),
	};

	await saveToStorage("notes", clip);

	await chrome.tabs.sendMessage(tab.id, {
		action: "show_notification", // TODO: no message handler defined
		data: { message: "Clip saved!" },
	});
}

async function getAllTasksWithDetails() {
	const tasks = await getAllFromStorage("tasks");
	const tabs = await getAllFromStorage("tabs");

	return tasks.map((task) => {
		const taskTabs = tabs.filter((t) => t.taskId === task.id);
		const subtaskMap = new Map();

		taskTabs.forEach((tab) => {
			if (!subtaskMap.has(tab.subtaskId)) {
				subtaskMap.set(tab.subtaskId, {
					id: tab.subtaskId,
					title: tab.subtaskId, // TODO: tab.subTask.name When you create proper models then fine
					tabs: [],
				});
			}
			subtaskMap.get(tab.subtaskId).tabs.push(tab);
		});

		return {
			...task,
			subtasks: Array.from(subtaskMap.values()),
		};
	});
}

// TODO: This is supposed to open sub-tasks (if defined) as tab groups then the associated tabs
async function openTaskTabs(taskId) {
	const tabs = await getAllFromStorage("tabs");
	const taskTabs = tabs.filter((t) => t.taskId === taskId);

	for (const tab of taskTabs) {
		await chrome.tabs.create({ url: tab.url });
	}
}

async function getWorkspaceState() {
	const [tasks, notes, tabs] = await Promise.all([
		getAllFromStorage("tasks"),
		getAllFromStorage("notes"),
		getAllFromStorage("tabs"),
	]);

	return { tasks, notes, tabs };
}

// DONE
async function calculateTabSalience(tabId) {
    try {
        const tab = await chrome.tabs.get(tabId);
        const urlStr = tab.url || "";
        const stringTabId = tabId.toString();

        // 1. Calculate Live Dwell Time (In-Memory, no DB thrashing)
        let liveOffsetMs = 0;
        const timer = sessionLogger.dwellTimers.get(stringTabId);
        
        // If the user is currently looking at this tab, calculate the running time
        if (activeTabId === tabId && timer && timer.start) {
            liveOffsetMs = Date.now() - timer.start;
        }
        
        const savedDwellTimeMs = sessionLogger.getTotalDwellTime(stringTabId);
        const timeSpent = Math.floor((savedDwellTimeMs + liveOffsetMs) / 1000);

        // 2. Calculate Origin
        let origin = "Direct";
        if (tab.openerTabId) {
            try {
                const openerTab = await chrome.tabs.get(tab.openerTabId);
                const openerUrl = new URL(openerTab.url);
                origin = openerUrl.hostname.replace(/^www\./, ''); 
            } catch (e) {
                origin = "Previous Tab";
            }
        } else if (urlStr.includes("google.com/search")) {
            origin = "google.com";
        }

        // 3. Calculate Visits
        const allTabs = await getAllFromStorage("tabs");
        let visits = 1;
        if (urlStr) {
            const currentUrlBase = urlStr.split('?')[0]; 
            visits = allTabs.filter(t => t.url && t.url.split('?')[0] === currentUrlBase).length;
            if (visits === 0) visits = 1; 
        }

        // 4. Calculate Productivity Score
        const prodMetrics = await sessionLogger.calculateProductivityMetrics(stringTabId);
        
        // Add the live time offset to the productivity calculation so the green bar grows in real-time
        const totalLiveDwell = savedDwellTimeMs + liveOffsetMs;
        const timeScore = Math.min(totalLiveDwell / (30 * 60 * 1000), 1.0) * 0.2; 
        
        let productivity = (prodMetrics.productivityScore || 0) + timeScore;
        
        // Ensure the bar is always at least 5% visible so the user knows it exists
        if (productivity < 0.05) productivity = 0.05; 

        return {
            timeSpent: timeSpent,
            origin: origin,
            visits: visits,
            productivity: productivity,
        };
    } catch (error) {
        console.error("Failed to calculate salience:", error);
        return { timeSpent: 0, origin: "Direct", visits: 1, productivity: 0.05 };
    }
}

// TODO: Persisting with filesys for add-in integration
// ============================================================================
// STORAGE HELPERS
// ============================================================================

async function saveToStorage(storeName, item) {
	if (!db) await initDB();

	return new Promise((resolve, reject) => {
		const transaction = db.transaction([storeName], "readwrite");
		const store = transaction.objectStore(storeName);
		const request = store.put(item);

		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}

async function getFromStorage(storeName, id) {
	if (!db) await initDB();

	return new Promise((resolve, reject) => {
		const transaction = db.transaction([storeName], "readonly");
		const store = transaction.objectStore(storeName);
		const request = store.get(id);

		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}

async function getAllFromStorage(storeName) {
	if (!db) await initDB();

	return new Promise((resolve, reject) => {
		const transaction = db.transaction([storeName], "readonly");
		const store = transaction.objectStore(storeName);
		const request = store.getAll();

		request.onsuccess = () => resolve(request.result || []);
		request.onerror = () => reject(request.error);
	});
}

// TODO: Well, gotta check existing ID's before generating new ones
function generateUUID() {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}
