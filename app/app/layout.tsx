export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className='flex flex-col space-y-6 lg:flex-row lg:space-x-12'>
          <aside className="h-screen"><div>Sidebar</div>

          </aside>
        <main>{children}</main>
      </div>
    </>
  );
}
