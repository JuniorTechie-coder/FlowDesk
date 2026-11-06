
import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Workspace from "./pages/Workspace";
import Board from "./pages/Board";
import BoardDetail from "./pages/BoardDetail";

import { useNavigation } from "./navigation-context";

function ProtectedRoute({ isLoggedIn, children }) {
    return isLoggedIn ? children : <Navigate to="/login" replace />;
}

function App() {
    const { navigateTo } = useNavigation();

    const [isLoggedIn, setIsLoggedIn] = useState(
        () => !!localStorage.getItem("token")
    );

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsLoggedIn(false);
        navigateTo("/");
    }

    return (
        <Routes>
            <Route
                path="/"
                element={
                    <Landing
                        onOpenWorkspace={() =>
                            navigateTo(isLoggedIn ? "/workspace" : "/login")
                        }
                        onOpenLogin={() => navigateTo("/login")}
                        onOpenRegister={() => navigateTo("/register")}
                        isLoggedIn={isLoggedIn}
                    />
                }
            />

            <Route
                path="/login"
                element={
                    isLoggedIn ? (
                        <Navigate to="/workspace" replace />
                    ) : (
                        <Login
                            setIsLoggedIn={(value) => {
                                setIsLoggedIn(value);
                                if (value) navigateTo("/workspace");
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
                    isLoggedIn ? (
                        <Navigate to="/workspace" replace />
                    ) : (
                        <Register
                            onSwitchToLogin={() => navigateTo("/login")}
                            onBackToHome={() => navigateTo("/")}
                        />
                    )
                }
            />

            <Route
                path="/workspace"
                element={
                    <ProtectedRoute isLoggedIn={isLoggedIn}>
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
                    <ProtectedRoute isLoggedIn={isLoggedIn}>
                        <Board handleLogout={handleLogout} />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/board/:boardId"
                element={
                    <ProtectedRoute isLoggedIn={isLoggedIn}>
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
