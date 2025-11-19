import { useState } from 'react';

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(!!sessionStorage.getItem('isAdminAuthenticated'));

    const login = (password: string) => {
        // In a real app, this would be an API call.
        if (password === 'Adrianka06') {
            sessionStorage.setItem('isAdminAuthenticated', 'true');
            setIsAuthenticated(true);
            return true;
        }
        return false;
    };

    const logout = () => {
        sessionStorage.removeItem('isAdminAuthenticated');
        setIsAuthenticated(false);
    };

    return { isAuthenticated, login, logout };
};
