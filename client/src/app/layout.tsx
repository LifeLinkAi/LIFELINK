import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LifeLink AI - Emergency Care, Redefined",
  description: "Connecting donors, hospitals, and emergency responders through real-time AI coordination.",
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
