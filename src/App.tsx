/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  ChevronRight, 
  ChevronLeft, 
  Send,
  Check,
  Loader2
} from 'lucide-react';
import { BriefingData } from './types';
import { QUESTIONS } from './constants';
import { supabase } from './lib/supabase';

const INITIAL_DATA: BriefingData = {
  companyName: '',
  contactName: '',
  email: '',
  phone: '',
  businessDescription: '',
  mainProductService: '',
  idealCustomer: '',
  websiteGoal: '',
  businessPains: '',
  timeConsumingTasks: '',
  repetitiveTasks: '',
  automationWishes: '',
  visitorAction: '',
  visualAssets: '',
  referenceLinks: '',
};

const STORAGE_KEY = 'briefing_form_data';

export default function App() {
  const [currentStepIndex, setCurrentStepIndex] = useState(-1); 
  const [formData, setFormData] = useState<BriefingData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });
  const [direction, setDirection] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  const handleNext = useCallback(() => {
    if (currentStepIndex < QUESTIONS.length + 1) {
      setDirection(1);
      setCurrentStepIndex(prev => prev + 1);
    }
  }, [currentStepIndex]);

  const handleBack = useCallback(() => {
    if (currentStepIndex > -1) {
      setDirection(-1);
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);

  const handleInputChange = (id: keyof BriefingData, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const { error } = await supabase.from('briefings').insert([
        {
          company_name: formData.companyName,
          contact_name: formData.contactName,
          email: formData.email,
          phone: formData.phone,
          business_description: formData.businessDescription,
          main_product_or_service: formData.mainProductService,
          ideal_client: formData.idealCustomer,
          website_goal: formData.websiteGoal,
          business_pains: formData.businessPains,
          time_consuming_tasks: formData.timeConsumingTasks,
          repetitive_manual_tasks: formData.repetitiveTasks,
          automation_goal: formData.automationWishes,
          desired_site_action: formData.visitorAction,
          visual_assets: formData.visualAssets,
          reference_links: formData.referenceLinks,
          raw_payload: formData
        }
      ]);

      if (error) throw error;

      setDirection(1);
      setCurrentStepIndex(QUESTIONS.length + 1);
      localStorage.removeItem(STORAGE_KEY);
    } catch (err: any) {
      console.error('Error submitting form:', err);
      setSubmitError('Ocorreu um erro ao enviar suas respostas. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = Math.max(0, (currentStepIndex / QUESTIONS.length) * 100);

  // New "Liquid" transition variants: Vertical slide + Blur + Scale
  const variants = {
    enter: (direction: number) => ({
      y: direction > 0 ? 40 : -40,
      opacity: 0,
      filter: 'blur(10px)',
      scale: 0.98,
    }),
    center: {
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      scale: 1,
    },
    exit: (direction: number) => ({
      y: direction < 0 ? 40 : -40,
      opacity: 0,
      filter: 'blur(10px)',
      scale: 0.98,
    }),
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-start md:justify-center pt-24 md:pt-12 pb-6 px-4 md:px-12 overflow-hidden bg-black relative">
      {/* Atmospheric Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-white/[0.03] blur-[120px] rounded-full animate-float" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-white/[0.02] blur-[120px] rounded-full animate-float" style={{ animationDelay: '-5s' }} />
      </div>

      {/* Liquid Background Grain/Noise */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      <div className="w-full max-w-md md:max-w-2xl relative h-[460px] md:h-[560px] z-10 mt-4 md:mt-0">
        {/* Minimal Progress Line */}
        {currentStepIndex >= 0 && currentStepIndex < QUESTIONS.length && (
          <div className="absolute -top-12 md:-top-16 left-0 w-full h-[1px] bg-white/[0.05]">
            <motion.div 
              className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        )}

        <AnimatePresence mode="wait" custom={direction}>
          {currentStepIndex === -1 && (
            <motion.div
              key="welcome"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="liquid-glass p-6 md:p-16 text-center space-y-8 md:space-y-12 h-full flex flex-col justify-center"
            >
              <div className="space-y-6 md:space-y-8">
                <div className="space-y-1 md:space-y-2">
                  <motion.span 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-[8px] md:text-[10px] uppercase tracking-[0.4em] text-neutral-600 font-bold block"
                  >
                    Briefing Digital
                  </motion.span>
                  <h1 className="text-3xl md:text-6xl font-light tracking-tight leading-tight text-white">
                    Estratégia <span className="opacity-30">Redefinida</span>
                  </h1>
                </div>
                <p className="text-neutral-500 text-sm md:text-lg font-light max-w-[220px] md:max-w-md mx-auto leading-relaxed">
                  Transforme sua visão em realidade com nosso processo de briefing imersivo.
                </p>
              </div>
              <button
                onClick={handleNext}
                className="w-full max-w-[200px] md:max-w-xs mx-auto bg-white text-black text-[9px] md:text-[11px] uppercase tracking-[0.2em] font-bold py-4 md:py-6 rounded-full transition-all hover:bg-neutral-200 active:scale-[0.98] shadow-lg"
              >
                Iniciar
              </button>
            </motion.div>
          )}

          {currentStepIndex >= 0 && currentStepIndex < QUESTIONS.length && (
            <motion.div
              key={`q-${currentStepIndex}`}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="liquid-glass p-5 md:p-16 space-y-5 md:space-y-10 h-full flex flex-col"
            >
              <div className="flex items-center justify-between shrink-0">
                <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-600">
                  {String(currentStepIndex + 1).padStart(2, '0')} <span className="opacity-30 mx-0.5 md:mx-1">/</span> {String(QUESTIONS.length).padStart(2, '0')}
                </span>
                <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-white/10" />
              </div>

              <div className="space-y-5 md:space-y-10 flex-1 flex flex-col justify-center">
                <div className="space-y-2 md:space-y-4">
                  <h2 className="text-xl md:text-5xl font-light tracking-tight leading-tight text-white">
                    {QUESTIONS[currentStepIndex].label}
                  </h2>
                  {QUESTIONS[currentStepIndex].helperText && (
                    <p className="text-neutral-600 text-[11px] md:text-sm font-light leading-relaxed max-w-xs md:max-w-md">
                      {QUESTIONS[currentStepIndex].helperText}
                    </p>
                  )}
                </div>

                <div className="pt-1 md:pt-4">
                  {QUESTIONS[currentStepIndex].type === 'text' ? (
                    <input
                      autoFocus
                      type="text"
                      value={formData[QUESTIONS[currentStepIndex].id]}
                      onChange={(e) => handleInputChange(QUESTIONS[currentStepIndex].id, e.target.value)}
                      placeholder={QUESTIONS[currentStepIndex].placeholder}
                      className="input-liquid md:text-lg md:py-5"
                      onKeyDown={(e) => e.key === 'Enter' && formData[QUESTIONS[currentStepIndex].id] && handleNext()}
                    />
                  ) : (
                    <textarea
                      autoFocus
                      rows={3}
                      value={formData[QUESTIONS[currentStepIndex].id]}
                      onChange={(e) => handleInputChange(QUESTIONS[currentStepIndex].id, e.target.value)}
                      placeholder={QUESTIONS[currentStepIndex].placeholder}
                      className="input-liquid resize-none scrollbar-hide md:text-lg md:py-5 md:rows-4"
                    />
                  )}
                </div>
              </div>

              <div className="flex gap-2 md:gap-4 shrink-0">
                <button
                  onClick={handleBack}
                  className="p-4 md:p-6 rounded-full bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.08] transition-all group"
                >
                  <ChevronLeft className="w-3.5 h-3.5 md:w-5 md:h-5 text-neutral-500 group-hover:text-white transition-colors" />
                </button>
                <button
                  disabled={!formData[QUESTIONS[currentStepIndex].id]}
                  onClick={handleNext}
                  className="flex-1 bg-white text-black text-[9px] md:text-[11px] uppercase tracking-[0.15em] md:tracking-[0.2em] font-bold rounded-full flex items-center justify-center gap-2 transition-all disabled:opacity-5 disabled:grayscale"
                >
                  Próximo
                  <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {currentStepIndex === QUESTIONS.length && (
            <motion.div
              key="review"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="liquid-glass p-6 md:p-16 space-y-6 md:space-y-10 h-full flex flex-col"
            >
              <div className="flex items-center justify-between shrink-0">
                <h2 className="text-xl md:text-4xl font-light tracking-tight text-white">Revisão</h2>
                <button 
                  onClick={() => setCurrentStepIndex(0)}
                  className="text-neutral-600 text-[8px] md:text-[10px] uppercase tracking-[0.2em] font-bold hover:text-white transition-colors"
                >
                  Editar
                </button>
              </div>

              <div className="space-y-6 md:space-y-10 overflow-y-auto pr-3 md:pr-6 scrollbar-hide flex-1">
                {QUESTIONS.map((q, idx) => (
                  <div key={q.id} className="space-y-1.5 md:space-y-3 group">
                    <p className="text-[7px] md:text-[9px] uppercase tracking-[0.2em] text-neutral-700 font-bold group-hover:text-neutral-500 transition-colors">
                      {q.label}
                    </p>
                    <p className="text-neutral-300 text-sm md:text-lg font-light leading-relaxed">
                      {formData[q.id] || <span className="opacity-20 italic">Vazio</span>}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 md:gap-4 pt-4 md:pt-8 shrink-0">
                <button
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="p-4 md:p-6 rounded-full bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.08] transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-3.5 h-3.5 md:w-5 md:h-5 text-neutral-500 group-hover:text-white transition-colors" />
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-white text-black text-[9px] md:text-[11px] uppercase tracking-[0.15em] md:tracking-[0.2em] font-bold rounded-full flex items-center justify-center gap-3 transition-all hover:bg-neutral-200 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      Enviando...
                      <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
                    </>
                  ) : (
                    <>
                      Finalizar
                      <Send className="w-3 h-3 md:w-4 md:h-4" />
                    </>
                  )}
                </button>
              </div>
              {submitError && (
                <p className="text-red-400 text-xs text-center mt-2">{submitError}</p>
              )}
            </motion.div>
          )}

          {currentStepIndex === QUESTIONS.length + 1 && (
            <motion.div
              key="success"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="liquid-glass p-8 md:p-16 text-center space-y-8 md:space-y-12 h-full flex flex-col justify-center"
            >
              <div className="w-12 h-12 md:w-24 md:h-24 border border-white/[0.08] rounded-full flex items-center justify-center mx-auto bg-white/[0.02] shadow-xl">
                <Check className="w-6 h-6 md:w-10 md:h-10 text-white opacity-80" />
              </div>
              <div className="space-y-3 md:space-y-6">
                <h2 className="text-2xl md:text-6xl font-light tracking-tight text-white">Concluído</h2>
                <p className="text-neutral-500 text-sm md:text-xl font-light leading-relaxed max-w-[200px] md:max-w-md mx-auto">
                  Suas respostas foram processadas. <br />
                  <span className="opacity-50">Obrigado pela confiança.</span>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Branding Update */}
        <div className="mt-10 text-center">
          <p className="text-[7px] uppercase tracking-[0.4em] text-neutral-800 font-bold">
            designed by <span className="text-neutral-600">Harry Portugal</span>
          </p>
        </div>
      </div>

      {/* Temporary discreet login button */}
      <Link 
        to="/admin/login" 
        className="absolute bottom-4 right-4 text-[10px] text-white/10 hover:text-white/30 transition-colors uppercase tracking-widest"
      >
        Admin
      </Link>
    </div>
  );
}
