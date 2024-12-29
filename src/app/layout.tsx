import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata, type Viewport } from "next";
import { Toaster } from "~/components/ui/sonner";
import { cn } from "~/lib/utils";

export const metadata: Metadata = {
  title: "Icon Search",
  description: "icon-search.com. Semantic search for Lucide icons.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={cn(GeistSans.variable, "notranslate")}
      suppressHydrationWarning
      translate="no"
    >
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
