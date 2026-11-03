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

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsLoggedIn(false);
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
        // The URL is the source of truth for the current page.
        if (currentPath === "/") {
            return (
                <Landing
                    onOpenWorkspace={() => navigateTo("/workspace")}
                    onOpenLogin={() => {
                        navigateTo("/login");
                    }}
                    onOpenRegister={() => {
                        navigateTo("/register");
                    }}
                    isLoggedIn={true}
                />
            );
        }
        return <Workspace handleLogout={handleLogout} />;
    }

    // Unauthenticated state
    const isLoginView = currentPath === "/login";
    const isRegisterView = currentPath === "/register";

    if (isLoginView) {
        return (
            <Login
                setIsLoggedIn={(val) => {
                    setIsLoggedIn(val);
                    navigateTo("/workspace");
                }}
                onSwitchToRegister={() => {
                    navigateTo("/register");
                }}
                onBackToHome={() => {
                    navigateTo("/");
                }}
            />
        );
    }

    if (isRegisterView) {
        return (
            <Register
                onSwitchToLogin={() => {
                    navigateTo("/login");
                }}
                onBackToHome={() => {
                    navigateTo("/");
                }}
            />
        );
    }

    // Default unauthenticated view: Landing Page
    return (
        <Landing
            onOpenWorkspace={() => {
                navigateTo("/login");
            }}
            onOpenLogin={() => {
                navigateTo("/login");
            }}
            onOpenRegister={() => {
                navigateTo("/register");
            }}
            isLoggedIn={false}
        />
    );
}

export default App;
