import { useState, useCallback } from "react";
import { ToastContext } from "./toast-context";

let nextId = 0;

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const push = useCallback(
        (message, type = "info", duration = 3500) => {
            const id = ++nextId;
            setToasts((prev) => [...prev, { id, message, type }]);
            setTimeout(() => removeToast(id), duration);
        },
        [removeToast]
    );

    const toast = {
        success: (message) => push(message, "success"),
        error: (message) => push(message, "error"),
        info: (message) => push(message, "info"),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div className="toast-viewport" aria-live="polite">
                {toasts.map((t) => (
                    <div key={t.id} className={`toast toast-${t.type}`} role="status">
                        <span>{t.message}</span>
                        <button
                            className="toast-close"
                            onClick={() => removeToast(t.id)}
                            aria-label="Dismiss notification"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}