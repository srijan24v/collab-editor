'use client';

import dynamic from 'next/dynamic';

const RoomClient = dynamic(() => import('./RoomClient'), { ssr: false });

export default function Page({ params }: { params: Promise<{ roomId: string }> }) {
  return <RoomClient params={params} />;
}