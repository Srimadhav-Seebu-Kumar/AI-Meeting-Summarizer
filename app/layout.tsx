import "./global.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Meeting Summarizer",
  description: "Summarize meeting transcripts with AI and send via email",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
