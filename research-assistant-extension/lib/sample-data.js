// sample-data.js - Initialize extension with demo data for presentations

export async function initializeSampleData(db) {
	console.log("Initializing sample data for demo...");

	const sampleTasks = [
		{
			id: "sample-task-1",
			title: "AI Research Paper",
			color: "#3B82F6",
			createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
			lastActiveAt: Date.now() - 2 * 60 * 60 * 1000,
			subtasks: [],
			notes: [],
			priority: 0.85,
			archived: false,
			metadata: {
				totalTimeSpent: 8340,
				tabCount: 0,
				noteCount: 0,
				lastSession: Date.now(),
			},
		},
		{
			id: "sample-task-2",
			title: "Product Design Research",
			color: "#10B981",
			createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
			lastActiveAt: Date.now() - 5 * 60 * 60 * 1000,
			subtasks: [],
			notes: [],
			priority: 0.7,
			archived: false,
			metadata: {
				totalTimeSpent: 5350,
				tabCount: 0,
				noteCount: 0,
				lastSession: Date.now(),
			},
		},
		{
			id: "sample-task-3",
			title: "Meeting Preparation",
			color: "#F59E0B",
			createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
			lastActiveAt: Date.now() - 30 * 60 * 1000,
			subtasks: [],
			notes: [],
			priority: 0.65,
			archived: false,
			metadata: {
				totalTimeSpent: 780,
				tabCount: 0,
				noteCount: 0,
				lastSession: Date.now(),
			},
		},
	];

	const sampleSubtasks = [
		{
			id: "sample-sub-1",
			taskId: "sample-task-1",
			title: "Transformer Models",
			tabs: [],
			createdAt: Date.now() - 6 * 24 * 60 * 60 * 1000,
			order: 0,
		},
		{
			id: "sample-sub-2",
			taskId: "sample-task-1",
			title: "Background Reading",
			tabs: [],
			createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
			order: 1,
		},
		{
			id: "sample-sub-3",
			taskId: "sample-task-2",
			title: "Competitor Analysis",
			tabs: [],
			createdAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
			order: 0,
		},
		{
			id: "sample-sub-4",
			taskId: "sample-task-2",
			title: "User Research",
			tabs: [],
			createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
			order: 1,
		},
		{
			id: "sample-sub-5",
			taskId: "sample-task-3",
			title: "Agenda Items",
			tabs: [],
			createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
			order: 0,
		},
	];

	const sampleTabs = [
		{
			id: "sample-tab-1",
			taskId: "sample-task-1",
			subtaskId: "sample-sub-1",
			url: "https://arxiv.org/abs/1706.03762",
			title: "Attention Is All You Need",
			favicon: "📄",
			provenance: {
				source: "search",
				type: "google",
				sourceUrl: "https://google.com",
				timestamp: Date.now() - 6 * 24 * 60 * 60 * 1000,
			},
			dwellHistory: [
				{
					start: Date.now() - 6 * 24 * 60 * 60 * 1000,
					end: Date.now() - 6 * 24 * 60 * 60 * 1000 + 1247000,
				},
			],
			totalTimeSpent: 1247,
			lastVisited: Date.now() - 2 * 60 * 60 * 1000,
			visitCount: 8,
			scrollDepth: 0.85,
			interactionSignals: {
				clicks: 15,
				copies: 3,
				searches: 0,
				keystrokes: 45,
			},
			salienceScore: 0.9,
			archived: false,
			archivedAt: null,
			chromeTabId: null,
			groupId: null,
		},
		{
			id: "sample-tab-2",
			taskId: "sample-task-1",
			subtaskId: "sample-sub-1",
			url: "https://arxiv.org/abs/1810.04805",
			title: "BERT: Pre-training of Deep Bidirectional Transformers",
			favicon: "📄",
			provenance: {
				source: "link",
				sourceUrl: "https://arxiv.org/abs/1706.03762",
				timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
			},
			dwellHistory: [
				{
					start: Date.now() - 5 * 24 * 60 * 60 * 1000,
					end: Date.now() - 5 * 24 * 60 * 60 * 1000 + 892000,
				},
			],
			totalTimeSpent: 892,
			lastVisited: Date.now() - 3 * 60 * 60 * 1000,
			visitCount: 5,
			scrollDepth: 0.7,
			interactionSignals: {
				clicks: 10,
				copies: 2,
				searches: 0,
				keystrokes: 30,
			},
			salienceScore: 0.75,
			archived: false,
			archivedAt: null,
			chromeTabId: null,
			groupId: null,
		},
		{
			id: "sample-tab-3",
			taskId: "sample-task-1",
			subtaskId: "sample-sub-2",
			url: "https://en.wikipedia.org/wiki/Artificial_neural_network",
			title: "Neural Networks - Wikipedia",
			favicon: "🌐",
			provenance: {
				source: "direct",
				type: "typed",
				timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000,
			},
			dwellHistory: [
				{
					start: Date.now() - 4 * 24 * 60 * 60 * 1000,
					end: Date.now() - 4 * 24 * 60 * 60 * 1000 + 456000,
				},
			],
			totalTimeSpent: 456,
			lastVisited: Date.now() - 12 * 60 * 60 * 1000,
			visitCount: 3,
			scrollDepth: 0.5,
			interactionSignals: {
				clicks: 5,
				copies: 1,
				searches: 0,
				keystrokes: 10,
			},
			salienceScore: 0.5,
			archived: false,
			archivedAt: null,
			chromeTabId: null,
			groupId: null,
		},
		{
			id: "sample-tab-4",
			taskId: "sample-task-2",
			subtaskId: "sample-sub-3",
			url: "https://www.figma.com/design-systems",
			title: "Figma Design Systems",
			favicon: "🎨",
			provenance: {
				source: "search",
				type: "google",
				timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000,
			},
			dwellHistory: [
				{
					start: Date.now() - 4 * 24 * 60 * 60 * 1000,
					end: Date.now() - 4 * 24 * 60 * 60 * 1000 + 2340000,
				},
			],
			totalTimeSpent: 2340,
			lastVisited: Date.now() - 6 * 60 * 60 * 1000,
			visitCount: 7,
			scrollDepth: 0.9,
			interactionSignals: {
				clicks: 25,
				copies: 5,
				searches: 2,
				keystrokes: 80,
			},
			salienceScore: 0.8,
			archived: false,
			archivedAt: null,
			chromeTabId: null,
			groupId: null,
		},
		{
			id: "sample-tab-5",
			taskId: "sample-task-2",
			subtaskId: "sample-sub-3",
			url: "https://www.adobe.com/products/xd.html",
			title: "Adobe XD - UI/UX Design Tool",
			favicon: "🎨",
			provenance: {
				source: "search",
				type: "google",
				timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
			},
			dwellHistory: [
				{
					start: Date.now() - 3 * 24 * 60 * 60 * 1000,
					end: Date.now() - 3 * 24 * 60 * 60 * 1000 + 1120000,
				},
			],
			totalTimeSpent: 1120,
			lastVisited: Date.now() - 8 * 60 * 60 * 1000,
			visitCount: 4,
			scrollDepth: 0.65,
			interactionSignals: {
				clicks: 12,
				copies: 2,
				searches: 1,
				keystrokes: 35,
			},
			salienceScore: 0.6,
			archived: false,
			archivedAt: null,
			chromeTabId: null,
			groupId: null,
		},
		{
			id: "sample-tab-6",
			taskId: "sample-task-2",
			subtaskId: "sample-sub-4",
			url: "https://www.nngroup.com/articles/",
			title: "UX Best Practices - Nielsen Norman Group",
			favicon: "📊",
			provenance: {
				source: "link",
				sourceUrl: "https://www.figma.com/design-systems",
				timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
			},
			dwellHistory: [
				{
					start: Date.now() - 2 * 24 * 60 * 60 * 1000,
					end: Date.now() - 2 * 24 * 60 * 60 * 1000 + 1890000,
				},
			],
			totalTimeSpent: 1890,
			lastVisited: Date.now() - 10 * 60 * 60 * 1000,
			visitCount: 6,
			scrollDepth: 0.8,
			interactionSignals: {
				clicks: 18,
				copies: 4,
				searches: 0,
				keystrokes: 55,
			},
			salienceScore: 0.7,
			archived: false,
			archivedAt: null,
			chromeTabId: null,
			groupId: null,
		},
		{
			id: "sample-tab-7",
			taskId: "sample-task-3",
			subtaskId: "sample-sub-5",
			url: "https://docs.google.com/document/d/sample-doc-id",
			title: "Q4 Strategy Planning",
			favicon: "📝",
			provenance: {
				source: "direct",
				type: "bookmark",
				timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000,
			},
			dwellHistory: [
				{
					start: Date.now() - 1 * 24 * 60 * 60 * 1000,
					end: Date.now() - 1 * 24 * 60 * 60 * 1000 + 780000,
				},
			],
			totalTimeSpent: 780,
			lastVisited: Date.now() - 30 * 60 * 1000,
			visitCount: 4,
			scrollDepth: 0.95,
			interactionSignals: {
				clicks: 8,
				copies: 1,
				searches: 0,
				keystrokes: 120,
			},
			salienceScore: 0.9,
			archived: false,
			archivedAt: null,
			chromeTabId: null,
			groupId: null,
		},
	];

	const sampleNotes = [
		{
			id: "sample-note-1",
			type: "note",
			taskId: "sample-task-1",
			subtaskId: "sample-sub-1",
			sourceTabId: "sample-tab-1",
			title: "Key Transformer Insights",
			content:
				"Self-attention mechanism allows the model to weigh the importance of different words in a sentence. This is fundamentally different from RNNs which process sequentially. The transformer can parallelize computation across all positions, making it much more efficient for training on GPUs.",
			excerpt: "",
			tags: ["important", "cite", "attention"],
			linkedNotes: [],
			linkedTabs: ["sample-tab-1"],
			linkedFiles: [],
			citations: 3,
			createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
			updatedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
			accessedAt: Date.now() - 2 * 60 * 60 * 1000,
			isPinned: false,
			isTodo: false,
			todoStatus: "pending",
			annotations: [],
			position: { x: 0, y: 0 },
			versionHistory: [],
		},
		{
			id: "sample-note-2",
			type: "note",
			taskId: "sample-task-1",
			subtaskId: "sample-sub-1",
			sourceTabId: null,
			title: "Research Questions",
			content:
				"Need to investigate:\n1. How does attention mechanism improve over RNNs?\n2. What are the computational trade-offs?\n3. Can transformers be applied to domains other than NLP?\n4. What are the limitations of the attention mechanism?",
			excerpt: "",
			tags: ["todo", "question"],
			linkedNotes: ["sample-note-1"],
			linkedTabs: ["sample-tab-1", "sample-tab-2"],
			linkedFiles: [],
			citations: 0,
			createdAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
			updatedAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
			accessedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
			isPinned: true,
			isTodo: true,
			todoStatus: "pending",
			annotations: [],
			position: { x: 100, y: 100 },
			versionHistory: [],
		},
		{
			id: "sample-note-3",
			type: "clip",
			taskId: "sample-task-1",
			subtaskId: "sample-sub-1",
			sourceTabId: "sample-tab-2",
			title: "BERT Training Details",
			content:
				"Pre-training on large corpus using masked language modeling, then fine-tuning on specific tasks. The key innovation is bidirectional training which allows the model to learn context from both directions.",
			excerpt:
				"Pre-training on large corpus using masked language modeling",
			tags: ["technical", "bert"],
			linkedNotes: [],
			linkedTabs: ["sample-tab-2"],
			linkedFiles: [],
			citations: 2,
			createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
			updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
			accessedAt: Date.now() - 5 * 60 * 60 * 1000,
			isPinned: false,
			isTodo: false,
			todoStatus: "completed",
			annotations: [],
			position: { x: 200, y: 150 },
			versionHistory: [],
		},
		{
			id: "sample-note-4",
			type: "note",
			taskId: "sample-task-2",
			subtaskId: "sample-sub-3",
			sourceTabId: "sample-tab-4",
			title: "Design System Patterns",
			content:
				"Key principles observed:\n- Atomic design methodology\n- Component libraries with clear hierarchies\n- Design tokens for consistency\n- Documentation as first-class citizen\n- Versioning and change management",
			excerpt: "",
			tags: ["design", "patterns", "figma"],
			linkedNotes: [],
			linkedTabs: ["sample-tab-4"],
			linkedFiles: [],
			citations: 1,
			createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
			updatedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
			accessedAt: Date.now() - 3 * 60 * 60 * 1000,
			isPinned: false,
			isTodo: false,
			todoStatus: "pending",
			annotations: [],
			position: { x: 300, y: 200 },
			versionHistory: [],
		},
		{
			id: "sample-note-5",
			type: "note",
			taskId: "sample-task-2",
			subtaskId: "sample-sub-4",
			sourceTabId: "sample-tab-6",
			title: "User Feedback Summary",
			content:
				"Common themes from user research:\n- Users want simpler navigation (mentioned by 80%)\n- Better search functionality is critical\n- Faster load times are expected\n- Mobile experience needs significant improvement\n- Dark mode is highly requested",
			excerpt: "",
			tags: ["feedback", "important", "user-research"],
			linkedNotes: ["sample-note-4"],
			linkedTabs: ["sample-tab-6"],
			linkedFiles: [],
			citations: 0,
			createdAt: Date.now() - 6 * 60 * 60 * 1000,
			updatedAt: Date.now() - 6 * 60 * 60 * 1000,
			accessedAt: Date.now() - 1 * 60 * 60 * 1000,
			isPinned: true,
			isTodo: false,
			todoStatus: "pending",
			annotations: [],
			position: { x: 400, y: 100 },
			versionHistory: [],
		},
		{
			id: "sample-note-6",
			type: "note",
			taskId: "sample-task-3",
			subtaskId: "sample-sub-5",
			sourceTabId: "sample-tab-7",
			title: "Meeting Action Items",
			content:
				"1. Review Q4 budget proposal by Friday\n2. Assign team leads for new initiatives\n3. Set concrete Q1 goals and KPIs\n4. Schedule follow-up meetings with stakeholders\n5. Document decisions in wiki",
			excerpt: "",
			tags: ["todo", "meeting", "urgent"],
			linkedNotes: [],
			linkedTabs: ["sample-tab-7"],
			linkedFiles: [],
			citations: 0,
			createdAt: Date.now() - 1 * 60 * 60 * 1000,
			updatedAt: Date.now() - 1 * 60 * 60 * 1000,
			accessedAt: Date.now() - 30 * 60 * 1000,
			isPinned: true,
			isTodo: true,
			todoStatus: "pending",
			annotations: [],
			position: { x: 150, y: 250 },
			versionHistory: [],
		},
	];

	// Save to IndexedDB
	try {
		for (const task of sampleTasks) {
			await db.add("tasks", task);
		}

		for (const subtask of sampleSubtasks) {
			await db.add("subTasks", subtask);
		}

		for (const tab of sampleTabs) {
			await db.add("tabs", tab);
		}

		for (const note of sampleNotes) {
			await db.add("notes", note);
		}

		// Mark sample data as initialized
		await db.add("settings", {
			key: "sample_data_initialized",
			value: true,
			timestamp: Date.now(),
		});

		console.log("✓ Sample data initialized successfully");
		return true;
	} catch (error) {
		console.error("Error initializing sample data:", error);
		return false;
	}
}

export async function isSampleDataInitialized(db) {
	try {
		const setting = await db.get("settings", "sample_data_initialized");
		return setting?.value === true;
	} catch (error) {
		return false;
	}
}

export async function clearSampleData(db) {
	try {
		// Get all sample items
		const tasks = await db.getAll("tasks");
		const subtasks = await db.getAll("subtasks");
		const tabs = await db.getAll("tabs");
		const notes = await db.getAll("notes");

		// Delete sample items
		for (const task of tasks) {
			if (task.id.startsWith("sample-")) {
				await db.delete("tasks", task.id);
			}
		}

		for (const subtask of subtasks) {
			if (subtask.id.startsWith("sample-")) {
				await db.delete("subtasks", subtask.id);
			}
		}

		for (const tab of tabs) {
			if (tab.id.startsWith("sample-")) {
				await db.delete("tabs", tab.id);
			}
		}

		for (const note of notes) {
			if (note.id.startsWith("sample-")) {
				await db.delete("notes", note.id);
			}
		}

		// Remove initialization flag
		await db.delete("settings", "sample_data_initialized");

		console.log("✓ Sample data cleared");
		return true;
	} catch (error) {
		console.error("Error clearing sample data:", error);
		return false;
	}
}
