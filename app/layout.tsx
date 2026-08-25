import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import BottomBar from '@/components/BottomBar'

const inter = Inter({ subsets: ['latin'] })

// Configuração da barra de status do celular
export const viewport: Viewport = {
  themeColor: '#09090b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

// Metadados do PWA e iOS
export const metadata: Metadata = {
  title: 'Silvana Paiva - Espaço de Beleza',
  description: 'Sistema de gestão de atendimentos e caixa',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Silvana Paiva',
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="bg-zinc-950">
      <body className={`${inter.className} bg-zinc-950 text-zinc-100 min-h-screen antialiased`}>
        <div className="pb-16">{children}</div>
        <BottomBar />
      </body>
    </html>
  )
}