
import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import { API_BASE } from "../config";

// Create authentication context
const AuthContext = createContext(null);

// Provider component
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Restore the user's session when the application starts
    useEffect(() => {
        async function checkAuth() {
            try {
                const response = await fetch(`${API_BASE}/auth/me`, {
                    method: "GET",
                    credentials: "include"
                });

                if (!response.ok) {
                    setUser(null);
                    return;
                }

                const data = await response.json();
                setUser(data.user);

            } catch (error) {
                console.error("Session restoration error:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        }

        checkAuth();
    }, []);


    // Login user
    async function login(email, password) {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Login failed!");
        }

        setUser({
            user_id: data.user_id,
            name: data.name,
            email: data.email
        });

        return data;
    }


    // Logout user
    async function logout() {
        try {
            const response = await fetch(`${API_BASE}/auth/logout`, {
                method: "POST",
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error("Logout request failed!");
            }
        } finally {
            // Clear frontend authentication state
            setUser(null);
        }
    }

    //Tells us whether a user is logged in.
    const isAuthenticated = !!user;

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook to access authentication context
export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside an AuthProvider"
        );
    }

    return context;
}
