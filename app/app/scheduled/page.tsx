'use client';
import { useGetScheduledStatusesQuery } from '@/redux/features/api/fediApi';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, Image, Video } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

function renderDate(date: string | number | Date) {
  const d = new Date(date);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}

export default function ScheduledPage() {
  const router = useRouter();
  const accessToken = useSelector((state: RootState) => state.user.accessToken);

  if (typeof window !== 'undefined') {
    if (!accessToken) {
      router.replace('/auth');
    }
  }
  const { data, error, isLoading } = useGetScheduledStatusesQuery();
  return isLoading ? (
    <h1>Loading...</h1>
  ) : error ? (
    <h1>Something went wrong. Please try again.</h1>
  ) : (
    <div className='space-y-4'>
      <div>
        <Link href='/app/scheduled/new'>
          <Button>
            <Plus className='mr-2 h-4 w-4' />
            New post
          </Button>
        </Link>
      </div>
      <div className='flex max-w-2xl flex-1 flex-col divide-y-2'>
        {!!data && data.length > 0 ? (
          data?.map((status) => (
            <div
              key={status.id}
              className='flex flex-1 py-4 max-sm:flex-col max-sm:space-y-4 sm:space-x-4'
            >
              <div className='flex flex-1 flex-col space-y-1'>
                <p>{status.params.text}</p>
                <div>
                  <Badge variant='outline'>
                    {status.params.visibility || 'public'}
                  </Badge>
                </div>

                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  {renderDate(status.scheduled_at)}
                </p>
                <div className='flex flex-wrap'>
                  {status.media_attachments?.map((media) => (
                    <div key={media.id} className='flex flex-col'>
                      {media.preview_url && (
                        <img
                          alt={media.description || media.id}
                          src={media.preview_url}
                          title={media.description || media.id}
                          className='h-28 w-28 object-scale-down'
                        />
                      )}
                      <div className='flex items-center space-x-2 text-gray-500'>
                        <Badge className='h-6 rounded-md px-1'>
                          {media.type === 'image' && <Image size={18} />}
                          {media.type === 'video' && <Video size={18} />}
                          {media.type === 'gifv' && <Video size={18} />}
                        </Badge>
                        {media.description && (
                          <Badge
                            className='h-6 rounded-md px-1'
                            title={media.description}
                          >
                            ALT
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className='space-x-2'>
                <Button variant='outline' asChild>
                  <Link href={`/app/scheduled/${status.id}`}>Edit</Link>
                </Button>
                <Button variant='outline'>Delete</Button>
              </div>
            </div>
          ))
        ) : (
          <h2>No scheduled statuses.</h2>
        )}
      </div>
    </div>
  );
}
