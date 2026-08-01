import { useRef } from 'react'
import { Download, Upload, FileText, FileJson, RotateCcw } from 'lucide-react'
import { useSettingsStore } from '@/store/settingsStore'
import {
  exportCollectionJson,
  exportStatisticsCsv,
  exportHtmlPortfolio,
  importCollectionJson,
} from '@/services/dataExportService'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex items-center justify-between gap-4 py-2 text-sm">
      <span className="text-zinc-600 dark:text-zinc-300">{label}</span>
      {children}
    </label>
  )
}

export default function Settings() {
  const settings = useSettingsStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    await importCollectionJson(file)
    alert('Collection imported successfully.')
    e.target.value = ''
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold text-zinc-800 dark:text-zinc-100">
        Settings
      </h1>

      <section className="glass rounded-2xl p-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-heading text-sm font-semibold text-zinc-700 dark:text-zinc-200">
            Timer
          </h2>
          <button
            onClick={settings.resetDefaults}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600"
          >
            <RotateCcw size={12} /> Reset defaults
          </button>
        </div>
        <Field label="Focus duration (minutes)">
          <input
            type="number"
            min={1}
            max={90}
            value={settings.focusMinutes}
            onChange={(e) => settings.update({ focusMinutes: Number(e.target.value) })}
            className="w-20 rounded-lg border border-zinc-200 bg-white/70 px-2 py-1 text-right text-sm dark:border-zinc-700 dark:bg-zinc-800/70"
          />
        </Field>
        <Field label="Short break (minutes)">
          <input
            type="number"
            min={1}
            max={30}
            value={settings.shortBreakMinutes}
            onChange={(e) => settings.update({ shortBreakMinutes: Number(e.target.value) })}
            className="w-20 rounded-lg border border-zinc-200 bg-white/70 px-2 py-1 text-right text-sm dark:border-zinc-700 dark:bg-zinc-800/70"
          />
        </Field>
        <Field label="Long break (minutes)">
          <input
            type="number"
            min={1}
            max={60}
            value={settings.longBreakMinutes}
            onChange={(e) => settings.update({ longBreakMinutes: Number(e.target.value) })}
            className="w-20 rounded-lg border border-zinc-200 bg-white/70 px-2 py-1 text-right text-sm dark:border-zinc-700 dark:bg-zinc-800/70"
          />
        </Field>
        <Field label="Sessions until long break">
          <input
            type="number"
            min={2}
            max={8}
            value={settings.sessionsUntilLongBreak}
            onChange={(e) => settings.update({ sessionsUntilLongBreak: Number(e.target.value) })}
            className="w-20 rounded-lg border border-zinc-200 bg-white/70 px-2 py-1 text-right text-sm dark:border-zinc-700 dark:bg-zinc-800/70"
          />
        </Field>
        <Field label="Auto-start next session">
          <input
            type="checkbox"
            checked={settings.autoStartNext}
            onChange={(e) => settings.update({ autoStartNext: e.target.checked })}
            className="h-4 w-4 accent-violet-500"
          />
        </Field>
      </section>

      <section className="glass rounded-2xl p-5">
        <h2 className="mb-2 font-heading text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          Sound
        </h2>
        <Field label="Chime sound">
          <select
            value={settings.chimeSound}
            onChange={(e) => settings.update({ chimeSound: e.target.value as typeof settings.chimeSound })}
            className="rounded-lg border border-zinc-200 bg-white/70 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800/70"
          >
            <option value="chime">Chime</option>
            <option value="bell">Bell</option>
            <option value="digital">Digital</option>
            <option value="none">None</option>
          </select>
        </Field>
        <Field label="Auto-play ambient sound on session start">
          <input
            type="checkbox"
            checked={settings.autoPlayAmbient}
            onChange={(e) => settings.update({ autoPlayAmbient: e.target.checked })}
            className="h-4 w-4 accent-violet-500"
          />
        </Field>
      </section>

      <section className="glass rounded-2xl p-5">
        <h2 className="mb-2 font-heading text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          Appearance
        </h2>
        <Field label="Theme">
          <select
            value={settings.theme}
            onChange={(e) => settings.update({ theme: e.target.value as typeof settings.theme })}
            className="rounded-lg border border-zinc-200 bg-white/70 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800/70"
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </Field>
      </section>

      <section className="glass rounded-2xl p-5">
        <h2 className="mb-3 font-heading text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          Data Management
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={exportCollectionJson}
            className="flex items-center gap-1.5 rounded-full bg-violet-400 px-3 py-1.5 text-xs font-medium text-white transition hover:scale-105"
          >
            <FileJson size={13} /> Export JSON
          </button>
          <button
            onClick={exportStatisticsCsv}
            className="flex items-center gap-1.5 rounded-full bg-zinc-500 px-3 py-1.5 text-xs font-medium text-white transition hover:scale-105"
          >
            <Download size={13} /> Export stats CSV
          </button>
          <button
            onClick={exportHtmlPortfolio}
            className="flex items-center gap-1.5 rounded-full bg-teal-500 px-3 py-1.5 text-xs font-medium text-white transition hover:scale-105"
          >
            <FileText size={13} /> Export HTML portfolio
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:border-violet-300 dark:border-zinc-700 dark:text-zinc-300"
          >
            <Upload size={13} /> Import JSON
          </button>
          <input ref={fileInputRef} type="file" accept=".json" hidden onChange={handleImport} />
        </div>
        <p className="mt-2 text-[11px] text-zinc-400">
          All data lives in this browser's local storage. Export regularly to back it up.
        </p>
      </section>
    </div>
  )
}
