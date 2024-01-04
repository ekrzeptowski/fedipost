'use client';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAppDispatch } from '@/redux/hooks';
import { userSlice } from '@/redux/features/user/userSlice';
import Link from 'next/link';
import { useGetUserDataQuery } from '@/redux/features/api/fediApi';
import { Button } from '@/components/ui/button';

type SidebarProps = {
  links?: { name: string; href: string }[];
};

export function Sidebar({ links }: SidebarProps) {
  const dispatch = useAppDispatch();
  const { logout } = userSlice.actions;
  const { data: account } = useGetUserDataQuery(undefined, {
    skip: !useSelector((state: RootState) => state.user.accessToken),
  });
  return (
    <>
      <aside className='sticky left-0 top-0 z-20 flex shrink-0 items-center space-x-2 bg-white p-2 max-md:border-b md:h-screen md:w-60 md:flex-col md:items-baseline md:space-x-0 md:space-y-2 md:border-r'>
        <nav className='flex-1'>
          <ul className='flex md:flex-col'>
            {links?.map((link) => (
              <li key={link.href}>
                <Button variant='link' asChild>
                  <Link href={link.href}>{link.name}</Link>
                </Button>
              </li>
            ))}
          </ul>
        </nav>
        <p className='flex items-center space-x-2'>
          <Avatar>
            <AvatarImage src={account?.avatar} />
            <AvatarFallback>{account?.display_name}</AvatarFallback>
          </Avatar>
          <span>{account?.display_name || account?.username}</span>
        </p>
        <Button variant='link' onClick={() => dispatch(logout())}>
            Log out
        </Button>

      </aside>
    </>
  );
}
