import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import generator from 'megalodon';
import { RootState } from '@/redux/store';
import ScheduledStatus = Entity.ScheduledStatus;

export const fediApi = createApi({
  reducerPath: 'fediApi',
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    getScheduledStatuses: builder.query<ScheduledStatus[], void>({
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
        } catch (err) {
          throw err;
        }
      },
    }),
  }),
});

export const { useGetScheduledStatusesQuery } = fediApi;
