'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Nav() {
  const path = usePathname();

  return (
    <nav className="nav">
      <div className="nav__inner">
        <Link href="/" className="nav__brand">
          Monetizely
        </Link>
        <div className="nav__links">
          <Link
            href="/catalog"
            className={`nav__link ${path.startsWith('/catalog') ? 'nav__link--active' : ''}`}
          >
            Catalog
          </Link>
          <Link
            href="/quotes"
            className={`nav__link ${path.startsWith('/quotes') ? 'nav__link--active' : ''}`}
          >
            Quotes
          </Link>
        </div>
      </div>
    </nav>
  );
}
