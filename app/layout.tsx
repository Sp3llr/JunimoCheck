import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JunimoCheck — Checklist colaborativa de Stardew Valley",
  description:
    "Organize o Centro Comunitário com sua fazenda em uma checklist compartilhada e atualizada em tempo real.",
  icons: { icon: "/favicon.svg" },
  applicationName: "JunimoCheck",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="pt-BR"><head><meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" /><meta httpEquiv="Pragma" content="no-cache" /><meta httpEquiv="Expires" content="0" /></head><body>{children}</body></html>; }
