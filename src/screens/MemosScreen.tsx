import { useState } from 'react'
import memosData from '../data/memos.json'
import { getNatinfByNumero, natureShortLabel } from '../lib/natinf'
import { usePersistentState } from '../lib/usePersistentState'
import type { NatinfEntry } from '../lib/types'
import { NatinfDetail } from './NatinfScreen'
import { IconArrowLeft, IconArrowRight, IconCheck, IconX } from '../components/icons'

type Tone = 'ok' | 'ko' | 'info'

interface MemoSection {
  title: string
  tone: string
  items: string[]
}

interface MemoNatinf {
  numero: string
  classe: number
  infraction: string
  note?: string
}

interface Memo {
  id: string
  title: string
  subtitle: string
  icon: string
  sections: MemoSection[]
  natinf: MemoNatinf[]
}

const memos = memosData.memos as Memo[]

function ToneIcon({ tone }: { tone: Tone }) {
  const style = { width: 16, height: 16 }
  if (tone === 'ok') return <IconCheck style={style} />
  if (tone === 'ko') return <IconX style={style} />
  return <IconArrowRight style={style} />
}

function scrollToTop() {
  document.querySelector('.app-main')?.scrollTo({ top: 0 })
}

export default function MemosScreen() {
  const [openId, setOpenId] = usePersistentState('gendkit-memo-open', '')
  const [selected, setSelected] = useState<NatinfEntry | null>(null)
  const memo = memos.find((m) => m.id === openId)

  function open(id: string) {
    setOpenId(id)
    scrollToTop()
  }

  function back() {
    setOpenId('')
    scrollToTop()
  }

  if (!memo) {
    return (
      <div>
        <p className="small muted" style={{ margin: '0 0.2rem 0.7rem' }}>
          Aides-mémoire de terrain, consultables hors connexion.
        </p>
        <div className="memo-list-grid">
          {memos.map((m) => (
            <button key={m.id} className="memo-card" onClick={() => open(m.id)}>
              <span className="memo-card-icon">{m.icon}</span>
              <span className="memo-card-text">
                <strong>{m.title}</strong>
                <span className="small muted">{m.subtitle}</span>
              </span>
              <IconArrowRight style={{ width: 18, height: 18, flexShrink: 0 }} className="muted" />
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="nav-header">
        <button className="back-btn" onClick={back} aria-label="Retour">
          <IconArrowLeft style={{ width: 20, height: 20 }} />
        </button>
        <div className="nav-title">
          <span style={{ marginRight: '0.35rem' }}>{memo.icon}</span>
          {memo.title}
        </div>
      </div>

      {memo.sections.map((section) => {
        const tone: Tone = section.tone === 'ok' || section.tone === 'ko' ? section.tone : 'info'
        return (
          <div className={`card memo-section ${tone}`} key={section.title}>
            <h2>{section.title}</h2>
            <ul>
              {section.items.map((item) => (
                <li key={item}>
                  <span className="memo-marker">
                    <ToneIcon tone={tone} />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )
      })}

      {memo.natinf.length > 0 && (
        <div className="card">
          <h2>NATINF</h2>
          <p className="small muted" style={{ marginBottom: '0.3rem' }}>
            Touchez une ligne pour ouvrir la fiche NATINF complète.
          </p>
          {memo.natinf.map((row) => (
            <div
              className="list-item"
              key={row.numero}
              onClick={() => setSelected(getNatinfByNumero(row.numero) ?? null)}
            >
              <div className="content">
                <span className="num">NATINF {row.numero}</span>{' '}
                <span className={`badge ${row.classe >= 4 ? 'amber' : 'blue'}`}>
                  {natureShortLabel(`Contravention de classe ${row.classe}`)}
                </span>
                <div className="qualif">{row.infraction}</div>
                {row.note && <div className="small muted" style={{ marginTop: '0.2rem' }}>{row.note}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && <NatinfDetail entry={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
