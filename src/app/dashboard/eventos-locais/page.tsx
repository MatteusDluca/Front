// src/app/eventos-locais/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import DataTable, { Column } from '@/components/DataTable';
import { Event } from '@/types/event';
import { Location } from '@/types/location';
import { EventCategory } from '@/types/event-category';
import { eventApi } from '@/services/event-api';
import { locationApi } from '@/services/location-api';
import { eventCategoryApi } from '@/services/event-category-api';
import EventForm from '@/components/EventForm';
import LocationForm from '@/components/LocationForm';
import EventCategoryForm from '@/components/EventCategoryForm';

enum ActiveTab {
  EVENTS = 'events',
  LOCATIONS = 'locations',
  CATEGORIES = 'categories',
}

const EventsAndLocationsPage: React.FC = () => {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>(ActiveTab.EVENTS);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [eventsData, locationsData, categoriesData] = await Promise.all([
          eventApi.getAll(),
          locationApi.getAll(),
          eventCategoryApi.getAll(),
        ]);
        
        setEvents(eventsData);
        setLocations(locationsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Definir colunas para a tabela de eventos
  const eventColumns: Column<Event>[] = [
    {
      header: 'Nome',
      accessor: 'name',
    },
    {
      header: 'Data',
      accessor: (event) => event.date || '-',
    },
    {
      header: 'Hora',
      accessor: (event) => event.time || '-',
    },
    {
      header: 'Categoria',
      accessor: (event) => event.eventCategory?.name || '-',
    },
  ];

  // Definir colunas para a tabela de locais
  const locationColumns: Column<Location>[] = [
    {
      header: 'Nome',
      accessor: 'name',
    },
    {
      header: 'Endereço',
      accessor: (location) =>
        location.address
          ? `${location.address.street.name}, ${location.address.number}${
              location.address.complement ? `, ${location.address.complement}` : ''
            }`
          : '-',
    },
    {
      header: 'Cidade/Estado',
      accessor: (location) =>
        location.address
          ? `${location.address.city.name}/${location.address.city.state.uf}`
          : '-',
    },
  ];

  // Definir colunas para a tabela de categorias
  const categoryColumns: Column<EventCategory>[] = [
    {
      header: 'Nome',
      accessor: 'name',
    },
    {
      header: 'Status',
      accessor: (category) => 
        category.status === 'ACTIVE' ? 'Ativo' : 'Desativado',
      cell: (category) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            category.status === 'ACTIVE'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {category.status === 'ACTIVE' ? 'Ativo' : 'Desativado'}
        </span>
      ),
    },
  ];

  // Função para adicionar novo item
  const handleAddItem = () => {
    setSelectedItem(null);
    setIsCreating(true);
    setIsEditing(false);
  };

  // Função para editar item
  const handleEditItem = (item: any) => {
    setSelectedItem(item);
    setIsEditing(true);
    setIsCreating(false);
  };

  // Função para excluir item
  const handleDeleteItem = async (item: any) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) {
      return;
    }

    try {
      if (activeTab === ActiveTab.EVENTS) {
        await eventApi.delete(item.id);
        setEvents((prev) => prev.filter((event) => event.id !== item.id));
      } else if (activeTab === ActiveTab.LOCATIONS) {
        await locationApi.delete(item.id);
        setLocations((prev) => prev.filter((location) => location.id !== item.id));
      } else if (activeTab === ActiveTab.CATEGORIES) {
        await eventCategoryApi.delete(item.id);
        setCategories((prev) => prev.filter((category) => category.id !== item.id));
      }
    } catch (error) {
      console.error('Erro ao excluir item:', error);
      alert('Erro ao excluir item. Tente novamente.');
    }
  };

  // Função para salvar evento
  const handleSaveEvent = (event: Event) => {
    if (isEditing) {
      setEvents((prev) =>
        prev.map((item) => (item.id === event.id ? event : item))
      );
    } else {
      setEvents((prev) => [event, ...prev]);
    }
    setIsCreating(false);
    setIsEditing(false);
  };

  // Função para salvar local
  const handleSaveLocation = (location: Location) => {
    if (isEditing) {
      setLocations((prev) =>
        prev.map((item) => (item.id === location.id ? location : item))
      );
    } else {
      setLocations((prev) => [location, ...prev]);
    }
    setIsCreating(false);
    setIsEditing(false);
  };

  // Função para salvar categoria
  const handleSaveCategory = (category: EventCategory) => {
    if (isEditing) {
      setCategories((prev) =>
        prev.map((item) => (item.id === category.id ? category : item))
      );
    } else {
      setCategories((prev) => [category, ...prev]);
    }
    setIsCreating(false);
    setIsEditing(false);
  };

  // Função para cancelar edição/criação
  const handleCancel = () => {
    setIsCreating(false);
    setIsEditing(false);
  };

  // Renderizar formulário de acordo com a aba ativa
  const renderForm = () => {
    if (activeTab === ActiveTab.EVENTS) {
      return (
        <EventForm
          event={isEditing ? selectedItem : undefined}
          onSuccess={handleSaveEvent}
          onCancel={handleCancel}
        />
      );
    } else if (activeTab === ActiveTab.LOCATIONS) {
      return (
        <LocationForm
          location={isEditing ? selectedItem : undefined}
          onSuccess={handleSaveLocation}
          onCancel={handleCancel}
        />
      );
    } else if (activeTab === ActiveTab.CATEGORIES) {
      return (
        <EventCategoryForm
          category={isEditing ? selectedItem : undefined}
          onSuccess={handleSaveCategory}
          onCancel={handleCancel}
        />
      );
    }
    return null;
  };

  // Renderizar tabela de acordo com a aba ativa
  const renderTable = () => {
    if (activeTab === ActiveTab.EVENTS) {
      return (
        <DataTable
  data={events}
  columns={eventColumns}
  title="Eventos"
  loading={loading}
  actions={{
    view: {
      enabled: true,
      onClick: (event) => router.push(`/eventos-locais/${event.id}`),
    },
    edit: {
      enabled: true,
      onClick: handleEditItem,
    },
    delete: {
      enabled: true,
      onClick: handleDeleteItem,
    },
  }}
  onAdd={handleAddItem}
  addButtonLabel="Novo Evento"
/>
      );
    } else if (activeTab === ActiveTab.LOCATIONS) {
      return (
        <DataTable
  data={locations}
  columns={locationColumns}
  title="Locais"
  loading={loading}
  actions={{
    view: {
      enabled: true,
      onClick: (location) => router.push(`/eventos-locais/${location.id}`),
    },
    edit: {
      enabled: true,
      onClick: handleEditItem,
    },
    delete: {
      enabled: true,
      onClick: handleDeleteItem,
    },
  }}
  onAdd={handleAddItem}
  addButtonLabel="Novo Local"
/>
      );
    } else if (activeTab === ActiveTab.CATEGORIES) {
      return (
        <DataTable
  data={categories}
  columns={categoryColumns}
  title="Categorias de Evento"
  loading={loading}
  actions={{
    view: {
      enabled: true,
      onClick: (category) => router.push(`/eventos-locais/${category.id}`),
    },
    edit: {
      enabled: true,
      onClick: handleEditItem,
    },
    delete: {
      enabled: true,
      onClick: handleDeleteItem,
    },
  }}
  onAdd={handleAddItem}
  addButtonLabel="Nova Categoria"
/>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-2xl font-boska text-white mb-4 md:mb-0">
          Gerenciamento de Eventos e Locais
        </h1>
        <div className="bg-soft-ivory p-1 rounded-lg shadow-md">
          <div className="flex space-x-1">
            <button
              className={`px-4 py-2 rounded-md transition-colors ${
                activeTab === ActiveTab.EVENTS
                  ? 'bg-light-yellow text-white'
                  : 'text-steel-gray hover:bg-light-yellow hover:bg-opacity-20'
              }`}
              onClick={() => {
                setActiveTab(ActiveTab.EVENTS);
                setIsCreating(false);
                setIsEditing(false);
              }}
            >
              Eventos
            </button>
            <button
              className={`px-4 py-2 rounded-md transition-colors ${
                activeTab === ActiveTab.LOCATIONS
                  ? 'bg-light-yellow text-white'
                  : 'text-steel-gray hover:bg-light-yellow hover:bg-opacity-20'
              }`}
              onClick={() => {
                setActiveTab(ActiveTab.LOCATIONS);
                setIsCreating(false);
                setIsEditing(false);
              }}
            >
              Locais
            </button>
            <button
              className={`px-4 py-2 rounded-md transition-colors ${
                activeTab === ActiveTab.CATEGORIES
                  ? 'bg-light-yellow text-white'
                  : 'text-steel-gray hover:bg-light-yellow hover:bg-opacity-20'
              }`}
              onClick={() => {
                setActiveTab(ActiveTab.CATEGORIES);
                setIsCreating(false);
                setIsEditing(false);
              }}
            >
              Categorias
            </button>
          </div>
        </div>
      </div>

      {isCreating || isEditing ? renderForm() : renderTable()}
    </div>
  );
};

export default EventsAndLocationsPage;