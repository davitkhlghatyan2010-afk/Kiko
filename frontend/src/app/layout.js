import { Noto_Sans_Armenian, JetBrains_Mono, Press_Start_2P, Pixelify_Sans } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import { Header } from "@/components/Header";
import { NavBar } from "@/components/NavBar";
import "./globals.css";

const notoSansArmenian = Noto_Sans_Armenian({
  variable: "--font-noto-sans-armenian",
  subsets: ["latin", "armenian"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

// Pixel-art UI chrome fonts -- Latin-only, so kept off user-typed/generated
// text (task text, Armenian usernames) and used only for interface labels:
// nav, header, buttons, modal titles. `display` (Press Start 2P) for short
// punchy labels/CTAs, `body` (Pixelify Sans) for everything else pixel.
const pixelDisplay = Press_Start_2P({
  variable: "--font-pixel-display",
  subsets: ["latin"],
  weight: "400",
});

const pixelBody = Pixelify_Sans({
  variable: "--font-pixel-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Kiko",
  description: "A daily accountability app built on manufactured deadlines and social visibility.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${notoSansArmenian.variable} ${jetbrainsMono.variable} ${pixelDisplay.variable} ${pixelBody.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>
          <Header />
          {children}
          <NavBar />
        </AuthProvider>
      </body>
    </html>
  );
}
