// store/authStore.js
import { create } from "zustand";
import Cookies from "js-cookie";

const useAuthStore = create((set) => ({
    isLoggedIn: !!Cookies.get("token"), // Initialize with token check
    login: (token) => {
        Cookies.set("token", token); // Set token cookie
        set({ isLoggedIn: true }); // Update state
    },
    logout: () => {
        Cookies.remove("token"); // Remove token cookie
        set({ isLoggedIn: false }); // Update state
    },
}));

export default useAuthStore;