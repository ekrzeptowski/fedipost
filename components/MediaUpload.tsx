'use client';
import { useEffect, useState } from 'react';
import Attachment = Entity.Attachment;
import generator from 'megalodon';
import {
  useUpdateMediaMutation,
  useUploadMediaMutation,
} from '@/redux/features/api/fediApi';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useDropzone } from 'react-dropzone';
import AsyncAttachment = Entity.AsyncAttachment;
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';

type Media = {
  fileName: string;
  attachment?: Attachment | AsyncAttachment;
  state: 'uploading' | 'uploaded' | 'failed' | 'processing';
};

type MediaUploadProps = {
  media_attachment?: Attachment[];
  onChange?: (media_ids: (string | undefined)[]) => void;
};

export const MediaUpload = ({
  media_attachment,
  onChange,
}: MediaUploadProps) => {
  const user = useSelector((state: RootState) => state.user);

  const [media, setMedia] = useState<Media[]>([]);

  const [uploadMedia, uploadResult] = useUploadMediaMutation();
  const [updateMedia, updateResult] = useUpdateMediaMutation();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  function onDrop(acceptedFiles: File[]) {
    acceptedFiles.forEach((file) => {
      // add empty file to list
      setMedia((prevMedia) => [
        ...prevMedia,
        { fileName: file.name, state: 'uploading' },
      ]);
      uploadMedia(file)
        .then((res) => {
          if ('data' in res && res.data) {
            setMedia((prevMedia) =>
              prevMedia.map((m) =>
                m.fileName === file.name
                  ? {
                      ...m,
                      attachment: res.data,
                      state:
                        res.data.type === 'gifv' || res.data.type === 'video'
                          ? 'processing'
                          : 'uploaded',
                    }
                  : m
              )
            );
            if (
              (res.data.type === 'gifv' || res.data.type === 'video') &&
              !res.data.url
            ) {
              if (!user.accessToken || !user.sns || !user.server) {
                throw new Error('User is not logged in');
              }
              const client = generator(user.sns, user.server, user.accessToken);
              const interval = setInterval(() => {
                client
                  .getMedia(res.data.id)
                  .then((res) => {
                    if ('data' in res && res.data && res.data.url) {
                      clearInterval(interval);
                      setMedia((prevMedia) =>
                        prevMedia.map((m) =>
                          m.fileName === file.name
                            ? {
                                ...m,
                                attachment: res.data,
                                state: 'uploaded',
                              }
                            : m
                        )
                      );
                    }
                  })
                  .catch((err) => {
                    clearInterval(interval);
                    setMedia((prevMedia) =>
                      prevMedia.map((m) =>
                        m.fileName === file.name
                          ? {
                              ...m,
                              state: 'failed',
                            }
                          : m
                      )
                    );
                  });
              }, 5000);
            }
          }
        })
        .catch((err) => {
          setMedia((prevMedia) =>
            prevMedia.map((m) =>
              m.fileName === file.name ? { ...m, state: 'failed' } : m
            )
          );
        });
    });
  }

  useEffect(() => {
    if (media_attachment) {
      setMedia(
        media_attachment.map((m) => ({
          fileName: m.id,
          attachment: m,
          state: 'uploaded',
        }))
      );
    }
  }, [media_attachment]);

  useEffect(() => {
    onChange?.(
      media.map((m) => (m.state === 'uploaded' ? m.attachment?.id : 'invalid'))
    );
  }, [media]);

  return (
    <>
      {media.map((file) => (
        <div key={file.fileName} className='rounded-md border px-3 py-2'>
          <div className='relative flex h-64 justify-center'>
            {file.state !== 'uploaded' && (
              <div className='absolute left-0 top-0 flex h-full w-full items-center justify-center bg-black bg-opacity-20'>
                {(file.state === 'uploading' ||
                  file.state === 'processing') && (
                  <div className='h-16 w-16 animate-spin rounded-full border-b-2 border-gray-200' />
                )}
                {file.state === 'failed' && (
                  <div className='h-16 w-16 rounded-full bg-red-500' />
                )}
              </div>
            )}
            {file.attachment && (
              <img
                className='object-contain'
                src={file.attachment.preview_url || ''}
                alt={file.attachment.description || file.fileName}
              />
            )}
          </div>

          <Separator className='my-4' />
          <div className='flex items-center space-x-2'>
            {file.state !== 'uploaded' && (
              <div className='w-full'>
                {file.state === 'uploading' && 'Uploading...'}
                {file.state === 'failed' && 'Failed'}
              </div>
            )}
            {file.attachment && file.state === 'uploaded' && (
              <Input
                placeholder='Describe this image for the visually impaired'
                value={file.attachment.description || ''}
                onChange={(e) => {
                  setMedia((prevMedia) =>
                    prevMedia.map((f) =>
                      f.fileName === file.fileName
                        ? {
                            ...f,
                            attachment: f.attachment
                              ? {
                                  ...f.attachment,
                                  description: e.target.value,
                                }
                              : undefined,
                          }
                        : f
                    )
                  );
                }}
                onBlur={() => {
                  file.attachment &&
                    updateMedia({
                      id: file.attachment.id,
                      options: {
                        description: file.attachment.description || '',
                        focus: '0,0',
                      },
                    }).then((res) => {});
                }}
              />
            )}

            <Button
              variant='ghost'
              size='icon'
              aria-label='Remove media'
              onClick={() => {
                file.state !== 'uploading' &&
                  setMedia(media.filter((f) => f.fileName !== file.fileName));
              }}
            >
              <Trash2 />
            </Button>
          </div>
        </div>
      ))}
      {media.length < 4 && (
        <div
          {...getRootProps()}
          className='flex cursor-pointer items-center justify-center rounded-md border border-input bg-background px-4 py-16 transition-colors hover:bg-accent hover:text-accent-foreground'
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the files here ...</p>
          ) : (
            <p>
              Drag &apos;n&apos; drop some files here, or click to select files
            </p>
          )}
        </div>
      )}
    </>
  );
};
