import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: null },
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: LayoutProps<"/auth">) {
  return children;
}
