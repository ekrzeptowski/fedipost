import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import generator, { MegalodonInterface } from 'megalodon';
import { RootState } from '@/redux/store';
import ScheduledStatus = Entity.ScheduledStatus;
import Status = Entity.Status;
import Account = Entity.Account;
import Attachment = Entity.Attachment;
import AsyncAttachment = Entity.AsyncAttachment;
import {
  PostSchema,
  ScheduledStatusToPostSchema,
  EditSchema,
  UpdateMediaSchema,
} from '@/app/app/scheduled/postSchema';

function arrIdentical(a1: any[], a2: any[]): boolean {
  return (
    a1.length === a2.length && a1.every((value, index) => value === a2[index])
  );
}

const getClient: (state: RootState) => MegalodonInterface = (state) => {
  if (!state.user.accessToken || !state.user.sns || !state.user.server) {
    throw new Error('User is not logged in');
  }
  return generator(state.user.sns, state.user.server, state.user.accessToken);
};

export const fediApi = createApi({
  reducerPath: 'fediApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Account', 'ScheduledStatus', 'Attachment'],
  endpoints: (builder) => ({
    getUserData: builder.query<Account, void>({
      queryFn: async (arg, { getState }) => {
        const client = getClient(getState() as RootState);

        try {
          const { data } = await client.verifyAccountCredentials();
          return { data };
        } catch (error) {
          return { error };
        }
      },
    }),
    getScheduledStatuses: builder.query<ScheduledStatus[], void>({
      providesTags: (result) => {
        if (!result) return [{ type: 'ScheduledStatus' as const, id: 'LIST' }];
        return [
          { type: 'ScheduledStatus' as const, id: 'LIST' },
          ...result.map(({ id }) => ({ type: 'ScheduledStatus' as const, id })),
        ];
      },
      queryFn: async (arg, { getState }) => {
        const client = getClient(getState() as RootState);

        try {
          const { data } = await client.getScheduledStatuses();
          return { data };
        } catch (error) {
          return { error };
        }
      },
    }),
    editScheduledStatus: builder.mutation<ScheduledStatus | Status, EditSchema>(
      {
        queryFn: async ({ id, post }, { getState }) => {
          const client = getClient(getState() as RootState);

          const oldPost = await client.getScheduledStatus(id);
          // Compare oldPost.data all fields and post fields
          const isChanged = (old: ScheduledStatus, edited: PostSchema) => {
            const convertedOld = ScheduledStatusToPostSchema(old);
            const oldOptions = convertedOld.options || {};
            const editedOptions = edited.options || {};

            return (
              convertedOld.status !== edited.status ||
              oldOptions.sensitive !== editedOptions.sensitive ||
              oldOptions.spoiler_text !== editedOptions.spoiler_text ||
              oldOptions.visibility !== editedOptions.visibility ||
              !arrIdentical(
                oldOptions.media_ids || [],
                editedOptions.media_ids || []
              )
            );
          };

          console.log('oldPost', ScheduledStatusToPostSchema(oldPost.data));
          console.log('post', post);

          // Compare oldPost.data.scheduled_at and post.options.scheduled_at
          const isDateChanged =
            oldPost.data.scheduled_at !== post.options?.scheduled_at;
          // If only date has been changed, use scheduleStatus
          if (isDateChanged && !isChanged(oldPost.data, post)) {
            try {
              const { data } = await client.scheduleStatus(
                id,
                post.options?.scheduled_at
              );
              return { data };
            } catch (error) {
              return { error };
            }
          }

          // If other fields have been changed, delete old post and create new post
          try {
            await client.cancelScheduledStatus(id);
            const { data } = await client.postStatus(post.status, post.options);
            return { data };
          } catch (error) {
            return { error };
          }
        },
        invalidatesTags: (result, error) => {
          if (error || !result) return [];
          return [
            { type: 'ScheduledStatus', id: 'LIST' },
            { type: 'ScheduledStatus', id: result.id },
          ];
        },
      }
    ),
    scheduleStatus: builder.mutation<ScheduledStatus | Status, PostSchema>({
      queryFn: async (post, { getState }) => {
        const client = getClient(getState() as RootState);

        try {
          const { data } = await client.postStatus(post.status, post.options);
          return { data };
        } catch (error) {
          return { error };
        }
      },
      invalidatesTags: [{ type: 'ScheduledStatus', id: 'LIST' }],
    }),
    uploadMedia: builder.mutation<AsyncAttachment, File>({
      queryFn: async (file, { getState }) => {
        const client = getClient(getState() as RootState);

        try {
          const { data } = (await client.uploadMedia(file)) as unknown as {
            data: AsyncAttachment;
          };
          return { data };
        } catch (error) {
          return { error };
        }
      },
      invalidatesTags: (result, error) => {
        if (error || !result) return [];
        return [{ type: 'Attachment', id: result.id }];
      },
    }),
    updateMedia: builder.mutation<Attachment, UpdateMediaSchema>({
      queryFn: async ({ id, options }, { getState }) => {
        const client = getClient(getState() as RootState);

        try {
          const { data } = (await client.updateMedia(
            id,
            options
          )) as unknown as {
            data: Attachment;
          };
          return { data };
        } catch (error) {
          return { error };
        }
      },
      invalidatesTags: (result, error) => {
        if (error || !result) return [];
        return [{ type: 'Attachment', id: result.id }];
      },
    }),
  }),
});

export const {
  useGetScheduledStatusesQuery,
  useGetUserDataQuery,
  useEditScheduledStatusMutation,
  useScheduleStatusMutation,
  useUploadMediaMutation,
  useUpdateMediaMutation,
} = fediApi;
