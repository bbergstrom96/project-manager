import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { AddTaskDialog } from "@/components/tasks/AddTaskDialog";
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
        <div className="flex h-screen overflow-hidden" style={bgColor}>
          <Sidebar />
          <main className="flex-1 overflow-y-auto w-full" style={bgColor}>{children}</main>
        </div>
        <AddTaskDialog />
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
