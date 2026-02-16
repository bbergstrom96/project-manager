import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthenticatedLayout } from "@/components/layout/AuthenticatedLayout";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tasks",
  description: "Personal task management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const bgColor = { backgroundColor: '#1b1e25' };

  return (
    <html lang="en" className="dark" style={bgColor}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className={inter.className} style={bgColor}>
        <AuthenticatedLayout>{children}</AuthenticatedLayout>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
