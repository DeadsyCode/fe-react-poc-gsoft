import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, CreateUserDTO, UpdateUserDTO } from '../../services/userService';
import './UserForm.css';

interface UserFormProps {
  user?: User;
  onSubmit: (data: CreateUserDTO | UpdateUserDTO) => void;
  onCancel: () => void;
}

interface RoleOption {
  id: number;
  name: string;
}

type FormErrors = {
  [key in keyof CreateUserDTO]?: string;
};

// Fields that are required in the form
const requiredFields: (keyof CreateUserDTO)[] = [
  'email',
  'roleId',
  'firstName',
  'lastName'
];

// Mock role options (in a real app, these would come from an API)
const roleOptions: RoleOption[] = [
  { id: 1, name: 'Admin' },
  { id: 2, name: 'User' },
  { id: 3, name: 'Manager' },
  { id: 4, name: 'Auditor' }
];

const UserForm: React.FC<UserFormProps> = ({ user, onSubmit, onCancel }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<CreateUserDTO>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    roleId: 2, // Default to 'User' role
    type: '',
    chiefId: null
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);

  // Pre-fill form if editing an existing user
  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        password: '', // Password is not returned from the server
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        roleId: user.roleId,
        type: user.type || '',
        chiefId: user.chiefId
      });
    }
  }, [user]);

  // In a real app, you would fetch available users to select as chiefs
  useEffect(() => {
    // Mock available users
    setAvailableUsers([
      { id: 1, email: 'admin@example.com', firstName: 'Admin', lastName: 'User', roleId: 1, roleName: 'Admin', state: null, type: null, chiefId: null },
      { id: 2, email: 'manager@example.com', firstName: 'Manager', lastName: 'User', roleId: 3, roleName: 'Manager', state: null, type: null, chiefId: null }
    ]);
  }, []);

  const validateField = (name: keyof CreateUserDTO, value: string | number | null): string => {
    if (requiredFields.includes(name) && (value === '' || value === null)) {
      return t('validation.required');
    }
    
    switch (name) {
      case 'email':
        if (!value) return t('validation.required');
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(value as string) ? '' : t('validation.emailInvalid');
      case 'password':
        // Only require password for new users
        if (!user && !value) return t('validation.required');
        if (value && (value as string).length < 6) return t('validation.passwordTooShort');
        return '';
      default:
        return '';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Validate each field
    Object.entries(formData).forEach(([key, value]) => {
      const fieldName = key as keyof CreateUserDTO;
      const error = validateField(fieldName, value as string | number | null);
      
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
    
    let processedValue: string | number | null = value;
    if (name === 'roleId') {
      processedValue = parseInt(value, 10) || 0;
    } else if (name === 'chiefId') {
      processedValue = value ? parseInt(value, 10) : null;
    }
    
    setFormData(prevData => ({
      ...prevData,
      [name]: processedValue
    }));

    // Validate field on change
    if (touched[name] || isSubmitting) {
      const error = validateField(name as keyof CreateUserDTO, processedValue);
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
    const error = validateField(name as keyof CreateUserDTO, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    if (validateForm()) {
      // If updating user and password is empty, don't include it in the submission
      if (user && !formData.password) {
        const { password, ...updateData } = formData;
        onSubmit(updateData);
      } else {
        onSubmit(formData);
      }
    }
  };

  return (
    <form className="user-form" onSubmit={handleSubmit} id="user-form">
      <div className="form-row cols-2">
        <div className="form-group">
          <label htmlFor="firstName" className={errors.firstName && touched.firstName ? 'form-label-required' : ''}>
            {t('user.firstName')} <span className="required-indicator">*</span>
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            className={`form-input ${errors.firstName && touched.firstName ? 'is-invalid' : ''}`}
            value={formData.firstName}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {errors.firstName && touched.firstName && (
            <div className="form-error">{errors.firstName}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="lastName" className={errors.lastName && touched.lastName ? 'form-label-required' : ''}>
            {t('user.lastName')} <span className="required-indicator">*</span>
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            className={`form-input ${errors.lastName && touched.lastName ? 'is-invalid' : ''}`}
            value={formData.lastName}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {errors.lastName && touched.lastName && (
            <div className="form-error">{errors.lastName}</div>
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="email" className={errors.email && touched.email ? 'form-label-required' : ''}>
          {t('user.email')} <span className="required-indicator">*</span>
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

      <div className="form-group">
        <label htmlFor="password" className={errors.password && touched.password ? 'form-label-required' : ''}>
          {t('user.password')} {!user && <span className="required-indicator">*</span>}
        </label>
        <input
          type="password"
          id="password"
          name="password"
          className={`form-input ${errors.password && touched.password ? 'is-invalid' : ''}`}
          value={formData.password}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={user ? t('user.leaveBlankToKeepCurrent') : ''}
        />
        {errors.password && touched.password && (
          <div className="form-error">{errors.password}</div>
        )}
      </div>

      <div className="form-row cols-2">
        <div className="form-group">
          <label htmlFor="roleId" className={errors.roleId && touched.roleId ? 'form-label-required' : ''}>
            {t('user.role')} <span className="required-indicator">*</span>
          </label>
          <select
            id="roleId"
            name="roleId"
            className={`form-select ${errors.roleId && touched.roleId ? 'is-invalid' : ''}`}
            value={formData.roleId || ''}
            onChange={handleChange}
            onBlur={handleBlur}
          >
            <option value="">{t('user.selectRole')}</option>
            {roleOptions.map(role => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
          {errors.roleId && touched.roleId && (
            <div className="form-error">{errors.roleId}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="type">
            {t('user.type')}
          </label>
          <input
            type="text"
            id="type"
            name="type"
            className="form-input"
            value={formData.type || ''}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="chiefId">
          {t('user.chief')}
        </label>
        <select
          id="chiefId"
          name="chiefId"
          className="form-select"
          value={formData.chiefId || ''}
          onChange={handleChange}
        >
          <option value="">{t('user.noChief')}</option>
          {availableUsers.map(u => (
            <option key={u.id} value={u.id}>
              {`${u.firstName} ${u.lastName} (${u.email})`}
            </option>
          ))}
        </select>
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
          {user ? t('common.update') : t('common.create')}
        </button>
      </div>
    </form>
  );
};

export default UserForm;