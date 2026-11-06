import {
    Layers,
    ArrowRight,
    Sparkles,
    CheckCircle2,
    Users,
    Zap,
    Shield,
    Layout,
    Crown
} from "lucide-react";

function Landing({ onOpenWorkspace, onOpenLogin, onOpenRegister, isLoggedIn }) {
    return (
        <div className="landing-body">
            {/* Header / Nav */}
            <header className="landing-nav">
                <div className="landing-nav-brand" onClick={(e) => { e.preventDefault(); window.history.pushState({}, "", "/"); }}>
                    <div className="logo-icon-box">
                        <Layers size={20} color="#fff" />
                    </div>
                    <span className="logo-text">FlowDesk</span>
                </div>

                <div className="landing-nav-links">
                    <a href="#features" className="nav-link-item">Features</a>
                    <a href="#workflow" className="nav-link-item">Workflow</a>
                </div>

                <div className="landing-nav-actions">
                    {isLoggedIn ? (
                        <button
                            className="primary-btn pulse-glow-btn"
                            onClick={onOpenWorkspace}
                            id="openWorkspaceBtn"
                        >
                            <span>Open Workspace</span>
                            <ArrowRight size={15} />
                        </button>
                    ) : (
                        <>
                            <button
                                className="ghost-btn"
                                onClick={onOpenLogin}
                                id="landingLoginBtn"
                            >
                                Sign In
                            </button>
                            <button
                                className="primary-btn"
                                onClick={onOpenRegister}
                                id="landingRegisterBtn"
                            >
                                <span>Get Started Free</span>
                                <ArrowRight size={14} />
                            </button>
                        </>
                    )}
                </div>
            </header>

            {/* Main Hero */}
            <main className="landing-main-content">
                <section className="landing-hero-section">
                    <div className="landing-hero-content">
                        <div className="landing-eyebrow-pill">
                            <Sparkles size={14} className="eyebrow-sparkle" />
                            <span>Workspaces · Kanban · Team Lead Staging</span>
                        </div>

                        <h1 className="landing-headline">
                            One Unified Board.<br />
                            <span className="gradient-text-hero">Every task in its right place.</span>
                        </h1>

                        <p className="landing-subheadline">
                            FlowDesk brings clarity to high-velocity teams. Stage backlogs with Team Lead control,
                            drag cards across dynamic workflow stages, and maintain total visibility from ideation to production.
                        </p>

                        <div className="landing-cta-group">
                            <button
                                onClick={isLoggedIn ? onOpenWorkspace : onOpenRegister}
                                className="primary-btn large pulse-glow-btn"
                                id="createWorkspaceHeroBtn"
                            >
                                <span>{isLoggedIn ? "Open Your Workspace" : "Start For Free — Instant Access"}</span>
                                <ArrowRight size={17} />
                            </button>

                            {!isLoggedIn && (
                                <button
                                    onClick={onOpenLogin}
                                    className="ghost-btn large"
                                >
                                    Log In to Account
                                </button>
                            )}
                        </div>

                        <div className="landing-social-proof">
                            <div className="social-proof-avatars">
                                <span className="proof-avatar" style={{ background: "#ec4899" }}>A</span>
                                <span className="proof-avatar" style={{ background: "#3b82f6" }}>T</span>
                                <span className="proof-avatar" style={{ background: "#10b981" }}>M</span>
                                <span className="proof-avatar" style={{ background: "#8b5cf6" }}>S</span>
                            </div>
                            <span className="social-proof-text">
                                Loved by developers, product managers, and Agile teams.
                            </span>
                        </div>
                    </div>

                    {/* Interactive Board Mockup */}
                    <div className="landing-mockup-wrapper" aria-hidden="true">
                        <div className="mockup-window-header">
                            <div className="mockup-window-dots">
                                <span className="dot red"></span>
                                <span className="dot yellow"></span>
                                <span className="dot green"></span>
                            </div>
                            <div className="mockup-window-title">Sprint 14 — FlowDesk Board</div>
                        </div>

                        <div className="mockup-board-grid">
                            {/* To Do Column */}
                            <div className="mockup-column">
                                <div className="mockup-col-header">
                                    <span>To Do</span>
                                    <span className="col-count">2</span>
                                </div>
                                <div className="mockup-card">
                                    <div className="mockup-card-title">Production Design System</div>
                                    <p className="mockup-card-desc">Implement responsive CSS tokens and glassmorphic cards.</p>
                                    <div className="mockup-card-footer">
                                        <span className="mockup-tag tag-high">High Priority</span>
                                        <span className="mockup-user-avatar">AD</span>
                                    </div>
                                </div>
                                <div className="mockup-card">
                                    <div className="mockup-card-title">Database Index Optimization</div>
                                    <div className="mockup-card-footer">
                                        <span className="mockup-tag tag-med">Medium</span>
                                        <span className="mockup-user-avatar">TN</span>
                                    </div>
                                </div>
                            </div>

                            {/* In Progress Column */}
                            <div className="mockup-column">
                                <div className="mockup-col-header">
                                    <span>In Progress</span>
                                    <span className="col-count">1</span>
                                </div>
                                <div className="mockup-card active-drag">
                                    <div className="mockup-card-title">Team Lead Backlog Stage</div>
                                    <p className="mockup-card-desc">Assign tasks directly to members before release.</p>
                                    <div className="mockup-card-footer">
                                        <span className="mockup-tag tag-progress">In Progress</span>
                                        <span className="mockup-user-avatar">CL</span>
                                    </div>
                                </div>
                            </div>

                            {/* Done Column */}
                            <div className="mockup-column">
                                <div className="mockup-col-header">
                                    <span>Done</span>
                                    <span className="col-count">2</span>
                                </div>
                                <div className="mockup-card done-card">
                                    <div className="mockup-card-title">JWT Auth &amp; Password Hashing</div>
                                    <div className="mockup-card-footer">
                                        <span className="mockup-tag tag-done">Completed</span>
                                        <span className="mockup-user-avatar">✓</span>
                                    </div>
                                </div>
                                <div className="mockup-card done-card">
                                    <div className="mockup-card-title">Vite 8 &amp; React 19 Upgrade</div>
                                    <div className="mockup-card-footer">
                                        <span className="mockup-tag tag-done">Completed</span>
                                        <span className="mockup-user-avatar">✓</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="landing-features-section" id="features">
                    <div className="section-title-wrap">
                        <span className="section-eyebrow">Enterprise Grade Architecture</span>
                        <h2>Engineered for focus and speed</h2>
                        <p>Everything you need to organize your team without the clutter.</p>
                    </div>

                    <div className="features-card-grid">
                        <div className="feature-highlight-card">
                            <div className="feature-icon-box" style={{ background: "rgba(236, 72, 153, 0.15)", color: "#ec4899" }}>
                                <Layout size={24} />
                            </div>
                            <h3>Multi-Level Workspaces</h3>
                            <p>Organize multiple independent boards inside workspaces for separate products, clients, or cross-functional teams.</p>
                        </div>

                        <div className="feature-highlight-card">
                            <div className="feature-icon-box" style={{ background: "rgba(59, 130, 246, 0.15)", color: "#3b82f6" }}>
                                <Zap size={24} />
                            </div>
                            <h3>Fluid Drag-and-Drop</h3>
                            <p>Seamlessly drag cards between columns or into the backlog tray with instant backend persistence and reordering.</p>
                        </div>

                        <div className="feature-highlight-card">
                            <div className="feature-icon-box" style={{ background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" }}>
                                <Crown size={24} />
                            </div>
                            <h3>Team Lead Backlog Mode</h3>
                            <p>Toggle Team Lead mode to stage unassigned work, assign members, and control task readiness before team pull.</p>
                        </div>

                        <div className="feature-highlight-card">
                            <div className="feature-icon-box" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981" }}>
                                <Shield size={24} />
                            </div>
                            <h3>Secure Authentication</h3>
                            <p>JWT-based stateless security with bcrypt hashing, individual member identification, and workspace isolation.</p>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="landing-footer-bar">
                <div className="footer-content">
                    <div className="footer-brand">
                        <Layers size={16} />
                        <span>FlowDesk</span>
                    </div>
                    <span className="footer-copy">
                        Production Task Management &amp; Agile Collaboration Platform
                    </span>
                </div>
            </footer>
        </div>
    );
}

export default Landing;
