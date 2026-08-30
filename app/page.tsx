'use client';

import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';

export default function Home() {
  const router = useRouter();

  const startSession = () => {
    const roomId = nanoid(8);
    router.push(`/room/${roomId}`);
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#1e1e1e',
      color: 'white'
    }}>
      <h1 style={{ marginBottom: '20px' }}>Collab Editor</h1>
      <button
        onClick={startSession}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          background: '#0e639c',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
      >
        Start Interview Session
      </button>
    </div>
  );
}