'use client';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {useAppDispatch} from "@/redux/hooks";
import {getAuthUrl} from "@/redux/features/user/userSlice";

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

  function onSubmit(data: z.infer<typeof authSchema>) {
    dispatch(getAuthUrl(data.server));
  }


  return (
    <div>
      <h1>Auth</h1>
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
                <FormDescription>Enter your server URL</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type='submit'>Submit</Button>
        </form>
      </Form>
    </div>
  );
}
