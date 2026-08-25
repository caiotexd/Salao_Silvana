'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Cliente {
  id: number
  nome: string
  telefone: string
  anotacoes_tecnicas: string
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [salvando, setSalvando] = useState(false)

  // Formulário
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [anotacoes, setAnotacoes] = useState('')

  useEffect(() => {
    buscarClientes()
  }, [])

  async function buscarClientes() {
    setLoading(true)
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('nome', { ascending: true })

    if (error) {
      console.error('Erro ao buscar clientes:', error)
    } else {
      setClientes(data || [])
    }
    setLoading(false)
  }

  async function salvarCliente(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim()) return

    setSalvando(true)
    const { error } = await supabase.from('clientes').insert([
      {
        nome,
        telefone,
        anotacoes_tecnicas: anotacoes,
      },
    ])

    if (error) {
      alert('Erro ao cadastrar cliente')
      console.error(error)
    } else {
      setNome('')
      setTelefone('')
      setAnotacoes('')
      setModalAberto(false)
      buscarClientes()
    }
    setSalvando(false)
  }

  async function excluirCliente(id: number) {
    if (!confirm('Deseja realmente excluir esta cliente?')) return

    const { error } = await supabase.from('clientes').delete().eq('id', id)
    if (error) {
      alert('Erro ao excluir cliente')
    } else {
      buscarClientes()
    }
  }

  const clientesFiltrados = clientes.filter(
    (c) =>
      c.nome.toLowerCase().includes(busca.toLowerCase()) ||
      (c.telefone && c.telefone.includes(busca))
  )

  return (
    <main className="max-w-md mx-auto min-h-screen bg-zinc-950 text-zinc-100 p-4 font-sans pb-24">
      {/* CABEÇALHO */}
      <header className="flex items-center justify-between border-b border-zinc-800/80 pb-4 mb-6 pt-2">
        <div>
          <h1 className="font-serif text-xl text-yellow-400 tracking-wide">
            Minhas Clientes
          </h1>
          <p className="text-[10px] tracking-[0.2em] text-zinc-400 uppercase font-light">
            Silvana Paiva • Cadastro
          </p>
        </div>

        <button
          onClick={() => setModalAberto(true)}
          className="bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-colors"
        >
          <span>+</span> Nova Cliente
        </button>
      </header>

      {/* CAMPO DE BUSCA */}
      <div className="mb-5">
        <input
          type="text"
          placeholder="🔍 Buscar por nome ou telefone..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-yellow-500"
        />
      </div>

      {/* LISTA DE CLIENTES */}
      <section className="space-y-3">
        {loading ? (
          <div className="text-center py-12 text-zinc-500 text-sm animate-pulse">
            Carregando lista de clientes...
          </div>
        ) : clientesFiltrados.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900/40 rounded-2xl border border-zinc-800/80 p-6">
            <p className="text-zinc-400 text-sm">Nenhuma cliente encontrada.</p>
          </div>
        ) : (
          clientesFiltrados.map((item) => (
            <div
              key={item.id}
              className="bg-zinc-900/90 p-4 rounded-2xl border border-zinc-800 shadow-md space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-zinc-100 text-base">
                    {item.nome}
                  </h3>
                  {item.telefone && (
                    <p className="text-xs text-yellow-400/90 font-medium mt-0.5">
                      📞 {item.telefone}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  {item.telefone && (
                    <a
                      href={`https://wa.me/55${item.telefone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-lg text-xs font-medium"
                    >
                      WhatsApp
                    </a>
                  )}
                  <button
                    onClick={() => excluirCliente(item.id)}
                    className="text-zinc-600 hover:text-rose-400 px-1 py-0.5 text-xs"
                  >
                    🗑
                  </button>
                </div>
              </div>

              {item.anotacoes_tecnicas && (
                <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/60">
                  <p className="text-[10px] text-yellow-500 uppercase font-bold tracking-wider mb-1">
                    Ficha Técnica / Histórico Capilar
                  </p>
                  <p className="text-xs text-zinc-300 whitespace-pre-wrap">
                    {item.anotacoes_tecnicas}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </section>

      {/* MODAL DE CADASTRO */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-5 border-b border-zinc-800 pb-3">
              <h2 className="font-serif text-lg text-yellow-400">
                Nova Cliente
              </h2>
              <button
                onClick={() => setModalAberto(false)}
                className="text-zinc-500 hover:text-zinc-300 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={salvarCliente} className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1 font-medium">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Ana Maria Silva"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1 font-medium">
                  Telefone / WhatsApp
                </label>
                <input
                  type="text"
                  placeholder="Ex: (11) 99999-9999"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1 font-medium">
                  Ficha Técnica (Fórmula de Coloração, Sensibilidade, etc)
                </label>
                <textarea
                  rows={3}
                  placeholder="Ex: Coloração 7.1 com ox 20. Alérgica a amônia."
                  value={anotacoes}
                  onChange={(e) => setAnotacoes(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-yellow-500"
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
                  {salvando ? 'Salvando...' : 'Salvar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}