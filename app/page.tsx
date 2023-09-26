'use client';
import { useAppDispatch } from '@/redux/hooks';
import Link from 'next/link';

export default function Home() {
  const dispatch = useAppDispatch();
  return (
    <main className='flex min-h-screen flex-col items-center justify-between p-24'>
      <p>TODO: Landing page</p>
      <div className='mb-32 grid text-center lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-4 lg:text-left'>
        <Link href='/app'>
          To the app
        </Link>
      </div>
    </main>
  );
}
