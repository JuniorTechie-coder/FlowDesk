import { useEffect, useState, useMemo } from "react";
import { API_BASE } from "../config";
import { useToast } from "../toast-context";
import { useNavigation } from "../navigation-context";
import {
    Plus,
    ArrowLeft,
    Trash2,
    Layout,
    Search,
    ChevronRight,
    Sparkles,
    Check,
    Palette
} from "lucide-react";

const THEME_PRESETS = [
    {
        id: "theme-sunset",
        name: "Sunset Pink",
        gradient: "linear-gradient(135deg, #f43f5e 0%, #ec4899 40%, #a855f7 100%)",
        colorClass: "sunset",
    },
    {
        id: "theme-ocean",
        name: "Ocean Blue",
        gradient: "linear-gradient(135deg, #0284c7 0%, #06b6d4 50%, #3b82f6 100%)",
        colorClass: "ocean",
    },
    {
        id: "theme-magenta",
        name: "Neon Magenta",
        gradient: "linear-gradient(135deg, #ff78cb 0%, #c377e0 50%, #6366f1 100%)",
        colorClass: "magenta",
    },
    {
        id: "theme-midnight",
        name: "Midnight Violet",
        gradient: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)",
        colorClass: "midnight",
    },
    {
        id: "theme-emerald",
        name: "Emerald Forest",
        gradient: "linear-gradient(135deg, #059669 0%, #10b981 50%, #14b8a6 100%)",
        colorClass: "emerald",
    },
    {
        id: "theme-amber",
        name: "Amber Flame",
        gradient: "linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #ef4444 100%)",
        colorClass: "amber",
    },
];

function Board() {
    const toast = useToast();
    const { navigateTo } = useNavigation();
    const [boards, setBoards] = useState([]);
    const [workspace, setWorkspace] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Add Board modal states
    const [showModal, setShowModal] = useState(false);
    const [boardName, setBoardName] = useState("");
    const [selectedTheme, setSelectedTheme] = useState(THEME_PRESETS[0].id);
    const [creating, setCreating] = useState(false);
    const [deletingBoardId, setDeletingBoardId] = useState(null);

    // Extract workspace ID from URL: /boards/:id
    const workspaceId = window.location.pathname.split("/")[2];

    useEffect(() => {
        let cancelled = false;

        async function fetchWorkspaceAndBoards() {
            try {
                const token = localStorage.getItem("token");

                // Fetch workspace info
                const wsRes = await fetch(`${API_BASE}/workspaces/${workspaceId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (wsRes.ok) {
                    const wsData = await wsRes.json();
                    if (!cancelled) setWorkspace(wsData);
                }

                // Fetch boards
                const boardsRes = await fetch(
                    `${API_BASE}/boards/workspace/${workspaceId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                const boardsData = await boardsRes.json();
                if (!boardsRes.ok) {
                    throw new Error(boardsData.error || "Failed to fetch boards");
                }

                if (!cancelled) setBoards(Array.isArray(boardsData) ? boardsData : []);
            } catch (error) {
                console.error("Error fetching boards:", error);
                toast.error(error.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchWorkspaceAndBoards();
        return () => {
            cancelled = true;
        };
    }, [workspaceId]);

    // Close modal on Escape
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && showModal) {
                setShowModal(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [showModal]);

    // POST new board
    async function handleCreateBoard(e) {
        e.preventDefault();

        if (!boardName.trim()) {
            toast.error("Board name is required!");
            return;
        }

        try {
            setCreating(true);
            const token = localStorage.getItem("token");

            const response = await fetch(`${API_BASE}/boards`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: boardName.trim(),
                    background: selectedTheme,
                    workspace_id: Number(workspaceId),
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to create board");
            }

            setBoards((prev) => [...prev, data]);
            setBoardName("");
            setSelectedTheme(THEME_PRESETS[0].id);
            setShowModal(false);
            toast.success(`Board "${data.name}" created!`);
        } catch (error) {
            console.error("Error creating board:", error);
            toast.error(error.message);
        } finally {
            setCreating(false);
        }
    }

    // Delete Board
    async function handleDeleteBoard(boardId, name, e) {
        e.stopPropagation();
        if (!window.confirm(`Are you sure you want to delete board "${name}"?`)) {
            return;
        }

        try {
            setDeletingBoardId(boardId);
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_BASE}/boards/${boardId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || "Failed to delete board");
            }

            setBoards((prev) => prev.filter((b) => b.id !== boardId));
            toast.success("Board deleted");
        } catch (error) {
            console.error("Error deleting board:", error);
            toast.error(error.message);
        } finally {
            setDeletingBoardId(null);
        }
    }

    // Helper to get background styling
    function getBoardGradient(bg) {
        const found = THEME_PRESETS.find((p) => p.id === bg || p.name.toLowerCase() === (bg || "").toLowerCase());
        if (found) return found.gradient;
        if (bg && (bg.startsWith("#") || bg.startsWith("linear-gradient"))) return bg;
        return THEME_PRESETS[0].gradient;
    }

    // Filter boards
    const filteredBoards = useMemo(() => {
        if (!searchQuery.trim()) return boards;
        const q = searchQuery.toLowerCase();
        return boards.filter((b) => b.name && b.name.toLowerCase().includes(q));
    }, [boards, searchQuery]);

    return (
        <div className="workspace-app-layout">
            {/* Top Navigation */}
            <header className="workspace-navbar">
                <div className="workspace-nav-left">
                    <div className="workspace-logo" onClick={() => navigateTo("/workspace")}>
                        <div className="logo-icon-box">
                            <Layout size={18} color="#fff" />
                        </div>
                        <span className="logo-text">FlowDesk</span>
                    </div>

                    {/* Breadcrumbs */}
                    <nav className="breadcrumbs-nav" aria-label="Breadcrumb">
                        <button
                            className="breadcrumb-item"
                            onClick={() => navigateTo("/workspace")}
                        >
                            Workspaces
                        </button>
                        <ChevronRight size={14} className="breadcrumb-separator" />
                        <span className="breadcrumb-active">
                            {workspace?.name || "Workspace"}
                        </span>
                    </nav>
                </div>

                <div className="workspace-nav-right">
                    <button
                        className="ghost-btn icon-text-btn"
                        onClick={() => navigateTo("/workspace")}
                    >
                        <ArrowLeft size={15} />
                        <span>All Workspaces</span>
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="workspace-main-container">
                {/* Header Strip */}
                <div className="workspace-header-strip">
                    <div className="workspace-header-text">
                        <div className="workspace-greeting">
                            <Sparkles size={16} className="sparkle-icon" />
                            <span>Workspace Boards</span>
                        </div>
                        <h1>{workspace?.name || "Workspace Boards"}</h1>
                        <p className="workspace-subtext">
                            {workspace?.description || "Select a board to manage lists, cards, and team tasks."}
                        </p>
                    </div>

                    <div className="workspace-header-actions">
                        <button
                            className="primary-btn pulse-glow-btn"
                            onClick={() => setShowModal(true)}
                            id="addBoardHeaderBtn"
                        >
                            <Plus size={16} />
                            <span>Create Board</span>
                        </button>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="workspace-toolbar">
                    <div className="search-input-box">
                        <Search size={16} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Filter boards by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                className="clear-search-btn"
                                onClick={() => setSearchQuery("")}
                            >
                                ×
                            </button>
                        )}
                    </div>

                    <div className="workspace-stats-pill">
                        <Layout size={14} />
                        <span>
                            {boards.length} {boards.length === 1 ? "Board" : "Boards"}
                        </span>
                    </div>
                </div>

                {/* Content: Skeleton or Grid */}
                {loading ? (
                    <div className="board-grid">
                        {[1, 2, 3, 4].map((n) => (
                            <div key={n} className="board-card board-skeleton-card">
                                <div className="skeleton-line skeleton-header"></div>
                                <div className="skeleton-line skeleton-desc"></div>
                            </div>
                        ))}
                    </div>
                ) : filteredBoards.length === 0 ? (
                    <div className="empty-state-card">
                        <div className="empty-state-icon-wrap">
                            <Layout size={42} />
                        </div>
                        <h3>{searchQuery ? "No matching boards" : "No boards yet"}</h3>
                        <p>
                            {searchQuery
                                ? `No boards match "${searchQuery}". Clear your search or create a new board.`
                                : "Create your first board in this workspace to organize tasks, lists, and team members."}
                        </p>
                        {searchQuery ? (
                            <button
                                className="secondary-btn"
                                onClick={() => setSearchQuery("")}
                            >
                                Clear Filter
                            </button>
                        ) : (
                            <button
                                className="primary-btn"
                                onClick={() => setShowModal(true)}
                            >
                                <Plus size={16} />
                                <span>Create Board</span>
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="board-grid">
                        {filteredBoards.map((b) => {
                            const bgStyle = getBoardGradient(b.background);

                            return (
                                <div
                                    key={b.id}
                                    className="board-card"
                                    style={{ background: bgStyle }}
                                    onClick={() => navigateTo(`/board/${b.id}`)}
                                >
                                    <div className="board-card-overlay">
                                        <div className="board-card-header">
                                            <h3 className="board-card-title">{b.name}</h3>
                                            <button
                                                className="board-card-delete-btn"
                                                onClick={(e) => handleDeleteBoard(b.id, b.name, e)}
                                                disabled={deletingBoardId === b.id}
                                                title="Delete board"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>

                                        <div className="board-card-footer">
                                            <span className="board-tag-badge">
                                                <Palette size={12} />
                                                <span>Active</span>
                                            </span>
                                            <span className="board-open-cta">
                                                Open Board &rarr;
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Create Board Modal */}
            {showModal && (
                <div
                    className="modal-overlay"
                    onClick={() => {
                        setShowModal(false);
                        setBoardName("");
                    }}
                >
                    <div
                        className="modal-box"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="createBoardTitle"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-box-header">
                            <div>
                                <h2 id="createBoardTitle">Create Board</h2>
                                <p>Choose a name and a visual theme for your board.</p>
                            </div>
                            <button
                                className="modal-close-btn"
                                onClick={() => setShowModal(false)}
                                aria-label="Close modal"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleCreateBoard} className="modal-form">
                            <div className="form-group">
                                <label htmlFor="boardNameInput">Board Title *</label>
                                <input
                                    id="boardNameInput"
                                    type="text"
                                    placeholder="e.g. Q4 Sprint, Launch Roadmap, Bug Backlog"
                                    value={boardName}
                                    onChange={(e) => setBoardName(e.target.value)}
                                    autoFocus
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Board Theme / Background *</label>
                                <div className="theme-palette-grid">
                                    {THEME_PRESETS.map((preset) => {
                                        const isSelected = selectedTheme === preset.id;
                                        return (
                                            <button
                                                key={preset.id}
                                                type="button"
                                                className={`theme-palette-option ${isSelected ? "selected" : ""}`}
                                                style={{ background: preset.gradient }}
                                                onClick={() => setSelectedTheme(preset.id)}
                                                title={preset.name}
                                            >
                                                {isSelected && <Check size={16} color="#fff" />}
                                                <span className="theme-preset-name">
                                                    {preset.name}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="modal-box-actions">
                                <button
                                    type="button"
                                    className="secondary-btn"
                                    onClick={() => setShowModal(false)}
                                    disabled={creating}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="primary-btn"
                                    disabled={creating || !boardName.trim()}
                                >
                                    {creating ? "Creating..." : "Create Board"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Board;