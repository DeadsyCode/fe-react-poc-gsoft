import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Matter, CreateMatterDTO } from '../../services/matterService';
import { Client, getAllClients } from '../../services/clientService';
import './MatterForm.css';

interface MatterFormProps {
  matter?: Matter;
  onSubmit: (data: CreateMatterDTO) => void;
  onCancel: () => void;
}

type FormErrors = {
  [key in keyof CreateMatterDTO]?: string;
};

// Fields that are required in the form
const requiredFields: (keyof CreateMatterDTO)[] = [
  'name',
  'clientId',
  'email'
];

const MatterForm: React.FC<MatterFormProps> = ({ matter, onSubmit, onCancel }) => {
  const { t } = useTranslation();
  const [clients, setClients] = useState<Client[]>([]);
  const [formData, setFormData] = useState<CreateMatterDTO>({
    clientId: undefined,
    name: '',
    openingDate: new Date(),
    phone: '',
    email: '',
    contact: '',
    effectiveDate: undefined,
    agreement: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load clients for dropdown
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await getAllClients();
        setClients(data);
        
        // If there are clients but no matter set default client
        if (data.length > 0 && !matter && !formData.clientId) {
          setFormData(prev => ({
            ...prev,
            clientId: data[0].id
          }));
        }
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };

    fetchClients();
  }, []);

  // Pre-fill form if editing an existing matter
  useEffect(() => {
    if (matter) {
      setFormData({
        clientId: matter.clientId,
        name: matter.name || '',
        openingDate: matter.openingDate ? new Date(matter.openingDate) : new Date(),
        phone: matter.phone || '',
        email: matter.email || '',
        contact: matter.contact || '',
        effectiveDate: matter.effectiveDate ? new Date(matter.effectiveDate) : undefined,
        agreement: matter.agreement || ''
      });
    }
  }, [matter]);

  const validateField = (name: keyof CreateMatterDTO, value: any): string => {
    if (requiredFields.includes(name) && (value === undefined || value === '')) {
      return t('validation.required');
    }
    
    switch (name) {
      case 'email':
        if (!value) return t('validation.required');
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(value as string) ? '' : t('validation.emailInvalid');
      default:
        return '';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Validate each field
    Object.entries(formData).forEach(([key, value]) => {
      const fieldName = key as keyof CreateMatterDTO;
      const error = validateField(fieldName, value);
      
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    
    // Mark all fields as touched to show validation errors
    const allTouched: { [key: string]: boolean } = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    return isValid;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof CreateMatterDTO) => {
    const { value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [fieldName]: value ? new Date(value) : undefined
    }));

    // Validate field
    if (touched[fieldName] || isSubmitting) {
      const error = validateField(fieldName, value ? new Date(value) : undefined);
      setErrors(prev => ({
        ...prev,
        [fieldName]: error
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    let processedValue: string | number | undefined = value;
    if (name === 'clientId') {
      processedValue = value ? parseInt(value, 10) : undefined;
    }
    
    setFormData({
      ...formData,
      [name]: processedValue
    });

    // Validate field on change
    if (touched[name] || isSubmitting) {
      const error = validateField(name as keyof CreateMatterDTO, processedValue);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Mark field as touched
    setTouched({
      ...touched,
      [name]: true
    });

    // Validate field on blur
    let processedValue: any = value;
    if (name === 'clientId') {
      processedValue = value ? parseInt(value, 10) : undefined;
    }

    const error = validateField(name as keyof CreateMatterDTO, processedValue);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    if (validateForm()) {
      // Format dates for API
      const formattedData = {
        ...formData,
        openingDate: formData.openingDate,
        effectiveDate: formData.effectiveDate
      };
      
      onSubmit(formattedData);
    }
  };

  // Helper to check if a field is required
  const isFieldRequired = (fieldName: string): boolean => {
    return requiredFields.includes(fieldName as keyof CreateMatterDTO);
  };

  // Format date for input field
  const formatDateForInput = (date?: Date): string => {
    if (!date) return '';
    return date instanceof Date 
      ? date.toISOString().split('T')[0]
      : '';
  };

  return (
    <form className="matter-form" onSubmit={handleSubmit} id="matter-form">
      <div className="form-row cols-2">
        <div className="form-group">
          <label htmlFor="name" className={errors.name && touched.name ? 'form-label-required' : ''}>
            {t('matter.name')} <span className="required-indicator">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className={`form-input ${errors.name && touched.name ? 'is-invalid' : ''}`}
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {errors.name && touched.name && (
            <div className="form-error">{errors.name}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="clientId" className={errors.clientId && touched.clientId ? 'form-label-required' : ''}>
            {t('matter.clientId')} <span className="required-indicator">*</span>
          </label>
          <select
            id="clientId"
            name="clientId"
            className={`form-select ${errors.clientId && touched.clientId ? 'is-invalid' : ''}`}
            value={formData.clientId || ''}
            onChange={handleChange}
            onBlur={handleBlur}
          >
            <option value="">{t('matter.selectClient')}</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.businessName} ({client.shortName})
              </option>
            ))}
          </select>
          {errors.clientId && touched.clientId && (
            <div className="form-error">{errors.clientId}</div>
          )}
        </div>
      </div>

      <div className="form-row cols-2">
        <div className="form-group">
          <label htmlFor="openingDate">
            {t('matter.openingDate')}
          </label>
          <input
            type="date"
            id="openingDate"
            name="openingDate"
            className="form-input"
            value={formatDateForInput(formData.openingDate)}
            onChange={(e) => handleDateChange(e, 'openingDate')}
          />
        </div>

        <div className="form-group">
          <label htmlFor="effectiveDate">
            {t('matter.effectiveDate')}
          </label>
          <input
            type="date"
            id="effectiveDate"
            name="effectiveDate"
            className="form-input"
            value={formatDateForInput(formData.effectiveDate)}
            onChange={(e) => handleDateChange(e, 'effectiveDate')}
          />
        </div>
      </div>

      <div className="form-row cols-2">
        <div className="form-group">
          <label htmlFor="phone">
            {t('matter.phone')}
          </label>
          <input
            type="text"
            id="phone"
            name="phone"
            className="form-input"
            value={formData.phone || ''}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email" className={errors.email && touched.email ? 'form-label-required' : ''}>
            {t('matter.email')} <span className="required-indicator">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className={`form-input ${errors.email && touched.email ? 'is-invalid' : ''}`}
            value={formData.email || ''}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {errors.email && touched.email && (
            <div className="form-error">{errors.email}</div>
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="contact">
          {t('matter.contact')}
        </label>
        <input
          type="text"
          id="contact"
          name="contact"
          className="form-input"
          value={formData.contact || ''}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="agreement">
          {t('matter.agreement')}
        </label>
        <textarea
          id="agreement"
          name="agreement"
          className="form-textarea"
          value={formData.agreement || ''}
          onChange={handleChange}
        />
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="modal-button modal-button-secondary"
          onClick={onCancel}
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          className="modal-button modal-button-primary"
        >
          {matter ? t('common.update') : t('common.create')}
        </button>
      </div>
    </form>
  );
};

export default MatterForm;