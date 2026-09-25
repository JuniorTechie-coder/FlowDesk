import { useState } from "react";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Workspace from "./pages/Workspace";
import Board from "./pages/Board";
import BoardDetail from "./pages/BoardDetail";
import { useNavigation } from "./navigation-context";

function App() {
    const { currentPath, navigateTo } = useNavigation();
    const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("token"));
    const [authView, setAuthView] = useState(() => {
        if (currentPath === "/login") return "login";
        if (currentPath === "/register") return "register";
        return "landing";
    });

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsLoggedIn(false);
        setAuthView("landing");
        navigateTo("/");
    }

    // Authenticated state
    if (isLoggedIn) {
        if (currentPath.startsWith("/board/")) {
            return <BoardDetail handleLogout={handleLogout} />;
        }
        if (currentPath.startsWith("/boards/")) {
            return <Board handleLogout={handleLogout} />;
        }
        if (currentPath === "/workspace" || currentPath === "/workspaces") {
            return <Workspace handleLogout={handleLogout} />;
        }
        // If at root '/' and explicitly wanting landing view
        if (authView === "landing" && currentPath === "/") {
            return (
                <Landing
                    onOpenWorkspace={() => navigateTo("/workspace")}
                    onOpenLogin={() => {
                        setAuthView("login");
                        navigateTo("/login");
                    }}
                    onOpenRegister={() => {
                        setAuthView("register");
                        navigateTo("/register");
                    }}
                    isLoggedIn={true}
                />
            );
        }
        return <Workspace handleLogout={handleLogout} />;
    }

    // Unauthenticated state
    const isLoginView = authView === "login" || currentPath === "/login";
    const isRegisterView = authView === "register" || currentPath === "/register";

    if (isLoginView) {
        return (
            <Login
                setIsLoggedIn={(val) => {
                    setIsLoggedIn(val);
                    setAuthView("landing");
                    navigateTo("/workspace");
                }}
                onSwitchToRegister={() => {
                    setAuthView("register");
                    navigateTo("/register");
                }}
                onBackToHome={() => {
                    setAuthView("landing");
                    navigateTo("/");
                }}
            />
        );
    }

    if (isRegisterView) {
        return (
            <Register
                onSwitchToLogin={() => {
                    setAuthView("login");
                    navigateTo("/login");
                }}
                onBackToHome={() => {
                    setAuthView("landing");
                    navigateTo("/");
                }}
            />
        );
    }

    // Default unauthenticated view: Landing Page
    return (
        <Landing
            onOpenWorkspace={() => {
                setAuthView("login");
                navigateTo("/login");
            }}
            onOpenLogin={() => {
                setAuthView("login");
                navigateTo("/login");
            }}
            onOpenRegister={() => {
                setAuthView("register");
                navigateTo("/register");
            }}
            isLoggedIn={false}
        />
    );
}

export default App;