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
  atendimento_id?: number | null
  criado_em: string
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
        valor: parseFloat(valor.replace(',', '.')),
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
      setTipo('SAIDA')
      setModalAberto(false)
      buscarTransacoes()
    }
    setSalvando(false)
  }

  // Cálculos de Resumo
  const totalEntradas = transacoes
    .filter((t) => t.tipo === 'ENTRADA')
    .reduce((acc, t) => acc + Number(t.valor), 0)

  const totalSaidas = transacoes
    .filter((t) => t.tipo === 'SAIDA')
    .reduce((acc, t) => acc + Number(t.valor), 0)

  const lucroLiquido = totalEntradas - totalSaidas

  return (
    <main className="max-w-md mx-auto min-h-screen bg-zinc-950 text-zinc-100 p-4 font-sans pb-20">
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
          <span>+</span> Lançamento
        </button>
      </header>

      {/* CARDS DE RESUMO FINANCEIRO */}
      <div className="space-y-3 mb-6">
        {/* Card do Lucro Líquido */}
        <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 p-4 rounded-2xl border border-yellow-500/30 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none" />
          <p className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
            Saldo / Lucro Líquido
          </p>
          <p
            className={`text-2xl font-bold mt-1 ${
              lucroLiquido >= 0 ? 'text-yellow-400' : 'text-rose-400'
            }`}
          >
            R$ {lucroLiquido.toFixed(2)}
          </p>
        </div>

        {/* Entradas x Saídas */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800">
            <span className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase block">
              ↑ Receitas (Entradas)
            </span>
            <span className="text-base font-semibold text-emerald-400 mt-0.5 block">
              +R$ {totalEntradas.toFixed(2)}
            </span>
          </div>

          <div className="bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800">
            <span className="text-[10px] font-bold tracking-wider text-rose-400 uppercase block">
              ↓ Despesas (Saídas)
            </span>
            <span className="text-base font-semibold text-rose-400 mt-0.5 block">
              -R$ {totalSaidas.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* EXTRATO DE TRANSAÇÕES */}
      <section>
        <h2 className="text-xs font-bold tracking-widest text-zinc-400 uppercase mb-3 px-1">
          Histórico de Movimentações
        </h2>

        {loading ? (
          <div className="text-center py-12 text-zinc-500 text-sm animate-pulse">
            Carregando transações...
          </div>
        ) : transacoes.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900/50 rounded-2xl border border-zinc-800/80 p-6">
            <p className="text-zinc-400 text-sm">Nenhuma movimentação registrada.</p>
            <p className="text-xs text-zinc-600 mt-1">
              Os valores cobrados nos atendimentos concluídos aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {transacoes.map((item) => (
              <div
                key={item.id}
                className="bg-zinc-900/90 p-3.5 rounded-xl border border-zinc-800/80 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                      item.tipo === 'ENTRADA'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {item.tipo === 'ENTRADA' ? '↑' : '↓'}
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-zinc-100">
                      {item.descricao}
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      {item.data.split('-').reverse().join('/')} • {item.metodo_pagamento}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-xs font-bold ${
                      item.tipo === 'ENTRADA' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {item.tipo === 'ENTRADA' ? '+' : '-'} R${' '}
                    {Number(item.valor).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* MODAL DE NOVO LANÇAMENTO */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
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
              {/* Tipo: Entrada ou Saída */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-950 rounded-xl border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setTipo('SAIDA')}
                  className={`py-2 text-xs font-bold rounded-lg transition-colors ${
                    tipo === 'SAIDA'
                      ? 'bg-rose-500 text-zinc-950'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  ↓ Despesa (Saída)
                </button>
                <button
                  type="button"
                  onClick={() => setTipo('ENTRADA')}
                  className={`py-2 text-xs font-bold rounded-lg transition-colors ${
                    tipo === 'ENTRADA'
                      ? 'bg-emerald-500 text-zinc-950'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  ↑ Receita (Entrada)
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
                      ? 'Ex: Compra de Tintas / Conta de Luz'
                      : 'Ex: Atendimento Avulso'
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
                    Data
                  </label>
                  <input
                    type="date"
                    value={dataTransacao}
                    onChange={(e) => setDataTransacao(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-yellow-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1 font-medium">
                  Forma de Pagamento
                </label>
                <select
                  value={metodoPagamento}
                  onChange={(e) => setMetodoPagamento(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-yellow-500"
                >
                  <option value="PIX">Pix</option>
                  <option value="DINHEIRO">Dinheiro</option>
                  <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                  <option value="CARTAO_DEBITO">Cartão de Débito</option>
                </select>
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
                  {salvando ? 'Registrando...' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}