import { createContext, useContext, useState, useEffect } from "react";

const NavigationContext = createContext({
    currentPath: "/",
    navigateTo: () => {},
});

export function NavigationProvider({ children }) {
    const [currentPath, setCurrentPath] = useState(window.location.pathname);

    useEffect(() => {
        const handlePopState = () => {
            setCurrentPath(window.location.pathname);
        };
        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, []);

    const navigateTo = (path) => {
        if (window.location.pathname !== path) {
            window.history.pushState({}, "", path);
            setCurrentPath(path);
        }
    };

    return (
        <NavigationContext.Provider value={{ currentPath, navigateTo }}>
            {children}
        </NavigationContext.Provider>
    );
}

export function useNavigation() {
    return useContext(NavigationContext);
}
