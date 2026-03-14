import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
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
  title: "CashNeko",
  description: "CashNeko personal finance dashboard",
  icons: {
    icon: [
      { url: "/favicon/favicon.ico" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/favicon/apple-touch-icon.png",
    shortcut: "/favicon/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ backgroundColor: "#0a0a0a" }}
      >
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#111217",
              color: "#f4f4f5",
              border: "1px solid rgba(255,255,255,0.1)",
            },
            success: {
              iconTheme: {
                primary: "#34d399",
                secondary: "#0a0a0a",
              },
            },
            error: {
              iconTheme: {
                primary: "#f87171",
                secondary: "#0a0a0a",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
