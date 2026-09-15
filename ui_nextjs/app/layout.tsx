import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'K4 Level 3B — AI Agent Evaluation Console',
  description: 'IT Helpdesk Assistant Next.js Console with Prompt Engineering & Tool Calling Trace',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body class="bg-[#0f0f11] text-neutral-100 min-h-screen selection:bg-amber-500/30 selection:text-amber-300">
        {children}
      </body>
    </html>
  )
}
