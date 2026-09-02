'use client';

import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';
import { useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [joinId, setJoinId] = useState('');

  const startSession = () => {
    const roomId = nanoid(8);
    router.push(`/room/${roomId}`);
  };

  const joinSession = () => {
    if (joinId.trim()) {
      router.push(`/room/${joinId.trim()}`);
    }
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#14161f',
      color: '#eef0f5',
      gap: '16px'
    }}>
      <h1 style={{ marginBottom: '4px' }}>Collab Editor</h1>
      <p style={{ color: '#8a8f9c', marginBottom: '12px' }}>Real-time collaborative code editor for interview practice</p>

      <button
        onClick={startSession}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          background: '#e8a33d',
          color: '#14161f',
          fontWeight: 600,
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
      >
        Start Interview Session
      </button>

      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        <input
          value={joinId}
          onChange={(e) => setJoinId(e.target.value)}
          placeholder="Enter room code"
          style={{
            padding: '10px 14px',
            borderRadius: '6px',
            border: '1px solid #333',
            background: '#1c1f2b',
            color: 'white'
          }}
        />
        <button
          onClick={joinSession}
          style={{
            padding: '10px 18px',
            background: 'transparent',
            color: '#4fb3bf',
            border: '1px solid #4fb3bf',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Join
        </button>
      </div>
    </div>
  );
}