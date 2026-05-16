import Link from "next/link";
import { Zap } from "lucide-react";

import { siteConfig } from "@/lib/site-config";
import { Container } from "@/components/layouts/container";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/layouts/mobile-nav";

export function SiteHeader() {
  return (
    <header className="border-border bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 w-full border-b backdrop-blur">
      <Container className="flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold tracking-tight"
          >
            <Zap className="text-primary size-5" />
            <span>{siteConfig.name}</span>
          </Link>
          <nav className="hidden gap-5 sm:flex">
            {siteConfig.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
