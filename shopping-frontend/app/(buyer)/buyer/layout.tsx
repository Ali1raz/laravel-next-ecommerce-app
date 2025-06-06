import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "../../globals.css";

const lato = Lato({
  weight: ["100", "300", "400", "700", "900"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Buyer",
  description: "Buyer dashboard",
};

export default function BuyerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased ${lato.className}`}>
        <header>Buyer layout</header>
        {children}
        <footer>&copy; 2025 Shopping App</footer>
      </body>
    </html>
  );
}
