import { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import TabMenu from '../components/TabMenu/TabMenu';
import ClientList from '../components/Client/ClientList';
import MatterList from '../components/Matter/MatterList';
import UserList from '../components/User/UserList';
import { useTranslation } from 'react-i18next';
import './Home.css';
import { HiMenu } from 'react-icons/hi';

// Import client services
import { Client, CreateClientDTO, getAllClients, createClient, updateClient, deleteClient } from '../services/clientService';
// Import matter services
import { Matter, CreateMatterDTO, getAllMatters, createMatter, updateMatter, deleteMatter } from '../services/matterService';
// Import user services
import { User, CreateUserDTO, UpdateUserDTO, getAllUsers, createUser, updateUser, deleteUser } from '../services/userService';

const Home = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('clients');
  const [clients, setClients] = useState<Client[]>([]);
  const [matters, setMatters] = useState<Matter[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Mapping for client names (for displaying in matters list)
  const [clientsMap, setClientsMap] = useState<{[id: number]: string}>({});

  const tabItems = [
    { id: 'clients', labelKey: 'home.tabMenu.clients' },
    { id: 'matters', labelKey: 'home.tabMenu.matters' },
    { id: 'users', labelKey: 'home.tabMenu.users' },
    // { id: 'companies', labelKey: 'home.tabMenu.companies' },
    // { id: 'times', labelKey: 'home.tabMenu.times' },
  ];

  // Fetch data based on the active tab
  useEffect(() => {
    if (activeTab === 'clients') {
      fetchClients();
    } else if (activeTab === 'matters') {
      fetchClients(); // Need clients for the dropdown in matter form
      fetchMatters();
    } else if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  // Update clients map for use in matters display
  useEffect(() => {
    const map: {[id: number]: string} = {};
    clients.forEach(client => {
      map[client.id] = `${client.businessName} (${client.shortName})`;
    });
    setClientsMap(map);
  }, [clients]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllClients();
      setClients(data);
    } catch (err) {
      setError(t('client.error.loading'));
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatters = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllMatters();
      setMatters(data);
    } catch (err) {
      setError(t('matter.error.loading'));
      console.error('Error fetching matters:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(t('user.error.loading'));
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Client CRUD operations
  const handleCreateClient = async (data: CreateClientDTO) => {
    try {
      setError(null);
      await createClient(data);
      await fetchClients(); // Refresh after creation
      return Promise.resolve();
    } catch (err) {
      setError(t('client.error.creating'));
      console.error('Error creating client:', err);
      return Promise.reject(err);
    }
  };

  const handleUpdateClient = async (id: number, data: CreateClientDTO) => {
    try {
      setError(null);
      await updateClient(id, data);
      await fetchClients(); // Refresh after update
      return Promise.resolve();
    } catch (err) {
      setError(t('client.error.updating'));
      console.error('Error updating client:', err);
      return Promise.reject(err);
    }
  };

  const handleDeleteClient = async (id: number) => {
    try {
      setError(null);
      await deleteClient(id);
      await fetchClients(); // Refresh after deletion
      return Promise.resolve();
    } catch (err) {
      setError(t('client.error.deleting'));
      console.error('Error deleting client:', err);
      return Promise.reject(err);
    }
  };

  // Matter CRUD operations
  const handleCreateMatter = async (data: CreateMatterDTO) => {
    try {
      setError(null);
      await createMatter(data);
      await fetchMatters(); // Refresh after creation
      return Promise.resolve();
    } catch (err) {
      setError(t('matter.error.creating'));
      console.error('Error creating matter:', err);
      return Promise.reject(err);
    }
  };

  const handleUpdateMatter = async (id: number, data: CreateMatterDTO) => {
    try {
      setError(null);
      await updateMatter(id, data);
      await fetchMatters(); // Refresh after update
      return Promise.resolve();
    } catch (err) {
      setError(t('matter.error.updating'));
      console.error('Error updating matter:', err);
      return Promise.reject(err);
    }
  };

  const handleDeleteMatter = async (id: number) => {
    try {
      setError(null);
      await deleteMatter(id);
      await fetchMatters(); // Refresh after deletion
      return Promise.resolve();
    } catch (err) {
      setError(t('matter.error.deleting'));
      console.error('Error deleting matter:', err);
      return Promise.reject(err);
    }
  };

  // User CRUD operations
  const handleCreateUser = async (data: CreateUserDTO) => {
    try {
      setError(null);

      await createUser(data);

      await fetchUsers(); // Refresh after creation
      return Promise.resolve();
    } catch (err) {
      setError(t('user.error.creating'));
      console.error('Error creating user:', err);
      return Promise.reject(err);
    }
  };

  const handleUpdateUser = async (id: number, data: UpdateUserDTO) => {
    try {
      setError(null);
      console.log('To update',data)
      await updateUser(id, data);
      await fetchUsers(); // Refresh after update
      return Promise.resolve();
    } catch (err) {
      setError(t('user.error.updating'));
      console.error('Error updating user:', err);
      return Promise.reject(err);
    }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      setError(null);
      await deleteUser(id);
      await fetchUsers(); // Refresh after deletion
      return Promise.resolve();
    } catch (err) {
      setError(t('user.error.deleting'));
      console.error('Error deleting user:', err);
      return Promise.reject(err);
    }
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setError(null); // Clear any errors when changing tabs
  };

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'clients':
        return (
          <div className="tab-content">
            <ClientList
              clients={clients}
              loading={loading}
              error={error}
              onCreateClient={handleCreateClient}
              onUpdateClient={handleUpdateClient}
              onDeleteClient={handleDeleteClient}
            />
          </div>
        );
      case 'matters':
        return (
          <div className="tab-content">
            <MatterList
              matters={matters}
              loading={loading}
              error={error}
              onCreateMatter={handleCreateMatter}
              onUpdateMatter={handleUpdateMatter}
              onDeleteMatter={handleDeleteMatter}
              clients={clientsMap}
            />
          </div>
        );
      case 'users':
        return (
          <div className="tab-content">
            <UserList
              users={users}
              loading={loading}
              error={error}
              onCreateUser={handleCreateUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
            />
          </div>
        );
      case 'companies':
        return (
          <div className="tab-content">
            <h2>{t('home.tabMenu.companies')}</h2>
            <p>Companies management content will be displayed here.</p>
          </div>
        );
      case 'times':
        return (
          <div className="tab-content">
            <h2>{t('home.tabMenu.times')}</h2>
            <p>Time tracking content will be displayed here.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="home-container">
        {/* <section className="hero-section">
          <div className="hero-content">
            <h1>{t('home.welcome')}</h1>
            <p className="hero-subtitle">
              {t('home.description')}
            </p>

          </div>
          <div className="hero-image">
            <div className="image-placeholder"></div>
          </div>
        </section> */}

        <div className="home-headers">
            <h1 >{t('home.title')}</h1>
            <p >{t('home.subtitle')}</p>

          </div>

        <section className="">
          <TabMenu items={tabItems} onTabChange={handleTabChange} />
          <div className="tab-content-container">
            {renderTabContent()}
          </div>
        </section>


      </div>
    </Layout>
  );
};

export default Home;