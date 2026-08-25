import { Noto_Sans_Armenian, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import { Header } from "@/components/Header";
import "./globals.css";

const notoSansArmenian = Noto_Sans_Armenian({
  variable: "--font-noto-sans-armenian",
  subsets: ["latin", "armenian"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Kiko",
  description: "A daily accountability app built on manufactured deadlines and social visibility.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${notoSansArmenian.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
