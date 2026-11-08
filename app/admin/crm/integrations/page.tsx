'use client'

import React, { useEffect, useState } from 'react'
import {
  Bell,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  Globe,
  Loader2,
  Plus,
  RefreshCw,
  Send,
  Shield,
  Sparkles,
  X,
  Zap,
} from 'lucide-react'
import {
  fetchWebhooks,
  saveWebhook,
  dispatchWebhookTest,
  fetchNotificationLogs,
  WebhookIntegration,
  NotificationLog,
} from '@/lib/crm-supabase'

export default function CrmIntegrationsPage() {
  const [webhooks, setWebhooks] = useState<WebhookIntegration[]>([])
  const [logs, setLogs] = useState<NotificationLog[]>([])
  const [loading, setLoading] = useState(true)
  const [testingId, setTestingId] = useState<string | null>(null)

  // New Webhook Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    platform: 'discord' as 'slack' | 'discord' | 'webhook',
    name: '',
    webhookUrl: '',
    isActive: true,
    events: ['standup_blocker', 'leave_request', 'offer_accepted', 'certificate_issued'],
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const [whs, lgs] = await Promise.all([
        fetchWebhooks(),
        fetchNotificationLogs(),
      ])
      setWebhooks(whs)
      setLogs(lgs)
    } catch (err) {
      console.error('Failed to load webhook integrations:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleTestPing = async (id: string) => {
    setTestingId(id)
    try {
      const updated = await dispatchWebhookTest(id)
      setWebhooks((prev) => prev.map((w) => (w.id === id ? { ...w, last_triggered_at: updated.last_triggered_at } : w)))
      const freshLogs = await fetchNotificationLogs()
      setLogs(freshLogs)
    } catch (err: any) {
      alert(`Test ping failed: ${err.message}`)
    } finally {
      setTestingId(null)
    }
  }

  const handleSaveWebhook = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.webhookUrl) return

    setSaving(true)
    try {
      const created = await saveWebhook(form)
      setWebhooks((prev) => [created, ...prev])
      setIsModalOpen(false)
      setForm({
        platform: 'discord',
        name: '',
        webhookUrl: '',
        isActive: true,
        events: ['standup_blocker', 'leave_request'],
      })
    } catch (err: any) {
      alert(`Save error: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#2a2a35] bg-[#131318] p-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white">Slack & Discord Notification Hub</h2>
            <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-0.5 text-xs font-semibold text-sky-300 flex items-center gap-1">
              <Zap size={13} />
              Real-Time Automation Dispatcher
            </span>
          </div>
          <p className="mt-1 text-sm text-[#a0a0b0]">
            Automate engineering alert notifications for standup blockers, leave approvals, and digital offer sign-offs
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={loadData}
            className="flex items-center gap-2 rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2 text-xs font-medium text-white transition-all hover:bg-[#252532]"
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Sync</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-sky-500/20 hover:brightness-110"
          >
            <Plus size={15} />
            <span>Add Webhook Channel</span>
          </button>
        </div>
      </div>

      {/* Webhook Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {webhooks.map((wh) => (
          <div key={wh.id} className="rounded-2xl border border-[#2a2a35] bg-[#131318] p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="rounded-full border border-[#3a3545] bg-[#1a1722] px-2.5 py-0.5 text-[10px] font-bold uppercase text-purple-300">
                  {wh.platform}
                </span>
                <h3 className="text-base font-bold text-white mt-2">{wh.name}</h3>
                <p className="text-xs font-mono text-[#808095] mt-1 max-w-xs truncate">
                  {wh.webhook_url}
                </p>
              </div>

              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                  wh.is_active
                    ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                    : 'border border-[#2a2a35] bg-[#1a1a24] text-[#808095]'
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${wh.is_active ? 'bg-emerald-400' : 'bg-gray-500'}`} />
                {wh.is_active ? 'Active' : 'Paused'}
              </span>
            </div>

            {/* Subscribed Events */}
            <div>
              <p className="text-[11px] text-[#808095] mb-1.5">Subscribed Event Triggers:</p>
              <div className="flex flex-wrap gap-1.5">
                {(wh.events || []).map((ev) => (
                  <span
                    key={ev}
                    className="rounded-lg border border-[#2a2a35] bg-[#1a1a24] px-2 py-0.5 text-[10px] font-medium text-[#d0ccda]"
                  >
                    ⚡ {ev.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#2a2a35] text-xs">
              <span className="text-[#808095] text-[11px]">
                {wh.last_triggered_at
                  ? `Last Ping: ${new Date(wh.last_triggered_at).toLocaleTimeString()}`
                  : 'Never triggered'}
              </span>

              <button
                onClick={() => handleTestPing(wh.id)}
                disabled={testingId === wh.id}
                className="inline-flex items-center gap-1.5 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-300 hover:bg-sky-500/20 transition-colors disabled:opacity-50"
              >
                {testingId === wh.id ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send size={12} />
                    <span>Send Test Ping</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl border border-[#2a2a35] bg-[#131318] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Bell size={16} className="text-sky-400" />
            <span>Recent Notification Dispatch Audit Logs</span>
          </h3>
          <span className="text-xs text-[#808095]">Real-time automation history</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#2a2a35] bg-[#16161d] text-[#808095]">
              <tr>
                <th className="px-4 py-3 font-semibold">Timestamp</th>
                <th className="px-4 py-3 font-semibold">Platform</th>
                <th className="px-4 py-3 font-semibold">Event</th>
                <th className="px-4 py-3 font-semibold">Payload Summary</th>
                <th className="px-4 py-3 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a35]">
              {logs.map((lg) => (
                <tr key={lg.id} className="transition-colors hover:bg-[#1a1a24]/50">
                  <td className="px-4 py-3 text-[#a0a0b0] font-mono text-[11px]">
                    {new Date(lg.created_at).toLocaleTimeString()}
                  </td>
                  <td className="px-4 py-3 font-bold text-white uppercase text-[11px]">{lg.platform}</td>
                  <td className="px-4 py-3 text-purple-300 font-semibold">{lg.event_type}</td>
                  <td className="px-4 py-3 text-[#808095] max-w-xs truncate font-mono text-[11px]">
                    {JSON.stringify(lg.payload)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                      HTTP {lg.response_status || 200} OK
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD WEBHOOK */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#3a3545] bg-[#131318] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#2a2a35]">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-sky-500/20 p-2 text-sky-400">
                  <Zap size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Connect Webhook Integration</h3>
                  <p className="text-xs text-[#a0a0b0]">Broadcast alerts to Slack, Discord, or custom endpoints</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-[#a0a0b0] hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveWebhook} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Platform *</label>
                <select
                  value={form.platform}
                  onChange={(e) => setForm({ ...form, platform: e.target.value as any })}
                  className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-sky-500 focus:outline-none"
                >
                  <option value="discord">Discord Webhook</option>
                  <option value="slack">Slack Incoming Webhook</option>
                  <option value="webhook">Custom HTTP Webhook Endpoint</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Channel / Webhook Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. #dev-squad-announcements"
                  className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Incoming Webhook URL *</label>
                <input
                  type="url"
                  required
                  value={form.webhookUrl}
                  onChange={(e) => setForm({ ...form, webhookUrl: e.target.value })}
                  placeholder="https://hooks.slack.com/services/... or https://discord.com/api/webhooks/..."
                  className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-sky-500 focus:outline-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-[#2a2a35] px-4 py-2 text-xs font-semibold text-[#a0a0b0] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-2 text-xs font-bold text-white hover:brightness-110 disabled:opacity-50"
                >
                  {saving ? 'Connecting...' : 'Save Integration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
