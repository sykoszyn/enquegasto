import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RoadToMajor — Simulador de carrera CS2",
  description:
    "Empezá como FACEIT Level 1 en Sudamérica y luchá por llegar a un CS2 Major. Un simulador narrativo inspirado en la escena competitiva argentina y sudamericana."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
