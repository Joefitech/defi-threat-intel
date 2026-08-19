import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DeFi Threat Intelligence Feed | Real-time Exploits & Post-Mortems',
  description: 'Real-time repository of decentralized finance security exploits, post-mortems, and attack vectors.',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white font-sans antialiased">
        {children}
      </body>
    </html>
  )
}