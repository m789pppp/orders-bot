import "./globals.css";
import { BUSINESS_NAME } from "@/lib/config";

export const metadata = { title: `${BUSINESS_NAME} · Orders` };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
