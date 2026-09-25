import { useEffect, useState, useMemo } from "react";
import { API_BASE } from "../config";
import { useToast } from "../toast-context";
import { useNavigation } from "../navigation-context";
import {
    Plus,
    Folder,
    ArrowRight,
    LogOut,
    Search,
    Trash2,
    Briefcase,
    Sparkles,
    Layout,
    Layers,
    User
} from "lucide-react";

function Workspace({ handleLogout }) {
    const toast = useToast();
    const { navigateTo } = useNavigation();
    const [workspaces, setWorkspaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [workspaceName, setWorkspaceName] = useState("");
    const [workspaceDescription, setWorkspaceDescription] = useState("");
    const [creating, setCreating] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    // Current user
    const [currentUser] = useState(() => {
        try {
            const saved = localStorage.getItem("user");
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });

    useEffect(() => {
        let cancelled = false;
        async function fetchWorkspaces() {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`${API_BASE}/workspaces`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || "Failed to fetch workspaces");
                }

                if (!cancelled) setWorkspaces(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error fetching workspaces:", error);
                toast.error(error.message || "Failed to load workspaces");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchWorkspaces();
        return () => {
            cancelled = true;
        };
    }, []);

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

    // Create workspace
    async function handleCreateWorkspace(e) {
        e.preventDefault();
        if (!workspaceName.trim()) {
            toast.error("Workspace name is required");
            return;
        }

        try {
            setCreating(true);
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_BASE}/workspaces`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: workspaceName.trim(),
                    description: workspaceDescription.trim(),
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to create workspace");
            }

            setWorkspaces((prev) => [...prev, data]);
            setWorkspaceName("");
            setWorkspaceDescription("");
            setShowModal(false);
            toast.success(`Workspace "${data.name}" created!`);
        } catch (error) {
            console.error("Error creating workspace:", error);
            toast.error(error.message);
        } finally {
            setCreating(false);
        }
    }

    // Delete workspace
    async function handleDeleteWorkspace(id, name, e) {
        e.stopPropagation();
        if (!window.confirm(`Are you sure you want to delete "${name}" and all its boards?`)) {
            return;
        }

        try {
            setDeletingId(id);
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_BASE}/workspaces/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || "Failed to delete workspace");
            }

            setWorkspaces((prev) => prev.filter((ws) => ws.id !== id));
            toast.success("Workspace deleted");
        } catch (error) {
            console.error("Error deleting workspace:", error);
            toast.error(error.message);
        } finally {
            setDeletingId(null);
        }
    }

    // Filter workspaces
    const filteredWorkspaces = useMemo(() => {
        if (!searchQuery.trim()) return workspaces;
        const q = searchQuery.toLowerCase();
        return workspaces.filter(
            (w) =>
                (w.name && w.name.toLowerCase().includes(q)) ||
                (w.description && w.description.toLowerCase().includes(q))
        );
    }, [workspaces, searchQuery]);

    // Gradient generator for workspace tiles
    const gradients = [
        "linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)",
        "linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)",
        "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
        "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    ];

    return (
        <div className="workspace-app-layout">
            {/* Top Navigation */}
            <header className="workspace-navbar">
                <div className="workspace-nav-left">
                    <div className="workspace-logo" onClick={() => navigateTo("/workspace")}>
                        <div className="logo-icon-box">
                            <Layers size={18} color="#fff" />
                        </div>
                        <span className="logo-text">FlowDesk</span>
                    </div>
                    <span className="workspace-nav-badge">Workspaces</span>
                </div>

                <div className="workspace-nav-right">
                    <div className="user-profile-badge">
                        <div className="user-avatar-circle">
                            {currentUser?.name ? currentUser.name[0].toUpperCase() : <User size={14} />}
                        </div>
                        <span className="user-name-text">{currentUser?.name || "My Account"}</span>
                    </div>

                    <button
                        className="ghost-btn icon-text-btn"
                        onClick={handleLogout}
                        title="Sign out of FlowDesk"
                    >
                        <LogOut size={15} />
                        <span>Logout</span>
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="workspace-main-container">
                {/* Hero / Header Strip */}
                <div className="workspace-header-strip">
                    <div className="workspace-header-text">
                        <div className="workspace-greeting">
                            <Sparkles size={16} className="sparkle-icon" />
                            <span>Welcome back, {currentUser?.name || "Team Member"}</span>
                        </div>
                        <h1>Your Workspaces</h1>
                        <p className="workspace-subtext">
                            Workspaces group projects, boards, and cross-functional teams in one place.
                        </p>
                    </div>

                    <div className="workspace-header-actions">
                        <button
                            className="primary-btn pulse-glow-btn"
                            onClick={() => setShowModal(true)}
                            id="newWorkspaceBtn"
                        >
                            <Plus size={16} />
                            <span>New Workspace</span>
                        </button>
                    </div>
                </div>

                {/* Search Bar & Summary */}
                <div className="workspace-toolbar">
                    <div className="search-input-box">
                        <Search size={16} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Filter workspaces by title or description..."
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
                        <Briefcase size={14} />
                        <span>
                            {workspaces.length} {workspaces.length === 1 ? "Workspace" : "Workspaces"}
                        </span>
                    </div>
                </div>

                {/* Content: Skeleton or Grid */}
                {loading ? (
                    <div className="tile-grid">
                        {[1, 2, 3, 4].map((n) => (
                            <div key={n} className="tile ws-skeleton-card">
                                <div className="skeleton-line skeleton-header"></div>
                                <div className="skeleton-line skeleton-title"></div>
                                <div className="skeleton-line skeleton-desc"></div>
                                <div className="skeleton-line skeleton-footer"></div>
                            </div>
                        ))}
                    </div>
                ) : filteredWorkspaces.length === 0 ? (
                    <div className="empty-state-card">
                        <div className="empty-state-icon-wrap">
                            <Folder size={42} />
                        </div>
                        <h3>
                            {searchQuery ? "No matching workspaces found" : "No workspaces yet"}
                        </h3>
                        <p>
                            {searchQuery
                                ? `No workspaces matched "${searchQuery}". Clear your search or create a new one.`
                                : "Create your first workspace to start collaborating on boards with your team."}
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
                                <span>Create Workspace</span>
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="tile-grid">
                        {filteredWorkspaces.map((ws, index) => {
                            const gradient = gradients[index % gradients.length];
                            const initials = (ws.name || "WS")
                                .split(" ")
                                .map((w) => w[0])
                                .slice(0, 2)
                                .join("")
                                .toUpperCase();

                            return (
                                <div
                                    key={ws.id}
                                    className="workspace-card"
                                    onClick={() => navigateTo(`/boards/${ws.id}`)}
                                >
                                    <div className="workspace-card-top">
                                        <div
                                            className="workspace-avatar-box"
                                            style={{ background: gradient }}
                                        >
                                            {initials}
                                        </div>
                                        <div className="workspace-card-actions">
                                            <button
                                                className="icon-action-btn delete-ws-btn"
                                                onClick={(e) => handleDeleteWorkspace(ws.id, ws.name, e)}
                                                disabled={deletingId === ws.id}
                                                title="Delete workspace"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="workspace-card-body">
                                        <h3 className="workspace-title">{ws.name}</h3>
                                        <p className="workspace-desc">
                                            {ws.description || "No description provided."}
                                        </p>
                                    </div>

                                    <div className="workspace-card-footer">
                                        <span className="workspace-board-link-text">
                                            <Layout size={14} />
                                            <span>Manage Boards</span>
                                        </span>
                                        <span className="workspace-open-arrow">
                                            <span>Open</span>
                                            <ArrowRight size={14} />
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Create Workspace Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div
                        className="modal-box"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="modalTitle"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-box-header">
                            <div>
                                <h2 id="modalTitle">Create Workspace</h2>
                                <p>Set up a space for your team to plan and collaborate.</p>
                            </div>
                            <button
                                className="modal-close-btn"
                                onClick={() => setShowModal(false)}
                                aria-label="Close modal"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleCreateWorkspace} className="modal-form">
                            <div className="form-group">
                                <label htmlFor="wsNameInput">Workspace Name *</label>
                                <input
                                    id="wsNameInput"
                                    type="text"
                                    placeholder="e.g. Engineering, Marketing Sprint, Product Alpha"
                                    value={workspaceName}
                                    onChange={(e) => setWorkspaceName(e.target.value)}
                                    autoFocus
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="wsDescInput">Description (Optional)</label>
                                <textarea
                                    id="wsDescInput"
                                    rows={3}
                                    placeholder="What is this workspace used for?"
                                    value={workspaceDescription}
                                    onChange={(e) => setWorkspaceDescription(e.target.value)}
                                />
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
                                    disabled={creating || !workspaceName.trim()}
                                >
                                    {creating ? "Creating..." : "Create Workspace"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Workspace;