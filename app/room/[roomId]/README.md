# Collab Editor

A real-time collaborative code editor built for technical interview practice — think VS Code meets Google Docs, purpose-built for two people working through DSA problems together.

**Live demo:** https://collab-editor-lyart-phi.vercel.app

## What it does

- **Live collaborative editing** — multiple people can type in the same file simultaneously, powered by CRDT-based conflict resolution (Yjs), so concurrent edits never overwrite each other.
- **Live cursor presence** — see exactly where your collaborator is typing or what they've selected, with their name and color.
- **Instant shareable rooms** — no sign-up. Click a button, get a URL, send it to a friend.
- **Sandboxed code execution** — run JavaScript directly in the browser via a self-hosted, Docker-isolated execution engine (Piston).

## Architecture

Browser (Vercel) ──Yjs CRDT──> Socket.io client
│
▼
Socket.io server (Render) ──relays updates to all clients in the room──
│
▼ (Run Code)
Cloudflare Tunnel ──> Self-hosted Piston (Docker, --privileged) ──> sandboxed execution


The frontend and the WebSocket/API server are deployed separately (Vercel + Render). The code execution engine runs in a privileged Docker container, which most free hosting platforms block for security reasons — so it's self-hosted and exposed via a Cloudflare Tunnel rather than deployed directly.

## Tech stack

- **Frontend:** Next.js (App Router), TypeScript, Monaco Editor
- **Real-time sync:** Yjs (CRDT), y-monaco, Socket.io
- **Backend:** Node.js, Express, Socket.io
- **Code execution:** Piston (self-hosted via Docker, `--privileged`)
- **Deployment:** Vercel (frontend), Render (backend), Cloudflare Tunnel (execution engine)

## Running locally

**Frontend + backend:**
```bash
# In the project root
npm install
npm run dev

# In a second terminal, inside /server
cd server
npm install
node index.js
```

**Code execution (optional, requires Docker):**
```bash
docker run -d --privileged --name piston_api -p 2000:2000 -v piston_data:/piston ghcr.io/engineer-man/piston

# Install the JavaScript runtime
curl.exe -X POST http://localhost:2000/api/v2/packages -H "Content-Type: application/json" -d '{\"language\": \"node\", \"version\": \"18.15.0\"}'
```

Then update `server/index.js`'s `/execute` route to point at `http://localhost:2000/api/v2/execute`.

## Known limitations

- Only JavaScript execution is currently installed on the Piston instance — Python and C are in the UI but need their runtimes installed the same way as above.
- Code execution depends on the local Piston + tunnel being active; it isn't always live on the deployed site.
- No persistence — rooms and their content are lost once everyone disconnects.
- No authentication — anyone with a room link can join.

## What I'd improve next

- Host the execution engine on infrastructure that allows privileged containers (a small VPS) instead of tunneling from a local machine.
- Add room persistence and history.
- Add a collaborative whiteboard tab for sketching data structures.

## Why these choices

Real-time sync uses **CRDTs** rather than naive broadcast because two people editing the same line simultaneously would otherwise corrupt each other's changes — CRDTs guarantee all clients converge to the same final state regardless of the order updates arrive in.

Code execution is **proxied through the backend** rather than called directly from the browser, avoiding CORS issues and keeping the execution engine's internals private from anyone inspecting the frontend.

The execution engine is **self-hosted** rather than using a third-party API after the two most common free options (Piston's public API, Judge0 via RapidAPI) became unusable — one moved to a whitelist-only model, the other required card verification that failed. Self-hosting via Docker removed the dependency on either.