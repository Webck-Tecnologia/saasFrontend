import { useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import { useToast } from "@/hooks/use-toast";

const handleInputErrors = ({username, email, password, confirmPassword, cpf, gender}) => {
    if(!username) return {error: true, message: "⚠️ Nome de usuário é obrigatório!"};
    if(!email) return {error: true, message: "⚠️ Email é obrigatório!"};
    if(!password) return {error: true, message: "🔒 Senha é obrigatória!"};
    if(!confirmPassword) return {error: true, message: "🔒 Confirmação de senha é obrigatória!"};
    if(!cpf) return {error: true, message: "🆔 CPF é obrigatório!"};
    if(!gender) return {error: true, message: "🚫 Gênero é obrigatório!"};
    if(password !== confirmPassword) return {error: true, message: "❌ As senhas não conferem!"};
    return {error: false, message: "✔️ Tudo certo!"};
}

export const useSignup = () => {
    const [loading, setLoading] = useState(false);
    const { setAuthUser } = useAuthContext();
    const { toast } = useToast();
    
    const signup = async({email, username, password, confirmPassword, cpf, gender}) => {
        const errorCheck = handleInputErrors({
            username,
            email,
            password,
            confirmPassword,
            cpf,
            gender
        });

        if(errorCheck.error) {
            toast({
                title: "Erro no cadastro",
                description: errorCheck.message,
                variant: "destructive",
            });
            return;
        }

        try {
            setLoading(true);
            const res = await fetch("/api/auth/cadastro", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    confirmPassword,
                    cpf,
                    gender
                })
            });

            const data = await res.json();

            if (res.status === 201) {
                toast({
                    title: "✅ Cadastro realizado com sucesso",
                    description: "Bem-vindo ao sistema!",
                    variant: "default",
                });

                localStorage.setItem("user", JSON.stringify(data));
                setAuthUser(data);
            } else {
                throw new Error(data.message || "Ocorreu um erro ao tentar cadastrar.");
            }
        } catch (error) {
            console.error("Erro durante o cadastro:", error);
            toast({
                title: "❌ Erro no cadastro",
                description: error.message || "Ocorreu um erro ao tentar cadastrar. Por favor, tente novamente.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }

    return { signup, loading };
}
