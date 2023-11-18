'use client';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAppDispatch } from '@/redux/hooks';
import { userSlice } from '@/redux/features/user/userSlice';
import Link from 'next/link';
import { useGetUserDataQuery } from '@/redux/features/api/fediApi';

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
      <aside className='flex items-center space-x-2 p-2 max-lg:border-b lg:h-screen lg:flex-col lg:items-baseline lg:space-x-0 lg:space-y-2 lg:border-r'>
        <div>FediPost</div>
        <nav className='flex-1'>
          <ul className='flex lg:flex-col'>
            {links?.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className='block px-4 py-2 hover:underline lg:px-0'
                >
                  {link.name}
                </Link>
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
        <a href='#' onClick={() => dispatch(logout())}>
          Log out
        </a>
      </aside>
    </>
  );
}
