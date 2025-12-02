import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/app/components/header";
import { AuthProvider } from "./context/AuthContext";
import Sidebar from "@/app/components/SideBar"; // <--- IMPORT THIS

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata = {
    title: "Library System",
    description: "Library management system",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
        <body
            suppressHydrationWarning
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        <AuthProvider>
            <div className="app-root min-h-screen flex flex-col">
                <Header />

                <div className="flex flex-1 w-full">

                    <Sidebar />


                    <main className="flex-1 p-8 bg-slate-900 text-slate-200 overflow-x-hidden">
                        {children}
                    </main>
                </div>

                <footer className="site-footer w-full border-t border-slate-800 bg-slate-950 text-slate-500">
                    <div className="container mx-auto px-6 py-4 text-sm">
                        © {new Date().getFullYear()} Library System
                    </div>
                </footer>
            </div>
        </AuthProvider>
        </body>
        </html>
    );
}