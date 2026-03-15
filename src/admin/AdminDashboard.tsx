import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2, Search, Filter, LogOut, ChevronRight, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BriefingListItem {
  id: string;
  company_name: string;
  email: string;
  created_at: string;
  status: string;
  website_goal: string;
  business_pains: string;
}

const STATUS_LABELS: Record<string, string> = {
  new: 'Novo',
  reviewing: 'Em análise',
  contacted: 'Contatado',
  closed: 'Fechado',
  archived: 'Arquivado'
};

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  reviewing: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  contacted: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  closed: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20',
  archived: 'bg-red-500/10 text-red-400 border-red-500/20'
};

export default function AdminDashboard() {
  const [briefings, setBriefings] = useState<BriefingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const navigate = useNavigate();

  const [accessDenied, setAccessDenied] = useState(false);

  const fetchBriefings = async () => {
    setLoading(true);
    setError(null);
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
        setIsInitializing(false);
        setLoading(false);
        return;
      }

      let query = supabase
        .from('briefings')
        .select('id, company_name, email, created_at, status, website_goal, business_pains')
        .order('created_at', { ascending: sortOrder === 'asc' });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setBriefings(data || []);
    } catch (err: any) {
      console.error('Error fetching briefings:', err);
      setError('Erro ao carregar os briefings. Tente novamente.');
    } finally {
      setLoading(false);
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    fetchBriefings();
  }, [navigate, statusFilter, sortOrder]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
      </div>
    );
  }

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

  const filteredBriefings = briefings.filter(b => 
    b.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 relative">
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-light tracking-tight">Briefings</h1>
            <p className="text-neutral-500 text-sm font-light">
              {briefings.length} {briefings.length === 1 ? 'briefing recebido' : 'briefings recebidos'}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={fetchBriefings}
              className="p-2 rounded-full bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.08] transition-all"
              title="Atualizar"
            >
              <RefreshCw className="w-4 h-4 text-neutral-400" />
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs uppercase tracking-[0.1em] text-neutral-400 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </header>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Buscar por empresa ou e-mail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.02] border border-white/[0.05] rounded-full pl-12 pr-4 py-3 text-sm font-light outline-none transition-all focus:bg-white/[0.04] focus:border-white/[0.1] placeholder:text-neutral-600"
            />
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full md:w-48 bg-white/[0.02] border border-white/[0.05] rounded-full pl-12 pr-8 py-3 text-sm font-light outline-none appearance-none cursor-pointer hover:bg-white/[0.04] transition-all"
              >
                <option value="all">Todos os status</option>
                <option value="new">Novo</option>
                <option value="reviewing">Em análise</option>
                <option value="contacted">Contatado</option>
                <option value="closed">Fechado</option>
                <option value="archived">Arquivado</option>
              </select>
            </div>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'desc' | 'asc')}
              className="w-full md:w-[141px] bg-white/[0.02] border border-white/[0.05] rounded-full px-6 py-3 text-sm font-light outline-none appearance-none cursor-pointer hover:bg-white/[0.04] transition-all"
            >
              <option value="desc">Mais recentes</option>
              <option value="asc">Mais antigos</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
          </div>
        ) : error ? (
          <div className="text-center py-20 space-y-4">
            <p className="text-red-400">{error}</p>
            <button 
              onClick={fetchBriefings}
              className="text-sm border border-white/10 px-4 py-2 rounded-full hover:bg-white/5 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        ) : filteredBriefings.length === 0 ? (
          <div className="text-center py-32 border border-white/[0.05] rounded-3xl bg-white/[0.01]">
            <p className="text-neutral-500 font-light">Nenhum briefing encontrado.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredBriefings.map((briefing) => (
              <Link 
                key={briefing.id} 
                to={`/admin/briefings/${briefing.id}`}
                className="group p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-4 flex-1">
                  <div className="flex items-center justify-between md:justify-start gap-4">
                    <h3 className="text-lg font-medium tracking-tight">{briefing.company_name || 'Empresa não informada'}</h3>
                    <span className={`text-[10px] uppercase tracking-[0.1em] px-3 py-1 rounded-full border ${STATUS_COLORS[briefing.status] || STATUS_COLORS.new}`}>
                      {STATUS_LABELS[briefing.status] || 'Desconhecido'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-neutral-400 font-light">
                    <div className="space-y-1">
                      <p className="text-xs text-neutral-600 uppercase tracking-wider">Objetivo</p>
                      <p className="truncate">{briefing.website_goal || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-neutral-600 uppercase tracking-wider">Dores</p>
                      <p className="truncate">{briefing.business_pains || '-'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:flex-col md:items-end gap-4 shrink-0">
                  <div className="text-xs text-neutral-500 font-light">
                    {format(new Date(briefing.created_at), "dd 'de' MMM, yyyy", { locale: ptBR })}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center group-hover:bg-white text-neutral-400 group-hover:text-black transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
