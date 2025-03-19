import React, { useState, useRef, useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Search, FileText, LayoutDashboard, Users, UserCircle, Package, Calendar, Tag, FileText as FileIcon, UserPlus } from 'lucide-react'
import { usePathname } from 'next/navigation'

/**
 * Interface para coluna da tabela
 */
export interface Column<T> {
  header: string
  accessor: keyof T | ((data: T) => React.ReactNode)
  cell?: (data: T) => React.ReactNode
}

/**
 * Interface para configuração de ações
 */
export interface ActionConfig<T> {
  edit?: {
    enabled: boolean
    onClick: (item: T) => void
  }
  delete?: {
    enabled: boolean
    onClick: (item: T) => void
  }
  view?: {
    enabled: boolean
    onClick: (item: T) => void
  }
  custom?: Array<{
    icon: React.ReactNode
    onClick: (item: T) => void
    title: string
  }>
}

/**
 * Propriedades do componente DataTable
 */
interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  title: string
  actions?: ActionConfig<T>
  onGeneratePdf?: () => void
  onGenerateItemPdf?: (item: T) => void
  onAdd?: () => void
  addButtonLabel?: string
  idField?: keyof T
  searchable?: boolean
  onSearch?: (searchTerm: string) => void
  loading?: boolean
}

/**
 * Componente de tabela de dados reutilizável
 */
function DataTable<T extends Record<string, any>>({
  data,
  columns,
  title,
  actions,
  onGeneratePdf,
  onGenerateItemPdf,
  onAdd,
  addButtonLabel = "Adicionar",
  idField = 'id' as keyof T,
  searchable = true,
  onSearch,
  loading = false
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [isSearchTyping, setIsSearchTyping] = useState(false)
  const [activeFilters, setActiveFilters] = useState<Record<string, boolean>>({})
  const [filterMenuOpen, setFilterMenuOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const filterMenuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const itemsPerPage = 10

  /**
   * Filtra os dados com base no termo de pesquisa e filtros ativos
   */
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    
    // Get the list of fields to search in
    const fieldsToSearch = Object.keys(activeFilters).length 
      ? columns
          .filter((col, index) => activeFilters[String(index)] || activeFilters[String(col.header)])
          .map(col => typeof col.accessor === 'string' ? col.accessor : null)
          .filter(Boolean) as (keyof T)[]
      : columns
          .map(col => typeof col.accessor === 'string' ? col.accessor : null)
          .filter(Boolean) as (keyof T)[];
    
    return data.filter((item) => {
      // If no specific fields are active for filtering, search all fields
      if (fieldsToSearch.length === 0) {
        return Object.values(item as Record<string, any>).some((value) => {
          if (value === null || value === undefined) return false;
          if (typeof value === 'object') return false;
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        });
      }
      
      // Otherwise search only the specified fields
      return fieldsToSearch.some(field => {
        const value = item[field];
        if (value === null || value === undefined) return false;
        if (typeof value === 'object') return false;
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [data, searchTerm, activeFilters, columns]);

  /**
   * Calcula os itens a serem exibidos na página atual
   */
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  /**
   * Calcula o número total de páginas
   */
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  /**
   * Renderiza o valor de uma célula
   */
  const renderCell = (item: T, column: Column<T>) => {
    if (column.cell) {
      return column.cell(item)
    }

    if (typeof column.accessor === 'function') {
      return column.accessor(item)
    }

    const value = item[column.accessor]
    
    if (value === null || value === undefined) {
      return ''
    }
    
    return String(value)
  }

  /**
   * Ativa a barra de pesquisa e inicia a animação
   */
  const activateSearch = () => {
    setIsSearchActive(true)
    setTimeout(() => {
      searchInputRef.current?.focus()
      setIsSearchTyping(true)
    }, 500) // Delay para dar tempo à animação de expansão
  }

  /**
   * Desativa a barra de pesquisa quando perde o foco
   */
  const deactivateSearch = () => {
    if (!searchTerm && !filterMenuOpen) {
      setIsSearchTyping(false)
      setTimeout(() => {
        setIsSearchActive(false)
      }, 300)
    }
  }
  
  /**
   * Toggle um filtro específico
   */
  const toggleFilter = (key: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  }
  
  /**
   * Limpa todos os filtros
   */
  const clearFilters = () => {
    setActiveFilters({});
  }
  
  /**
   * Handler para mudança na busca
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);
    
    // If an external search handler is provided, call it
    if (onSearch) {
      onSearch(value);
    }
  }
  
  // Close filter menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setFilterMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /**
   * Retorna o ícone correspondente à página atual
   */
  const getCurrentPageIcon = () => {
    if (pathname?.includes('/dashboard')) return <LayoutDashboard size={24} className="text-light-yellow" />;
    if (pathname?.includes('/funcionarios')) return <Users size={24} className="text-light-yellow" />;
    if (pathname?.includes('/clientes')) return <UserCircle size={24} className="text-light-yellow" />;
    if (pathname?.includes('/produtos')) return <Package size={24} className="text-light-yellow" />;
    if (pathname?.includes('/contratos')) return <FileIcon size={24} className="text-light-yellow" />;
    if (pathname?.includes('/eventos-locais')) return <Calendar size={24} className="text-light-yellow" />;
    if (pathname?.includes('/categorias')) return <Tag size={24} className="text-light-yellow" />;
    
    // Default icon
    return <LayoutDashboard size={24} className="text-light-yellow" />;
  };

  return (
    <div className="bg-soft-ivory rounded-lg shadow-lg overflow-hidden">
      {/* Cabeçalho */}
      <div className="p-4 flex justify-between items-center border-b border-light-yellow border-opacity-50">
        <div className="flex items-center">
          {getCurrentPageIcon()}
          <h2 className="text-xl font-boska text-steel-gray ml-3">{title}</h2>
        </div>
        
        <div className="flex space-x-3">
          {searchable && (
            <div className={`relative transition-all duration-500 ease-in-out ${isSearchActive ? 'w-64' : 'w-10'}`}>
              <div 
                className={`absolute inset-0 bg-soft-ivory rounded-md flex items-center cursor-pointer z-10 ${isSearchActive ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                onClick={activateSearch}
              >
                <Search size={20} className="mx-auto text-gray-500" />
              </div>
              <div className={`relative overflow-hidden transition-all duration-500 ${isSearchActive ? 'opacity-100' : 'opacity-0'}`}>
                <div className="relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    className="w-full px-10 py-2 bg-transparent border-b-2 border-peach-cream focus:outline-none"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onBlur={deactivateSearch}
                    placeholder={isSearchTyping ? 'Buscar...' : ''}
                  />
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  />
                  <button
                    type="button"
                    onClick={() => setFilterMenuOpen(!filterMenuOpen)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                    </svg>
                  </button>
                  
                  {/* Filter menu */}
                  {filterMenuOpen && (
                    <div 
                      ref={filterMenuRef}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-20 py-2"
                    >
                      <div className="px-4 py-2 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-sm text-gray-700">Filtrar por campo</span>
                          <button 
                            onClick={clearFilters}
                            className="text-xs text-light-yellow hover:underline"
                          >
                            Limpar filtros
                          </button>
                        </div>
                      </div>
                      <div className="max-h-60 overflow-y-auto py-1">
                        {columns.map((column, index) => (
                          <div 
                            key={index} 
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                            onClick={() => toggleFilter(column.header)}
                          >
                            <input 
                              type="checkbox" 
                              className="mr-2" 
                              checked={!!activeFilters[column.header]} 
                              onChange={() => {}} // Handled by the div click
                            />
                            <span className="text-sm text-gray-700">{column.header}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Add Button with Light Sweep Animation */}
          {onAdd && (
            <button
              onClick={onAdd}
              className="flex items-center px-4 py-2 bg-light-yellow text-white rounded-md light-sweep-button transition-colors duration-300"
              title={addButtonLabel}
            >
              <UserPlus size={18} className="mr-2" /> 
              <span>{addButtonLabel}</span>
            </button>
          )}
          
          {onGeneratePdf && (
            <button
              onClick={onGeneratePdf}
              className="flex items-center px-3 py-1 bg-light-yellow text-white rounded-md hover:bg-opacity-90 text-sm transition-colors duration-300"
              title="Gerar PDF com todos os registros"
            >
              <FileText size={16} className="mr-1" /> Gerar PDF
            </button>
          )}
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-steel-gray text-white">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-clash uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
              {actions && (actions.edit?.enabled || actions.delete?.enabled || actions.view?.enabled || actions.custom?.length) && (
                <th className="px-6 py-3 text-right text-xs font-clash uppercase tracking-wider">
                  Ações
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200" style={{ boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-light-yellow"></div>
                  </div>
                  <p className="mt-2">Carregando...</p>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  Nenhum registro encontrado
                </td>
              </tr>
            ) : (
              paginatedData.map((item, rowIndex) => (
                <tr key={String(item[idField]) || rowIndex} className="hover:bg-gray-50 transition-colors duration-150">
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {renderCell(item, column)}
                    </td>
                  ))}
                  {actions && (actions.edit?.enabled || actions.delete?.enabled || actions.view?.enabled || actions.custom?.length) && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {onGenerateItemPdf && (
                          <button
                            onClick={() => onGenerateItemPdf(item)}
                            className="text-light-yellow hover:text-opacity-80 transition-colors duration-150"
                            title="Gerar PDF"
                          >
                            <FileText size={18} className="transition-transform duration-150 hover:scale-110" />
                          </button>
                        )}
                        
                        {actions.view?.enabled && (
                          <button
                            onClick={() => actions.view?.onClick(item)}
                            className="text-blue-500 hover:text-blue-700 transition-colors duration-150"
                            title="Visualizar"
                          >
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              width="18" 
                              height="18" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="2" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                              className="transition-transform duration-150 hover:scale-110"
                            >
                              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </button>
                        )}
                        
                        {actions.edit?.enabled && (
                          <button
                            onClick={() => actions.edit?.onClick(item)}
                            className="text-amber-500 hover:text-amber-700 transition-colors duration-150"
                            title="Editar"
                          >
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              width="18" 
                              height="18" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="2" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                              className="transition-transform duration-150 hover:scale-110"
                            >
                              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                              <path d="m15 5 4 4" />
                            </svg>
                          </button>
                        )}
                        
                        {actions.delete?.enabled && (
                          <button
                            onClick={() => actions.delete?.onClick(item)}
                            className="text-red-500 hover:text-red-700 transition-colors duration-150"
                            title="Excluir"
                          >
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              width="18" 
                              height="18" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="2" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                              className="transition-transform duration-150 hover:scale-110"
                            >
                              <path d="M3 6h18" />
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                              <line x1="10" x2="10" y1="11" y2="17" />
                              <line x1="14" x2="14" y1="11" y2="17" />
                            </svg>
                          </button>
                        )}
                        
                        {actions.custom?.map((customAction, actionIndex) => (
                          <button
                            key={actionIndex}
                            onClick={() => customAction.onClick(item)}
                            className="text-gray-500 hover:text-gray-700 transition-colors duration-150"
                            title={customAction.title}
                          >
                            <div className="transition-transform duration-150 hover:scale-110">
                              {customAction.icon}
                            </div>
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-white">
          <div className="text-sm text-gray-700">
            Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a{' '}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, filteredData.length)}
            </span>{' '}
            de <span className="font-medium">{filteredData.length}</span> resultados
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md transition-colors duration-200 ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-sm'
              }`}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md transition-colors duration-200 ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-sm'
              }`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Estilos para a animação de digitação */}
      <style jsx>{`
        @keyframes typing {
          from { width: 0 }
          to { width: 100% }
        }
      `}</style>
    </div>
  )
}

export default DataTable