import type { ReactNode } from 'react';
import { Header } from '@/Components/Layout/Header';
import { Footer } from '@/Components/Layout/Footer';
import { WhatsAppButton } from '@/Components/Public/WhatsAppButton';

interface PublicLayoutProps {
    children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
    return (
        <div className="min-h-screen flex flex-col bg-surface text-ink">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <WhatsAppButton />
        </div>
    );
}
