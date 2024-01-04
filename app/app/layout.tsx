import { Sidebar } from '@/components/Sidebar';

const appLinks = [
  {
    name: 'Home',
    href: '/app/scheduled',
  },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className='flex flex-col md:flex-row'>
        <Sidebar links={appLinks} />
        <main className='w-full py-6 max-md:px-2 md:px-4'>{children}</main>
      </div>
    </>
  );
}
