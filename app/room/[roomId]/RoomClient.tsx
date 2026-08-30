'use client';

import { use, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import Editor from '@monaco-editor/react';
import * as Y from 'yjs';
import { MonacoBinding } from 'y-monaco';
import { Awareness, encodeAwarenessUpdate, applyAwarenessUpdate } from 'y-protocols/awareness';

const COLORS = ['#ff5c5c', '#5cff8f', '#5cb3ff', '#ffe45c', '#c95cff'];
const randomName = `User${Math.floor(Math.random() * 1000)}`;
const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];

export default function RoomClient({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  const socketRef = useRef<any>(null);
  const ydocRef = useRef<Y.Doc | null>(null);
  const awarenessRef = useRef<Awareness | null>(null);
  const editorRef = useRef<any>(null);

  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    const awareness = new Awareness(ydoc);
    awarenessRef.current = awareness;
    awareness.setLocalStateField('user', { name: randomName, color: randomColor });

    const socket = io('http://localhost:3001');
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join-room', roomId);
    });

    ydoc.on('update', (update: Uint8Array, origin: any) => {
      if (origin !== 'remote') {
        socket.emit('yjs-update', Array.from(update));
      }
    });

    socket.on('yjs-update', (update: number[]) => {
      Y.applyUpdate(ydoc, new Uint8Array(update), 'remote');
    });

    awareness.on('update', ({ added, updated, removed }: any, origin: any) => {
      if (origin !== 'remote') {
        const changedClients = added.concat(updated).concat(removed);
        const update = encodeAwarenessUpdate(awareness, changedClients);
        socket.emit('awareness-update', Array.from(update));
      }
    });

    socket.on('awareness-update', (update: number[]) => {
      applyAwarenessUpdate(awareness, new Uint8Array(update), 'remote');
    });

    return () => {
      socket.disconnect();
      awareness.destroy();
      ydoc.destroy();
    };
  }, [roomId]);

  const handleEditorMount = (editor: any) => {
    editorRef.current = editor;
    const ydoc = ydocRef.current;
    const awareness = awarenessRef.current;
    if (!ydoc || !awareness) return;

    const ytext = ydoc.getText('monaco');
    const model = editor.getModel();
    if (!model) return;

    new MonacoBinding(ytext, model, new Set([editor]), awareness);
  };

  const runCode = async () => {
    if (!editorRef.current) return;
    const code = editorRef.current.getValue();
    setRunning(true);
    setOutput('Running...');

    try {
      const res = await fetch('http://localhost:3001/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: 'javascript',
          version: '18.15.0',
          files: [{ content: code }]
        })
      });
            const data = await res.json();
      console.log('API response:', data);
      setOutput(data?.run?.output || JSON.stringify(data) || 'No output');
    } catch (err) {
      setOutput('Error running code: ' + err);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        color: 'white',
        padding: '8px',
        background: '#1e1e1e',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>Room: {roomId} — You are: <span style={{ color: randomColor }}>{randomName}</span></span>
        <button
          onClick={runCode}
          disabled={running}
          style={{
            padding: '6px 16px',
            background: running ? '#555' : '#2ea043',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: running ? 'default' : 'pointer'
          }}
        >
          {running ? 'Running...' : '▶ Run Code'}
        </button>
      </div>

      <div style={{ flex: 1 }}>
        <Editor
          height="100%"
          defaultLanguage="javascript"
          theme="vs-dark"
          onMount={handleEditorMount}
        />
      </div>

      <div style={{
        height: '150px',
        background: '#0d0d0d',
        color: '#0f0',
        padding: '10px',
        fontFamily: 'monospace',
        overflowY: 'auto',
        borderTop: '1px solid #333',
        whiteSpace: 'pre-wrap'
      }}>
        {output || '// output will appear here'}
      </div>
    </div>
  );
}