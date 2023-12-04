import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import generator from 'megalodon';
import { RootState } from '@/redux/store';
import ScheduledStatus = Entity.ScheduledStatus;
import Status = Entity.Status;
import Account = Entity.Account;

type PostSchema = {
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
export const fediApi = createApi({
  reducerPath: 'fediApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Account', 'ScheduledStatus'],
  endpoints: (builder) => ({
    getUserData: builder.query<Account, void>({
      queryFn: async (arg, { getState }) => {
        const state = getState() as RootState;
        if (!state.user.accessToken || !state.user.sns || !state.user.server) {
          throw new Error('User is not logged in');
        }
        const client = generator(
          state.user.sns,
          state.user.server,
          state.user.accessToken
        );

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
        const state = getState() as RootState;
        if (!state.user.accessToken || !state.user.sns || !state.user.server) {
          throw new Error('User is not logged in');
        }
        const client = generator(
          state.user.sns,
          state.user.server,
          state.user.accessToken
        );

        try {
          const { data } = await client.getScheduledStatuses();
          return { data };
        } catch (error) {
          return { error };
        }
      },
    }),
    scheduleStatus: builder.mutation<ScheduledStatus | Status, PostSchema>({
      queryFn: async (post, { getState }) => {
        const state = getState() as RootState;
        if (!state.user.accessToken || !state.user.sns || !state.user.server) {
          throw new Error('User is not logged in');
        }
        const client = generator(
          state.user.sns,
          state.user.server,
          state.user.accessToken
        );

        try {
          const { data } = await client.postStatus(post.status, post.options);
          return { data };
        } catch (error) {
          return { error };
        }
      },
      invalidatesTags: (result, error, arg) => [{ type: 'ScheduledStatus', id: result?.id || 'LIST' }]
    }),
  }),
});

export const {
  useGetScheduledStatusesQuery,
  useGetUserDataQuery,
  useScheduleStatusMutation,
} = fediApi;
