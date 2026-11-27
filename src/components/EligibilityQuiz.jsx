import { useEffect, useRef, useState } from 'react'
import { CloseIcon } from './Icons.jsx'

const choices = ['Yes', 'No', 'Not sure']

export default function EligibilityQuiz({ requirements, initialAnswers = {}, onClose, onDone, onProgress }) {
  const [answers, setAnswers] = useState(initialAnswers)
  const [step, setStep] = useState(Object.keys(initialAnswers).length)
  const dialogRef = useRef(null)
  const done = step >= requirements.length

  useEffect(() => {
    const prev = document.activeElement
    dialogRef.current?.querySelector('button')?.focus()
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; prev?.focus?.() }
  }, [onClose])

  const answer = (v) => {
    const next = { ...answers, [step]: v }
    setAnswers(next)
    setStep((s) => s + 1)
    onProgress?.(next)
    if (step + 1 >= requirements.length) onDone(next)
  }

  const yes = Object.values(answers).filter((a) => a === 'Yes').length
  const no = Object.values(answers).filter((a) => a === 'No').length

  return (
    <div className="fixed inset-0 z-[1300] grid place-items-center p-4">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-navy/50" onClick={onClose} />
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="quiz-h" className="relative w-full max-w-[460px] rounded-2xl bg-white p-6 shadow-2xl">
        <button type="button" onClick={onClose} aria-label="Close eligibility check" className="focus-ring-light absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full hover:bg-[#F0F1F4]">
          <CloseIcon className="h-4 w-4" />
        </button>
        <h2 id="quiz-h" className="text-lg font-semibold text-ink">Check your eligibility</h2>
        {!done ? (
          <>
            <p className="mt-1 text-xs text-muted">Question {step + 1} of {requirements.length}</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#EEEFF2]" aria-hidden="true">
              <div className="h-full rounded-full bg-navy transition-all" style={{ width: `${(step / requirements.length) * 100}%` }} />
            </div>
            <p className="mt-5 text-[15px] font-medium leading-relaxed text-ink">Does this describe you?</p>
            <p className="mt-2 rounded-lg bg-[#F5F6F8] p-3 text-sm leading-relaxed text-[#4A5068]">{requirements[step]}</p>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {choices.map((c) => (
                <button key={c} type="button" onClick={() => answer(c)} className="focus-ring-light min-h-[44px] rounded-lg border border-line text-sm font-medium text-ink transition hover:border-navy hover:bg-[#EEF2FC]">
                  {c}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div aria-live="polite">
            <p className="mt-4 text-2xl font-semibold text-navy">{no ? 'You may not qualify' : yes === requirements.length ? 'You may qualify' : 'You might qualify'}</p>
            <p className="mt-2 text-sm leading-relaxed text-[#4A5068]">
              You matched {yes} of {requirements.length} key requirements.{' '}
              {no
                ? 'One or more requirements may not fit you. The study team can still answer your questions, and there may be other trials that suit you better.'
                : 'This is only a first check. The study team confirms eligibility during screening.'}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <button type="button" onClick={onClose} className="focus-ring-light min-h-[44px] rounded-full bg-navy px-5 text-sm font-semibold text-white hover:bg-navy-800">Done</button>
              <button type="button" onClick={() => { setAnswers({}); setStep(0); onProgress?.({}) }} className="focus-ring-light min-h-[44px] rounded-full border border-line px-5 text-sm font-medium text-ink hover:border-ink/40">Start over</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
