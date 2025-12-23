// session-logger.js - Comprehensive session logging for replay functionality
// Tracks every user interaction for complete session reconstruction

export class SessionLogger {
	constructor() {
		this.currentSession = null;
		this.dwellTimers = new Map(); // tabId -> { start: timestamp, intervals: [] }
		this.eventBuffer = [];
		this.bufferSize = 50;
		this.flushInterval = 5000; // Flush every 5 seconds
		this.startFlushTimer();
	}

	// ============================================================================
	// SESSION MANAGEMENT
	// ============================================================================

	async startSession(sessionId) {
		this.currentSession = {
			id: sessionId,
			startTime: Date.now(),
			endTime: null,
			deviceInfo: await this.getDeviceInfo(),
			browserInfo: this.getBrowserInfo(),
			eventsCount: 0,
		};

		// Save session metadata
		await this.saveToStorage("sessions", this.currentSession);
		console.log("Session started:", sessionId);
	}

	// TODO: when browser/tab/computer closes or crashes, this should be immeditaely called
	async endSession() {
		if (!this.currentSession) return;

		this.currentSession.endTime = Date.now();
		this.currentSession.duration =
			this.currentSession.endTime - this.currentSession.startTime;

		// Flush any remaining events
		await this.flushEventBuffer();

		// Update session metadata
		await this.updateInStorage("sessions", this.currentSession);
		console.log("Session ended:", this.currentSession.id);
	}

	// ============================================================================
	// EVENT LOGGING
	// ============================================================================

	async logEvent(event) {
		if (!this.currentSession) {
			console.warn("No active session for logging event");
			return;
		}

		const enrichedEvent = {
			id: this.generateUUID(),
			sessionId: this.currentSession.id,
			timestamp: Date.now(),
			...event,
			metadata: {
				viewport: await this.getViewport(),
				...event.metadata,
			},
		};

		this.eventBuffer.push(enrichedEvent);
		this.currentSession.eventsCount++;

		// Flush if buffer is full
		if (this.eventBuffer.length >= this.bufferSize) {
			await this.flushEventBuffer();
		}

		return enrichedEvent;
	}

	async flushEventBuffer() {
		if (this.eventBuffer.length === 0) return;

		try {
			// Batch insert into IndexedDB
			const eventsToFlush = [...this.eventBuffer];
			this.eventBuffer = [];

			for (const event of eventsToFlush) {
				await this.saveToStorage("sessionEvents", event);
			}

			console.log(`Flushed ${eventsToFlush.length} events to storage`);
		} catch (error) {
			console.error("Error flushing event buffer:", error);
			// Re-add events to buffer if flush failed
			this.eventBuffer = [...this.eventBuffer, ...eventsToFlush];
		}
	}

	startFlushTimer() {
		setInterval(() => {
			this.flushEventBuffer();
		}, this.flushInterval);
	}

	// ============================================================================
	// DWELL TIME TRACKING
	// ============================================================================

	async startDwellTime(tabId) {
		const now = Date.now();

		if (this.dwellTimers.has(tabId)) {
			// Resume existing timer
			const timer = this.dwellTimers.get(tabId);
			timer.start = now;
		} else {
			// Create new timer
			this.dwellTimers.set(tabId, {
				start: now,
				intervals: [],
			});
		}

		await this.logEvent({
			eventType: "dwell_start", // TODO: eventTypes.DWELL_START same as constants
			tabId,
			data: { timestamp: now },
		});
	}

	async endDwellTime(tabId) {
		if (!this.dwellTimers.has(tabId)) return;

		const now = Date.now();
		const timer = this.dwellTimers.get(tabId);
		const duration = now - timer.start;

		// Record interval
		timer.intervals.push({
			start: timer.start,
			end: now,
			duration,
		});

		await this.logEvent({
			eventType: "dwell_end", // TODO: eventTypes.DWELL_END same as constants, do same with all other logEvents (subsequently classifying this as logEvents instead of eventType)
			tabId,
			data: {
				timestamp: now,
				duration,
				totalDwell: this.getTotalDwellTime(tabId),
			},
		});

		// Update tab dwell history in storage
		await this.updateTabDwellHistory(tabId, timer.intervals);
	}

	// TODO: when browser/tab/computer closes or crashes, this should be immeditaely called
	async endAllDwellTimes() {
		const activeTabIds = Array.from(this.dwellTimers.keys());
		for (const tabId of activeTabIds) {
			await this.endDwellTime(tabId);
		}
	}

	getTotalDwellTime(tabId) {
		if (!this.dwellTimers.has(tabId)) return 0;

		const timer = this.dwellTimers.get(tabId);
		return timer.intervals.reduce(
			(sum, interval) => sum + interval.duration,
			0
		);
	}

	// ============================================================================
	// INTERACTION SIGNAL TRACKING
	// ============================================================================

	async trackScroll(tabId, scrollData) {
		await this.logEvent({
			eventType: "scroll",
			tabId,
			data: {
				scrollTop: scrollData.scrollTop,
				scrollHeight: scrollData.scrollHeight,
				clientHeight: scrollData.clientHeight,
				scrollDepth:
					scrollData.scrollTop /
					(scrollData.scrollHeight - scrollData.clientHeight),
				timestamp: Date.now(),
			},
		});

		// Update tab scroll depth
		await this.updateTabScrollDepth(tabId, scrollData);
	}

	async trackClick(tabId, clickData) {
		await this.logEvent({
			eventType: "click",
			tabId,
			data: {
				x: clickData.x,
				y: clickData.y,
				target: clickData.target,
				tagName: clickData.tagName,
				classList: clickData.classList,
				timestamp: Date.now(),
			},
		});

		// Increment click count for interaction signals
		await this.incrementInteractionSignal(tabId, "clicks");
	}

	async trackCopy(tabId, copyData) {
		await this.logEvent({
			eventType: "copy",
			tabId,
			data: {
				text: copyData.text.substring(0, 200), // Truncate long text
				textLength: copyData.text.length,
				timestamp: Date.now(),
			},
		});

		await this.incrementInteractionSignal(tabId, "copies");
	}

	async trackPaste(tabId, pasteData) {
		await this.logEvent({
			eventType: "paste",
			tabId,
			data: {
				text: pasteData.text.substring(0, 200),
				textLength: pasteData.text.length,
				target: pasteData.target,
				timestamp: Date.now(),
			},
		});
	}

	async trackKeyboard(tabId, keyData) {
		await this.logEvent({
			eventType: "keyboard",
			tabId,
			data: {
				key: keyData.key,
				keyCode: keyData.keyCode,
				ctrlKey: keyData.ctrlKey,
				shiftKey: keyData.shiftKey,
				altKey: keyData.altKey,
				timestamp: Date.now(),
			},
		});

		await this.incrementInteractionSignal(tabId, "keystrokes");
	}

	async trackSearch(tabId, searchQuery) {
		await this.logEvent({
			eventType: "search",
			tabId,
			data: {
				query: searchQuery,
				timestamp: Date.now(),
			},
		});

		await this.addSearchQuery(tabId, searchQuery);
	}

	async trackAnnotation(tabId, annotationData) {
		await this.logEvent({
			eventType: "annotation_created",
			tabId,
			data: {
				annotationId: annotationData.id,
				type: annotationData.type,
				selectedText: annotationData.selectedText,
				color: annotationData.color,
				timestamp: Date.now(),
			},
		});
	}

	async trackNoteCreation(noteId, noteData) {
		await this.logEvent({
			eventType: "note_created",
			tabId: noteData.sourceTabId,
			data: {
				noteId,
				type: noteData.type,
				title: noteData.title,
				taskId: noteData.taskId,
				timestamp: Date.now(),
			},
		});
	}

	async trackNoteUpdate(noteId, updates) {
		await this.logEvent({
			eventType: "note_updated",
			data: {
				noteId,
				updates,
				timestamp: Date.now(),
			},
		});
	}

	async trackTaskCreation(taskId, taskData) {
		await this.logEvent({
			eventType: "task_created",
			data: {
				taskId,
				title: taskData.title,
				color: taskData.color,
				timestamp: Date.now(),
			},
		});
	}

	async trackTaskUpdate(taskId, updates) {
		await this.logEvent({
			eventType: "task_updated",
			data: {
				taskId,
				updates,
				timestamp: Date.now(),
			},
		});
	}

	async trackTabAssignment(tabId, taskId, subtaskId) {
		await this.logEvent({
			eventType: "tab_assigned",
			tabId,
			data: {
				taskId,
				subtaskId,
				timestamp: Date.now(),
			},
		});
	}

	async trackLinkCreation(sourceId, targetId, linkType) {
		await this.logEvent({
			eventType: "link_created",
			data: {
				sourceId,
				targetId,
				linkType,
				timestamp: Date.now(),
			},
		});
	}

	// ============================================================================
	// SESSION REPLAY DATA RETRIEVAL
	// ============================================================================

	async getSessionReplay(sessionId, options = {}) {
		const {
			startTime = 0,
			endTime = Date.now(),
			eventTypes = null, // Filter by specific event types
			tabId = null, // Filter by specific tab
		} = options;

		// Query session events
		let events = await this.getSessionEvents(sessionId);

		// Apply filters
		events = events.filter((event) => {
			if (event.timestamp < startTime || event.timestamp > endTime)
				return false;
			if (eventTypes && !eventTypes.includes(event.eventType))
				return false;
			if (tabId && event.tabId !== tabId) return false;
			return true;
		});

		// Sort by timestamp
		events.sort((a, b) => a.timestamp - b.timestamp);

		// Enrich with additional context
		const enrichedEvents = await this.enrichReplayEvents(events);

		return {
			sessionId,
			startTime,
			endTime,
			eventsCount: enrichedEvents.length,
			events: enrichedEvents,
		};
	}

	async enrichReplayEvents(events) {
		// Add context like task names, note titles, etc.
		return Promise.all(
			events.map(async (event) => {
				const enriched = { ...event };

				// Add task info if present
				if (event.data?.taskId) {
					const task = await this.getFromStorage(
						"tasks",
						event.data.taskId
					);
					enriched.taskInfo = task
						? { title: task.title, color: task.color }
						: null;
				}

				// Add tab info if present
				if (event.tabId) {
					const tab = await this.getTabInfo(event.tabId);
					enriched.tabInfo = tab
						? { title: tab.title, url: tab.url }
						: null;
				}

				return enriched;
			})
		);
	}

	async getSessionTimeline(sessionId) {
		const events = await this.getSessionEvents(sessionId);

		// Group events by time buckets (e.g., every 5 minutes)
		const bucketSize = 5 * 60 * 1000; // 5 minutes
		const timeline = {};

		events.forEach((event) => {
			const bucket =
				Math.floor(event.timestamp / bucketSize) * bucketSize;
			if (!timeline[bucket]) {
				timeline[bucket] = {
					timestamp: bucket,
					events: [],
					eventCounts: {},
				};
			}
			timeline[bucket].events.push(event);
			timeline[bucket].eventCounts[event.eventType] =
				(timeline[bucket].eventCounts[event.eventType] || 0) + 1;
		});

		return Object.values(timeline).sort(
			(a, b) => a.timestamp - b.timestamp
		);
	}

	// ============================================================================
	// PRODUCTIVITY METRICS
	// ============================================================================

	// TODO: The todo on tab salience and productivity calculation, please refer to this function
	async calculateProductivityMetrics(tabId) {
		const dwellTime = this.getTotalDwellTime(tabId);
		const signals = await this.getInteractionSignals(tabId);
		const annotations = await this.getAnnotationCount(tabId);
		const notes = await this.getNoteCount(tabId);

		// Productivity score based on engagement
		let productivityScore = 0;

		// Time spent (normalized, max 30 minutes = 1.0)
		const timeScore = Math.min(dwellTime / (30 * 60 * 1000), 1.0);
		productivityScore += timeScore * 0.2;

		// Scroll depth
		const scrollScore = signals.scrollDepth || 0;
		productivityScore += scrollScore * 0.2;

		// Annotations created
		const annotationScore = Math.min(annotations / 5, 1.0);
		productivityScore += annotationScore * 0.3;

		// Notes created
		const noteScore = Math.min(notes / 3, 1.0);
		productivityScore += noteScore * 0.3;

		return {
			productivityScore,
			dwellTime,
			scrollDepth: signals.scrollDepth,
			annotations,
			notes,
			clicks: signals.clicks,
			copies: signals.copies,
		};
	}

	// ============================================================================
	// STORAGE HELPERS
	// ============================================================================

	async saveToStorage(storeName, item) {
		// This would interface with IndexedDB via the storage.js module
		// Placeholder implementation
		console.log(`Saving to ${storeName}:`, item.id);
	}

	async getFromStorage(storeName, id) {
		// Placeholder
		return null;
	}

	async updateInStorage(storeName, item) {
		// Placeholder
		console.log(`Updating in ${storeName}:`, item.id);
	}

	async getSessionEvents(sessionId) {
		// Placeholder - would query IndexedDB
		return [];
	}

	async updateTabDwellHistory(tabId, intervals) {
		// Placeholder
		console.log(
			`Updating dwell history for tab ${tabId}:`,
			intervals.length
		);
	}

	async updateTabScrollDepth(tabId, scrollData) {
		// Placeholder
		console.log(`Updating scroll depth for tab ${tabId}`);
	}

	async incrementInteractionSignal(tabId, signal) {
		// Placeholder
		console.log(`Incrementing ${signal} for tab ${tabId}`);
	}

	async addSearchQuery(tabId, query) {
		// Placeholder
		console.log(`Adding search query for tab ${tabId}:`, query);
	}

	async getInteractionSignals(tabId) {
		// Placeholder
		return {
			clicks: 0,
			copies: 0,
			scrollDepth: 0,
			keystrokes: 0,
		};
	}

	async getAnnotationCount(tabId) {
		// Placeholder
		return 0;
	}

	async getNoteCount(tabId) {
		// Placeholder
		return 0;
	}

	async getTabInfo(tabId) {
		// Placeholder
		return null;
	}

	// ============================================================================
	// UTILITY FUNCTIONS
	// ============================================================================

	async getDeviceInfo() {
		return {
			platform: navigator.platform, // TODO: deprecated
			userAgent: navigator.userAgent,
			language: navigator.language,
			screenResolution: {
				width: screen?.width || 0,
				height: screen?.height || 0,
			},
		};
	}

	// TODO: will have to enhance this version to get browser info as we extend the extension beyond chrome
	getBrowserInfo() {
		return {
			name: "Chrome",
			version:
				navigator.userAgent.match(/Chrome\/(\d+)/)?.[1] || "unknown",
		};
	}

	// TODO: by passing the tab id, we could easily get ts right?
	async getViewport() {
		try {
			const tabs = await chrome.tabs.query({
				active: true,
				currentWindow: true,
			});
			if (tabs[0]) {
				return {
					width: tabs[0].width,
					height: tabs[0].height,
				};
			}
		} catch (e) {
			console.error("Error getting viewport:", e);
		}
		return { width: 0, height: 0 };
	}

	// TODO: same as other UUID generator in service-worker.js
	generateUUID() {
		return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
			const r = (Math.random() * 16) | 0;
			const v = c === "x" ? r : (r & 0x3) | 0x8;
			return v.toString(16);
		});
	}
}
