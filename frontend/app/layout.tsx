import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FTP Client",
  description: "A simple FTP client",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <main className="flex justify-center items-center min-h-screen bg-gray-950">
          {children}
        </main>
      </body>
    </html>
  );
}
