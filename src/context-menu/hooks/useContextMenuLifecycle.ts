import { useEffect, type RefObject } from 'react';

interface UseContextMenuLifecycleParams {
  visible: boolean;
  menuRef: RefObject<HTMLDivElement | null>;
  onClose: () => void;
}

export const useContextMenuLifecycle = ({
  visible,
  menuRef,
  onClose,
}: UseContextMenuLifecycleParams): void => {
  useEffect(() => {
    if (!visible) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuRef, onClose, visible]);

  useEffect(() => {
    if (!visible) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose, visible]);
};
