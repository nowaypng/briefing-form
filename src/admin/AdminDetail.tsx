import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2, ChevronLeft, Save, Copy, CheckCircle2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BriefingDetail {
  id: string;
  created_at: string;
  updated_at: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  business_description: string;
  main_product_or_service: string;
  ideal_client: string;
  website_goal: string;
  business_pains: string;
  time_consuming_tasks: string;
  repetitive_manual_tasks: string;
  automation_goal: string;
  desired_site_action: string;
  visual_assets: string;
  reference_links: string;
  status: string;
  internal_notes: string;
  raw_payload: any;
}

const STATUS_OPTIONS = [
  { value: 'new', label: 'Novo' },
  { value: 'reviewing', label: 'Em análise' },
  { value: 'contacted', label: 'Contatado' },
  { value: 'closed', label: 'Fechado' },
  { value: 'archived', label: 'Arquivado' }
];

export default function AdminDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [briefing, setBriefing] = useState<BriefingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Edit state
  const [status, setStatus] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showRaw, setShowRaw] = useState(false);

  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    const fetchBriefing = async () => {
      setLoading(true);
      setAccessDenied(false);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/admin/login');
          return;
        }

        // Check admin status
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (adminError || !adminData) {
          setAccessDenied(true);
          setLoading(false);
          return;
        }

        const { data, error: fetchError } = await supabase
          .from('briefings')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;

        setBriefing(data);
        setStatus(data.status || 'new');
        setInternalNotes(data.internal_notes || '');
      } catch (err: any) {
        console.error('Error fetching briefing:', err);
        setError('Erro ao carregar os detalhes do briefing.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBriefing();
    }
  }, [id, navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 space-y-6">
        <div className="fixed inset-0 pointer-events-none opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        <div className="liquid-glass p-10 text-center space-y-6 relative z-10 max-w-md w-full">
          <h1 className="text-2xl font-light text-white">Acesso Negado</h1>
          <p className="text-neutral-400 font-light">
            Você não tem permissão de administrador para acessar esta área.
          </p>
          <button 
            onClick={handleLogout}
            className="w-full bg-white text-black text-[10px] uppercase tracking-[0.2em] font-bold py-4 rounded-full transition-all hover:bg-neutral-200"
          >
            Sair e voltar ao login
          </button>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    if (!id) return;
    
    setSaving(true);
    setSaveMessage(null);
    
    try {
      const { error: updateError } = await supabase
        .from('briefings')
        .update({
          status,
          internal_notes: internalNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;
      
      setSaveMessage({ type: 'success', text: 'Alterações salvas com sucesso.' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err: any) {
      console.error('Error updating briefing:', err);
      setSaveMessage({ type: 'error', text: 'Erro ao salvar alterações.' });
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast here
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
      </div>
    );
  }

  if (error || !briefing) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 space-y-6">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-white text-lg font-light">{error || 'Briefing não encontrado.'}</p>
        <Link to="/admin/briefings" className="text-neutral-400 hover:text-white transition-colors border-b border-white/20 pb-1">
          Voltar para a lista
        </Link>
      </div>
    );
  }

  const Section = ({ title, content }: { title: string, content: string | null | undefined }) => (
    <div className="space-y-2">
      <h3 className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold">{title}</h3>
      <p className="text-white font-light leading-relaxed bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
        {content || <span className="text-neutral-600 italic">Não informado</span>}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 relative">
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6">
          <div className="space-y-4">
            <Link 
              to="/admin/briefings"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.1em] text-neutral-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Voltar
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-light tracking-tight">{briefing.company_name || 'Empresa não informada'}</h1>
              <p className="text-neutral-500 text-sm font-light mt-2">
                Recebido em {format(new Date(briefing.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-white/[0.02] border border-white/[0.05] p-2 rounded-2xl">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-transparent text-sm font-light outline-none appearance-none cursor-pointer pl-4 pr-8 py-2 border-r border-white/10"
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-neutral-900">{opt.label}</option>
              ))}
            </select>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-white text-black text-[10px] uppercase tracking-[0.1em] font-bold rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar
            </button>
          </div>
        </header>

        {saveMessage && (
          <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-light ${
            saveMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            {saveMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {saveMessage.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            <div className="space-y-6">
              <h2 className="text-xl font-light tracking-tight border-b border-white/10 pb-2">Negócio</h2>
              <Section title="O que a empresa faz" content={briefing.business_description} />
              <Section title="Principal Produto/Serviço" content={briefing.main_product_or_service} />
              <Section title="Cliente Ideal" content={briefing.ideal_client} />
              <Section title="Dores do Negócio" content={briefing.business_pains} />
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-light tracking-tight border-b border-white/10 pb-2">Projeto & Site</h2>
              <Section title="Objetivo do Site" content={briefing.website_goal} />
              <Section title="Ação Esperada (CTA)" content={briefing.desired_site_action} />
              <Section title="Ativos Visuais" content={briefing.visual_assets} />
              <Section title="Links de Referência" content={briefing.reference_links} />
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-light tracking-tight border-b border-white/10 pb-2">Operação & Automação</h2>
              <Section title="Tarefas Demoradas" content={briefing.time_consuming_tasks} />
              <Section title="Tarefas Repetitivas" content={briefing.repetitive_manual_tasks} />
              <Section title="Desejos de Automação" content={briefing.automation_goal} />
            </div>
            
            <div className="space-y-4 pt-8 border-t border-white/10">
              <button 
                onClick={() => setShowRaw(!showRaw)}
                className="text-xs uppercase tracking-[0.1em] text-neutral-500 hover:text-white transition-colors flex items-center gap-2"
              >
                {showRaw ? 'Ocultar Payload' : 'Ver Payload Completo'}
              </button>
              
              {showRaw && (
                <pre className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 overflow-x-auto text-xs font-mono text-neutral-400">
                  {JSON.stringify(briefing.raw_payload, null, 2)}
                </pre>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 space-y-6">
              <h2 className="text-lg font-light tracking-tight">Contato</h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold mb-1">Nome</p>
                  <p className="font-light">{briefing.contact_name || '-'}</p>
                </div>
                
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold mb-1">E-mail</p>
                  <div className="flex items-center justify-between group">
                    <p className="font-light truncate pr-2">{briefing.email || '-'}</p>
                    {briefing.email && (
                      <button onClick={() => copyToClipboard(briefing.email)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-white/10 rounded-md">
                        <Copy className="w-3.5 h-3.5 text-neutral-400" />
                      </button>
                    )}
                  </div>
                </div>
                
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold mb-1">Telefone / WhatsApp</p>
                  <div className="flex items-center justify-between group">
                    <p className="font-light">{briefing.phone || '-'}</p>
                    {briefing.phone && (
                      <button onClick={() => copyToClipboard(briefing.phone)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-white/10 rounded-md">
                        <Copy className="w-3.5 h-3.5 text-neutral-400" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-light tracking-tight">Notas Internas</h2>
              <textarea
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Adicione observações sobre este lead..."
                className="w-full bg-black/50 border border-white/[0.05] rounded-xl p-4 text-sm font-light outline-none transition-all focus:bg-white/[0.02] focus:border-white/[0.1] placeholder:text-neutral-700 min-h-[150px] resize-y"
              />
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-white/[0.05] hover:bg-white/[0.1] text-white text-[10px] uppercase tracking-[0.1em] font-bold py-3 rounded-xl transition-all disabled:opacity-50"
              >
                Salvar Notas
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
