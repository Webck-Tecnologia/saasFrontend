import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('access_token');

  // Lista de rotas que não precisam de autenticação
  const publicRoutes = ['/login', '/cadastro', '/workspace-setup'];

  // Verifica se a rota atual está na lista de rotas públicas
  const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname.startsWith(route));

  if (!token && !isPublicRoute) {
    // Se não há token e a rota não é pública, redireciona para o login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Decodificar o token JWT para obter o workspaceId
  const decodedToken = decodeJWT(token); // Implementar a função de decodificação JWT
  const workspaceId = decodedToken?.workspaceId;

  if (token && isPublicRoute && request.nextUrl.pathname === '/workspace-setup') {
    // Permite o acesso à rota /workspace-setup mesmo sem workspaceId
    return NextResponse.next();
  }

  console.log(workspaceId, "workspaceId")

  if (token && !workspaceId && request.nextUrl.pathname !== '/workspace-setup') {
    // Se o token existe, mas o workspaceId não está presente, redireciona para /workspace-setup
    return NextResponse.redirect(new URL('/workspace-setup', request.url));
  }

  if (token && workspaceId && isPublicRoute) {
    // Se há token e o workspaceId está presente, redireciona da rota pública para a rota principal
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Se tudo estiver ok, permite a requisição continuar
  return NextResponse.next();
}

// Função para decodificar o token JWT
function decodeJWT(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Erro ao decodificar o token JWT', error);
    return null;
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
