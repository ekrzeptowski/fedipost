import * as z from 'zod';
import ScheduledStatus = Entity.ScheduledStatus;

export const postSchema = z.object({
  status: z.string(),
  options: z
    .object({
      in_reply_to_id: z.string().optional(),
      language: z.string().optional(),
      media_ids: z
        .array(z.string())
        .refine((value) => !value.includes('invalid'), {
          message: 'Make sure that attachments are uploaded before submitting.',
        })
        .optional(),
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

export function ScheduledStatusToPostSchema(
  scheduledStatus: ScheduledStatus
): PostSchema {
  const { scheduled_at, params } = scheduledStatus;
  const {
    text,
    media_ids,
    in_reply_to_id,
    sensitive,
    spoiler_text,
    visibility,
  } = params;
  return {
    status: text,
    options: {
      media_ids: media_ids || undefined,
      in_reply_to_id: in_reply_to_id || undefined,
      sensitive: sensitive || undefined,
      spoiler_text: spoiler_text || undefined,
      visibility: visibility || undefined,
      scheduled_at,
    },
  };
}

export type PostSchema = {
  status: string;
  options?: {
    media_ids?: Array<string>;
    poll?: {
      options: Array<string>;
      expires_in: number;
      multiple?: boolean;
      hide_totals?: boolean;
    };
    in_reply_to_id?: string;
    sensitive?: boolean;
    spoiler_text?: string;
    visibility?: 'public' | 'unlisted' | 'private' | 'direct';
    scheduled_at?: string;
    language?: string;
    quote_id?: string;
  };
};

export type EditSchema = {
  id: string;
  post: PostSchema;
};

export type UpdateMediaSchema = {
  id: string;
  options?: {
    file?: any;
    description?: string;
    focus?: string;
    is_sensitive?: boolean;
  };
};
