import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { PERSONAL_INFO } from '../../data/portfolio';
import { X, Mail, Copy, Check, Send, Download, AlertCircle } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '../Icons';
import { soundManager } from '../../utils/audio';

export const ContactModal: React.FC = () => {
  const { activeModal, closeModal } = useStore();
  const [copied, setCopied] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (activeModal !== 'contact') return null;

  const copyEmail = () => {
    navigator.clipboard.writeText(PERSONAL_INFO.email);
    setCopied(true);
    soundManager.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errors.name = 'Please provide your name (at least 2 characters).';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Please provide a valid email address.';
    }
    if (!formData.subject.trim() || formData.subject.trim().length < 3) {
      errors.subject = 'Subject must be at least 3 characters.';
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      errors.message = 'Message must be at least 10 characters long.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    soundManager.playAchievement();
    setIsSubmitted(true);

    // Open mail client with pre-filled content so message actually reaches the developer!
    const mailtoLink = `mailto:${PERSONAL_INFO.email}?subject=${encodeURIComponent(
      `[Portfolio Inquiry] ${formData.subject}`
    )}&body=${encodeURIComponent(
      `Hi Neelesh,\n\nName: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    )}`;
    window.location.href = mailtoLink;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-slate-900 border border-pink-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-pink-950/60 to-slate-900 border-b border-pink-500/20 relative">
            <button
              onClick={() => {
                closeModal();
                soundManager.playClick();
              }}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-xs font-bold uppercase tracking-wider text-pink-400">Comms Station</div>
            <h2 className="text-2xl font-bold text-white">Let's Build Something Extraordinary</h2>
            <p className="text-xs text-pink-200 mt-1">
              Open to exciting full-stack engineering roles, creative 3D web contracts, and innovative tech collaborations.
            </p>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-6 text-sm">
            {/* Quick Channel Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Email Card */}
              <div
                onClick={copyEmail}
                className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-pink-500/50 cursor-pointer transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-pink-400">
                  <Mail className="w-5 h-5" />
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                </div>
                <div className="mt-3">
                  <div className="text-[11px] text-slate-400 font-medium">Direct Email</div>
                  <div className="text-xs font-semibold text-white truncate">{PERSONAL_INFO.email}</div>
                </div>
              </div>

              {/* GitHub Card */}
              <a
                href={PERSONAL_INFO.github}
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-sky-500/50 cursor-pointer transition-all flex flex-col justify-between"
              >
                <div className="text-sky-400">
                  <GithubIcon className="w-5 h-5" />
                </div>
                <div className="mt-3">
                  <div className="text-[11px] text-slate-400 font-medium">GitHub Code</div>
                  <div className="text-xs font-semibold text-white">@neelesh1097</div>
                </div>
              </a>

              {/* LinkedIn Card */}
              <a
                href={PERSONAL_INFO.linkedin}
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-indigo-500/50 cursor-pointer transition-all flex flex-col justify-between"
              >
                <div className="text-indigo-400">
                  <LinkedinIcon className="w-5 h-5" />
                </div>
                <div className="mt-3">
                  <div className="text-[11px] text-slate-400 font-medium">LinkedIn Network</div>
                  <div className="text-xs font-semibold text-white">Neelesh Yadav</div>
                </div>
              </a>
            </div>

            {/* Resume Download Banner */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-pink-950/40 via-purple-950/30 to-slate-900 border border-pink-500/20 flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-white">Curriculum Vitae / Resume</div>
                <div className="text-[11px] text-slate-400">Get a copy of my detailed professional resume.</div>
              </div>
              <a
                href={`mailto:${PERSONAL_INFO.email}?subject=Requesting%20Resume%20-%20Neelesh%20Yadav`}
                className="px-3.5 py-1.5 rounded-lg bg-pink-500 hover:bg-pink-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0"
              >
                <Download className="w-3.5 h-3.5" /> Request CV
              </a>
            </div>

            {/* Interactive Contact Form */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-pink-400">Send Direct Transmission</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Name */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Your Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ada Lovelace"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 transition-colors"
                  />
                  {formErrors.name && (
                    <span className="text-[10px] text-rose-400 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" /> {formErrors.name}
                    </span>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Your Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ada@example.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 transition-colors"
                  />
                  {formErrors.email && (
                    <span className="text-[10px] text-rose-400 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" /> {formErrors.email}
                    </span>
                  )}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Subject *</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Project Collaboration / Full-Time Engineering Opportunity"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 transition-colors"
                />
                {formErrors.subject && (
                  <span className="text-[10px] text-rose-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" /> {formErrors.subject}
                  </span>
                )}
              </div>

              {/* Message */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Message *</label>
                <textarea
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe your project, team, or opportunity..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 transition-colors resize-none"
                />
                {formErrors.message && (
                  <span className="text-[10px] text-rose-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" /> {formErrors.message}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">
                  Transmits directly via authenticated email client.
                </span>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-pink-500/20"
                >
                  <Send className="w-3.5 h-3.5" /> Send Message
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
