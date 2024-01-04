'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getLocalTimeZone, parseAbsolute } from '@internationalized/date';
import { useRouter } from 'next/navigation';
import {
  useEditScheduledStatusMutation,
  useGetScheduledStatusesQuery,
  useScheduleStatusMutation,
} from '@/redux/features/api/fediApi';

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
import { DateTimePicker } from '@/components/ui/date-time-picker/date-time-picker';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MediaUpload } from '@/components/MediaUpload';
import { Textarea } from '@/components/ui/textarea';
import { postSchema, ScheduledStatusToPostSchema } from '../postSchema';
import { useEffect } from 'react';

export default function PostSchedulePage({
  params,
}: {
  params: { id: string };
}) {
  const form = useForm<z.infer<typeof postSchema>>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      status: '',
      options: {
        sensitive: false,
        spoiler_text: '',
      },
    },
  });
  const foundStatus = useGetScheduledStatusesQuery().data?.find(
    (status) => status.id === params.id
  );

  useEffect(() => {
    const oldPost = foundStatus && ScheduledStatusToPostSchema(foundStatus);
    oldPost &&
      form.reset({
        ...oldPost,
        options: {
          ...oldPost.options,
          scheduled_at: oldPost?.options?.scheduled_at
            ? new Date(oldPost?.options?.scheduled_at)
            : undefined,
        },
      });
  }, [params.id, foundStatus]);

  const isEdit = params.id !== 'new';

  function onSubmit(values: z.infer<typeof postSchema>) {
    // make spoiler_text required if sensitive is true
    if (values?.options?.sensitive && !values.options.spoiler_text) {
      form.setError('options.spoiler_text', {
        type: 'manual',
        message: 'Spoiler text is required when post is marked as sensitive.',
      });
      return;
    }

    // Convert scheduled_at to ISO string if it exists
    const valuesCopy = {
      ...values,
      options: {
        ...values.options,
        scheduled_at: values.options?.scheduled_at?.toISOString() || undefined,
      },
    };
    isEdit
      ? editScheduled({ id: params.id, post: valuesCopy })
      : schedule(valuesCopy);
    // redirect to scheduled page
    router.push('/app/scheduled');
  }

  const router = useRouter();

  const [schedule] = useScheduleStatusMutation();
  const [editScheduled] = useEditScheduledStatusMutation();

  return (
    <div>
      <h1 className='mb-4 text-2xl'>
        {isEdit ? 'Edit scheduled post' : 'Schedule new post'}
      </h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='flex max-w-md flex-1 flex-col space-y-2'
        >
          <FormField
            control={form.control}
            name='status'
            render={({ field }) => (
              <FormItem className='w-full flex-1'>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <Textarea placeholder='Compose your status' {...field} />
                </FormControl>
                <FormDescription>This is your status.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='options.sensitive'
            render={({ field }) => (
              <FormItem>
                <div className='flex items-center space-x-2'>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Sensitive</FormLabel>
                </div>

                <FormDescription>Set post sensitivity</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.watch('options.sensitive') && (
            <FormField
              control={form.control}
              name='options.spoiler_text'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content warning text</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Write post content warning'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Set post content warning text
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name='options.visibility'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Visibility</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder='Select post visibility' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='public'>Public</SelectItem>
                      <SelectItem value='unlisted'>Unlisted</SelectItem>
                      <SelectItem value='private'>Private</SelectItem>
                      <SelectItem value='direct'>Direct</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>Set post visibility</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='options.media_ids'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Media</FormLabel>
                <FormControl>
                  <MediaUpload
                    media_attachment={
                      foundStatus?.media_attachments || undefined
                    }
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormDescription>Upload media</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='options.scheduled_at'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Scheduled at</FormLabel>
                <FormControl>
                  <DateTimePicker
                    value={
                      !!field.value
                        ? parseAbsolute(
                            field.value.toISOString(),
                            getLocalTimeZone()
                          )
                        : null
                    }
                    onChange={(date) => {
                      field.onChange(
                        !!date ? date.toDate(getLocalTimeZone()) : null
                      );
                    }}
                    hideTimeZone
                    granularity={'minute'}
                    aria-label='Scheduled at'
                  />
                </FormControl>
                <FormDescription>When should this be posted?</FormDescription>
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
