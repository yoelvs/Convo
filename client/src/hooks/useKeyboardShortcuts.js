import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts when typing in inputs, textareas, or contenteditable elements
      if (
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA' ||
        e.target.isContentEditable ||
        e.target.closest('input') ||
        e.target.closest('textarea') ||
        e.target.closest('[contenteditable="true"]')
      ) {
        // Allow Enter to send messages (handled in ChatWindow)
        if (e.key === 'Enter' && !e.shiftKey && e.target.tagName === 'TEXTAREA') {
          // Let the form handle it
          return;
        }
        return;
      }

      // Keyboard shortcuts
      switch (e.key) {
        case 'g':
        case 'G':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            navigate('/chat');
          }
          break;
        case 'f':
        case 'F':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            navigate('/friends');
          }
          break;
        case 'c':
        case 'C':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            navigate('/chats');
          }
          break;
        case 's':
        case 'S':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            navigate('/settings');
          }
          break;
        case '/':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            // Focus search if available
            const searchInput = document.querySelector('input[type="search"], input[placeholder*="Search"]');
            if (searchInput) {
              searchInput.focus();
            }
          }
          break;
        case 'Escape':
          // Close any open modals or menus
          const modals = document.querySelectorAll('.modal, .popup, .menu');
          modals.forEach(modal => {
            if (modal.style.display !== 'none') {
              const closeBtn = modal.querySelector('.close-btn, [aria-label*="close" i]');
              if (closeBtn) {
                closeBtn.click();
              }
            }
          });
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);
};
