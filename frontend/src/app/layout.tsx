import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { AppSettingsProvider } from "@/contexts/AppSettingsContext";
import Toast from "@/components/Toast";

export const metadata: Metadata = {
  title: "IPMAS - Military Personnel Management System",
  description: "Integrated Personnel Management and Administration System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>
          <AppSettingsProvider>
            <NotificationProvider>
              <Toast />
              {children}
            </NotificationProvider>
          </AppSettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
