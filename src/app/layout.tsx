import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alphahood Dashboard",
  description: "Paper trading dashboard for Alphahood",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
