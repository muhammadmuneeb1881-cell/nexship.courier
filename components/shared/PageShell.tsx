import { ReactNode } from "react";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";
import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";

interface PageShellProps {
  eyebrow: string;
  title: string;
  highlight?: string;
  description?: string;
  children: ReactNode;
  wide?: boolean;
}

export default function PageShell({
  eyebrow,
  title,
  highlight,
  description,
  children,
  wide = false,
}: PageShellProps) {
  return (
    <>
      <Navbar />
      <main className="relative bg-base pt-40 pb-24 sm:pt-48">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,rgba(0,255,136,0.1),transparent_60%)]" />
        </div>
        <Container>
          <SectionHeading
            eyebrow={eyebrow}
            title={title}
            highlight={highlight}
            description={description}
          />
          <div className={`mx-auto mt-14 ${wide ? "max-w-5xl" : "max-w-3xl"}`}>
            {children}
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
