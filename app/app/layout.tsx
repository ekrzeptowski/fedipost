import { Sidebar } from '@/components/Sidebar';

const appLinks = [
    {
        name: 'Dashboard',
        href: '/app/',
    },
    {
        name: 'Scheduled',
        href: '/app/scheduled',
    }
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className='flex flex-col max-lg:space-y-6 lg:flex-row lg:space-x-12'>
        <Sidebar links={appLinks} />
        <main>{children}</main>
      </div>
    </>
  );
}
