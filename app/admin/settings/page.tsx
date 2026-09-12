'use client'

import React, { useState, useEffect } from 'react'
import {
  Settings,
  Save,
  Globe,
  Mail,
  Phone,
  MapPin,
  Share2,
  Search,
  CheckCircle2,
  Loader2
} from 'lucide-react'
import { useAdmin, supabase } from '@/components/admin/AdminContext'
import { SETTING_KEYS, SiteSettings } from '@/components/admin/types'

export default function AdminSettingsPage() {
  const { siteSettings, setSuccess, setError } = useAdmin()

  const [formData, setFormData] = useState<SiteSettings>({
    site_name: 'DS Softwares',
    site_description: 'Full-Service Digital Engineering & Design Agency',
    contact_email: 'contact@dssoftwares.in',
    contact_phone: '+91 98765 43210',
    address: 'New Delhi, India',
    social_links: {
      linkedin: 'https://linkedin.com/company/ds-softwares',
      twitter: 'https://twitter.com/ds_softwares',
      github: 'https://github.com/ds-softwares',
      instagram: '',
      facebook: '',
      youtube: ''
    },
    seo_settings: {
      meta_title: 'DS Softwares | High-Performance Software, AI & Design Agency',
      meta_description: 'We build world-class digital products, custom web applications, and autonomous AI systems.',
      google_analytics_id: ''
    }
  })

  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (siteSettings) {
      setFormData(prev => ({
        ...prev,
        ...siteSettings,
        social_links: { ...prev.social_links, ...(siteSettings.social_links || {}) },
        seo_settings: { ...prev.seo_settings, ...(siteSettings.seo_settings || {}) }
      }))
    }
  }, [siteSettings])

  const handleChange = (section: string, field: string, value: string) => {
    if (section === 'root') {
      setFormData(prev => ({ ...prev, [field]: value }))
    } else if (section === 'social_links') {
      setFormData(prev => ({
        ...prev,
        social_links: { ...prev.social_links, [field]: value }
      }))
    } else if (section === 'seo_settings') {
      setFormData(prev => ({
        ...prev,
        seo_settings: { ...prev.seo_settings, [field]: value }
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      // Upsert site settings into Supabase key-value table
      const updates = [
        {
          setting_key: SETTING_KEYS.SITE_INFO,
          setting_value: { name: formData.site_name, description: formData.site_description },
          is_active: true
        },
        {
          setting_key: SETTING_KEYS.CONTACT_INFO,
          setting_value: { email: formData.contact_email, phone: formData.contact_phone, address: formData.address },
          is_active: true
        },
        {
          setting_key: SETTING_KEYS.SOCIAL_LINKS,
          setting_value: formData.social_links,
          is_active: true
        },
        {
          setting_key: SETTING_KEYS.SEO_SETTINGS,
          setting_value: formData.seo_settings,
          is_active: true
        }
      ]

      for (const update of updates) {
        await supabase
          .from('site_settings')
          .upsert(update, { onConflict: 'setting_key' })
      }

      setSuccess('Site settings saved successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to save settings')
      setTimeout(() => setError(null), 4000)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#131318] p-5 rounded-2xl border border-[#2a2a35]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white">Site Settings</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#7727ff]/20 text-[#a77aff] border border-[#7727ff]/30">
              Agency Config
            </span>
          </div>
          <p className="text-sm text-[#a0a0b0] mt-1">
            Global metadata, contact information, social links, and search engine optimization
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#7727ff] to-[#6417ed] rounded-xl hover:shadow-lg hover:shadow-purple-500/30 text-sm font-medium text-white transition-all disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save size={16} />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Site Identity */}
        <div className="bg-[#131318] rounded-2xl border border-[#2a2a35] p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[#2a2a35]">
            <Globe size={18} className="text-[#a77aff]" />
            <h3 className="font-bold text-base text-white">Agency Identity</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#a0a0b0] mb-2">Agency Name</label>
              <input
                type="text"
                value={formData.site_name}
                onChange={(e) => handleChange('root', 'site_name', e.target.value)}
                className="w-full px-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-xl text-white text-sm focus:outline-none focus:border-[#7727ff]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#a0a0b0] mb-2">Tagline / Mission</label>
              <input
                type="text"
                value={formData.site_description}
                onChange={(e) => handleChange('root', 'site_description', e.target.value)}
                className="w-full px-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-xl text-white text-sm focus:outline-none focus:border-[#7727ff]"
              />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-[#131318] rounded-2xl border border-[#2a2a35] p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[#2a2a35]">
            <Mail size={18} className="text-[#a77aff]" />
            <h3 className="font-bold text-base text-white">Contact Details</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#a0a0b0] mb-2">Public Inquiries Email</label>
              <input
                type="email"
                value={formData.contact_email}
                onChange={(e) => handleChange('root', 'contact_email', e.target.value)}
                className="w-full px-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-xl text-white text-sm focus:outline-none focus:border-[#7727ff]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#a0a0b0] mb-2">Contact Phone</label>
              <input
                type="text"
                value={formData.contact_phone}
                onChange={(e) => handleChange('root', 'contact_phone', e.target.value)}
                className="w-full px-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-xl text-white text-sm focus:outline-none focus:border-[#7727ff]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#a0a0b0] mb-2">Office Headquarters</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('root', 'address', e.target.value)}
                className="w-full px-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-xl text-white text-sm focus:outline-none focus:border-[#7727ff]"
              />
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-[#131318] rounded-2xl border border-[#2a2a35] p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[#2a2a35]">
            <Share2 size={18} className="text-[#a77aff]" />
            <h3 className="font-bold text-base text-white">Social Media Links</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#a0a0b0] mb-2">LinkedIn URL</label>
              <input
                type="url"
                value={formData.social_links.linkedin || ''}
                onChange={(e) => handleChange('social_links', 'linkedin', e.target.value)}
                className="w-full px-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-xl text-white text-sm focus:outline-none focus:border-[#7727ff]"
                placeholder="https://linkedin.com/..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#a0a0b0] mb-2">Twitter / X URL</label>
              <input
                type="url"
                value={formData.social_links.twitter || ''}
                onChange={(e) => handleChange('social_links', 'twitter', e.target.value)}
                className="w-full px-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-xl text-white text-sm focus:outline-none focus:border-[#7727ff]"
                placeholder="https://x.com/..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#a0a0b0] mb-2">GitHub URL</label>
              <input
                type="url"
                value={formData.social_links.github || ''}
                onChange={(e) => handleChange('social_links', 'github', e.target.value)}
                className="w-full px-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-xl text-white text-sm focus:outline-none focus:border-[#7727ff]"
                placeholder="https://github.com/..."
              />
            </div>
          </div>
        </div>

        {/* SEO Settings */}
        <div className="bg-[#131318] rounded-2xl border border-[#2a2a35] p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[#2a2a35]">
            <Search size={18} className="text-[#a77aff]" />
            <h3 className="font-bold text-base text-white">Search Engine Optimization (SEO)</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#a0a0b0] mb-2">Default Meta Title</label>
              <input
                type="text"
                value={formData.seo_settings.meta_title}
                onChange={(e) => handleChange('seo_settings', 'meta_title', e.target.value)}
                className="w-full px-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-xl text-white text-sm focus:outline-none focus:border-[#7727ff]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#a0a0b0] mb-2">Default Meta Description</label>
              <textarea
                value={formData.seo_settings.meta_description}
                onChange={(e) => handleChange('seo_settings', 'meta_description', e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-xl text-white text-sm focus:outline-none focus:border-[#7727ff]"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
