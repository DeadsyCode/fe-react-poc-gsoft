import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// Define types for the GenericForm component
export interface FormField {
  name: string;
  type: 'text' | 'email' | 'number' | 'select' | 'date' | 'textarea';
  label: string;
  required?: boolean;
  options?: { value: string | number; label: string }[]; // For select fields
  validation?: (value: any) => string; // Custom validation function
}

export interface GenericFormProps<T, FormDataType> {
  fields: FormField[];
  item?: T;
  onSubmit: (data: FormDataType) => void;
  onCancel: () => void;
  initialValues: FormDataType;
  requiredFields: string[];
  formId?: string;
}

function GenericForm<T, FormDataType>({
  fields,
  item,
  onSubmit,
  onCancel,
  initialValues,
  requiredFields,
  formId = 'generic-form'
}: GenericFormProps<T, FormDataType>) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<any>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill form if editing an existing item
  useEffect(() => {
    if (item) {
      const newFormData = { ...initialValues };
      // Map item properties to form fields
      Object.keys(initialValues).forEach(key => {
        if (item.hasOwnProperty(key)) {
          // @ts-ignore
          newFormData[key] = item[key];
        }
      });
      setFormData(newFormData);
    }
  }, [item, initialValues]);

  const validateField = (name: string, value: any): string => {
    const field = fields.find(f => f.name === name);
    
    // Required field validation
    if (requiredFields.includes(name) && (value === undefined || value === null || value === '')) {
      return t('validation.required');
    }
    
    // Field-specific validation
    if (field?.validation) {
      return field.validation(value);
    }
    
    // Type-specific validation
    if (field) {
      switch (field.type) {
        case 'email':
          if (!value) return '';
          const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          return emailRegex.test(value) ? '' : t('validation.emailInvalid');
        default:
          return '';
      }
    }
    
    return '';
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    // Validate each field
    Object.entries(formData).forEach(([key, value]) => {
      const error = validateField(key, value);
      
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    
    // Mark all fields as touched to show validation errors
    const allTouched: Record<string, boolean> = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    let processedValue: any = value;
    
    // Process different input types
    if (type === 'number') {
      processedValue = value ? parseFloat(value) : null;
    } else if (type === 'date') {
      processedValue = value ? new Date(value) : null;
    } else if ((e.target as HTMLSelectElement).multiple) {
      processedValue = Array.from((e.target as HTMLSelectElement).selectedOptions).map(option => option.value);
    }
    
    setFormData({
      ...formData,
      [name]: processedValue
    });

    // Validate field on change
    if (touched[name] || isSubmitting) {
      const error = validateField(name, processedValue);
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
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    if (validateForm()) {
      onSubmit(formData as FormDataType);
    }
  };

  const renderField = (field: FormField) => {
    const { name, type, label, required, options } = field;
    const hasError = !!errors[name] && touched[name];
    
    const baseProps = {
      id: name,
      name,
      value: formData[name] || '',
      onChange: handleChange,
      onBlur: handleBlur,
      className: `form-${type === 'select' ? 'select' : type === 'textarea' ? 'textarea' : 'input'} ${hasError ? 'is-invalid' : ''}`
    };

    switch (type) {
      case 'textarea':
        return (
          <textarea
            {...baseProps}
            rows={4}
          />
        );
      case 'select':
        return (
          <select {...baseProps}>
            <option value="">-- {t('common.select')} --</option>
            {options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case 'date':
        // Format date for input field
        const dateValue = formData[name] instanceof Date 
          ? formData[name].toISOString().split('T')[0]
          : formData[name] ? new Date(formData[name]).toISOString().split('T')[0] : '';
          
        return (
          <input
            {...baseProps}
            type="date"
            value={dateValue}
          />
        );
      default:
        return (
          <input
            {...baseProps}
            type={type}
          />
        );
    }
  };

  return (
    <form className="generic-form" onSubmit={handleSubmit} id={formId}>
      <div className="form-grid">
        {fields.map(field => (
          <div key={field.name} className="form-group">
            <label 
              htmlFor={field.name} 
              className={errors[field.name] && touched[field.name] ? 'form-label-required' : ''}
            >
              {field.label} {field.required && <span className="required-indicator">*</span>}
            </label>
            {renderField(field)}
            {errors[field.name] && touched[field.name] && (
              <div className="form-error">{errors[field.name]}</div>
            )}
          </div>
        ))}
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
          {item ? t('common.update') : t('common.create')}
        </button>
      </div>
    </form>
  );
}

export default GenericForm;