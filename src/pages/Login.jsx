import { useState } from "react";
import { API_BASE } from "../config";
import {
    Layers,
    Mail,
    Lock,
    Eye,
    EyeOff,
    AlertCircle,
    ArrowLeft,
    Sparkles
} from "lucide-react";

function Login({ setIsLoggedIn, onSwitchToRegister, onBackToHome }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    async function handleLogin(e) {
        if (e) e.preventDefault();
        setErrorMessage("");

        if (!email.trim() || !password.trim()) {
            setErrorMessage("Please enter both email and password.");
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email.trim(),
                    password: password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Save JWT and user metadata
                localStorage.setItem("token", data.token);
                localStorage.setItem(
                    "user",
                    JSON.stringify({
                        user_id: data.user_id,
                        name: data.name,
                        email: data.email,
                    })
                );

                // Update application state
                setIsLoggedIn(true);
            } else {
                setErrorMessage(data.error || "Login failed. Please verify your credentials.");
            }
        } catch (error) {
            console.error("Login request error:", error);
            setErrorMessage("Unable to connect to server. Please check your backend.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                {/* Brand Header */}
                <div
                    className="auth-brand"
                    onClick={() => onBackToHome && onBackToHome()}
                    style={{ cursor: "pointer" }}
                    title="Back to Home"
                >
                    <div className="logo-icon-box">
                        <Layers size={22} color="#fff" />
                    </div>
                    <span className="auth-brand-name">FlowDesk</span>
                </div>

                {/* Glassmorphic Auth Card */}
                <div className="auth-card">
                    <div className="auth-header">
                        <h2>Welcome back</h2>
                        <p>Sign in to your FlowDesk account to access workspaces and boards.</p>
                    </div>

                    {/* Error Banner */}
                    {errorMessage && (
                        <div className="auth-alert auth-alert-error">
                            <AlertCircle size={18} className="alert-icon" />
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="auth-form">
                        {/* Email Input */}
                        <div className="auth-field">
                            <label htmlFor="email">Email Address</label>
                            <div className="auth-input-wrapper">
                                <span className="auth-input-icon">
                                    <Mail size={16} />
                                </span>
                                <input
                                    id="email"
                                    type="email"
                                    className="auth-input"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="alex@company.com"
                                    autoComplete="email"
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="auth-field">
                            <label htmlFor="password">Password</label>
                            <div className="auth-input-wrapper">
                                <span className="auth-input-icon">
                                    <Lock size={16} />
                                </span>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    className="auth-input"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="auth-toggle-pwd-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                    title={showPassword ? "Hide password" : "Show password"}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="auth-submit-btn"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="auth-spinner"></span>
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>

                    <div className="auth-divider">
                        <span>or</span>
                    </div>

                    <div className="auth-footer">
                        Don't have an account?{" "}
                        <button
                            type="button"
                            onClick={() => onSwitchToRegister && onSwitchToRegister()}
                        >
                            Create one for free
                        </button>
                    </div>

                    {onBackToHome && (
                        <div style={{ textAlign: "center", marginTop: "14px" }}>
                            <button
                                type="button"
                                className="ghost-btn sm"
                                onClick={onBackToHome}
                                style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-muted)" }}
                            >
                                <ArrowLeft size={13} />
                                <span>Back to Home</span>
                            </button>
                        </div>
                    )}
                </div>

                <div className="auth-footer-tagline">
                    Streamlined Task Management &amp; Team Lead Delegation
                </div>
            </div>
        </div>
    );
}

export default Login;
