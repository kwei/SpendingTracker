'use client';
import { CloseIcon } from '@/components/icons/CloseIcon';
import useFocusRef from '@/hooks/useFocusRef';
import { forwardRef, ReactNode, useImperativeHandle, useState } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  title: ReactNode;
  onClose?: () => void;
  defaultOpen?: boolean;
}

export const Modal = forwardRef<ModalRef, Props>((props, ref) => {
  const [open, setOpen] = useState(props.defaultOpen ?? false);
  const contentRef = useFocusRef<HTMLDivElement>(() => {
    props.onClose?.();
    setOpen(false);
  });

  useImperativeHandle(ref, () => ({
    open: () => {
      setOpen(true);
    },
    close: () => {
      setOpen(false);
    },
  }));

  const handleCloseModal = () => {
    props.onClose?.();
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 top-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        ref={contentRef}
        className={`relative rounded-xl bg-background p-6 ${props.className}`}
      >
        <button
          type="button"
          onClick={handleCloseModal}
          className="absolute right-3 top-3 size-6 rounded-full p-1 transition-colors hover:bg-gray-300"
        >
          <CloseIcon className="size-full" />
        </button>
        <h1 className="mb-6 text-lg font-bold sm:text-xl">{props.title}</h1>
        {props.children}
      </div>
    </div>
  );
});
Modal.displayName = 'Modal';
