import type { Metadata } from "next";
import { Geist_Mono, Noto_Serif_KR, Song_Myung } from "next/font/google";

import "@/app/globals.css";

const bodySerif = Noto_Serif_KR({
  variable: "--font-body-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const displayBrush = Song_Myung({
  variable: "--font-display-brush",
  weight: "400",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Korean Learning Platform",
  description: "순우리말, 표현 감각, AI 교정을 함께 다루는 공개 학습 플랫폼",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body
        className={`${bodySerif.variable} ${displayBrush.variable} ${geistMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
