import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const useLogout = () => {
  const [loading, setLoading] = useState(false);
  const { setAuthUser } = useContext(AuthContext);
  const { toast } = useToast();
  const navigate = useNavigate();

  const logout = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/auth/logout", {
        method: "GET",
        credentials: 'include',
      });

      if (!res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const data = await res.json();
          throw new Error(data.error || "Erro ao efetuar logout!");
        } else {
          const text = await res.text();
          console.error("Resposta não-JSON do servidor:", text);
          throw new Error("Resposta inesperada do servidor");
        }
      }

      // Se chegou aqui, o logout foi bem-sucedido
      toast({
        title: "Logout efetuado com sucesso!",
        description: "Você foi desconectado com sucesso!",
        variant: "default",
      });
      localStorage.removeItem("token");
      setAuthUser(null);

      // Adicione esta linha para redirecionar para a página de login
      navigate('/login');

    } catch (error) {
      console.error("Erro detalhado:", error);
      toast({
        title: "Erro no logout",
        description: error.message || "Erro ao efetuar logout!",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { logout, loading };
};

export default useLogout;
