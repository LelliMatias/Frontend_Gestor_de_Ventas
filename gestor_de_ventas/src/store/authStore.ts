import { create } from 'zustand';

// --- Define Interfaces ---
interface User {
    id: number;
    nombre: string;
    email: string;
    rol: 'ADMIN' | 'VENDEDOR';
}

interface AuthState {
    token: string | null;
    user: User | null;
    login: (token: string, user: User) => void;
    logout: () => void;
}


function getInitialUser(): User | null {
    const userString = localStorage.getItem('user');
    if (!userString) {
        return null; // No user found
    }
    try {
        // Try to parse the string
        return JSON.parse(userString);
    } catch (error) {
        // If parsing fails (because it's "undefined" or invalid JSON), return null
        console.error("Failed to parse user from localStorage", error);
        return null;
    }
}



const useAuthStore = create<AuthState>((set) => ({
    token: localStorage.getItem('token') || null,
    user: getInitialUser(), // Use the safe function here
    login: (token, user) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        set({ token, user });
    },
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ token: null, user: null });
    },
}));

export default useAuthStore;