import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Grad To Dentist',
  description: 'Professional dental education platform with video courses and training materials by Dr. Maha',
  keywords: 'dental education, dental courses, medical training, dental procedures, grad to dentist',
  icons: {
    icon: [
      { url: '/logofav.ico', sizes: '16x16', type: 'image/x-icon' },
      { url: '/logofav.ico', sizes: '32x32', type: 'image/x-icon' }
    ],
    shortcut: '/logofav.ico',
    apple: { url: '/logofav.ico', sizes: '180x180' }
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logofav.ico" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}