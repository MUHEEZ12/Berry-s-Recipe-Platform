// Toast notification system
let toastContainer = null;

const createToastContainer = () => {
  if (toastContainer) return toastContainer;
  
  const container = document.createElement('div');
  container.id = 'toast-container';
  container.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    pointer-events: none;
  `;
  document.body.appendChild(container);
  toastContainer = container;
  return container;
};

export const showToast = (message, type = 'info', duration = 3000) => {
  const container = createToastContainer();
  
  const toast = document.createElement('div');
  const colors = {
    success: { bg: '#4CAF50', text: '#fff' },
    error: { bg: '#FF6B6B', text: '#fff' },
    info: { bg: '#2196F3', text: '#fff' },
    warning: { bg: '#FF9800', text: '#fff' },
  };
  
  const scheme = colors[type] || colors.info;
  
  toast.style.cssText = `
    background: ${scheme.bg};
    color: ${scheme.text};
    padding: 15px 20px;
    border-radius: 8px;
    margin-bottom: 10px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    animation: slideIn 0.3s ease;
    pointer-events: auto;
  `;
  
  toast.textContent = message;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
};

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const truncate = (text, length = 100) => {
  return text.length > length ? text.slice(0, length) + '...' : text;
};
