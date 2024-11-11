import { createContext, useState, useContext } from "react";

export const AuthContext = createContext();

export const useAuthContext = () => {
    return useContext(AuthContext);
}

export const AuthContextProvider = ({ children }) => {
    const [authUser, setAuthUser] = useState(
        JSON.parse(localStorage.getItem("user")) || null);

    const updateAuthUser = (newAuthUser) => {
        setAuthUser(newAuthUser);
        localStorage.setItem("user", JSON.stringify(newAuthUser));
    };

    return (
        <AuthContext.Provider value={{ authUser, setAuthUser: updateAuthUser }}>
            {children}
        </AuthContext.Provider>
    )
}
