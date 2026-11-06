import { useState } from "react";
import { API_BASE } from "../config";
import {
    Layers,
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    AlertCircle,
    CheckCircle2,
    ArrowLeft
} from "lucide-react";

function Register({ onSwitchToLogin, onBackToHome }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    async function handleRegister(e) {
        if (e) e.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");

        if (!name.trim() || !email.trim() || !password.trim()) {
            setErrorMessage("All fields are required.");
            return;
        }

        if (password.length < 6) {
            setErrorMessage("Password must be at least 6 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`${API_BASE}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim(),
                    password: password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage("Account created successfully! Redirecting to sign in...");
                setName("");
                setEmail("");
                setPassword("");
                setConfirmPassword("");

                setTimeout(() => {
                    if (onSwitchToLogin) onSwitchToLogin();
                }, 1500);
            } else {
                setErrorMessage(data.error || "Registration failed. Please try again.");
            }
        } catch (error) {
            console.error("Registration request error:", error);
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
                        <h2>Create your account</h2>
                        <p>Join FlowDesk to create workspaces, organize boards, and track team progress.</p>
                    </div>

                    {/* Alerts */}
                    {errorMessage && (
                        <div className="auth-alert auth-alert-error">
                            <AlertCircle size={18} className="alert-icon" />
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    {successMessage && (
                        <div className="auth-alert auth-alert-success">
                            <CheckCircle2 size={18} className="alert-icon" />
                            <span>{successMessage}</span>
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="auth-form">
                        {/* Name Input */}
                        <div className="auth-field">
                            <label htmlFor="regName">Full Name</label>
                            <div className="auth-input-wrapper">
                                <span className="auth-input-icon">
                                    <User size={16} />
                                </span>
                                <input
                                    id="regName"
                                    type="text"
                                    className="auth-input"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Alex Morgan"
                                    autoComplete="name"
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Email Input */}
                        <div className="auth-field">
                            <label htmlFor="regEmail">Email Address</label>
                            <div className="auth-input-wrapper">
                                <span className="auth-input-icon">
                                    <Mail size={16} />
                                </span>
                                <input
                                    id="regEmail"
                                    type="email"
                                    className="auth-input"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="alex@company.com"
                                    autoComplete="email"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="auth-field">
                            <label htmlFor="regPassword">Password (6+ chars)</label>
                            <div className="auth-input-wrapper">
                                <span className="auth-input-icon">
                                    <Lock size={16} />
                                </span>
                                <input
                                    id="regPassword"
                                    type={showPassword ? "text" : "password"}
                                    className="auth-input"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Create a strong password"
                                    autoComplete="new-password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="auth-toggle-pwd-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="auth-field">
                            <label htmlFor="regConfirmPassword">Confirm Password</label>
                            <div className="auth-input-wrapper">
                                <span className="auth-input-icon">
                                    <Lock size={16} />
                                </span>
                                <input
                                    id="regConfirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    className="auth-input"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Repeat your password"
                                    autoComplete="new-password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="auth-toggle-pwd-btn"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
                                    <span>Creating Account...</span>
                                </>
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </form>

                    <div className="auth-divider">
                        <span>or</span>
                    </div>

                    <div className="auth-footer">
                        Already have an account?{" "}
                        <button
                            type="button"
                            onClick={() => onSwitchToLogin && onSwitchToLogin()}
                        >
                            Sign in here
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
                    Organize effortlessly · Collaborate seamlessly
                </div>
            </div>
        </div>
    );
}

export default Register;