import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/home'
import AuthPage from './pages/auth'
import WebAppPage from './pages/webApp'
import ChatPage from './pages/chat'
import AppLayout from './layouts/AppLayout'
import NotFoundPage from './pages/404'
import { useAuthContext } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import WorkspaceSetup from './pages/WorkspaceSetup'
import CampanhasLayout from './features/campanhas/CampanhasLayout'
import Dashboard from './features/campanhas/page'
import ListarInstancias from './features/campanhas/ListarInstancias/page'
import Disparador from './features/campanhas/Disparador/page'
import Configuracoes from './features/campanhas/Configuracoes/page'
import CriarInstancia from './features/campanhas/CriarInstancia/page'
import ListarCampanhas from './features/campanhas/ListarCampanhas/page'
import BoltRotasLayout from './features/boltRotas/brotasLayout'
import DashboardRotas from './features/boltRotas/page'

function App() {
  const { authUser } = useAuthContext();
  
  return (
    <ProtectedRoute>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route 
          path='/auth' 
          element={authUser ? <Navigate to="/app" /> : <AuthPage />} 
        />
        <Route path='/login' element={<AuthPage />} />
        <Route path='/cadastro' element={<AuthPage />} />
        <Route path='/workspace-setup' element={<WorkspaceSetup />} />
        <Route 
          path='/app'
          element={<AppLayout />}
        > 
          <Route index element={<WebAppPage />} />
          <Route path='chat' element={<ChatPage />} />
          <Route path='campanhas' element={<CampanhasLayout />}>
            <Route index element={<Dashboard />} />
            <Route path='listar-instancias' element={<ListarInstancias />} />
            <Route path='disparador' element={<Disparador />} />
            <Route path='configuracoes' element={<Configuracoes />} />
            <Route path='criar-instancia' element={<CriarInstancia />} />
            <Route path='listar-campanhas' element={<ListarCampanhas />} />
          </Route>
          <Route path='bolt-rotas' element={<BoltRotasLayout />}>
            <Route index element={<DashboardRotas />} />
          </Route>
        </Route>
        <Route path='*' element={<NotFoundPage />} />
      </Routes>
    </ProtectedRoute>
  )
}

export default App
