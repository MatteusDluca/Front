// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Pegar o token do localStorage não é possível no middleware
  // Precisamos usar cookies em vez disso
  const token = request.cookies.get('token')?.value;
  
  // Verificar a URL atual
  const { pathname } = request.nextUrl;
  
  // Rotas públicas que não precisam de autenticação
  const publicRoutes = ['/login'];
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname === route + '/');
  
  // Se não houver token e a rota não for pública
  if (!token && !isPublicRoute) {
    // Rota de API - retorna status 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Redirecionar para a página de login
    const url = new URL('/login', request.url);
    // Armazenar a URL original para redirecionar de volta após o login
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }
  
  // Se tiver token e estiver tentando acessar login, redirecionar para dashboard
  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

// Configurar quais rotas o middleware deve ser executado
export const config = {
  matcher: [
    /*
     * Corresponde a todas as rotas exceto:
     * 1. Arquivos estáticos (_next/static, favicon.ico, etc)
     * 2. Imagens (_next/image, etc)
     * 3. API de debugger
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};