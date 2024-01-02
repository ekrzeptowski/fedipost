import { Sidebar } from '@/components/Sidebar';

const appLinks = [
  {
    name: 'Dashboard',
    href: '/app/',
  },
  {
    name: 'Scheduled',
    href: '/app/scheduled',
  },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className='flex flex-col md:flex-row'>
        <Sidebar links={appLinks} />
        <main className='my-6 max-md:mx-2 md:mx-4'>{children}</main>
      </div>
    </>
  );
}
