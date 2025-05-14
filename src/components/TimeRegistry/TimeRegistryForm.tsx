import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DatePickerComponent, TimePickerComponent } from '@syncfusion/ej2-react-calendars';
import { ComboBoxComponent } from '@syncfusion/ej2-react-dropdowns';
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import './TimeRegistryForm.css';
import { getAllClientsWithMatters, registerTimeEntry, ClientWithMatters, CreateTimeEntryDTO } from '../../services/timeEntryService';

interface TimeRegistryFormProps {
  onTimeEntryCreated: () => void;
}

const TimeRegistryForm: React.FC<TimeRegistryFormProps> = ({ onTimeEntryCreated }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<{
    clientId: number | undefined;
    matterId: number | undefined;
    date: Date;
    startTime: Date | undefined;
    endTime: Date | undefined;
    description: string;
  }>({
    clientId: undefined,
    matterId: undefined,
    date: new Date(),
    startTime: undefined,
    endTime: undefined,
    description: ''
  });

  const [clients, setClients] = useState<ClientWithMatters[]>([]);
  const [availableMatters, setAvailableMatters] = useState<{ text: string; value: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch clients and matters
  useEffect(() => {
    const fetchClientsWithMatters = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllClientsWithMatters();
        setClients(data);
      } catch (err) {
        console.error('Error fetching clients with matters:', err);
        setError('Failed to load clients and matters');
      } finally {
        setLoading(false);
      }
    };

    fetchClientsWithMatters();
  }, []);

  // Update available matters when client changes
  useEffect(() => {
    if (formData.clientId) {
      const selectedClient = clients.find(client => client.id === formData.clientId);
      if (selectedClient) {
        const matters = selectedClient.matters.map(matter => ({
          text: matter.name || 'Unnamed Matter',
          value: matter.id
        }));
        setAvailableMatters(matters);

        // Reset selected matter if it doesn't belong to the selected client
        if (formData.matterId) {
          const matterExists = selectedClient.matters.some(m => m.id === formData.matterId);
          if (!matterExists) {
            setFormData(prev => ({ ...prev, matterId: undefined }));
          }
        }
      }
    } else {
      setAvailableMatters([]);
    }
  }, [formData.clientId, clients]);

  // Format client data for dropdown
  const clientsData = clients.map(client => ({
    text: `${client.businessName} (${client.shortName})`,
    value: client.id
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.clientId || !formData.matterId || !formData.startTime || !formData.endTime) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create time entry data
      const timeEntryData: CreateTimeEntryDTO = {
        clientId: formData.clientId,
        matterId: formData.matterId,
        description: formData.description,
        timeEntryDate: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime
      };

      console.log(formData.date);

      await registerTimeEntry(timeEntryData);

      // Reset form
      setFormData({
        clientId: formData.clientId,  // Keep the selected client
        matterId: formData.matterId,  // Keep the selected matter
        date: new Date(),
        startTime: undefined,
        endTime: undefined,
        description: ''
      });

      // Notify parent component
      onTimeEntryCreated();

    } catch (err) {
      console.error('Error registering time entry:', err);
      setError('Failed to register time entry');
    } finally {
      setLoading(false);
    }
  };

  // Set current time with 30 min increment for end time
  const setCurrentTimeWithIncrement = () => {
    const now = new Date();
    const startTime = new Date();
    const endTime = new Date();
    endTime.setMinutes(now.getMinutes() + 30);

    setFormData(prev => ({
      ...prev,
      startTime,
      endTime
    }));
  };

  return (
    <div className="time-registry-form-container">
      <form onSubmit={handleSubmit} className="time-registry-form">
        <h2 className="form-title">{t('timeRegistry.title')}</h2>

        {error && <div className="form-error">{error}</div>}

        <div className="form-group">
          <ComboBoxComponent
            dataSource={clientsData}
            fields={{ text: 'text', value: 'value' }}
            placeholder={t('timeRegistry.selectClient')}
            value={formData.clientId}
            change={(e) => setFormData({ ...formData, clientId: e.value })}
            className="form-control"
            showClearButton={true}
          />
        </div>

        <div className="form-group">
          <ComboBoxComponent
            dataSource={availableMatters}
            fields={{ text: 'text', value: 'value' }}
            placeholder={t('timeRegistry.selectMatter')}
            value={formData.matterId}
            change={(e) => setFormData({ ...formData, matterId: e.value })}
            className="form-control"
            enabled={formData.clientId !== undefined}
            showClearButton={true}
          />
        </div>

        <div className="form-group time-inputs">
          <div className="date-input">
            <DatePickerComponent
              value={formData.date}
              change={(e) => setFormData({ ...formData, date: e.value })}
              className="form-control"
              placeholder="Select Date"
              format="dd/MM/yyyy"
            />
          </div>
          <div className="time-input">
            <TimePickerComponent
              placeholder={t('timeRegistry.startTime')}
              value={formData.startTime}
              change={(e) => setFormData({ ...formData, startTime: e.value })}
              className="form-control"
              format="HH:mm"
              step={15}
            />
          </div>
          <div className="time-input">
            <TimePickerComponent
              placeholder={t('timeRegistry.endTime')}
              value={formData.endTime}
              change={(e) => setFormData({ ...formData, endTime: e.value })}
              className="form-control"
              format="HH:mm"
              step={15}
            />
          </div>
        </div>

        <div className="form-group">
          <TextBoxComponent
            multiline={true}
            placeholder={t('timeRegistry.description')}
            value={formData.description}
            change={(e) => setFormData({ ...formData, description: e.value })}
            className="form-control description-input"
          />
        </div>

        <div className="form-actions">

          <ButtonComponent
            type="submit"
            className="submit-button"
            disabled={loading || !formData.clientId || !formData.matterId}
          >
            {loading ? '...' : t('timeRegistry.submit')}
          </ButtonComponent>
        </div>
      </form>
    </div>
  );
};

export default TimeRegistryForm;