

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./index.css";
import "./toast.css";

import App from "./App.jsx";
import ErrorBoundary from "./ErrorBoundary.jsx";
import { ToastProvider } from "./toast.jsx";
import { NavigationProvider } from "./navigation-context.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <ErrorBoundary>
            <BrowserRouter>
                <ToastProvider>
                    <AuthProvider>
                        <NavigationProvider>
                            <App />
                        </NavigationProvider>
                    </AuthProvider>
                </ToastProvider>
            </BrowserRouter>
        </ErrorBoundary>
    </StrictMode>
);
