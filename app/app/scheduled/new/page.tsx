'use client';

import * as z from 'zod';
import { FieldValues, useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getLocalTimeZone, parseAbsolute } from '@internationalized/date';
import { useRouter } from 'next/navigation';
import { useScheduleStatusMutation } from '@/redux/features/api/fediApi';

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

const postSchema = z.object({
  status: z.string(),
  options: z
    .object({
      in_reply_to_id: z.string().optional(),
      language: z.string().optional(),
      media_ids: z.array(z.string()).optional(),
      poll: z
        .object({
          options: z.array(z.string()),
          expires_in: z.number(),
          multiple: z.boolean().optional(),
          hide_totals: z.boolean().optional(),
        })
        .optional(),
      sensitive: z.boolean().default(false).optional(),
      spoiler_text: z.string().optional(),
      visibility: z
        .enum(['public', 'unlisted', 'private', 'direct'])
        .optional(),
      scheduled_at: z
        .date()
        .min(new Date(new Date().setMinutes(new Date().getMinutes() - 10)), {
          message: 'Scheduled time must be at least 10 minutes in the future.',
        })
        .optional(),
    })
    .optional(),
});

export default function NewPostPage() {
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

  function onSubmit(values: z.infer<typeof postSchema>) {
    // make spoiler_text required if sensitive is true
    if (values?.options?.sensitive && !values.options.spoiler_text) {
      form.setError('options.spoiler_text', {
        type: 'manual',
        message: 'Spoiler text is required when sensitive is true.',
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
    schedule(valuesCopy);
    // redirect to scheduled page
    router.push('/app/scheduled');
  }

  const router = useRouter();

  const [schedule, result] = useScheduleStatusMutation();

  return (
    <div>
      <h2>New post form</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name='status'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <Input placeholder='shadcn' {...field} />
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
                <FormLabel>Sensitive</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
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
                  <FormLabel>Spoiler text</FormLabel>
                  <FormControl>
                    <Input placeholder='...' {...field} />
                  </FormControl>
                  <FormDescription>Set post spoiler text</FormDescription>
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
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