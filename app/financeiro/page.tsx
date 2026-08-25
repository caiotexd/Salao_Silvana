'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Transacao {
  id: number
  tipo: 'ENTRADA' | 'SAIDA'
  descricao: string
  valor: number
  data: string
  metodo_pagamento: string
}

export default function FinanceiroPage() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [modalAberto, setModalAberto] = useState(false)

  // Formulário
  const [tipo, setTipo] = useState<'ENTRADA' | 'SAIDA'>('SAIDA')
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [metodoPagamento, setMetodoPagamento] = useState('PIX')
  const [dataTransacao, setDataTransacao] = useState(
    new Date().toISOString().split('T')[0]
  )

  useEffect(() => {
    buscarTransacoes()
  }, [])

  async function buscarTransacoes() {
    setLoading(true)
    const { data, error } = await supabase
      .from('transacoes')
      .select('*')
      .order('data', { ascending: false })
      .order('id', { ascending: false })

    if (error) {
      console.error('Erro ao buscar transações:', error)
    } else {
      setTransacoes(data || [])
    }
    setLoading(false)
  }

  async function salvarTransacao(e: React.FormEvent) {
    e.preventDefault()
    if (!descricao.trim() || !valor) return

    setSalvando(true)
    const { error } = await supabase.from('transacoes').insert([
      {
        tipo,
        descricao,
        valor: parseFloat(valor.replace(',', '.')) || 0,
        data: dataTransacao,
        metodo_pagamento: metodoPagamento,
      },
    ])

    if (error) {
      alert('Erro ao registrar transação')
      console.error(error)
    } else {
      setDescricao('')
      setValor('')
      setModalAberto(false)
      buscarTransacoes()
    }
    setSalvando(false)
  }

  async function excluirTransacao(id: number) {
    if (!confirm('Deseja excluir este lançamento?')) return

    const { error } = await supabase.from('transacoes').delete().eq('id', id)
    if (error) {
      alert('Erro ao excluir transação')
    } else {
      buscarTransacoes()
    }
  }

  // Totais
  const totalEntradas = transacoes
    .filter((t) => t.tipo === 'ENTRADA')
    .reduce((acc, t) => acc + Number(t.valor || 0), 0)

  const totalSaidas = transacoes
    .filter((t) => t.tipo === 'SAIDA')
    .reduce((acc, t) => acc + Number(t.valor || 0), 0)

  const lucroLiquido = totalEntradas - totalSaidas

  return (
    <main className="max-w-md mx-auto min-h-screen bg-zinc-950 text-zinc-100 p-4 font-sans pb-24">
      {/* CABEÇALHO */}
      <header className="flex items-center justify-between border-b border-zinc-800/80 pb-4 mb-6 pt-2">
        <div>
          <h1 className="font-serif text-xl text-yellow-400 tracking-wide">
            Livro Caixa
          </h1>
          <p className="text-[10px] tracking-[0.2em] text-zinc-400 uppercase font-light">
            Silvana Paiva • Financeiro
          </p>
        </div>

        <button
          onClick={() => setModalAberto(true)}
          className="bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-colors"
        >
          <span>+</span> Novo Lançamento
        </button>
      </header>

      {/* BALANÇO */}
      <section className="bg-zinc-900/90 border border-yellow-500/30 rounded-2xl p-5 mb-6 shadow-md relative overflow-hidden">
        <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider mb-1">
          Saldo / Lucro Líquido
        </p>
        <h2
          className={`text-3xl font-bold font-serif mb-4 ${
            lucroLiquido >= 0 ? 'text-yellow-400' : 'text-rose-400'
          }`}
        >
          R$ {lucroLiquido.toFixed(2)}
        </h2>

        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-800">
          <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80">
            <span className="text-[10px] text-zinc-400 uppercase font-bold block mb-0.5">
              🟢 Total Entradas
            </span>
            <span className="text-sm font-semibold text-emerald-400">
              + R$ {totalEntradas.toFixed(2)}
            </span>
          </div>

          <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80">
            <span className="text-[10px] text-zinc-400 uppercase font-bold block mb-0.5">
              🔴 Total Saídas
            </span>
            <span className="text-sm font-semibold text-rose-400">
              - R$ {totalSaidas.toFixed(2)}
            </span>
          </div>
        </div>
      </section>

      {/* EXTRATO */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold tracking-widest text-zinc-400 uppercase px-1 mb-2">
          Histórico ({transacoes.length})
        </h3>

        {loading ? (
          <div className="text-center py-12 text-zinc-500 text-sm animate-pulse">
            Carregando extrato...
          </div>
        ) : transacoes.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900/40 rounded-2xl border border-zinc-800/80 p-6">
            <p className="text-zinc-400 text-sm">Nenhuma transação cadastrada.</p>
          </div>
        ) : (
          transacoes.map((item) => (
            <div
              key={item.id}
              className="bg-zinc-900/90 p-3.5 rounded-xl border border-zinc-800 flex justify-between items-center shadow-md"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${
                    item.tipo === 'ENTRADA'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {item.tipo === 'ENTRADA' ? '⇣' : '⇡'}
                </div>

                <div>
                  <p className="font-medium text-zinc-100 text-sm">
                    {item.descricao}
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    {item.data ? item.data.split('-').reverse().join('/') : ''} •{' '}
                    <span className="text-zinc-400 font-medium">
                      {item.metodo_pagamento}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`font-bold text-sm ${
                    item.tipo === 'ENTRADA' ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {item.tipo === 'ENTRADA' ? '+' : '-'} R${' '}
                  {Number(item.valor || 0).toFixed(2)}
                </span>
                <button
                  onClick={() => excluirTransacao(item.id)}
                  className="text-zinc-600 hover:text-rose-400 text-xs ml-1"
                >
                  🗑
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      {/* MODAL */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-5 border-b border-zinc-800 pb-3">
              <h2 className="font-serif text-lg text-yellow-400">
                Novo Lançamento
              </h2>
              <button
                onClick={() => setModalAberto(false)}
                className="text-zinc-500 hover:text-zinc-300 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={salvarTransacao} className="space-y-4">
              <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-950 rounded-xl border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setTipo('SAIDA')}
                  className={`py-2 text-xs font-bold rounded-lg transition-colors ${
                    tipo === 'SAIDA'
                      ? 'bg-rose-500 text-zinc-950 shadow-md'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  🔴 Saída (Despesa)
                </button>
                <button
                  type="button"
                  onClick={() => setTipo('ENTRADA')}
                  className={`py-2 text-xs font-bold rounded-lg transition-colors ${
                    tipo === 'ENTRADA'
                      ? 'bg-emerald-500 text-zinc-950 shadow-md'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  🟢 Entrada (Receita)
                </button>
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1 font-medium">
                  Descrição *
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    tipo === 'SAIDA'
                      ? 'Ex: Compra de tintas'
                      : 'Ex: Venda avulsa de produto'
                  }
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1 font-medium">
                    Valor (R$) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="0,00"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-1 font-medium">
                    Pagamento
                  </label>
                  <select
                    value={metodoPagamento}
                    onChange={(e) => setMetodoPagamento(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-yellow-500"
                  >
                    <option value="PIX">PIX</option>
                    <option value="CARTAO_DEBITO">Cartão Débito</option>
                    <option value="CARTAO_CREDITO">Cartão Crédito</option>
                    <option value="DINHEIRO">Dinheiro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1 font-medium">
                  Data
                </label>
                <input
                  type="date"
                  value={dataTransacao}
                  onChange={(e) => setDataTransacao(e.target.value)}
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
                  {salvando ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}