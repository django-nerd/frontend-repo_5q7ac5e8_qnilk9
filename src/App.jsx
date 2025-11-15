import { useEffect, useMemo, useState } from 'react'

function App() {
  const baseUrl = useMemo(() => import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000', [])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [couple, setCouple] = useState(null)
  const [memories, setMemories] = useState([])
  const [notes, setNotes] = useState([])

  const [newNote, setNewNote] = useState({ author: 'Fauzan', message: '', mood: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError('')
        const [cRes, mRes, nRes] = await Promise.all([
          fetch(`${baseUrl}/api/couple`),
          fetch(`${baseUrl}/api/memories`),
          fetch(`${baseUrl}/api/notes`),
        ])
        if (!cRes.ok || !mRes.ok || !nRes.ok) throw new Error('Failed to fetch data')
        const [cData, mData, nData] = await Promise.all([cRes.json(), mRes.json(), nRes.json()])
        setCouple(Object.keys(cData || {}).length ? cData : null)
        setMemories(Array.isArray(mData) ? mData : [])
        setNotes(Array.isArray(nData) ? nData : [])
      } catch (e) {
        setError(e.message || 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [baseUrl])

  const handleSubmitNote = async (e) => {
    e.preventDefault()
    if (!newNote.message.trim()) return
    try {
      setSubmitting(true)
      const res = await fetch(`${baseUrl}/api/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNote),
      })
      if (!res.ok) throw new Error('Failed to add note')
      setNewNote({ author: 'Fauzan', message: '', mood: '' })
      // refresh notes
      const list = await fetch(`${baseUrl}/api/notes`).then((r) => r.json())
      setNotes(Array.isArray(list) ? list : [])
    } catch (e) {
      alert(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-extrabold text-rose-600 tracking-tight">
            Fauzan ❤ Girlfriend
          </h1>
          <a href="/test" className="text-sm text-rose-700 hover:underline">System check</a>
        </header>

        <section className="mt-8 bg-white/70 backdrop-blur p-6 rounded-2xl shadow-sm border border-white/50">
          {loading ? (
            <p className="text-gray-600">Loading their story...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : couple ? (
            <div className="grid md:grid-cols-2 gap-6 items-start">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  {couple.person_a} & {couple.person_b}
                </h2>
                {couple.anniversary && (
                  <p className="mt-1 text-gray-600">Anniversary: <span className="font-medium">{new Date(couple.anniversary).toLocaleDateString()}</span></p>
                )}
                {couple.story && (
                  <p className="mt-4 text-gray-700 leading-relaxed">{couple.story}</p>
                )}
              </div>
              <div className="md:text-right">
                <div className="inline-block bg-rose-100 text-rose-700 px-4 py-2 rounded-full text-sm font-medium">
                  A little place to celebrate love
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Welcome, Fauzan!</h2>
              <p className="mt-2 text-gray-700">Start by adding your couple profile and memories using the database viewer, or just leave love notes below.</p>
            </div>
          )}
        </section>

        <section className="mt-8 grid md:grid-cols-5 gap-6">
          <div className="md:col-span-3 bg-white/70 backdrop-blur p-6 rounded-2xl shadow-sm border border-white/50">
            <h3 className="text-xl font-semibold text-gray-900">Memories Timeline</h3>
            {memories && memories.length > 0 ? (
              <ul className="mt-4 space-y-4">
                {memories.map((m) => (
                  <li key={m.id} className="flex items-start gap-4">
                    <div className="mt-1 h-3 w-3 rounded-full bg-rose-400" />
                    <div>
                      <p className="font-medium text-gray-900">{m.title}{m.event_date ? ` • ${new Date(m.event_date).toLocaleDateString()}` : ''}</p>
                      {m.location && <p className="text-sm text-gray-500">{m.location}</p>}
                      {m.description && <p className="mt-1 text-gray-700">{m.description}</p>}
                      {m.photo_url && (
                        <a className="text-sm text-rose-700 hover:underline" href={m.photo_url} target="_blank" rel="noreferrer">View photo</a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-gray-600">No memories yet. Add some to see your journey appear here.</p>
            )}
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="bg-white/70 backdrop-blur p-6 rounded-2xl shadow-sm border border-white/50">
              <h3 className="text-xl font-semibold text-gray-900">Leave a Love Note</h3>
              <form onSubmit={handleSubmitNote} className="mt-4 space-y-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Author</label>
                  <input value={newNote.author} onChange={(e)=>setNewNote(n=>({...n, author: e.target.value}))} className="w-full rounded-md border-gray-300 focus:ring-rose-500 focus:border-rose-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Mood (optional)</label>
                  <input value={newNote.mood} onChange={(e)=>setNewNote(n=>({...n, mood: e.target.value}))} className="w-full rounded-md border-gray-300 focus:ring-rose-500 focus:border-rose-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Message</label>
                  <textarea value={newNote.message} onChange={(e)=>setNewNote(n=>({...n, message: e.target.value}))} rows={3} className="w-full rounded-md border-gray-300 focus:ring-rose-500 focus:border-rose-500" placeholder="Write something sweet..." />
                </div>
                <button disabled={submitting} className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white font-semibold py-2 px-4 rounded-md transition-colors">
                  {submitting ? 'Sending...' : 'Post Note'}
                </button>
              </form>
            </div>

            <div className="bg-white/70 backdrop-blur p-6 rounded-2xl shadow-sm border border-white/50">
              <h3 className="text-xl font-semibold text-gray-900">Love Notes</h3>
              {notes && notes.length > 0 ? (
                <ul className="mt-4 space-y-3">
                  {notes.map((n) => (
                    <li key={n.id} className="p-3 rounded-lg border border-rose-100 bg-white">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">{n.mood ? `#${n.mood}` : ''}</p>
                        <p className="text-xs text-gray-400">{n.updated_at ? new Date(n.updated_at).toLocaleString() : ''}</p>
                      </div>
                      <p className="mt-1 text-gray-800">{n.message}</p>
                      <p className="mt-1 text-sm text-gray-600">— {n.author}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-gray-600">No notes yet. Be the first to write one!</p>
              )}
            </div>
          </div>
        </section>

        <footer className="mt-10 text-center text-sm text-gray-500">
          Built with ❤ for Fauzan
        </footer>
      </div>
    </div>
  )
}

export default App
