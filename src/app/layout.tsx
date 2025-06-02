import type { Metadata } from "next";
import { BIZ_UDPGothic } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Inter } from 'next/font/google'
import { Header } from '@/components/layout/Header'
import { AuthProvider } from '@/features/auth'
import { getUser } from '@/lib/auth'
import { cookies } from 'next/headers'

// Web font for headings only
const bizUDPGothic = BIZ_UDPGothic({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-biz-udp-gothic',
});

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "Creatalk - クリエイターとファンをつなぐビデオ通話プラットフォーム",
  description: "クリエイターとファンを1対1のビデオ通話でつなぐプラットフォーム。より直接的で価値のある交流を実現します。",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const initialUser = await getUser(cookieStore)

  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${bizUDPGothic.variable} font-sans antialiased ${inter.className}`}>
        <AuthProvider initialUser={initialUser}>
          <Header />
          <main>
            {children}
          </main>
          <Toaster richColors position="top-center" />
        </AuthProvider>
      </body>
    </html>
  );
}
