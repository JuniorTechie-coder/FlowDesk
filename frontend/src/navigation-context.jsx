
import { createContext, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const NavigationContext = createContext(null);

export function NavigationProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const value = {
    currentPath: location.pathname,
    navigateTo: (path, options) => navigate(path, options),
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);

  if (!context) {
    throw new Error(
      "useNavigation must be used inside NavigationProvider"
    );
  }

  return context;
}
