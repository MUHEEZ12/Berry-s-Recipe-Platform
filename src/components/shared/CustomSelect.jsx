import React, { useState, useRef, useEffect } from 'react';
import './CustomSelect.css';

export const CustomSelect = ({ value, onChange, options, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState('bottom');
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Prioritize showing above if near bottom of screen
    // On mobile, we need at least 150px space for the dropdown
    if (spaceBelow < 150 && spaceAbove > 150) {
      setPosition('top');
    } else {
      setPosition('bottom');
    }
  }, [isOpen]);

  const handleSelect = (selectedValue) => {
    onChange(selectedValue);
    setIsOpen(false);
  };

  const selectedLabel = options.find(opt => opt.value === value)?.label || label;

  return (
    <div className="custom-select-container" ref={containerRef}>
      <button
        ref={buttonRef}
        className="custom-select-button"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span>{selectedLabel}</span>
        <svg className={`chevron ${isOpen ? 'open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="custom-select-overlay" onClick={() => setIsOpen(false)} />
          <div className={`custom-select-menu ${position}`} ref={menuRef}>
            {options.map((option) => (
              <button
                key={option.value}
                className={`custom-select-option ${value === option.value ? 'active' : ''}`}
                onClick={() => handleSelect(option.value)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
