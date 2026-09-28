import React, { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  requiredConfirmationText?: string;
  isLoading?: boolean;
  suggestionText?: string;
  onSuggestionAction?: () => void;
  suggestionActionLabel?: string;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDestructive = true,
  requiredConfirmationText,
  isLoading = false,
  suggestionText,
  onSuggestionAction,
  suggestionActionLabel,
}) => {
  const [typedText, setTypedText] = useState('');

  const isConfirmationSatisfied = requiredConfirmationText
    ? typedText.trim().toLowerCase() === requiredConfirmationText.trim().toLowerCase()
    : true;

  const handleClose = () => {
    setTypedText('');
    onClose();
  };

  const handleConfirm = async () => {
    if (!isConfirmationSatisfied) return;
    await onConfirm();
    setTypedText('');
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="md">
      <div className="space-y-4">
        <div className="flex items-start gap-3.5">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              isDestructive ? 'bg-[#FEE2E2] text-[#B91C1C]' : 'bg-[#FEF3C7] text-[#92400E]'
            }`}
          >
            {isDestructive ? (
              <Trash2 className="w-5 h-5" aria-hidden="true" />
            ) : (
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            )}
          </div>
          <div>
            <h3 className="font-headline-sm text-lg font-semibold text-[#1C1917] leading-tight">{title}</h3>
            <p className="text-xs text-[#57534E] mt-1.5 leading-relaxed">{message}</p>
          </div>
        </div>

        {requiredConfirmationText && (
          <div className="p-3.5 bg-[#FAF7F2] border border-[#E7E0D6] rounded-[6px] space-y-2">
            <p className="text-xs font-medium text-[#1C1917]">
              Para confirmar, escribe <strong className="font-semibold select-all text-[#9F1D3A]">{requiredConfirmationText}</strong>:
            </p>
            <Input
              value={typedText}
              onChange={(e) => setTypedText(e.target.value)}
              placeholder={requiredConfirmationText}
              className="text-xs py-2 bg-white"
              autoFocus
            />
          </div>
        )}

        {suggestionText && (
          <div className="p-3 bg-[#FEF3C7] border border-[#FDE68A] rounded-[4px] flex items-center justify-between gap-2">
            <p className="text-xs text-[#92400E] leading-relaxed">{suggestionText}</p>
            {onSuggestionAction && suggestionActionLabel && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  handleClose();
                  onSuggestionAction();
                }}
                className="text-xs py-1 px-2 border-[#92400E]/40 text-[#92400E] hover:border-[#92400E] bg-white shrink-0"
              >
                {suggestionActionLabel}
              </Button>
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E7E0D6]">
          <Button type="button" variant="outline" size="sm" onClick={handleClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={isDestructive ? 'danger' : 'primary'}
            size="sm"
            onClick={handleConfirm}
            isLoading={isLoading}
            disabled={!isConfirmationSatisfied}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
