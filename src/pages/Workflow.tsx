import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getAllProcessTypes, createProcessType, updateProcessType, deleteProcessType } from '../services/workflowService';
import WorkflowGrid from '../components/Workflow/WorkflowGrid';
import WorkflowDiagram from '../components/Workflow/WorkflowDiagram';
import './Workflow.css';

// Import SyncFusion styles
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-buttons/styles/material.css';
import '@syncfusion/ej2-calendars/styles/material.css';
import '@syncfusion/ej2-dropdowns/styles/material.css';
import '@syncfusion/ej2-inputs/styles/material.css';
import '@syncfusion/ej2-navigations/styles/material.css';
import '@syncfusion/ej2-popups/styles/material.css';
import '@syncfusion/ej2-splitbuttons/styles/material.css';
import '@syncfusion/ej2-react-grids/styles/material.css';
import '@syncfusion/ej2-react-diagrams/styles/material.css';
import Layout from '../components/Layout/Layout';

// Import icon
import { FaSitemap } from 'react-icons/fa';


interface ProcessType {
  id: number;
  description: string;
  averageDuration: number | null;
  state: boolean;
}

const Workflow: React.FC = () => {
  const { t } = useTranslation();
  const [processTypes, setProcessTypes] = useState<ProcessType[]>([]);
  const [selectedProcess, setSelectedProcess] = useState<ProcessType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProcessTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllProcessTypes();
      setProcessTypes(data);
    } catch (err) {
      setError(t('workflow.error.loading'));
      console.error('Error fetching process types:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcessTypes();
  }, []);

  const handleCreateProcessType = async (data: Omit<ProcessType, 'id'>) => {
    try {
      setError(null);
      await createProcessType(data);
      await fetchProcessTypes(); // Refresh the grid after creation
    } catch (err) {
      setError(t('workflow.error.creating'));
      console.error('Error creating process type:', err);
      throw err; // Re-throw to let the grid know the operation failed
    }
  };

  const handleUpdateProcessType = async (data: ProcessType) => {
    try {
      setError(null);
      let idToEdit = data.id;
      await updateProcessType(idToEdit, data);
      await fetchProcessTypes(); // Refresh the grid after update

      // Update selected process if it was the one that was edited
      if (selectedProcess && selectedProcess.id === data.id) {
        setSelectedProcess(data);
      }
    } catch (err) {
      setError(t('workflow.error.updating'));
      console.error('Error updating process type:', err);
      throw err; // Re-throw to let the grid know the operation failed
    }
  };

  const handleDeleteProcessType = async (id: number) => {
    try {
      setError(null);
      await deleteProcessType(id);
      await fetchProcessTypes(); // Refresh the grid after deletion

      // Clear selected process if it was the one deleted
      if (selectedProcess && selectedProcess.id === id) {
        setSelectedProcess(null);
      }
    } catch (err) {
      setError(t('workflow.error.deleting'));
      console.error('Error deleting process type:', err);
      throw err; // Re-throw to let the grid know the operation failed
    }
  };

  const handleProcessSelection = (process: ProcessType) => {
    setSelectedProcess(process);
  };

  const renderWorkflowContent = () => {
    if (loading && processTypes.length === 0) {
      return (
        <div className="workflow-loading">
          <div className="spinner"></div>
          <p>{t('common.loading')}</p>
        </div>
      );
    }

    if (error && processTypes.length === 0) {
      return (
        <div className="workflow-error">
          <p>{error}</p>
          <button onClick={() => fetchProcessTypes()}>{t('common.retry')}</button>
        </div>
      );
    }

    return (
      <div className="workflow-container">
        <div className="workflow-headers">
          <FaSitemap className="workflow-icon" />
          <h1 className="workflow-title">{t('workflow.title')}</h1>
          <p className="workflow-subtitle">{t('workflow.subtitle')}</p>
        </div>

        <div className="workflow-grid-container">
          <WorkflowGrid
            processTypes={processTypes}
            onCreateProcessType={handleCreateProcessType}
            onUpdateProcessType={handleUpdateProcessType}
            onDeleteProcessType={handleDeleteProcessType}
            onProcessSelection={handleProcessSelection}
          />
        </div>

        {selectedProcess ? (
          <div className="workflow-diagram-container">
            <div className="workflow-diagram-title">
              <FaSitemap className="workflow-diagram-icon" />
              {selectedProcess
                ? t('workflow.processFlow', { process: selectedProcess.description })
                : t('workflow.selectProcess')}
            </div>

            <WorkflowDiagram selectedProcess={selectedProcess} />
          </div>
        ) : (
          <div />
        )}
      </div>
    );
  };

  // Always render within Layout so navbar is always visible
  return (
    <Layout>
      {renderWorkflowContent()}
    </Layout>
  );
};

export default Workflow;