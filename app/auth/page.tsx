'use client';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { getAuthUrl } from '@/redux/features/user/userSlice';
import { useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const authSchema = z.object({
  server: z.string().url(),
});

export default function Auth() {
  const form = useForm<z.infer<typeof authSchema>>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      server: 'https://',
    },
  });
  const dispatch = useAppDispatch();

  const isAuthLoading = useAppSelector((state) => state.user.isAuthLoading);
  const authError = useAppSelector((state) => state.user.authError);

  function onSubmit(data: z.infer<typeof authSchema>) {
    dispatch(getAuthUrl(data.server));
  }

  useEffect(() => {
    authError
      ? form.setError('server', {
          type: 'manual',
          message: authError,
        })
      : form.clearErrors('server');
  }, [authError]);

  return (
    <div className='flex min-h-screen items-center justify-center'>
      <Card className='w-[360px]'>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Enter your server URL to sign in</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
              <FormField
                control={form.control}
                name='server'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Server</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type='submit' disabled={isAuthLoading}>
                Submit
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
