import type { Metadata } from "next";
import { BIZ_UDPGothic } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

// Web font for headings only
const bizUDPGothic = BIZ_UDPGothic({
  weight: ['700'],          // Bold weight only for headings
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-biz-udp-gothic',
});

export const metadata: Metadata = {
  title: "Creatalk - クリエイターとファンをつなぐビデオ通話プラットフォーム",
  description: "クリエイターとファンを1対1のビデオ通話でつなぐプラットフォーム。より直接的で価値のある交流を実現します。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${bizUDPGothic.variable} font-sans antialiased`}>
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
