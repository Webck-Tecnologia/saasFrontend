import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';
import { jwtDecode } from 'jwt-decode'; // Instale com: npm install jwt-decode

const publicRoutes = ['/login', '/cadastro'];

const ProtectedRoute = ({ children }) => {
  const { authUser, setAuthUser } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const isPublicRoute = publicRoutes.some(route => location.pathname.startsWith(route));

    if (!token) {
      if (!isPublicRoute) {
        navigate('/login');
      }
      return;
    }

    try {
      const decodedToken = jwtDecode(token);

      // Se não temos authUser, tentamos recuperá-lo do token
      if (!authUser) {
        setAuthUser({ ...decodedToken, token });
      }

      // Verifica se o usuário tem um activeWorkspaceId
      if (authUser?.activeWorkspaceId) {
        if (location.pathname === '/workspace-setup') {
          navigate('/app');
        }
      } else if (location.pathname !== '/workspace-setup' && !isPublicRoute) {
        navigate('/workspace-setup');
      }

    } catch (error) {
      console.error('Erro ao decodificar o token', error);
      localStorage.removeItem('token');
      navigate('/login');
    }
  }, [location, navigate, setAuthUser, authUser]);

  return <>{children}</>;
};

export default ProtectedRoute;
