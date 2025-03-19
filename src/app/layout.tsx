import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sistema de Loja de Aluguel',
  description: 'Sistema para gerenciamento de loja de aluguel',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='pt-BR'>
      <body>
        {children}
      </body>
    </html>
  )
}