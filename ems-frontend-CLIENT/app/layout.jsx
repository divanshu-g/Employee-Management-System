import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import FontVariablesWrapper from "./FontVariablesWrapper"; // adjust the import path if needed

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Nexsus-HR | Employee Management System",
  description: "A modern HR and Employee Management platform for secure workforce collaboration.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth bg-gray-900">
      <body
        className={`
          antialiased min-h-screen min-w-full bg-gradient-to-br from-gray-900 via-blue-950 to-gray-800
          text-white selection:bg-blue-600 selection:text-white
          ${geistSans.variable} ${geistMono.variable}
        `}
        style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}
      >
        <FontVariablesWrapper
          geistSansVariable={geistSans.variable}
          geistMonoVariable={geistMono.variable}
        >
          {/* Main layout container */}
          <div className="flex flex-col min-h-screen w-full">
            {/* Optional global header here, e.g. main nav */}
            
            {/* Page content */}
            <main className="flex-1 flex flex-col">
              {children}
            </main>

            {/* Optional global footer here */}
          </div>
        </FontVariablesWrapper>
      </body>
    </html>
  );
}
