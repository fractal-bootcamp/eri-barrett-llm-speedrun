'use client';

import { TerminalCanvas } from '../components/terminal-canvas';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <TerminalCanvas />
    </main>
  );
}