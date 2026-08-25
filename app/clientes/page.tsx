'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Cliente {
  id: number
  nome: string
  telefone: string
  anotacoes_tecnicas: string
  criado_em: string
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [busca, setBusca] = useState('')
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [modalAberto, setModalAberto] = useState(false)

  // Formulário
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [anotacoesTecnicas, setAnotacoesTecnicas] = useState('')

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
        anotacoes_tecnicas: anotacoesTecnicas,
      },
    ])

    if (error) {
      alert('Erro ao cadastrar cliente')
      console.error(error)
    } else {
      // Limpar formulário e fechar modal
      setNome('')
      setTelefone('')
      setAnotacoesTecnicas('')
      setModalAberto(false)
      buscarClientes() // Recarrega lista
    }
    setSalvando(false)
  }

  // Filtragem local por nome ou telefone
  const clientesFiltrados = clientes.filter(
    (c) =>
      c.nome.toLowerCase().includes(busca.toLowerCase()) ||
      (c.telefone && c.telefone.includes(busca))
  )

  return (
    <main className="max-w-md mx-auto min-h-screen bg-zinc-950 text-zinc-100 p-4 font-sans pb-20">
      {/* CABEÇALHO */}
      <header className="flex items-center justify-between border-b border-zinc-800/80 pb-4 mb-6 pt-2">
        <div>
          <h1 className="font-serif text-xl text-yellow-400 tracking-wide">
            Minhas Clientes
          </h1>
          <p className="text-[10px] tracking-[0.2em] text-zinc-400 uppercase font-light">
            Silvana Paiva • Fichas
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
      <div className="mb-6 relative">
        <input
          type="text"
          placeholder="Buscar por nome ou WhatsApp..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-yellow-500/60 transition-colors"
        />
        {busca && (
          <button
            onClick={() => setBusca('')}
            className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300 text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* LISTA DE CLIENTES */}
      {loading ? (
        <div className="text-center py-12 text-zinc-500 text-sm animate-pulse">
          Carregando clientes...
        </div>
      ) : clientesFiltrados.length === 0 ? (
        <div className="text-center py-12 bg-zinc-900/50 rounded-2xl border border-zinc-800/80 p-6">
          <p className="text-zinc-400 text-sm">Nenhuma cliente encontrada.</p>
          <p className="text-xs text-zinc-600 mt-1">
            Clique em "+ Nova Cliente" para cadastrar a primeira.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-zinc-500 px-1">
            Total: {clientesFiltrados.length} cliente(s)
          </p>

          {clientesFiltrados.map((cliente) => (
            <div
              key={cliente.id}
              className="bg-zinc-900/90 p-4 rounded-2xl border border-zinc-800 shadow-lg hover:border-zinc-700 transition-all"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-zinc-100 text-base">
                    {cliente.nome}
                  </h3>
                  {cliente.telefone ? (
                    <a
                      href={`https://wa.me/55${cliente.telefone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-yellow-500/90 hover:text-yellow-400 flex items-center gap-1 mt-0.5"
                    >
                      💬 {cliente.telefone}
                    </a>
                  ) : (
                    <span className="text-xs text-zinc-600">Sem WhatsApp</span>
                  )}
                </div>
              </div>

              {/* ANOTAÇÕES TÉCNICAS / FÓRMULAS QUÍMICAS */}
              <div className="mt-3 pt-3 border-t border-zinc-800/80 bg-zinc-950/50 p-2.5 rounded-xl border border-zinc-800/40">
                <p className="text-[10px] font-bold tracking-wider text-yellow-500/80 uppercase mb-1">
                  🧪 Ficha Técnica / Fórmulas
                </p>
                <p className="text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed">
                  {cliente.anotacoes_tecnicas ||
                    'Nenhuma nota ou fórmula cadastrada ainda.'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE CADASTRO DE CLIENTE */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
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
                  placeholder="Ex: Maria Oliveira"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1 font-medium">
                  WhatsApp / Telefone
                </label>
                <input
                  type="tel"
                  placeholder="Ex: 11999998888"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1 font-medium">
                  Anotações / Fórmulas Químicas
                </label>
                <textarea
                  rows={3}
                  placeholder="Ex: Raiz 7.1 + OX 20V. Cabelo poroso na ponta."
                  value={anotacoesTecnicas}
                  onChange={(e) => setAnotacoesTecnicas(e.target.value)}
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