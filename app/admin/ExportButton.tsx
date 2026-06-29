'use client'

import { useState } from 'react'

export default function ExportButton() {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/export-tips')
      if (!res.ok) {
        alert('Export selhal: ' + res.statusText)
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `tipy-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-60"
    >
      {loading ? '⏳ Exportuji...' : '📥 Export tipů (CSV)'}
    </button>
  )
}
