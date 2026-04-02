import { useState } from 'react';

export const useFormInput = (initialValues = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues({
      ...values,
      [name]: type === 'checkbox' ? checked : value,
    });
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const setError = (field, message) => {
    setErrors({ ...errors, [field]: message });
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
  };

  const validate = (rules) => {
    const newErrors = {};

    for (const [field, rule] of Object.entries(rules)) {
      if (rule.required && (!values[field] || values[field].toString().trim() === '')) {
        newErrors[field] = `${field} is required`;
      } else if (rule.minLength && values[field] && values[field].toString().length < rule.minLength) {
        newErrors[field] = `${field} must be at least ${rule.minLength} characters`;
      } else if (rule.maxLength && values[field] && values[field].toString().length > rule.maxLength) {
        newErrors[field] = `${field} must be less than ${rule.maxLength} characters`;
      } else if (rule.pattern && values[field] && !rule.pattern.test(values[field])) {
        newErrors[field] = rule.message || `${field} is invalid`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return {
    values,
    setValues,
    errors,
    setError,
    handleChange,
    reset,
    validate,
  };
};
