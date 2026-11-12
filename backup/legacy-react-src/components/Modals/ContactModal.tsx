import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { PERSONAL_INFO } from '../../data/portfolio';
import { Mail, Copy, Check, Send, Download, AlertCircle } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '../Icons';
import { soundManager } from '../../utils/audio';
import { ModalShell } from '../ui/ModalShell';

export const ContactModal: React.FC = () => {
  const { activeModal, closeModal } = useStore();
  const [copied, setCopied] = useState(false);

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

    const mailtoLink = `mailto:${PERSONAL_INFO.email}?subject=${encodeURIComponent(
      `[Portfolio Inquiry] ${formData.subject}`
    )}&body=${encodeURIComponent(
      `Hi Neelesh,\n\nName: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    )}`;
    window.location.href = mailtoLink;
  };

  return (
    <ModalShell
      title="Get in Touch"
      eyebrow="Contact Station"
      subtitle="Open to full-stack engineering roles, creative WebGL experiences, and technical collaborations."
      maxWidthClass="max-w-2xl"
      onClose={closeModal}
    >
      <div className="space-y-6 text-sm">
        {/* Direct Channels */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={copyEmail}
            className="p-3.5 rounded-xl bg-[#14263A]/65 border border-white/10 hover:border-[#43D9F5]/50 cursor-pointer transition-colors flex flex-col justify-between text-left"
          >
            <div className="flex items-center justify-between text-[#43D9F5] w-full">
              <Mail className="w-4 h-4" />
              {copied ? (
                <Check className="w-4 h-4 text-[#43D9F5]" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-[#9AAFC2]" />
              )}
            </div>
            <div className="mt-3 w-full">
              <div className="text-[11px] text-[#9AAFC2]">
                {copied ? 'Copied to clipboard' : 'Direct Email'}
              </div>
              <div className="text-xs font-semibold text-[#F4F7FA] truncate mt-0.5">
                {PERSONAL_INFO.email}
              </div>
            </div>
          </button>

          <a
            href={PERSONAL_INFO.github}
            target="_blank"
            rel="noreferrer"
            className="p-3.5 rounded-xl bg-[#14263A]/65 border border-white/10 hover:border-[#43D9F5]/50 transition-colors flex flex-col justify-between"
          >
            <div className="text-[#43D9F5]">
              <GithubIcon className="w-4 h-4" />
            </div>
            <div className="mt-3">
              <div className="text-[11px] text-[#9AAFC2]">GitHub</div>
              <div className="text-xs font-semibold text-[#F4F7FA] mt-0.5">@neelesh1097</div>
            </div>
          </a>

          <a
            href={PERSONAL_INFO.linkedin}
            target="_blank"
            rel="noreferrer"
            className="p-3.5 rounded-xl bg-[#14263A]/65 border border-white/10 hover:border-[#43D9F5]/50 transition-colors flex flex-col justify-between"
          >
            <div className="text-[#43D9F5]">
              <LinkedinIcon className="w-4 h-4" />
            </div>
            <div className="mt-3">
              <div className="text-[11px] text-[#9AAFC2]">LinkedIn</div>
              <div className="text-xs font-semibold text-[#F4F7FA] mt-0.5">Neelesh Yadav</div>
            </div>
          </a>
        </div>

        {/* Resume Banner */}
        <div className="p-4 rounded-xl bg-[#14263A] border border-white/10 flex items-center justify-between gap-4">
          <div>
            <div className="font-display text-xs font-bold text-[#F4F7FA]">
              Curriculum Vitae / Resume
            </div>
            <div className="text-xs text-[#9AAFC2] mt-0.5">
              Request or download a detailed copy of my engineering resume.
            </div>
          </div>
          <a
            href={PERSONAL_INFO.resume}
            target="_blank"
            rel="noreferrer"
            download="Neelesh_Yadav_Resume.pdf"
            className="px-3.5 py-2 rounded-lg bg-[#F5B84B] hover:bg-[#f7c56a] text-[#0B1420] font-semibold text-xs flex items-center gap-1.5 transition-colors shrink-0"
          >
            <Download className="w-3.5 h-3.5" /> Download CV
          </a>
        </div>

        {/* Interactive Contact Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-[#43D9F5]">
              Send Message
            </h3>
            {isSubmitted && (
              <span className="font-mono text-[11px] text-[#43D9F5]">
                Opening email client...
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-[#9AAFC2] mb-1">
                Your Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ada Lovelace"
                className="w-full px-3 py-2 rounded-lg bg-[#14263A]/80 border border-white/10 text-xs text-[#F4F7FA] placeholder-[#9AAFC2]/50 focus:outline-none focus:border-[#43D9F5] transition-colors"
              />
              {formErrors.name && (
                <span className="text-[10px] text-[#F5B84B] flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" /> {formErrors.name}
                </span>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#9AAFC2] mb-1">
                Your Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="ada@example.com"
                className="w-full px-3 py-2 rounded-lg bg-[#14263A]/80 border border-white/10 text-xs text-[#F4F7FA] placeholder-[#9AAFC2]/50 focus:outline-none focus:border-[#43D9F5] transition-colors"
              />
              {formErrors.email && (
                <span className="text-[10px] text-[#F5B84B] flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" /> {formErrors.email}
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#9AAFC2] mb-1">Subject *</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Engineering Role / Project Collaboration"
              className="w-full px-3 py-2 rounded-lg bg-[#14263A]/80 border border-white/10 text-xs text-[#F4F7FA] placeholder-[#9AAFC2]/50 focus:outline-none focus:border-[#43D9F5] transition-colors"
            />
            {formErrors.subject && (
              <span className="text-[10px] text-[#F5B84B] flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" /> {formErrors.subject}
              </span>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#9AAFC2] mb-1">Message *</label>
            <textarea
              rows={3}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Tell me about your team, timeline, or idea..."
              className="w-full px-3 py-2 rounded-lg bg-[#14263A]/80 border border-white/10 text-xs text-[#F4F7FA] placeholder-[#9AAFC2]/50 focus:outline-none focus:border-[#43D9F5] transition-colors resize-none"
            />
            {formErrors.message && (
              <span className="text-[10px] text-[#F5B84B] flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" /> {formErrors.message}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-[#9AAFC2]">
              Opens your default email client pre-filled.
            </span>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-[#43D9F5] hover:bg-[#5ce1f8] text-[#0B1420] font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" /> Send Transmission
            </button>
          </div>
        </form>
      </div>
    </ModalShell>
  );
};
