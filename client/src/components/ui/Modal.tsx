import { useEffect } from "react";
import { MdClose } from "react-icons/md";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  zIndexClass?: string;
}

const Modal = ({ isOpen, onClose, title, children, zIndexClass = "z-50" }: ModalProps) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 ${zIndexClass} flex items-center justify-center sm:p-4`}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white sm:rounded-xl shadow-xl w-full h-full sm:h-auto sm:max-w-2xl max-h-full sm:max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 sm:p-5 border-b sticky top-0 bg-white z-10">
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 truncate pr-3">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 shrink-0">
            <MdClose size={24} />
          </button>
        </div>
        <div className="p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;