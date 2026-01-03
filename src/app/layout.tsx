import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Klinik Spesialis Mata Makula Bahalap - Penglihatan Jernih, Hidup Lebih Bermakna",
  description: "Klinik Spesialis Mata Makula Bahalap hadir memberikan pelayanan kesehatan mata terbaik dengan teknologi modern dan dokter spesialis berpengalaman. Booking online, operasi katarak, LASIK, dan layanan mata lainnya.",
  keywords: ["klinik mata", "spesialis mata", "operasi katarak", "LASIK", "pemeriksaan mata", "makula bahalap", "dokter mata"],
  authors: [{ name: "Makula Bahalap" }],
  icons: {
    icon: "/Makula Bahalap-Landscape.png",
    apple: "/Makula Bahalap-Landscape.png",
  },
  openGraph: {
    title: "Klinik Spesialis Mata Makula Bahalap",
    description: "Penglihatan jernih, hidup lebih bermakna. Klinik spesialis mata dengan teknologi modern dan dokter berpengalaman.",
    type: "website",
    locale: "id_ID",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
