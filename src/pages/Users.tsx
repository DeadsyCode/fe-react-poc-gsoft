import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout/Layout';
import TabMenu from '../components/TabMenu/TabMenu';
import UserList from '../components/User/UserList';
import {
  User,
  CreateUserDTO,
  UpdateUserDTO,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from '../services/userService';
import { isAuthenticated } from '../services/authService';
import './Users.css';

const Users: React.FC = () => {
  const { t } = useTranslation();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    setAuthenticated(isAuthenticated());
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchUsers();
    }
  }, [authenticated]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(t('user.errorFetching'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (data: CreateUserDTO): Promise<void> => {
    try {
      console.log('User',data);
      await createUser(data);
      fetchUsers(); // Refresh users after creating one
    } catch (err) {
      console.error('Error creating user:', err);
      throw err;
    }
  };

  const handleUpdateUser = async (id: number, data: UpdateUserDTO): Promise<void> => {
    try {
      await updateUser(id, data);
      fetchUsers(); // Refresh users after updating one
    } catch (err) {
      console.error('Error updating user:', err);
      throw err;
    }
  };

  const handleDeleteUser = async (id: number): Promise<void> => {
    try {
      await deleteUser(id);
      fetchUsers(); // Refresh users after deleting one
    } catch (err) {
      console.error('Error deleting user:', err);
      throw err;
    }
  };

  if (authenticated === false) {
    return <Navigate to="/login" replace />;
  }

  const tabs = [
    { id: 'users', labelKey: 'user.usersList' }
  ];

  return (
    <Layout>
      <div className="users-container">
        <div className="users-header">
          <h1>{t('user.title')}</h1>
          <p>{t('user.description')}</p>
        </div>

        <TabMenu
          items={tabs}
          onTabChange={(tabId) => setActiveTab(tabId)}
        />

        <div className="users-content">
          {activeTab === 'users' && (
            <UserList
              users={users}
              onCreateUser={handleCreateUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              loading={loading}
              error={error}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Users;