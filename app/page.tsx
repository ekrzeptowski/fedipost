import { Check } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

import screenshot from './screenshot.png';

export default function Home() {
  return (
    <section className='w-full py-12 md:py-24 lg:py-32'>
      <div className='container px-4 md:px-6'>
        <div className='grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_550px]'>
          <Image
            src={screenshot}
            alt='App screenshot'
            className='object-fit mx-auto overflow-hidden object-center sm:w-full lg:order-first'
          />

          <div className='flex flex-col justify-center space-y-4'>
            <div className='space-y-2'>
              <h1 className='text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none'>
                Welcome to Fedipost
              </h1>
              <p className='max-w-[600px] text-gray-500 dark:text-gray-400 md:text-xl'>
                Fedipost is a fediverse post scheduler using builtin scheduling
                functionality.
              </p>
            </div>
            <ul className='grid gap-2 py-4'>
              <li>
                <Check className='mr-2 inline-block h-4 w-4' />
                User-friendly interface.
              </li>
              <li>
                <Check className='mr-2 inline-block h-4 w-4' />
                Supports images and videos with alt text.
              </li>
              <li>
                <Check className='mr-2 inline-block h-4 w-4' />
                Uses builtin scheduling functionality.
              </li>
            </ul>
            <div className='flex flex-col gap-2 min-[400px]:flex-row'>
              <Button asChild>
                <Link href='/app'>Get Started</Link>
              </Button>
              <Button variant='secondary' asChild>
                <Link href='https://github.com/ekrzeptowski/fedipost'>
                  Source Code
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
