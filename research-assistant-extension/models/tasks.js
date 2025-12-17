/**
 * @typedef {Object} Task
 * - A task has no parent, while a subtask does.
 * - A task with no sub tasks will have tabs and links directly linked to it and behave as both a subtask and a task
 *
 * @property {String} id
 * @property {String} title
 * @property {String} color
 * @property {Task[]} subTasks
 * @property {Task} parent
 * @property {number} priority
 * @property {Object.<String, (Object|String|number)} metaData // For now let's give it raw
 * @property {number} order
 * @property {Tab[]} tabs // TODO: [GLOBAL]  Using an array when there are going ot be many insertions and deletions might not be the best way
 *
 * @property {Tag[]} tags
 * @property {Link[]} links // model links (for now) or citations (TODO: future)
 * // property {} annotations // Already handled in links
 * // property {} isPinned // TODO: Pinned is determined by task/subtask/file/inbox/notespace associated to
 * @property {Todo} TodoStatus
 *
 * @property {GraphPositions} graphPositions // TODO: Should probably be stored in personal knowledge graph workspace
 * @property {CanvasPositions} canvasPositions // TODO: Should probably be stored in open canvas workspace
 *
 * @property {number} createdAt
 * @property {number} updatedAt
 * @property {number} accessedAt
 * @property {VersionHistory} versionHistory // TODO: should probably be stored in version control manager. Interface with this property and concrete methods to retrieve/display it cleanly (could be retrieved from DB/provided History type/interface for instance)
 *
 * @property {Salience} salience // dedicated type // for CalculateMetrics interface
 * @property {Productivity} productivity // interface // for CalculateMetrics interface
 * @property {ArchiveHistory} // getLastArchived, isArchived, archivedAt // Should probably be handled in archive manager. interface ... bla bla. In addition, could leverage the bookmarks api from chrome to molest this part properly. i.e, could have a dedicated type Archive
 *
 * @property {VisitHistory} // getVisitCount && getlastVisited // TODO: could have some kind of functionality extension but I digress for now
 */

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
];
