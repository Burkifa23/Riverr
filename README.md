# Research Assistant

> An AI-powered research workspace with intelligent task management, note-taking, and productivity tracking for Chrome and Microsoft Word.

## Overview

Research Assistant is a comprehensive browser extension and Word add-in that transforms how you conduct research online. It automatically organizes your browsing sessions into tasks, tracks your productivity, enables rich annotations, and seamlessly integrates with Microsoft Word for citation management.

## Key Features

### Intelligent Task Management
- **Automatic Task Organization**: Group related tabs into color-coded tasks and subtasks
- **Chrome Tab Groups Integration**: Open entire research tasks with organized tab groups
- **Task Inference**: ML-powered suggestions for task classification (placeholder implementation)
- **Hierarchical Structure**: Tasks → Subtasks → Tabs with full metadata tracking

### Advanced Note-Taking & Annotations
- **Three Annotation Types** (based on academic research):
  - **Telegraphic Marks**: Highlights and underlines
  - **Explicit Notes**: Margin-style notes with full content
  - **Header/Footer Marks**: Structural annotations for titles and headings
- **Rich Text Notes**: Create, edit, and organize notes with tags and citations
- **Clips**: Save text excerpts directly from web pages
- **Context Menus**: Right-click to highlight, save clips, or add notes
- **Notes Sidebar**: Persistent sidebar for quick access to annotations

### Productivity Tracking
- **Dwell Time Tracking**: Monitor time spent on each tab
- **Scroll Depth Analysis**: Track how deeply you read content
- **Interaction Signals**: Count clicks, copies, keystrokes, and searches
- **Salience Scoring**: Calculate importance of tabs based on engagement
- **Productivity Metrics**: Comprehensive scoring algorithm for research quality
- **Session Logging**: Complete session replay with event buffering

### Research Workspace
- **Dashboard View**: Overview of active tasks, recent activity, quick stats, and inbox
- **Notes View**: Full-featured note editor with search and tag management
- **Graph View**: Visualize connections between tasks, notes, and sources (coming soon)
- **Replay View**: Session timeline for reviewing research journey (coming soon)
- **Global Search**: Find notes and tasks across your entire workspace

### Microsoft Word Integration
- **Word Add-in**: Access research notes directly from Word
- **Citation Insertion**: Insert notes with automatic citations
- **Task Linking**: Link Word documents to research tasks
- **Tabbed Interface**: Browse notes, tasks, and annotations
- **Shared Folder Sync**: Synchronize data between browser and Word

### Advanced Features
- **Tab Provenance Tracking**: Know where each tab came from (search, link, bookmark, etc.)
- **Visit History**: Track revisits and access patterns
- **Version History**: Track changes to notes and tasks (planned)
- **Archive Management**: Archive completed tasks and tabs
- **Inbox System**: Capture quick notes, screenshots, and voice memos
- **Graph & Canvas Coordinates**: Position items in knowledge graph and canvas views

##  Architecture

### System Overview

The Research Assistant consists of multiple interconnected components:

1. **Background Service Worker**: Central hub for data management, session logging, and task inference
2. **Content Scripts**: Injected into web pages to track interactions and enable annotations
3. **Workspace UI**: Full-featured research dashboard with multiple views
4. **Popup UI**: Quick access to common actions and stats
5. **Word Add-in**: Integration with Microsoft Word for citation management
6. **IndexedDB Storage**: Persistent storage for all research data


```mermaid
graph TB
    subgraph Browser["Chrome Browser"]
        BG[Background Service Worker]
        CS[Content Scripts]
        WS[Workspace UI]
        PP[Popup UI]
        LP[Left Panel]
        NS[Notes Sidebar]
    end
    
    subgraph Storage["Data Layer"]
        IDB[(IndexedDB)]
        TASKS[Tasks Store]
        NOTES[Notes Store]
        TABS[Tabs Store]
        SESSIONS[Sessions Store]
    end
    
    subgraph Word["Microsoft Word"]
        WA[Word Add-in]
        TP[Task Pane]
    end
    
    subgraph Web["Web Pages"]
        PAGE[Active Page]
        ANNOT[Annotations]
    end
    
    BG -->|Store/Retrieve| IDB
    IDB --> TASKS
    IDB --> NOTES
    IDB --> TABS
    IDB --> SESSIONS
    
    CS -->|Inject UI| PAGE
    CS -->|Track Events| BG
    CS -->|Create| ANNOT
    
    BG -->|Messages| CS
    BG -->|Messages| WS
    BG -->|Messages| PP
    
    WS -->|Query Data| BG
    PP -->|Actions| BG
    LP -->|Manage Tasks| BG
    NS -->|Save Notes| BG
    
    WA -.->|Sync Data| IDB
    WA -->|Insert Citations| TP
    
    PAGE -->|User Interactions| CS

    style BG fill:#3B82F6,color:#fff
    style IDB fill:#10B981,color:#fff
    style WA fill:#F59E0B,color:#fff
    style CS fill:#8B5CF6,color:#fff
```


### Chrome Extension Structure
```
research-assistant-extension/
├── background/
│   ├── service-worker.js      # Main background service worker
│   ├── session-logger.js      # Session tracking and event logging
│   └── task-inference.js      # ML-based task classification
├── content/
│   ├── content-script.js      # Injected into web pages
│   ├── content-styles.css     # Styles for injected UI
│   ├── notes-popup.html/js    # Note creation popup
│   ├── notes-sidebar.html     # Sidebar for annotations
│   ├── left-panel.html/js     # Task management panel
│   └── salience-strip.js      # Visual salience indicators
├── workspace/
│   ├── workspace.html         # Main workspace interface
│   ├── workspace.css          # Workspace styles
│   └── workspace.js           # Workspace logic and views
├── popup/
│   ├── popup.html             # Extension popup
│   ├── popup.css              # Popup styles
│   └── popup.js               # Popup actions
├── models/
│   ├── tasks.js               # Task data model
│   ├── notes.js               # Note data model
│   ├── tabs.js                # Tab data model
│   ├── annotations.js         # Annotation data model
│   └── files.js               # File data model
├── lib/
│   ├── storage.js             # IndexedDB storage interface
│   ├── sync.js                # Cross-component synchronization
│   ├── sample-data.js         # Demo data initialization
│   ├── constants.js           # Shared constants
│   ├── utils.js               # Utility functions
│   └── ml-classifier.js       # ML classification utilities
└── manifest.json              # Extension configuration
```

### Word Add-in Structure
```
word-addin/
├── src/
│   ├── taskpane/
│   │   ├── taskpane.html      # Add-in interface
│   │   ├── taskpane.css       # Add-in styles
│   │   ├── taskpane.js        # Add-in logic
│   │   └── data-reader.js     # Data synchronization
│   └── commands/
│       └── commands.js        # Word commands
└── manifest.xml               # Add-in configuration
```

## Installation

### Chrome Extension

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/Riverr.git
   cd Riverr
   ```

2. **Load the extension in Chrome**:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `research-assistant-extension` folder

3. **Grant permissions**: The extension will request permissions for:
   - Storage, tabs, tab groups, history
   - Active tab, scripting, side panel
   - Context menus, web navigation, idle detection

### Word Add-in

1. **Open Word** and go to Insert → Get Add-ins
2. **Upload the manifest**: Use "Upload My Add-in" and select `word-addin/manifest.xml`
3. **Configure shared folder**: Set the path to sync data with the browser extension

## Usage

### Quick Start Guide

1. **Install the extension** following the installation instructions above
2. **Open the workspace** by clicking the extension icon and selecting "Open Workspace"
3. **Create your first task**:
   - Click "New Task" in the popup or workspace
   - Give it a name and color
   - Start browsing - tabs will be tracked automatically
4. **Take notes**:
   - Select text on any page and right-click → "Add Note"
   - Or use `Ctrl+Shift+N` to open the notes sidebar
   - Create highlights, clips, or full notes
5. **Organize your research**:
   - View all tasks in the Dashboard
   - Search notes in the Notes view
   - Open entire tasks with organized tab groups
6. **Use in Word** (optional):
   - Install the Word add-in
   - Access your notes from the task pane
   - Insert citations directly into your document

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+R` (Mac: `Cmd+Shift+R`) | Open extension popup |
| `Ctrl+Shift+N` (Mac: `Cmd+Shift+N`) | Toggle notes sidebar |
| `Ctrl+Shift+S` (Mac: `Cmd+Shift+S`) | Quick save current page |
| `Ctrl+Shift+W` (Mac: `Cmd+Shift+W`) | Open research workspace |

### Context Menu Actions

Right-click on selected text to:
- **Save as Clip**: Save selection as a quick clip
- **Add Note**: Create a note with the selected text
- **Highlight (Yellow)**: Highlight the selected text

### Workspace Views

1. **Dashboard**: See all active tasks, recent activity, quick stats, and inbox items
2. **Notes**: Browse, search, and edit all your research notes
3. **Graph**: Visualize relationships (coming soon)
4. **Replay**: Review your research timeline (coming soon)

##  Use Cases

### For Researchers
- Track multiple research projects simultaneously
- Organize papers, articles, and web sources by topic
- Create annotated bibliographies with automatic citation tracking
- Review research sessions to understand your reading patterns

### For Students
- Manage coursework across multiple subjects
- Take notes directly on web-based readings
- Build a personal knowledge base of study materials
- Track time spent on different assignments

### For Writers
- Collect research for articles or books
- Save quotes and excerpts with source tracking
- Organize research by chapter or section
- Export notes to Word with citations

### For Knowledge Workers
- Organize competitive research
- Track industry news and trends
- Build a searchable knowledge repository
- Share research findings with team (via Word integration)

## Data Models

### Task Model
Tasks are the top-level organizational unit with the following properties:
- **Hierarchy**: Tasks contain subtasks, subtasks contain tabs
- **Metadata**: Total time spent, tab count, note count, last session
- **Attributes**: Title, color, priority, tags, links
- **Tracking**: Created/updated/accessed timestamps, version history
- **Metrics**: Salience score, productivity score, archive history
- **Positioning**: Graph coordinates, canvas coordinates

### Note Model
Notes capture your research insights:
- **Types**: Regular notes, clips (excerpts), annotations
- **Content**: Title, content, excerpt, tags
- **Relationships**: Linked to tasks, subtasks, tabs, other notes, files
- **Metadata**: Citations count, todo status, pinned status
- **Tracking**: Created/updated/accessed timestamps

### Tab Model
Tabs represent web pages with rich metadata:
- **Basic Info**: URL, title, favicon
- **Provenance**: Source (search, link, bookmark, direct), source URL, timestamp
- **Engagement**: Dwell history, visit count, scroll depth
- **Interactions**: Clicks, copies, searches, keystrokes
- **Metrics**: Salience score, productivity score
- **Session Data**: Chrome tab ID, group ID

### Annotation Model
Three types based on academic research (CC Marshall):
1. **Telegraphic Marks**: Highlights, underlines, circles
2. **Explicit Notes**: Margin-style notes with full content
3. **Header/Footer Marks**: Structural annotations for titles

## 🔧 Technical Details

### Storage
- **IndexedDB**: Primary storage for all data (tasks, notes, tabs, annotations, sessions)
- **Object Stores**: Separate stores for each data type
- **Event Buffering**: Session events buffered (50 events) and flushed every 5 seconds
- **Limits**: Max 10,000 session events, 500 notes per task

### Productivity Scoring Algorithm
The productivity score (0-1) is calculated based on:
- **Dwell Time** (30%): Time spent on page (capped at 30 minutes)
- **Scroll Depth** (20%): How far down the page you scrolled
- **Annotations** (30%): Number of highlights/notes created (capped at 5)
- **Notes** (30%): Number of notes created (capped at 3)

### Session Logging
Complete event tracking for session replay:
- **Event Types**: Tab open/close/switch, note created, annotation created, task created
- **Enrichment**: Viewport info, device info, browser info
- **Buffering**: Events buffered and batch-inserted to IndexedDB
- **Metadata**: Session ID, timestamps, event counts

### Synchronization
- **Cross-Component Sync**: Background ↔ Content Scripts ↔ Workspace ↔ Word Add-in
- **Message Passing**: Chrome runtime messaging for communication
- **Broadcast Updates**: Changes propagated to all active components
- **File System Integration**: Planned for Word add-in data sharing

##  UI Components

### Injected Elements
- **Notes Sidebar**: Slide-in panel on the right with annotation tools
- **Salience Strip**: Visual indicator of page importance (placeholder)
- **Left Panel**: Task management panel (iframe-based)
- **Note Popup**: Modal for creating/editing notes
- **Annotation Menu**: Context menu for text selection actions

### Workspace Interface
- **Top Navigation**: View tabs (Dashboard, Notes, Graph, Replay)
- **Global Search**: Search across all notes and tasks
- **Dashboard Cards**: Task previews, recent activity, quick stats, inbox
- **Note Editor**: Full-featured editor with tags, citations, metadata
- **Settings Panel**: Configuration options (placeholder)

##  Permissions

The extension requires the following Chrome permissions:
- **storage**: Store tasks, notes, and settings
- **tabs**: Monitor and manage browser tabs
- **tabGroups**: Create and manage tab groups
- **history**: Track tab provenance
- **activeTab**: Access current tab content
- **scripting**: Inject content scripts
- **sidePanel**: Display side panel UI
- **alarms**: Schedule periodic tasks
- **contextMenus**: Add right-click menu options
- **webNavigation**: Track navigation events
- **idle**: Detect user idle state
- **host_permissions** (`<all_urls>`): Access all websites for annotation

## Current Status & TODOs

### Implemented Features 
- Task and subtask management
- Chrome tab groups integration
- Note creation and editing
- Annotations (highlights, clips, notes)
- Context menus and keyboard shortcuts
- Session logging and productivity tracking
- Workspace dashboard and notes view
- Word add-in basic integration
- Sample data for demos

### In Progress / Planned 
- Graph view for knowledge visualization
- Session replay timeline
- ML-based task inference (currently placeholder)
- Shadow DOM for content injection
- File system integration for Word sync
- Version history tracking
- Archive manager with bookmarks API
- Improved session management for crash recovery
- Better productivity metric calculations
- Constants for event types (refactoring needed)

### Known Issues 
- `navigator.platform` is deprecated (needs replacement)
- Intermittent database request issues
- `initializeWorkspace()` is commented out in workspace.js
- Sample data loading may need refinement
- Notes sidebar injection could use shadow DOM

## 🔍 Comparison with Other Tools

| Feature | Research Assistant | Notion | Zotero | OneNote |
|---------|-------------------|--------|--------|---------|
| Browser Tab Management | ✅ Chrome Tab Groups | ❌ | ❌ | ❌ |
| Automatic Tab Tracking | ✅ | ❌ | ❌ | ❌ |
| Web Annotations | ✅ In-page highlights | ⚠️ Web clipper | ❌ | ⚠️ Web clipper |
| Productivity Metrics | ✅ Dwell time, scroll depth | ❌ | ❌ | ❌ |
| Session Replay | 🚧 Coming soon | ❌ | ❌ | ❌ |
| Knowledge Graph | 🚧 Coming soon | ⚠️ Databases | ❌ | ❌ |
| Word Integration | ✅ Native add-in | ⚠️ Export | ✅ Plugin | ✅ Native |
| Citation Management | ⚠️ Basic | ❌ | ✅ Advanced | ❌ |
| Offline Support | ✅ IndexedDB | ⚠️ Limited | ✅ | ✅ |
| Open Source | ✅ | ❌ | ✅ | ❌ |

##  Tips & Best Practices

### Organizing Your Research
- **Use descriptive task names**: Make it easy to find tasks later
- **Color-code by project**: Use consistent colors for related research
- **Tag liberally**: Tags make notes searchable and discoverable
- **Link related notes**: Build connections between ideas
- **Archive completed tasks**: Keep your workspace clean

### Maximizing Productivity Tracking
- **Let tabs dwell**: The extension tracks time automatically
- **Scroll through content**: Scroll depth indicates engagement
- **Create annotations**: Highlights and notes boost productivity scores
- **Review your metrics**: Check the dashboard to understand your patterns

### Note-Taking Strategies
- **Use clips for quotes**: Save exact text with automatic source tracking
- **Write synthesis notes**: Create your own notes to process information
- **Highlight key passages**: Quick visual markers for important content
- **Add context to highlights**: Combine highlights with margin notes

### Word Integration Workflow
1. Conduct research in the browser with the extension
2. Create and organize notes as you read
3. Open Word and launch the Research Assistant add-in
4. Search and insert notes with citations
5. Link the document to your research task for future reference

##  Contributing

Contributions are welcome! This project is in active development.

### Development Setup
1. Clone the repository
2. Make changes to the extension or Word add-in
3. Test in Chrome (load unpacked) or Word (upload manifest)
4. Submit a pull request

### Code Structure Guidelines
- Follow existing file organization
- Use JSDoc comments for type definitions
- Keep data models in `models/` directory
- Separate UI logic from data logic
- Use constants from `lib/constants.js`

### Areas for Contribution
- **ML Task Inference**: Implement actual machine learning for task classification
- **Graph Visualization**: Build the knowledge graph view with D3.js or similar
- **Session Replay**: Create timeline visualization for research sessions
- **Mobile Support**: Extend to mobile browsers
- **Export Features**: Add export to Markdown, PDF, or other formats
- **Collaboration**: Multi-user features and sharing
- **Performance**: Optimize for large datasets (1000+ notes)

##  FAQ

### Does this work with other browsers?
Currently, the extension is built for Chrome using Manifest V3. Support for Edge, Brave, and other Chromium-based browsers should work with minimal changes. Firefox support would require porting to their extension API.

### How is my data stored?
All data is stored locally in your browser using IndexedDB. Nothing is sent to external servers. The Word add-in can optionally sync via a shared folder you configure.

### Can I export my notes?
Export functionality is planned but not yet implemented. You can currently access notes via the Word add-in or directly from IndexedDB.

### What happens to my data if I uninstall?
Uninstalling the extension will remove all stored data. Make sure to export important notes before uninstalling (once export is implemented).

### Does this track my browsing history?
The extension only tracks tabs you open while it's active and only stores metadata (URL, title, time spent). It does not track browsing on excluded sites (YouTube, Gmail, etc.).

### Can I use this for collaborative research?
Currently, the extension is single-user. Collaboration features are planned for future releases.

### How does the productivity score work?
The score combines dwell time (30%), scroll depth (20%), annotations created (30%), and notes created (30%). Higher engagement = higher score.

### Is this free?
Yes, this is an open-source research project. There are no paid features or subscriptions.

##  Academic Foundation

The annotation system is based on research from:
- **"Annotation: The Core of Active Reading"** by CC Marshall
- Implements three primary annotation types observed in academic reading
- Focuses on active reading and knowledge construction

## Roadmap

### Version 1.0 (Current)
- Core task and note management
- Basic annotations and highlights
- Chrome tab groups integration
- Word add-in foundation

### Version 1.5 (Next)
- Knowledge graph visualization
- Session replay timeline
- Export to Markdown/PDF
- Improved ML task inference
- Shadow DOM for better isolation

### Version 2.0 (Future)
- Real-time collaboration
- Mobile browser support
- Advanced citation management
- Integration with reference managers (Zotero, Mendeley)
- Cloud sync (optional)
- Browser extension for Firefox/Safari


## Authors

- Mendjemo Gerard

## Acknowledgments

- Chrome Extensions API documentation
- Microsoft Office Add-ins framework
- Academic research on active reading and annotation systems