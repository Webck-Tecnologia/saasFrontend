import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export const usePasswordReset = () => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const resetPwd = async (email) => {
        try {
            setIsLoading(true);

            const response = await fetch("/api/auth/forgotpassword", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();

            if (!data.success) throw new Error(data.message || "Falha ao enviar o email de reset.");

            toast({ title: "Sucesso", description: "Email de reset enviado com sucesso.", variant: "default" });
            return data;
        } catch (error) {
            console.error("Erro ao enviar email de reset:", error);
            toast({ title: "Erro", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const verifyPwdResetToken = async (token, email) => {
        try {
            setIsLoading(true);

            const response = await fetch("/api/auth/verpwdtoken", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, email }),
            });
            const data = await response.json();

            if (!data.success) throw new Error(data.message || "Token de reset inválido.");

            toast({ title: "Token verificado com sucesso", variant: "default" });
            return data;
        } catch (error) {
            console.error("Erro ao verificar token de reset:", error);
            toast({ title: "Erro", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const changePassword = async (email, newPassword, token) => {
        try {
            setIsLoading(true);

            const response = await fetch("/api/auth/changepwd", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    email, 
                    newPassword,
                    token
                }),
            });
            const data = await response.json();

            if (!data.success) throw new Error(data.message || "Erro ao mudar a senha.");

            toast({ title: "Senha alterada com sucesso", variant: "default" });
            return data;
        } catch (error) {
            console.error("Erro ao mudar a senha:", error);
            toast({ title: "Erro", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const verifyTokenExists = async (email, newPassword) => {
        try {
            setIsLoading(true);

            const response = await fetch("/api/auth/tokenresetverify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, newPassword }),
            });
            const data = await response.json();

            return data;
        } catch (error) {
            console.error("Erro ao verificar existência de token:", error);
            toast({ title: "Erro", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return { resetPwd, verifyPwdResetToken, changePassword, verifyTokenExists, isLoading };
};