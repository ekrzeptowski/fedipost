import generator, { detector } from 'megalodon';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const urlSchema = z.string().url();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  try {
    const serverUrl = urlSchema.parse(searchParams.get('server') as string);
    const sns = await detector(serverUrl);
    if (!sns) {
      return NextResponse.json({
        success: false,
        error: 'Server not found',
      });
    }
    const client = generator(sns, serverUrl);
    return client
      .registerApp('FediPost', {
        scopes: ['read', 'write'],
        website: process.env.WEBSITE_URL || 'http://localhost:3000',
        redirect_uris:
          (process.env.WEBSITE_URL || 'http://localhost:3000') +
          '/auth/callback',
      })
      .then((appdata) => {
        return NextResponse.json({
          success: true,
          clientId: appdata.clientId,
          clientSecret: appdata.clientSecret,
          sns,
          server: serverUrl,
          url: appdata.url,
        });
      })
      .catch((err) => {
        console.log(err);
        return NextResponse.json({
          success: false,
          error: 'Server not found',
        });
      });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: 'Invalid URL',
    });
  }
}
