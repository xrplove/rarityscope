'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { config } from '@/config'
import { loadDetail, type Detail } from '@/lib/data'
import { loadMinted } from '@/lib/minted'
import { isValidSerial, TOTAL, DISPLAY_NAME } from '@/lib/rarity'
import { ReportCard } from '@/components/ReportCard'

type State = { status: 'loading' } | { status: 'ok'; detail: Detail } | { status: 'invalid' } | { status: 'error' }

export default function NftClient() {
  const params = useParams<{ serial: string }>()
  const serial = Number(params.serial)
  const [state, setState] = useState<State>({ status: 'loading' })
  const [minted, setMinted] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    if (!isValidSerial(serial)) {
      setState({ status: 'invalid' })
      return
    }
    let alive = true
    setState({ status: 'loading' })
    setMinted(undefined)
    loadDetail(serial)
      .then((d) => alive && setState(d ? { status: 'ok', detail: d } : { status: 'invalid' }))
      .catch(() => alive && setState({ status: 'error' }))
    if (config.features.mintedMarkers) {
      loadMinted()
        .then((m) => alive && m && setMinted(m.has(serial)))
        .catch(() => {})
    }
    return () => {
      alive = false
    }
  }, [serial])

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <Link href="/" className="mb-6 inline-block text-sm text-text-secondary hover:text-text-primary">
        ← back to browse
      </Link>

      {state.status === 'loading' && (
        <div className="animate-pulse-dot text-text-muted">loading #{serial}…</div>
      )}

      {state.status === 'invalid' && (
        <p className="text-text-secondary">
          {DISPLAY_NAME} only goes 1–{TOTAL.toLocaleString()}. <Link href="/" className="text-accent hover:underline">browse the collection →</Link>
        </p>
      )}

      {state.status === 'error' && (
        <p className="text-text-secondary">couldn&apos;t load that piece. refresh to try again.</p>
      )}

      {state.status === 'ok' && <ReportCard serial={serial} detail={state.detail} minted={minted} priority />}
    </div>
  )
}
