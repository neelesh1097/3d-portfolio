import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface ModalShellProps {
  title: string;
  eyebrow: string;
  subtitle?: string;
  maxWidthClass?: string;
  accentHex?: string;
  onClose: () => void;
  headerRight?: React.ReactNode;
  headerLeftSlot?: React.ReactNode;
  subNav?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Shared dark architectural modal container aligned with the Full Stack Island design system.
 */
export const ModalShell: React.FC<ModalShellProps> = ({
  title,
  eyebrow,
  subtitle,
  maxWidthClass = 'max-w-2xl',
  accentHex = '#43D9F5',
  onClose,
  headerRight,
  headerLeftSlot,
  subNav,
  footer,
  children,
}) => {
  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-5 bg-[#0B1420]/75 select-text"
        onClick={() => {
          onClose();
          soundManager.playClick();
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className={`relative w-full ${maxWidthClass} bg-[#0B1420] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]`}
        >
          {/* Header */}
          <div className="px-6 py-5 bg-[#14263A] border-b border-white/10 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5 min-w-0">
              {headerLeftSlot}
              <div className="min-w-0">
                <div
                  className="text-[11px] font-mono font-semibold uppercase tracking-[0.12em]"
                  style={{ color: accentHex }}
                >
                  {eyebrow}
                </div>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-[#F4F7FA] tracking-tight mt-0.5 truncate">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-xs sm:text-sm text-[#9AAFC2] mt-1 leading-relaxed">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {headerRight}
              <button
                type="button"
                aria-label={`Close ${title}`}
                onClick={() => {
                  onClose();
                  soundManager.playClick();
                }}
                className="p-2 rounded-xl bg-[#1B3045] hover:bg-[#233d57] text-[#9AAFC2] hover:text-[#F4F7FA] border border-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Optional Sub-navigation Tabs */}
          {subNav && (
            <div className="bg-[#0B1420] border-b border-white/10 px-6">
              {subNav}
            </div>
          )}

          {/* Scrollable Body */}
          <div className="p-6 overflow-y-auto flex-1">
            {children}
          </div>

          {/* Optional Footer */}
          {footer && (
            <div className="px-6 py-3.5 bg-[#14263A]/70 border-t border-white/10 flex items-center justify-between gap-3">
              {footer}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

