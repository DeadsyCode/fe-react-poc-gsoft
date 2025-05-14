import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Client, CreateClientDTO } from '../../services/clientService';
import { Country, getAllCountries } from '../../services/countryService';
import './ClientForm.css';

interface ClientFormProps {
  client?: Client;
  onSubmit: (data: CreateClientDTO) => void;
  onCancel: () => void;
}

type FormErrors = {
  [key in keyof CreateClientDTO]?: string;
};

// Fields that are required in the form
const requiredFields: (keyof CreateClientDTO)[] = [
  'shortName',
  'businessName',
  'taxId',
  'phone',
  'email',
  'countryId'
];

const ClientForm: React.FC<ClientFormProps> = ({ client, onSubmit, onCancel }) => {
  const { t } = useTranslation();
  const [countries, setCountries] = useState<Country[]>([]);
  const [formData, setFormData] = useState<CreateClientDTO>({
    shortName: '',
    businessName: '',
    taxId: '',
    phone: '',
    email: '',
    contact: '',
    website: '',
    additionalNotes: '',
    countryId: 0
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load countries for dropdown
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const data = await getAllCountries();
        setCountries(data);
        
        // If there are countries but no client set default country
        if (data.length > 0 && !client && !formData.countryId) {
          setFormData(prev => ({
            ...prev,
            countryId: data[0].id
          }));
        }
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    };

    fetchCountries();
  }, []);

  // Pre-fill form if editing an existing client
  useEffect(() => {
    if (client) {
      setFormData({
        shortName: client.shortName,
        businessName: client.businessName,
        taxId: client.taxId,
        phone: client.phone,
        email: client.email,
        contact: client.contact || '',
        website: client.website || '',
        additionalNotes: client.additionalNotes || '',
        countryId: client.countryId
      });
    }
  }, [client]);

  const validateField = (name: keyof CreateClientDTO, value: string | number): string => {
    if (requiredFields.includes(name) && !value) {
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
      const fieldName = key as keyof CreateClientDTO;
      const error = validateField(fieldName, value as string | number);
      
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    let processedValue: string | number = value;
    if (name === 'countryId') {
      processedValue = parseInt(value, 10) || 0;
    }
    
    setFormData({
      ...formData,
      [name]: processedValue
    });

    // Validate field on change
    if (touched[name] || isSubmitting) {
      const error = validateField(name as keyof CreateClientDTO, processedValue);
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
    const error = validateField(name as keyof CreateClientDTO, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  // Helper to check if a field is required
  const isFieldRequired = (fieldName: string): boolean => {
    return requiredFields.includes(fieldName as keyof CreateClientDTO);
  };

  return (
    <form className="client-form" onSubmit={handleSubmit} id="client-form">
      <div className="form-row cols-2">
        <div className="form-group">
          <label htmlFor="shortName" className={errors.shortName && touched.shortName ? 'form-label-required' : ''}>
            {t('client.shortName')} <span className="required-indicator">*</span>
          </label>
          <input
            type="text"
            id="shortName"
            name="shortName"
            className={`form-input ${errors.shortName && touched.shortName ? 'is-invalid' : ''}`}
            value={formData.shortName}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {errors.shortName && touched.shortName && (
            <div className="form-error">{errors.shortName}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="businessName" className={errors.businessName && touched.businessName ? 'form-label-required' : ''}>
            {t('client.businessName')} <span className="required-indicator">*</span>
          </label>
          <input
            type="text"
            id="businessName"
            name="businessName"
            className={`form-input ${errors.businessName && touched.businessName ? 'is-invalid' : ''}`}
            value={formData.businessName}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {errors.businessName && touched.businessName && (
            <div className="form-error">{errors.businessName}</div>
          )}
        </div>
      </div>

      <div className="form-row cols-2">
        <div className="form-group">
          <label htmlFor="taxId" className={errors.taxId && touched.taxId ? 'form-label-required' : ''}>
            {t('client.taxId')} <span className="required-indicator">*</span>
          </label>
          <input
            type="text"
            id="taxId"
            name="taxId"
            className={`form-input ${errors.taxId && touched.taxId ? 'is-invalid' : ''}`}
            value={formData.taxId}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {errors.taxId && touched.taxId && (
            <div className="form-error">{errors.taxId}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="countryId" className={errors.countryId && touched.countryId ? 'form-label-required' : ''}>
            {t('client.country')} <span className="required-indicator">*</span>
          </label>
          <select
            id="countryId"
            name="countryId"
            className={`form-select ${errors.countryId && touched.countryId ? 'is-invalid' : ''}`}
            value={formData.countryId || ''}
            onChange={handleChange}
            onBlur={handleBlur}
          >
            <option value="">{t('client.selectCountry')}</option>
            {countries.map(country => (
              <option key={country.id} value={country.id}>
                {country.descriptionES}
              </option>
            ))}
          </select>
          {errors.countryId && touched.countryId && (
            <div className="form-error">{errors.countryId}</div>
          )}
        </div>
      </div>

      <div className="form-row cols-2">
        <div className="form-group">
          <label htmlFor="phone" className={errors.phone && touched.phone ? 'form-label-required' : ''}>
            {t('client.phone')} <span className="required-indicator">*</span>
          </label>
          <input
            type="text"
            id="phone"
            name="phone"
            className={`form-input ${errors.phone && touched.phone ? 'is-invalid' : ''}`}
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {errors.phone && touched.phone && (
            <div className="form-error">{errors.phone}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email" className={errors.email && touched.email ? 'form-label-required' : ''}>
            {t('client.email')} <span className="required-indicator">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className={`form-input ${errors.email && touched.email ? 'is-invalid' : ''}`}
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {errors.email && touched.email && (
            <div className="form-error">{errors.email}</div>
          )}
        </div>
      </div>

      <div className="form-row cols-2">
        <div className="form-group">
          <label htmlFor="contact">
            {t('client.contact')}
          </label>
          <input
            type="text"
            id="contact"
            name="contact"
            className="form-input"
            value={formData.contact}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="website">
            {t('client.website')}
          </label>
          <input
            type="text"
            id="website"
            name="website"
            className="form-input"
            value={formData.website}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="additionalNotes">
          {t('client.additionalNotes')}
        </label>
        <textarea
          id="additionalNotes"
          name="additionalNotes"
          className="form-textarea"
          value={formData.additionalNotes}
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
          {client ? t('common.update') : t('common.create')}
        </button>
      </div>
    </form>
  );
};

export default ClientForm;