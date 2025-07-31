import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import Header from "@/components/Header"; // Impor header baru

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Karaokei Web App",
  description: "Your favorite songs, ready to sing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-900 text-white`}>
        <AuthProvider>
          <Header />
          <main>{children}</main>
          <footer className="text-center p-4 mt-8 border-t border-gray-700">
            <p className="text-gray-400">&copy; 2025 Karaokei. All rights reserved.</p>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}