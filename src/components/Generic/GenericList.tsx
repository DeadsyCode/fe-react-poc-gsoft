import React, { useState, useMemo, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { FiPlus, FiSearch } from 'react-icons/fi';
import { BiSad } from 'react-icons/bi';
import Modal from '../Modal/Modal';

// Define types for the GenericList component
export interface GenericItemProps {
  id: number;
  [key: string]: any;
}

interface GenericListProps<T extends GenericItemProps, CreateDTO> {
  items: T[];
  itemType: string; // For translations (e.g., 'client', 'matter')
  loading: boolean;
  error: string | null;
  onCreateItem: (data: CreateDTO) => Promise<void>;
  onUpdateItem: (id: number, data: CreateDTO) => Promise<void>;
  onDeleteItem: (id: number) => Promise<void>;
  renderForm: (props: {
    item?: T;
    onSubmit: (data: CreateDTO) => void;
    onCancel: () => void;
  }) => ReactNode;
  renderItemCard: (item: T, handlers: {
    onEdit: (item: T) => void;
    onDelete: (item: T) => void;
  }) => ReactNode;
  searchPredicate: (item: T, searchTerm: string) => boolean;
}

function GenericList<T extends GenericItemProps, CreateDTO>({
  items,
  itemType,
  loading,
  error,
  onCreateItem,
  onUpdateItem,
  onDeleteItem,
  renderForm,
  renderItemCard,
  searchPredicate
}: GenericListProps<T, CreateDTO>) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [itemToDelete, setItemToDelete] = useState<T | null>(null);

  // Filter items based on search term
  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;
    const term = searchTerm.toLowerCase();
    return items.filter(item => searchPredicate(item, term));
  }, [items, searchTerm, searchPredicate]);

  const handleCreateItem = (data: CreateDTO) => {
    onCreateItem(data)
      .then(() => {
        setIsCreateModalOpen(false);
      })
      .catch(error => {
        console.error(`Error creating ${itemType}:`, error);
      });
  };

  const handleUpdateItem = (data: CreateDTO) => {
    if (editingItem) {
      onUpdateItem(editingItem.id, data)
        .then(() => {
          setEditingItem(null);
        })
        .catch(error => {
          console.error(`Error updating ${itemType}:`, error);
        });
    }
  };

  const handleDeleteItem = () => {
    if (itemToDelete) {
      onDeleteItem(itemToDelete.id)
        .then(() => {
          setItemToDelete(null);
        })
        .catch(error => {
          console.error(`Error deleting ${itemType}:`, error);
        });
    }
  };

  // Delete modal footer buttons
  const deleteModalFooter = (
    <div>
      <button
        className="modal-button modal-button-secondary"
        onClick={() => setItemToDelete(null)}
      >
        {t('common.cancel')}
      </button>
      <button
        className="modal-button modal-button-primary"
        onClick={handleDeleteItem}
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

  const emptyStateTitle = t(`${itemType}.noItemsTitle`, { defaultValue: t(`${itemType}.noMattersTitle`) });
  const emptyStateDescription = t(`${itemType}.noItemsDescription`, { defaultValue: t(`${itemType}.noMattersDescription`) });
  const addFirstItemText = t(`${itemType}.addFirstItem`, { defaultValue: t(`${itemType}.addFirstMatter`) });
  const noSearchResultsTitle = t(`${itemType}.noSearchResultsTitle`);
  const noSearchResultsDescription = t(`${itemType}.noSearchResultsDescription`, { searchTerm });
  const clearSearchText = t(`${itemType}.clearSearch`);
  const addItemText = t(`${itemType}.add`);
  const searchPlaceholder = t(`${itemType}.search`);
  const confirmDeleteTitle = t(`${itemType}.confirmDelete`);
  const addNewTitle = t(`${itemType}.addNew`);
  const editTitle = t(`${itemType}.edit`);
  const deleteWarningTitle = t(`${itemType}.deleteWarningTitle`);
  const deleteWarningDescription = t(`${itemType}.deleteWarningDescription`);

  return (
    <div className={`${itemType}-list-container`}>
      <div className={`${itemType}-list-header`}>
        <div className={`${itemType}-list-actions`}>
          <div className={`${itemType}-search`}>
            <div className='client-action'>
              <FiSearch className={`${itemType}-search-icon`} />
            </div>
            <div className='client-action'>
              <input
                type="text"
                className={`${itemType}-search-input`}
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <button
            className={`add-${itemType}-button`}
            onClick={() => setIsCreateModalOpen(true)}
          >
            <FiPlus />
            {addItemText}
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <BiSad className="empty-state-icon" />
          <h3 className="empty-state-title">{emptyStateTitle}</h3>
          <p className="empty-state-description">{emptyStateDescription}</p>
          <button
            className="empty-state-button"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <FiPlus />
            {addFirstItemText}
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="empty-state">
          <BiSad className="empty-state-icon" />
          <h3 className="empty-state-title">{noSearchResultsTitle}</h3>
          <p className="empty-state-description">
            {noSearchResultsDescription}
          </p>
          <button
            className="empty-state-button"
            onClick={() => setSearchTerm('')}
          >
            {clearSearchText}
          </button>
        </div>
      ) : (
        <div className={`${itemType}-grid`}>
          {filteredItems.map(item => 
            renderItemCard(item, {
              onEdit: (item) => setEditingItem(item),
              onDelete: (item) => setItemToDelete(item)
            })
          )}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={addNewTitle}
        size="lg"
      >
        {renderForm({
          onSubmit: handleCreateItem,
          onCancel: () => setIsCreateModalOpen(false)
        })}
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        title={editTitle}
        size="lg"
      >
        {editingItem && renderForm({
          item: editingItem,
          onSubmit: handleUpdateItem,
          onCancel: () => setEditingItem(null)
        })}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        title={confirmDeleteTitle}
        size="sm"
        footer={deleteModalFooter}
      >
        {itemToDelete && (
          <div className="delete-confirmation">
            <BiSad className="delete-confirmation-icon" />
            <h3 className="delete-confirmation-title">{deleteWarningTitle}</h3>
            <p className="delete-confirmation-description">
              {deleteWarningDescription}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default GenericList;