'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Atendimento {
  id: number
  cliente_nome: string
  servico: string
  data: string
  horario: string
  valor: number
  concluido: boolean
}

export default function AgendaPage() {
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([])
  const [loading, setLoading] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [salvando, setSalvando] = useState(false)

  // Formulário
  const [clienteNome, setClienteNome] = useState('')
  const [servico, setServico] = useState('')
  const [valor, setValor] = useState('')
  const [dataAtendimento, setDataAtendimento] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [horario, setHorario] = useState('09:00')

  useEffect(() => {
    buscarAtendimentos()
  }, [])

  async function buscarAtendimentos() {
    setLoading(true)
    const { data, error } = await supabase
      .from('atendimentos')
      .select('*')
      .order('data', { ascending: true })
      .order('horario', { ascending: true })

    if (error) console.error('Erro ao buscar:', error)
    else setAtendimentos(data || [])
    setLoading(false)
  }

  async function salvarAtendimento(e: React.FormEvent) {
    e.preventDefault()
    setSalvando(true)

    const valorNumerico = parseFloat(valor.replace(',', '.')) || 0

    const { error } = await supabase.from('atendimentos').insert([
      {
        cliente_nome: clienteNome,
        servico,
        valor: valorNumerico,
        data: dataAtendimento,
        horario,
        concluido: false,
      },
    ])

    if (error) {
      alert(`Erro ao agendar: ${error.message}`)
      console.error('Erro detalhado:', error)
    } else {
      setClienteNome('')
      setServico('')
      setValor('')
      setModalAberto(false)
      buscarAtendimentos()
    }
    setSalvando(false)
  }

  // Marcar como Concluído e Lançar Automático no Financeiro
  async function alternarStatus(item: Atendimento) {
    const novoStatus = !item.concluido

    // 1. Atualiza o status no agendamento
    const { error: errAtendimento } = await supabase
      .from('atendimentos')
      .update({ concluido: novoStatus })
      .eq('id', item.id)

    if (errAtendimento) {
      alert(`Erro ao atualizar status: ${errAtendimento.message}`)
      return
    }

    // 2. Se foi marcado como concluído e tem valor, gera a entrada no Livro Caixa/Financeiro
    if (novoStatus && item.valor > 0) {
      const { error: errTransacao } = await supabase.from('transacoes').insert([
        {
          tipo: 'ENTRADA',
          descricao: `Atendimento: ${item.cliente_nome} (${item.servico})`,
          valor: item.valor,
          data: item.data,
          metodo_pagamento: 'PIX',
        },
      ])

      if (errTransacao) {
        console.error('Erro ao lançar no financeiro:', errTransacao)
      }
    }

    buscarAtendimentos()
  }

  return (
    <main className="max-w-md mx-auto min-h-screen bg-zinc-950 text-zinc-100 p-4 font-sans pb-24">
      {/* CABEÇALHO */}
      <header className="flex items-center justify-between border-b border-zinc-800/80 pb-4 mb-6 pt-2">
        <div>
          <h1 className="font-serif text-xl text-yellow-400 tracking-wide">
            Silvana Paiva
          </h1>
          <p className="text-[10px] tracking-[0.2em] text-zinc-400 uppercase font-light">
            Agenda de Atendimentos
          </p>
        </div>

        <button
          onClick={() => setModalAberto(true)}
          className="bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-colors"
        >
          <span>+</span> Novo Agendamento
        </button>
      </header>

      {/* LISTA DE AGENDAMENTOS */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold tracking-widest text-zinc-400 uppercase px-1 mb-2">
          Agendamentos ({atendimentos.length})
        </h2>

        {loading ? (
          <div className="text-center py-12 text-zinc-500 text-sm animate-pulse">
            Carregando agenda...
          </div>
        ) : atendimentos.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900/40 rounded-2xl border border-zinc-800/80 p-6">
            <p className="text-zinc-400 text-sm">Nenhum agendamento encontrado.</p>
          </div>
        ) : (
          atendimentos.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all ${
                item.concluido
                  ? 'bg-zinc-900/40 border-zinc-800/50 opacity-75'
                  : 'bg-zinc-900/90 border-zinc-800 shadow-md'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-xs font-bold text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-lg mr-2">
                    {item.horario}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {item.data ? item.data.split('-').reverse().join('/') : ''}
                  </span>
                  <h3 className="font-semibold text-zinc-100 text-base mt-1">
                    {item.cliente_nome}
                  </h3>
                  <p className="text-xs text-zinc-400">{item.servico}</p>
                </div>

                <span className="font-bold text-sm text-emerald-400">
                  R$ {Number(item.valor || 0).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center pt-3 mt-2 border-t border-zinc-800/60">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    item.concluido
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {item.concluido ? '✓ Concluído' : '⏱ Pendente'}
                </span>

                <button
                  onClick={() => alternarStatus(item)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all ${
                    item.concluido
                      ? 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                      : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {item.concluido ? 'Reabrir' : 'Marcar Concluído'}
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      {/* MODAL DE NOVO AGENDAMENTO */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-5 border-b border-zinc-800 pb-3">
              <h2 className="font-serif text-lg text-yellow-400">
                Novo Agendamento
              </h2>
              <button
                onClick={() => setModalAberto(false)}
                className="text-zinc-500 hover:text-zinc-300 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={salvarAtendimento} className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1 font-medium">
                  Nome da Cliente *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Maria Silva"
                  value={clienteNome}
                  onChange={(e) => setClienteNome(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1 font-medium">
                  Serviço *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mechas / Corte"
                  value={servico}
                  onChange={(e) => setServico(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1 font-medium">
                    Valor (R$)
                  </label>
                  <input
                    type="text"
                    placeholder="0,00"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-1 font-medium">
                    Horário
                  </label>
                  <input
                    type="time"
                    value={horario}
                    onChange={(e) => setHorario(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-yellow-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1 font-medium">
                  Data
                </label>
                <input
                  type="date"
                  value={dataAtendimento}
                  onChange={(e) => setDataAtendimento(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="w-1/2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-2.5 rounded-xl text-xs transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={salvando}
                  className="w-1/2 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-bold py-2.5 rounded-xl text-xs transition-colors shadow-md disabled:opacity-50"
                >
                  {salvando ? 'Agendando...' : 'Agendar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}