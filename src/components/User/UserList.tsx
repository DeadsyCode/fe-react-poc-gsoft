import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FiPlus, FiSearch, FiEdit2, FiTrash2, FiUser,
  FiMail, FiShield, FiUserCheck, FiTag
} from 'react-icons/fi';
import { BiSad } from 'react-icons/bi';
import { HiOutlineExclamationTriangle } from 'react-icons/hi2';
import Modal from '../Modal/Modal';
import UserForm from './UserForm';
import { User, CreateUserDTO, UpdateUserDTO } from '../../services/userService';
import './UserList.css';

interface UserListProps {
  users: User[];
  onCreateUser: (data: CreateUserDTO) => Promise<void>;
  onUpdateUser: (id: number, data: UpdateUserDTO) => Promise<void>;
  onDeleteUser: (id: number) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const UserList: React.FC<UserListProps> = ({
  users,
  onCreateUser,
  onUpdateUser,
  onDeleteUser,
  loading,
  error
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;

    const term = searchTerm.toLowerCase();
    return users.filter(user =>
      user.firstName?.toLowerCase().includes(term) ||
      user.lastName?.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.roleName.toLowerCase().includes(term) ||
      (user.type && user.type.toLowerCase().includes(term))
    );
  }, [users, searchTerm]);

  const handleCreateUser = (data: CreateUserDTO) => {
    onCreateUser(data)
      .then(() => {
        setIsCreateModalOpen(false);
      })
      .catch(error => {
        console.error('Error creating user:', error);
      });
  };

  const handleUpdateUser = (data: UpdateUserDTO) => {
    if (editingUser) {
      onUpdateUser(editingUser.id, data)
        .then(() => {
          setEditingUser(null);
        })
        .catch(error => {
          console.error('Error updating user:', error);
        });
    }
  };

  const handleDeleteUser = () => {
    if (userToDelete) {
      onDeleteUser(userToDelete.id)
        .then(() => {
          setUserToDelete(null);
        })
        .catch(error => {
          console.error('Error deleting user:', error);
        });
    }
  };

  // Modal footer buttons
  const createModalFooter = (
    <>
      <button
        className="modal-button modal-button-secondary"
        onClick={() => setIsCreateModalOpen(false)}
      >
        {t('common.cancel')}
      </button>
      <button
        className="modal-button modal-button-primary"
        type="submit"
        form="user-form"
      >
        {t('common.create')}
      </button>
    </>
  );

  const editModalFooter = (
    <>
      <button
        className="modal-button modal-button-secondary"
        onClick={() => setEditingUser(null)}
      >
        {t('common.cancel')}
      </button>
      <button
        className="modal-button modal-button-primary"
        type="submit"
        form="user-form"
      >
        {t('common.update')}
      </button>
    </>
  );

  const deleteModalFooter = (
    <div>
      <button
        className="modal-button modal-button-secondary"
        onClick={() => setUserToDelete(null)}
      >
        {t('common.cancel')}
      </button>
      <button
        className="modal-button modal-button-primary"
        onClick={handleDeleteUser}
        style={{ backgroundColor: 'red', borderRadius: '25px' }}
      >
        {t('common.delete')}
      </button>
    </div>
  );

  if (loading) {
    return <div className="loading-indicator">{t('common.loading')}</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="user-list-container">
      <div className="user-list-header">
        <div className="user-list-actions">
          <div className="user-search">
            <div className="user-action">
              <FiSearch className="user-search-icon" />
            </div>
            <div className="user-action">
              <input
                type="text"
                className="user-search-input"
                placeholder={t('user.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <button
            className="add-user-button"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <FiPlus />
            {t('user.add')}
          </button>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="empty-state">
          <BiSad className="empty-state-icon" />
          <h3 className="empty-state-title">{t('user.noUsersTitle')}</h3>
          <p className="empty-state-description">{t('user.noUsersDescription')}</p>
          <button
            className="empty-state-button"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <FiPlus />
            {t('user.addFirstUser')}
          </button>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="empty-state">
          <BiSad className="empty-state-icon" />
          <h3 className="empty-state-title">{t('user.noSearchResultsTitle')}</h3>
          <p className="empty-state-description">
            {t('user.noSearchResultsDescription', { searchTerm })}
          </p>
          <button
            className="empty-state-button"
            onClick={() => setSearchTerm('')}
          >
            {t('user.clearSearch')}
          </button>
        </div>
      ) : (
        <div className="user-grid">
          {filteredUsers.map(user => (
            <div key={user.id} className="user-card">
              <div className="user-card-header">
                <h3 className="user-card-name">{`${user.firstName} ${user.lastName}`}</h3>
                <span className="user-card-role">{user.roleName}</span>
              </div>
              <div className="user-card-details">
                <div className="user-card-detail">
                  <FiMail className="user-card-icon" />
                  <div>
                    <div className="user-card-label">{t('user.email')}</div>
                    <div className="user-card-value">{user.email}</div>
                  </div>
                </div>
                <div className="user-card-detail">
                  <FiShield className="user-card-icon" />
                  <div>
                    <div className="user-card-label">{t('user.role')}</div>
                    <div className="user-card-value">{user.roleName}</div>
                  </div>
                </div>
                {user.type && (
                  <div className="user-card-detail">
                    <FiTag className="user-card-icon" />
                    <div>
                      <div className="user-card-label">{t('user.type')}</div>
                      <div className="user-card-value">{user.type}</div>
                    </div>
                  </div>
                )}
                {user.chiefId && (
                  <div className="user-card-detail">
                    <FiUserCheck className="user-card-icon" />
                    <div>
                      <div className="user-card-label">{t('user.chief')}</div>
                      <div className="user-card-value">{t('user.hasChief')}</div>
                    </div>
                  </div>
                )}
              </div>
              <div className="user-card-actions">
                <button
                  className="user-card-action edit"
                  onClick={() => setEditingUser(user)}
                  title={t('common.edit')}
                >
                  <FiEdit2 />
                </button>
                <button
                  className="user-card-action delete"
                  onClick={() => setUserToDelete(user)}
                  title={t('common.delete')}
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create User Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={t('user.addNew')}
        size="lg"
      >
        <UserForm
          onSubmit={handleCreateUser}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title={t('user.edit')}
        size="lg"
      >
        {editingUser && (
          <UserForm
            user={editingUser}
            onSubmit={handleUpdateUser}
            onCancel={() => setEditingUser(null)}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        title={t('user.confirmDelete')}
        size="sm"
        footer={deleteModalFooter}
      >
        {userToDelete && (
          <div className="delete-confirmation">
            <HiOutlineExclamationTriangle className="delete-confirmation-icon" />
            <h3 className="delete-confirmation-title">{t('user.deleteWarningTitle')}</h3>
            <p className="delete-confirmation-description">
              {t('user.deleteWarningDescription')}
            </p>
            <p className="delete-confirmation-user">
              {`${userToDelete.firstName} ${userToDelete.lastName} (${userToDelete.email})`}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserList;