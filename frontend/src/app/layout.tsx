import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Container from "@/components/Container";
import Footer from "@/components/Footer";
import { BRAND_CONFIG } from "@/lib/constants";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: `${BRAND_CONFIG.brandName} | Smart Car Inspection`,
  description:
    "AI-powered car inspection platform. Chat with a car expert, analyze damage from photos, and get repair estimates.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Container>
          {children}
          <Footer />
        </Container>
      </body>
    </html>
  );
}
