import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FiPlus, FiSearch, FiEdit2, FiTrash2, FiBriefcase,
  FiMail, FiPhone, FiGlobe, FiFileText
} from 'react-icons/fi';
import { BiSad } from 'react-icons/bi';
import { HiOutlineExclamationTriangle } from 'react-icons/hi2';
import Modal from '../Modal/Modal';
import ClientForm from './ClientForm';
import { Client, CreateClientDTO } from '../../services/clientService';
import './ClientList.css';

interface ClientListProps {
  clients: Client[];
  onCreateClient: (data: CreateClientDTO) => Promise<void>;
  onUpdateClient: (id: number, data: CreateClientDTO) => Promise<void>;
  onDeleteClient: (id: number) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const ClientList: React.FC<ClientListProps> = ({
  clients,
  onCreateClient,
  onUpdateClient,
  onDeleteClient,
  loading,
  error
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  // Filter clients based on search term
  const filteredClients = useMemo(() => {
    if (!searchTerm) return clients;

    const term = searchTerm.toLowerCase();
    return clients.filter(client =>
      client.shortName.toLowerCase().includes(term) ||
      client.businessName.toLowerCase().includes(term) ||
      client.taxId.toLowerCase().includes(term) ||
      client.email.toLowerCase().includes(term) ||
      client.phone.toLowerCase().includes(term) ||
      (client.contact && client.contact.toLowerCase().includes(term)) ||
      client.countryName.toLowerCase().includes(term)
    );
  }, [clients, searchTerm]);

  const handleCreateClient = (data: CreateClientDTO) => {
    onCreateClient(data)
      .then(() => {
        setIsCreateModalOpen(false);
      })
      .catch(error => {
        console.error('Error creating client:', error);
      });
  };

  const handleUpdateClient = (data: CreateClientDTO) => {
    if (editingClient) {
      onUpdateClient(editingClient.id, data)
        .then(() => {
          setEditingClient(null);
        })
        .catch(error => {
          console.error('Error updating client:', error);
        });
    }
  };

  const handleDeleteClient = () => {
    if (clientToDelete) {
      onDeleteClient(clientToDelete.id)
        .then(() => {
          setClientToDelete(null);
        })
        .catch(error => {
          console.error('Error deleting client:', error);
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
        form="client-form"
      >
        {t('common.create')}
      </button>
    </>
  );

  const editModalFooter = (
    <>
      <button
        className="modal-button modal-button-secondary"
        onClick={() => setEditingClient(null)}
      >
        {t('common.cancel')}
      </button>
      <button
        className="modal-button modal-button-primary"
        type="submit"
        form="client-form"
      >
        {t('common.update')}
      </button>
    </>
  );

  const deleteModalFooter = (
    <div >
      <button
        className="modal-button modal-button-secondary"
        onClick={() => setClientToDelete(null)}
      >
        {t('common.cancel')}
      </button>
      <button
        className="modal-button modal-button-primary"
        onClick={handleDeleteClient}
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
    <div className="client-list-container">
      <div className="client-list-header">
        {/* <h2 className="client-list-title">{t('client.list')}</h2> */}
        <div className="client-list-actions">
          <div className="client-search">
            <div className='client-action'>
            <FiSearch className="client-search-icon" />
            </div>
            <div className='client-action'>
            <input
              type="text"
              className="client-search-input"
              placeholder={t('client.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}

            />
            </div>
          </div>
          <button
            className="add-client-button"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <FiPlus />
            {t('client.add')}
          </button>
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="empty-state">
          <BiSad className="empty-state-icon" />
          <h3 className="empty-state-title">{t('client.noClientsTitle')}</h3>
          <p className="empty-state-description">{t('client.noClientsDescription')}</p>
          <button
            className="empty-state-button"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <FiPlus />
            {t('client.addFirstClient')}
          </button>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="empty-state">
          <BiSad className="empty-state-icon" />
          <h3 className="empty-state-title">{t('client.noSearchResultsTitle')}</h3>
          <p className="empty-state-description">
            {t('client.noSearchResultsDescription', { searchTerm })}
          </p>
          <button
            className="empty-state-button"
            onClick={() => setSearchTerm('')}
          >
            {t('client.clearSearch')}
          </button>
        </div>
      ) : (
        <div className="client-grid">
          {filteredClients.map(client => (
            <div key={client.id} className="client-card">
              <div className="client-card-header">
                <h3 className="client-card-name">{client.shortName}</h3>
                <span className="client-card-country">{client.countryName}</span>
              </div>
              <div className="client-card-details">
                <div className="client-card-detail">
                  <FiBriefcase className="client-card-icon" />
                  <div>
                    <div className="client-card-label">{t('client.businessName')}</div>
                    <div className="client-card-value">{client.businessName}</div>
                  </div>
                </div>
                <div className="client-card-detail">
                  <FiMail className="client-card-icon" />
                  <div>
                    <div className="client-card-label">{t('client.email')}</div>
                    <div className="client-card-value">{client.email}</div>
                  </div>
                </div>
                <div className="client-card-detail">
                  <FiPhone className="client-card-icon" />
                  <div>
                    <div className="client-card-label">{t('client.phone')}</div>
                    <div className="client-card-value">{client.phone}</div>
                  </div>
                </div>
                {client.website && (
                  <div className="client-card-detail">
                    <FiGlobe className="client-card-icon" />
                    <div>
                      <div className="client-card-label">{t('client.website')}</div>
                      <div className="client-card-value">{client.website}</div>
                    </div>
                  </div>
                )}
                {client.additionalNotes && (
                  <div className="client-card-detail">
                    <FiFileText className="client-card-icon" />
                    <div>
                      <div className="client-card-label">{t('client.additionalNotes')}</div>
                      <div className="client-card-value">
                        {client.additionalNotes.length > 100
                          ? `${client.additionalNotes.substring(0, 100)}...`
                          : client.additionalNotes
                        }
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="client-card-actions">
                <button
                  className="client-card-action edit"
                  onClick={() => setEditingClient(client)}
                  title={t('common.edit')}
                >
                  <FiEdit2 />
                </button>
                <button
                  className="client-card-action delete"
                  onClick={() => setClientToDelete(client)}
                  title={t('common.delete')}
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Client Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={t('client.addNew')}
        size="lg"
      >
        <ClientForm
          onSubmit={handleCreateClient}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Edit Client Modal */}
      <Modal
        isOpen={!!editingClient}
        onClose={() => setEditingClient(null)}
        title={t('client.edit')}
        size="lg"
      >
        {editingClient && (
          <ClientForm
            client={editingClient}
            onSubmit={handleUpdateClient}
            onCancel={() => setEditingClient(null)}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!clientToDelete}
        onClose={() => setClientToDelete(null)}
        title={t('client.confirmDelete')}
        size="sm"
        footer={deleteModalFooter}
      >
        {clientToDelete && (
          <div className="delete-confirmation">
            <HiOutlineExclamationTriangle className="delete-confirmation-icon" />
            <h3 className="delete-confirmation-title">{t('client.deleteWarningTitle')}</h3>
            <p className="delete-confirmation-description">
              {t('client.deleteWarningDescription')}
            </p>
            <p className="delete-confirmation-client">
              {clientToDelete.businessName} ({clientToDelete.shortName})
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ClientList;