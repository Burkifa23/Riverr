// --- EXISTING BUTTON LOGIC ---
document.getElementById("open-workspace").addEventListener("click", async () => {
    await chrome.runtime.sendMessage({ action: "open_workspace" });
    window.close();
});

document.getElementById("new-task").addEventListener("click", async () => {
    await chrome.tabs.create({ url: "workspace/workspace.html?action=new-task" });
    window.close();
});

document.getElementById("toggle-notes")?.addEventListener("click", async () => {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.id) {
            await chrome.tabs.sendMessage(tab.id, { action: "toggle_notes_sidebar" });
            window.close();
        }
    } catch (err) {
        console.error("Error sending toggle_notes_sidebar:", err);
    }
});

// --- NEW TASTE SKILL LOGIC: Task Selection ---
async function initializeTaskSelector() {
    const dropdown = document.getElementById("task-dropdown");
    
    // 1. Fetch all tasks from the DB
    const response = await chrome.runtime.sendMessage({ action: "get_all_tasks" });
    const tasks = response.tasks || [];

    // 2. Fetch the currently active task ID from the service worker
    const currentTaskRes = await chrome.runtime.sendMessage({ action: "get_active_task_id" });
    const activeId = currentTaskRes.taskId;

    // 3. Populate the dropdown
    tasks.forEach(task => {
        const option = document.createElement("option");
        option.value = task.id;
        option.textContent = task.title || "Untitled Task";
        dropdown.appendChild(option);
    });

    // 4. Set the current selection
    if (activeId) {
        dropdown.value = activeId;
    }

    // 5. Listen for changes and alert the background script
    dropdown.addEventListener("change", async (e) => {
        const selectedTaskId = e.target.value;
        await chrome.runtime.sendMessage({ 
            action: "set_active_task", 
            taskId: selectedTaskId || null 
        });
        
        // Optional: Provide tiny visual feedback that it saved
        dropdown.style.borderColor = "#30D158"; // Taste skill success green
        setTimeout(() => dropdown.style.borderColor = "rgba(255,255,255,0.1)", 500);
    });
}

// --- STATS LOGIC ---
async function loadStats() {
    const response = await chrome.runtime.sendMessage({ action: "get_workspace_state" });
    if (response.tasks) document.getElementById("active-tasks").textContent = response.tasks.length;
    if (response.notes) document.getElementById("total-notes").textContent = response.notes.length;
    const tabs = await chrome.tabs.query({});
    document.getElementById("open-tabs").textContent = tabs.length;
}

// Boot up
document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    initializeTaskSelector();
});