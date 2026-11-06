

import { Routes, Route, Navigate } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Workspace from "./pages/Workspace";
import Board from "./pages/Board";
import BoardDetail from "./pages/BoardDetail";

import { useNavigation } from "./navigation-context";
import { useAuth } from "./context/AuthContext";

function ProtectedRoute({ isAuthenticated, loading, children }) {
    if (loading) {
        return <div>Checking your session...</div>;
    }

    return isAuthenticated
        ? children
        : <Navigate to="/login" replace />;
}

function App() {
    const { navigateTo } = useNavigation();

    const {
        isAuthenticated,
        loading,
        login,
        logout
    } = useAuth();

    async function handleLogout() {
        try {
            await logout();
            navigateTo("/");
        } catch (error) {
            console.error("Logout error:", error);
        }
    }

    if (loading) {
        return <div>Loading FlowDesk...</div>;
    }

    return (
        <Routes>
            <Route
                path="/"
                element={
                    <Landing
                        onOpenWorkspace={() =>
                            navigateTo(
                                isAuthenticated ? "/workspace" : "/login"
                            )
                        }
                        onOpenLogin={() => navigateTo("/login")}
                        onOpenRegister={() => navigateTo("/register")}
                        isLoggedIn={isAuthenticated}
                    />
                }
            />

            <Route
                path="/login"
                element={
                    isAuthenticated ? (
                        <Navigate to="/workspace" replace />
                    ) : (
                        <Login
                            onLogin={async (email, password) => {
                                await login(email, password);
                                navigateTo("/workspace");
                            }}
                            onSwitchToRegister={() =>
                                navigateTo("/register")
                            }
                            onBackToHome={() => navigateTo("/")}
                        />
                    )
                }
            />

            <Route
                path="/register"
                element={
                    isAuthenticated ? (
                        <Navigate to="/workspace" replace />
                    ) : (
                        <Register
                            onSwitchToLogin={() =>
                                navigateTo("/login")
                            }
                            onBackToHome={() => navigateTo("/")}
                        />
                    )
                }
            />

            <Route
                path="/workspace"
                element={
                    <ProtectedRoute
                        isAuthenticated={isAuthenticated}
                        loading={loading}
                    >
                        <Workspace handleLogout={handleLogout} />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/workspaces"
                element={<Navigate to="/workspace" replace />}
            />

            <Route
                path="/boards/:workspaceId"
                element={
                    <ProtectedRoute
                        isAuthenticated={isAuthenticated}
                        loading={loading}
                    >
                        <Board handleLogout={handleLogout} />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/board/:boardId"
                element={
                    <ProtectedRoute
                        isAuthenticated={isAuthenticated}
                        loading={loading}
                    >
                        <BoardDetail handleLogout={handleLogout} />
                    </ProtectedRoute>
                }
            />

            <Route
                path="*"
                element={<Navigate to="/" replace />}
            />
        </Routes>
    );
}

export default App;
