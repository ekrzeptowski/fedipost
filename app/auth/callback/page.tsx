'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch } from '@/redux/hooks';
import { getAccessToken } from '@/redux/features/user/userSlice';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

export default function CallbackPage() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const router = useRouter();
  const dispatch = useAppDispatch();

  const accessToken = useSelector((state: RootState) =>
    state.user.accessToken
  );

  const clientId = useSelector((state: RootState) => state.user.clientId);

  const isLoading = useSelector((state: RootState) => state.user.isLoading);

  useEffect(() => {
    if (!code) {
      router.replace('/auth');
    }
    if (accessToken) {
      router.replace('/app');
    }
  });

  useEffect(() => {
    if (code && !accessToken && clientId && !isLoading) {
      dispatch(getAccessToken(code));
    }
  }, [code, accessToken, clientId, dispatch]);

  return (
    <div>
      {code ? (
        <h1>Please wait...</h1>
      ) : (
        <h1>Something went wrong. Please try again.</h1>
      )}
    </div>
  );
}
