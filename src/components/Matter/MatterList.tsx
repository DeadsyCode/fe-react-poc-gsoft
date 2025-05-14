import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FiPlus, FiSearch, FiEdit2, FiTrash2, FiBriefcase,
  FiMail, FiPhone, FiCalendar, FiFileText, FiUser
} from 'react-icons/fi';
import { BiSad } from 'react-icons/bi';
import { HiOutlineExclamationTriangle } from 'react-icons/hi2';
import Modal from '../Modal/Modal';
import MatterForm from './MatterForm';
import { Matter, CreateMatterDTO } from '../../services/matterService';
import './MatterList.css';

interface MatterListProps {
  matters: Matter[];
  onCreateMatter: (data: CreateMatterDTO) => Promise<void>;
  onUpdateMatter: (id: number, data: CreateMatterDTO) => Promise<void>;
  onDeleteMatter: (id: number) => Promise<void>;
  loading: boolean;
  error: string | null;
  clients: { [id: number]: string }; // Map of client IDs to names
}

const MatterList: React.FC<MatterListProps> = ({
  matters,
  onCreateMatter,
  onUpdateMatter,
  onDeleteMatter,
  loading,
  error,
  clients
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingMatter, setEditingMatter] = useState<Matter | null>(null);
  const [matterToDelete, setMatterToDelete] = useState<Matter | null>(null);

  // Format date for display
  const formatDate = (date?: Date | string): string => {
    if (!date) return '';
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString();
  };

  // Filter matters based on search term
  const filteredMatters = useMemo(() => {
    if (!searchTerm) return matters;

    const term = searchTerm.toLowerCase();
    return matters.filter(matter =>
      (matter.name && matter.name.toLowerCase().includes(term)) ||
      (matter.email && matter.email.toLowerCase().includes(term)) ||
      (matter.phone && matter.phone.toLowerCase().includes(term)) ||
      (matter.contact && matter.contact.toLowerCase().includes(term)) ||
      (clients[matter.clientId || 0] && clients[matter.clientId || 0].toLowerCase().includes(term))
    );
  }, [matters, searchTerm, clients]);

  const handleCreateMatter = (data: CreateMatterDTO) => {
    onCreateMatter(data)
      .then(() => {
        setIsCreateModalOpen(false);
      })
      .catch(error => {
        console.error('Error creating matter:', error);
      });
  };

  const handleUpdateMatter = (data: CreateMatterDTO) => {
    if (editingMatter) {
      onUpdateMatter(editingMatter.id, data)
        .then(() => {
          setEditingMatter(null);
        })
        .catch(error => {
          console.error('Error updating matter:', error);
        });
    }
  };

  const handleDeleteMatter = () => {
    if (matterToDelete) {
      onDeleteMatter(matterToDelete.id)
        .then(() => {
          setMatterToDelete(null);
        })
        .catch(error => {
          console.error('Error deleting matter:', error);
        });
    }
  };

  // Delete modal footer buttons
  const deleteModalFooter = (
    <div>
      <button
        className="modal-button modal-button-secondary"
        onClick={() => setMatterToDelete(null)}
      >
        {t('common.cancel')}
      </button>
      <button
        className="modal-button modal-button-primary"
        onClick={handleDeleteMatter}
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
    <div className="matter-list-container">
      <div className="matter-list-header">
        <div className="matter-list-actions">
          <div className="matter-search">
            <div className='client-action'>
              <FiSearch className="matter-search-icon" />
            </div>
            <div className='client-action'>
              <input
                type="text"
                className="matter-search-input"
                placeholder={t('matter.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <button
            className="add-matter-button"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <FiPlus />
            {t('matter.add')}
          </button>
        </div>
      </div>

      {matters.length === 0 ? (
        <div className="empty-state">
          <BiSad className="empty-state-icon" />
          <h3 className="empty-state-title">{t('matter.noMattersTitle')}</h3>
          <p className="empty-state-description">{t('matter.noMattersDescription')}</p>
          <button
            className="empty-state-button"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <FiPlus />
            {t('matter.addFirstMatter')}
          </button>
        </div>
      ) : filteredMatters.length === 0 ? (
        <div className="empty-state">
          <BiSad className="empty-state-icon" />
          <h3 className="empty-state-title">{t('matter.noSearchResultsTitle')}</h3>
          <p className="empty-state-description">
            {t('matter.noSearchResultsDescription', { searchTerm })}
          </p>
          <button
            className="empty-state-button"
            onClick={() => setSearchTerm('')}
          >
            {t('matter.clearSearch')}
          </button>
        </div>
      ) : (
        <div className="matter-grid">
          {filteredMatters.map(matter => (
            <div key={matter.id} className="matter-card">
              <div className="matter-card-header">
                <h3 className="matter-card-name">{matter.name}</h3>
                <span className="matter-card-client">
                  {clients[matter.clientId || 0] || t('matter.selectClient')}
                </span>
              </div>
              <div className="matter-card-details">
                {matter.openingDate && (
                  <div className="matter-card-detail">
                    <FiCalendar className="matter-card-icon" />
                    <div>
                      <div className="matter-card-label">{t('matter.openingDate')}</div>
                      <div className="matter-card-value">{formatDate(matter.openingDate)}</div>
                    </div>
                  </div>
                )}
                {matter.email && (
                  <div className="matter-card-detail">
                    <FiMail className="matter-card-icon" />
                    <div>
                      <div className="matter-card-label">{t('matter.email')}</div>
                      <div className="matter-card-value">{matter.email}</div>
                    </div>
                  </div>
                )}
                {matter.phone && (
                  <div className="matter-card-detail">
                    <FiPhone className="matter-card-icon" />
                    <div>
                      <div className="matter-card-label">{t('matter.phone')}</div>
                      <div className="matter-card-value">{matter.phone}</div>
                    </div>
                  </div>
                )}
                {matter.contact && (
                  <div className="matter-card-detail">
                    <FiUser className="matter-card-icon" />
                    <div>
                      <div className="matter-card-label">{t('matter.contact')}</div>
                      <div className="matter-card-value">{matter.contact}</div>
                    </div>
                  </div>
                )}
                {matter.effectiveDate && (
                  <div className="matter-card-detail">
                    <FiCalendar className="matter-card-icon" />
                    <div>
                      <div className="matter-card-label">{t('matter.effectiveDate')}</div>
                      <div className="matter-card-value">{formatDate(matter.effectiveDate)}</div>
                    </div>
                  </div>
                )}
                {matter.agreement && (
                  <div className="matter-card-detail">
                    <FiFileText className="matter-card-icon" />
                    <div>
                      <div className="matter-card-label">{t('matter.agreement')}</div>
                      <div className="matter-card-value">
                        {matter.agreement.length > 100
                          ? `${matter.agreement.substring(0, 100)}...`
                          : matter.agreement
                        }
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="matter-card-actions">
                <button
                  className="matter-card-action edit"
                  onClick={() => setEditingMatter(matter)}
                  title={t('common.edit')}
                >
                  <FiEdit2 />
                </button>
                <button
                  className="matter-card-action delete"
                  onClick={() => setMatterToDelete(matter)}
                  title={t('common.delete')}
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Matter Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={t('matter.addNew')}
        size="lg"
      >
        <MatterForm
          onSubmit={handleCreateMatter}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Edit Matter Modal */}
      <Modal
        isOpen={!!editingMatter}
        onClose={() => setEditingMatter(null)}
        title={t('matter.edit')}
        size="lg"
      >
        {editingMatter && (
          <MatterForm
            matter={editingMatter}
            onSubmit={handleUpdateMatter}
            onCancel={() => setEditingMatter(null)}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!matterToDelete}
        onClose={() => setMatterToDelete(null)}
        title={t('matter.confirmDelete')}
        size="sm"
        footer={deleteModalFooter}
      >
        {matterToDelete && (
          <div className="delete-confirmation">
            <HiOutlineExclamationTriangle className="delete-confirmation-icon" />
            <h3 className="delete-confirmation-title">{t('matter.deleteWarningTitle')}</h3>
            <p className="delete-confirmation-description">
              {t('matter.deleteWarningDescription')}
            </p>
            <p className="delete-confirmation-matter">
              {matterToDelete.name}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MatterList;