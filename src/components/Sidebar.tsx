import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  UserCircle,
  Package,
  Calendar,
  Tag,
  LogOut,
  FileText
} from 'lucide-react'
import { authApi } from '../lib/api'

/**
 * Interface para item do menu lateral
 */
interface MenuItem {
  name: string
  path: string
  icon: React.ReactNode
}

/**
 * Componente Sidebar para navegação entre páginas
 */
const Sidebar: React.FC = () => {
  const pathname = usePathname()
  const [isHoveringLogout, setIsHoveringLogout] = useState(false)
  const [logoutTextVisible, setLogoutTextVisible] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    // Get current user info
    const user = authApi.getUser()
    setCurrentUser(user)
  }, [])

  /**
   * Lista de itens do menu
   */
  const menuItems: MenuItem[] = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard size={22} strokeWidth={1.5} className="rounded-sm" />
    },
    {
      name: 'Clientes',
      path: '/clientes',
      icon: <UserCircle size={22} strokeWidth={1.5} className="rounded-sm" />
    },
    {
      name: 'Funcionários',
      path: '/funcionarios',
      icon: <Users size={22} strokeWidth={1.5} className="rounded-sm" />
    },
    {
      name: 'Produtos',
      path: '/produtos',
      icon: <Package size={22} strokeWidth={1.5} className="rounded-sm" />
    },
    {
      name: 'Contratos',
      path: '/contratos',
      icon: <FileText size={22} strokeWidth={1.5} className="rounded-sm" />
    },
    {
      name: 'Eventos e Locais',
      path: '/eventos-locais',
      icon: <Calendar size={22} strokeWidth={1.5} className="rounded-sm" />
    },
    {
      name: 'Categorias',
      path: '/categorias',
      icon: <Tag size={22} strokeWidth={1.5} className="rounded-sm" />
    }
  ]

  /**
   * Realiza logout do usuário
   */
  const handleLogout = () => {
    authApi.logout()
  }

  /**
   * Gerencia a animação do botão de logout
   */
  const handleLogoutHover = () => {
    setIsHoveringLogout(true)
    
    // Inicia a animação da seta e desaparecimento do texto
    setTimeout(() => {
      setLogoutTextVisible(false)
    }, 300)
  }

  /**
   * Gerencia o fim da animação do botão de logout quando o mouse sai
   */
  const handleLogoutLeave = () => {
    // Reseta os estados quando o mouse sai
    setIsHoveringLogout(false)
    setTimeout(() => {
      setLogoutTextVisible(true)
    }, 300)
  }

  return (
    <div className="h-screen w-64 flex flex-col relative overflow-hidden font-formula"
         style={{
           background: "linear-gradient(135deg, #E8CBC0 0%, #a4a7c2 50%, #636FA4 100%)",
           boxShadow: "2px 0 10px rgba(0,0,0,0.1)"
         }}>
      
      {/* Logo e nome da empresa (20%) */}
      <div className="p-6 flex-shrink-0 relative" style={{ height: "20%" }}>
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 bg-emerald rounded-lg flex items-center justify-center shadow-md">
            <span className="text-white font-formula text-xl">LOGO</span>
          </div>
          <h1 className="font-formula text-xl text-steel-gray">
            Loja de Aluguel
          </h1>
        </div>
      </div>
      
      {/* Divider between logo and navigation - positioned lower */}
      <div className="w-full h-[2px] mb-2 static-gradient-divider"></div>

      {/* Menu de navegação (40%) */}
      <nav className="flex-grow overflow-y-auto py-4 custom-scrollbar" style={{ height: "40%" }}>
        <div className="px-3">
          <ul className="space-y-1 rounded-lg shadow-lg overflow-hidden">
            {menuItems.map((item, index) => {
              const isActive = pathname === item.path
              const isFirst = index === 0
              const isLast = index === menuItems.length - 1
              
              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className={`
                      flex items-center px-4 py-3 text-sm transition-all duration-300 relative
                      ${isActive 
                        ? 'bg-soft-ivory text-steel-gray font-bold' 
                        : 'text-gray-700 hover:bg-soft-ivory hover:bg-opacity-30'}
                      ${isFirst ? 'rounded-t-lg' : ''}
                      ${isLast ? 'rounded-b-lg' : ''}
                    `}
                  >
                    <span className={`mr-3 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
                      {item.icon}
                    </span>
                    {item.name}
                    {isActive && <div className="absolute inset-0 shadow-glow rounded-lg pointer-events-none"></div>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </nav>
      
      {/* Divider between navigation and logout/user info */}
      <div className="w-full h-[2px] mb-2 static-gradient-divider"></div>

      {/* Área do usuário e logout (40%) */}
      <div className="flex-shrink-0 p-4 flex flex-col justify-end" style={{ height: "40%" }}>
        {/* Botão de logout com animação */}
        <button
          onClick={handleLogout}
          onMouseEnter={handleLogoutHover}
          onMouseLeave={handleLogoutLeave}
          className="relative w-full px-4 py-3 mb-8 bg-soft-ivory bg-opacity-20 rounded-lg transition-all duration-300 hover:bg-opacity-40 overflow-hidden"
        >
          <div className="flex items-center relative h-6 w-full">
            <div 
              className={`absolute transition-all duration-500 ${
                isHoveringLogout ? "animate-logout-arrow" : "left-0"
              }`}
              style={{
                animation: isHoveringLogout ? 
                  "logoutArrow 2s forwards" : "none"
              }}
            >
              <LogOut size={20} />
            </div>
            <span 
              className={`absolute left-8 font-formula transition-opacity duration-300 ${
                logoutTextVisible ? "opacity-100" : "opacity-0"
              }`}
            >
              Sair
            </span>
          </div>
        </button>
        
        {/* Informações do usuário */}
        {currentUser && (
          <div className="flex items-center space-x-3 p-3 mt-4 bg-soft-ivory bg-opacity-10 rounded-lg">
            {currentUser.imageUrl ? (
              <img 
                src={currentUser.imageUrl} 
                alt={`Foto de ${currentUser.name}`} 
                className="w-10 h-10 rounded-full object-cover border-2 border-light-yellow"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-light-yellow flex items-center justify-center text-white font-bold">
                {currentUser.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{currentUser.name || 'Usuário'}</p>
              <p className="text-xs opacity-70 truncate">{currentUser.email || ''}</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Adicionando estilo global para a animação e scrollbar */}
      <style jsx global>{`
        @keyframes logoutArrow {
          /* Passo 1: A seta vai da esquerda para a direita apagando o texto */
          0% { transform: translateX(0); opacity: 1; }
          25% { transform: translateX(80px); opacity: 1; }
          
          /* Passo 2: A seta para no lado direito */
          30% { transform: translateX(80px); opacity: 1; }
          
          /* Passo 3: A seta vai da direita para a esquerda até sumir */
          35% { transform: translateX(80px); opacity: 1; }
          90% { transform: translateX(-20px); opacity: 0; }
          
          /* Mantém invisível até o final */
          100% { transform: translateX(-20px); opacity: 0; }
        }
        
        /* Estilização da barra de rolagem para combinar com o gradient */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
        
        /* Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
        }
        
        /* Glow effect for active menu item */
        .shadow-glow {
          box-shadow: 0 0 10px 2px rgba(255, 255, 255, 0.5), 
                      0 0 15px 5px rgba(239, 233, 224, 0.3);
        }
        
        /* Hover effect for menu items */
        a:hover:not(.bg-soft-ivory) {
          box-shadow: 0 0 8px 1px rgba(255, 255, 255, 0.3), 
                      0 0 10px 2px rgba(239, 233, 224, 0.15);
        }
        
        /* Gradient divider that blends with the background - no animation */
        .static-gradient-divider {
          background: linear-gradient(to right, 
            rgba(255, 255, 255, 0.1), 
            rgba(255, 255, 255, 0.5) 50%, 
            rgba(255, 255, 255, 0.1)
          );
        }
      `}</style>
    </div>
  )
}

export default Sidebar