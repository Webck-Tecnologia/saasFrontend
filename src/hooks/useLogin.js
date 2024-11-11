import { useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';

const handleInputError = (email, password) => {
    if (!email || !password) {
        return "Preencha todos os campos";
    }
    return null;
}

const useLogin = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { setAuthUser } = useAuthContext();
    const { toast } = useToast();
    const navigate = useNavigate();

    const login = async (email, password) => {
        try {
            setIsLoading(true);

            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!data.token) {
                throw new Error(data.message || "Erro ao fazer login");
            }

            // Salva o token no localStorage
            localStorage.setItem("token", data.token);

            // Decodifica o token
            const decodedToken = jwtDecode(data.token);

            // Combina os dados do token com os dados do usuário retornados pela API
            const userData = {
                ...decodedToken,
                ...data.user,
                token: data.token
            };

            console.log("Dados do usuário após login:", userData);

            // Atualiza o contexto de autenticação com todos os dados do usuário
            setAuthUser(userData);

            toast({
                title: "Login realizado com sucesso!",
                description: `Bem-vindo, ${userData.username || 'usuário'}!`,
                variant: "default",
            });

            // Redireciona o usuário após o login bem-sucedido
            if (userData.workspaces && userData.workspaces.length > 0) {
                navigate('/app');
            } else {
                navigate('/workspace-setup');
            }

        } catch (error) {
            console.error("Erro durante o login:", error);
            toast({
                title: "Erro ao fazer login",
                description: error.message || "Ocorreu um erro inesperado. Por favor, tente novamente.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return { login, isLoading };
}

export default useLogin;
