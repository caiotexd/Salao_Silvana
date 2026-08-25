'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Atendimento {
  id: number
  turno: 'MANHA' | 'TARDE' | 'NOITE'
  ordem: number
  status: 'AGUARDANDO' | 'EM_ATENDIMENTO' | 'CONCLUIDO' | 'CANCELADO'
  clientes: {
    nome: string
    telefone: string
  }
  atendimento_servicos: {
    preco_cobrado: number
    servicos: { nome: string }
  }[]
}

export default function AgendaPage() {
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([])
  const [loading, setLoading] = useState(true)

  const hoje = new Date().toISOString().split('T')[0]

  useEffect(() => {
    buscarFilaDoDia()
  }, [])

  async function buscarFilaDoDia() {
    setLoading(true)
    const { data, error } = await supabase
      .from('atendimentos')
      .select(`
        id,
        turno,
        ordem,
        status,
        clientes ( nome, telefone ),
        atendimento_servicos (
          preco_cobrado,
          servicos ( nome )
        )
      `)
      .eq('data', hoje)
      .order('ordem', { ascending: true })

    if (error) {
      console.error('Erro ao buscar agenda:', error)
    } else {
      setAtendimentos((data as unknown as Atendimento[]) || [])
    }
    setLoading(false)
  }

  async function atualizarStatus(id: number, novoStatus: Atendimento['status']) {
    const { error } = await supabase
      .from('atendimentos')
      .update({ status: novoStatus })
      .eq('id', id)

    if (!error) {
      buscarFilaDoDia()
    }
  }

  const turnos = ['MANHA', 'TARDE', 'NOITE'] as const

  return (
    <main className="max-w-md mx-auto min-h-screen bg-zinc-950 text-zinc-100 p-4 font-sans pb-12">
      
      {/* CAMEALHO TEMÁTICO: SILVANA PAIVA - ESPAÇO DE BELEZA */}
      <header className="flex flex-col items-center justify-center pt-6 pb-8 border-b border-zinc-800/80 mb-6 relative">
        {/* Monograma Circular S.P */}
        <div className="w-20 h-20 rounded-full border border-zinc-400 flex items-center justify-center relative mb-3 shadow-[0_0_15px_rgba(234,179,8,0.15)]">
          <span className="text-yellow-400 text-2xl font-serif tracking-tighter select-none">
            S<span className="text-white">.</span>P
          </span>
        </div>

        {/* Nome da Marca */}
        <h1 className="font-serif text-2xl text-yellow-400 tracking-wide select-none">
          Silvana Paiva
        </h1>
        <p className="text-[10px] tracking-[0.3em] text-zinc-300 font-light uppercase mt-0.5 select-none">
          Espaço de Beleza
        </p>

        {/* Indicador de Data */}
        <div className="mt-4 px-3 py-1 bg-zinc-900 border border-yellow-500/20 rounded-full text-xs text-zinc-400 font-medium">
          📅 {hoje.split('-').reverse().join('/')}
        </div>
      </header>

      {/* LISTA DA AGENDA DIÁRIA */}
      {loading ? (
        <div className="text-center py-12 text-zinc-500 text-sm animate-pulse">
          Carregando atendimentos...
        </div>
      ) : (
        <div className="space-y-6">
          {turnos.map((turno) => {
            const itensDoTurno = atendimentos.filter((a) => a.turno === turno)

            if (itensDoTurno.length === 0) return null

            return (
              <section 
                key={turno} 
                className="bg-zinc-900/90 p-4 rounded-2xl border border-zinc-800 shadow-xl"
              >
                {/* Título do Turno */}
                <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-2">
                  <h2 className="text-xs font-bold tracking-widest text-yellow-400 uppercase flex items-center gap-1.5">
                    {turno === 'MANHA' && '☀️ MANHÃ'}
                    {turno === 'TARDE' && '🌤️ TARDE'}
                    {turno === 'NOITE' && '🌙 NOITE'}
                  </h2>
                  <span className="text-xs font-semibold text-zinc-400 bg-zinc-800 px-2.5 py-0.5 rounded-full">
                    {itensDoTurno.length} {itensDoTurno.length === 1 ? 'cliente' : 'clientes'}
                  </span>
                </div>

                {/* Cards das Clientes */}
                <div className="space-y-3">
                  {itensDoTurno.map((item) => {
                    const total = item.atendimento_servicos.reduce(
                      (acc, s) => acc + Number(s.preco_cobrado), 
                      0
                    )
                    const servicosNomes = item.atendimento_servicos
                      .map((s) => s.servicos.nome)
                      .join(', ')

                    return (
                      <div
                        key={item.id}
                        className={`p-3.5 rounded-xl border transition-all flex justify-between items-center ${
                          item.status === 'EM_ATENDIMENTO'
                            ? 'bg-zinc-900 border-yellow-500/60 shadow-[0_0_10px_rgba(234,179,8,0.1)]'
                            : item.status === 'CONCLUIDO'
                            ? 'bg-zinc-950/40 border-zinc-800/50 opacity-60'
                            : 'bg-zinc-950/70 border-zinc-800/80 hover:border-zinc-700'
                        }`}
                      >
                        {/* Dados da Cliente */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded">
                              #{item.ordem}
                            </span>
                            <p className="font-semibold text-zinc-100 text-sm">
                              {item.clientes.nome}
                            </p>
                          </div>

                          <p className="text-xs text-zinc-400 pl-7">
                            {servicosNomes || 'Sem serviço definido'}
                          </p>

                          <p className="text-xs font-bold text-yellow-400 pl-7">
                            R$ {total.toFixed(2)}
                          </p>
                        </div>

                        {/* Ações / Status */}
                        <div>
                          {item.status === 'AGUARDANDO' && (
                            <button
                              onClick={() => atualizarStatus(item.id, 'EM_ATENDIMENTO')}
                              className="text-xs bg-yellow-500 hover:bg-yellow-400 text-zinc-950 px-3.5 py-1.5 rounded-lg font-bold transition-colors shadow-sm"
                            >
                              Atender
                            </button>
                          )}

                          {item.status === 'EM_ATENDIMENTO' && (
                            <button
                              onClick={() => atualizarStatus(item.id, 'CONCLUIDO')}
                              className="text-xs bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-3.5 py-1.5 rounded-lg font-bold transition-colors shadow-sm"
                            >
                              Concluir
                            </button>
                          )}

                          {item.status === 'CONCLUIDO' && (
                            <span className="text-xs text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">
                              ✓ Finalizado
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </main>
  )
}