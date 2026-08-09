import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Checklist Stardew Valley", description: "Checklist compartilhada do Centro Comunitário.", icons: { icon: "/favicon.svg" }, other: { "codex-preview": "development" } };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="pt-BR"><head><meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" /><meta httpEquiv="Pragma" content="no-cache" /><meta httpEquiv="Expires" content="0" /></head><body>{children}</body></html>; }
