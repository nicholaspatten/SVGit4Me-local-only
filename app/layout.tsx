import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SVG It 4 Me',
  description: 'Convert images to SVGs with ease',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
