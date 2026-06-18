import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { QuoteViewClient } from './QuoteViewClient';
import type { Quote } from '@/types';

type Props = { params: { quoteId: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Quote ${params.quoteId} | Monetizely`,
    description: `View the pricing proposal`,
  };
}

export default async function QuoteViewPage({ params }: Props) {
  // Fetch from the backend API using native fetch in Server Component
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is not defined');
  }

  const res = await fetch(`${apiUrl}/quotes/${params.quoteId}`, { cache: 'no-store' });
  if (!res.ok) {
    if (res.status === 404) notFound();
    throw new Error('Failed to fetch quote');
  }

  const data = await res.json();
  const quote = data.data as Quote;

  return <QuoteViewClient quote={quote} />;
}
