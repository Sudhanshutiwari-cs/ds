'use client'

import React, { useState, useEffect } from 'react'
import {
  X,
  Save,
  Plus,
  Trash2,
  BarChart3,
  Layout,
  ExternalLink
} from 'lucide-react'
import {
  categories,
  blogCategories,
  faqCategories,
  sectionTypes,
  availableServiceIcons,
  serviceIconMap
} from './types'
import { useAdmin } from './AdminContext'

export default function AdminModal() {
  const { showModal, modalType, editingItem, closeModal, handleSaveItem, projects } = useAdmin()

  const [formData, setFormData] = useState<any>({})
  const [activeStep, setActiveStep] = useState(1)
  const [projectMetrics, setProjectMetrics] = useState<any[]>([])
  const [projectSections, setProjectSections] = useState<any[]>([])
  const [projectTestimonials, setProjectTestimonials] = useState<any[]>([])

  useEffect(() => {
    if (editingItem) {
      setFormData(editingItem)
      if (modalType === 'projects') {
        setProjectMetrics(editingItem.metrics || [])
        setProjectSections(editingItem.sections || [])
        setProjectTestimonials(editingItem.testimonials || [])
      }
    } else {
      setFormData({})
      setActiveStep(1)
      setProjectMetrics([])
      setProjectSections([])
      setProjectTestimonials([])
    }
  }, [editingItem, modalType, showModal])

  if (!showModal) return null

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    let dataToSave = { ...formData }
    if (modalType === 'projects') {
      dataToSave.metrics = projectMetrics
      dataToSave.sections = projectSections
      dataToSave.testimonials = projectTestimonials
      if (!dataToSave.slug && dataToSave.title) {
        dataToSave.slug = dataToSave.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      }
    }
    handleSaveItem(dataToSave)
  }

  const addMetric = () => {
    setProjectMetrics([...projectMetrics, { label: '', value: '', prefix: '', suffix: '' }])
  }
  const updateMetric = (index: number, field: string, value: string) => {
    const updated = [...projectMetrics]
    updated[index][field] = value
    setProjectMetrics(updated)
  }
  const removeMetric = (index: number) => {
    setProjectMetrics(projectMetrics.filter((_, i) => i !== index))
  }

  const addSection = () => {
    setProjectSections([...projectSections, { section_type: 'OVERVIEW', title: '', body: '', sort_order: projectSections.length }])
  }
  const updateSection = (index: number, field: string, value: any) => {
    const updated = [...projectSections]
    updated[index][field] = value
    setProjectSections(updated)
  }
  const removeSection = (index: number) => {
    setProjectSections(projectSections.filter((_, i) => i !== index))
  }

  const addTestimonial = () => {
    setProjectTestimonials([...projectTestimonials, { quote_text: '', author_name: '', author_title: '', rating: 5 }])
  }
  const updateTestimonial = (index: number, field: string, value: any) => {
    const updated = [...projectTestimonials]
    updated[index][field] = value
    setProjectTestimonials(updated)
  }
  const removeTestimonial = (index: number) => {
    setProjectTestimonials(projectTestimonials.filter((_, i) => i !== index))
  }

  const getModalTitle = () => {
    const action = editingItem ? 'Edit' : 'Create New'
    switch (modalType) {
      case 'projects': return `${action} Project`
      case 'services': return `${action} Service`
      case 'testimonials': return `${action} Testimonial`
      case 'blog':
      case 'blog_posts': return `${action} Blog Post`
      case 'team':
      case 'team_members': return `${action} Team Member`
      case 'faqs': return `${action} FAQ`
      default: return `${action} Item`
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={closeModal} />
      <div className="relative bg-[#131318] border border-[#2a2a35] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto z-10 shadow-2xl scrollbar-thin">
        {/* Header */}
        <div className="sticky top-0 bg-[#131318]/95 backdrop-blur-md border-b border-[#2a2a35] p-5 flex items-center justify-between z-20">
          <div>
            <h3 className="text-xl font-bold text-white">{getModalTitle()}</h3>
            <p className="text-xs text-[#a0a0b0] mt-0.5">Fill in the details below to update your live website</p>
          </div>
          <button onClick={closeModal} className="p-2 rounded-lg hover:bg-[#1a1a24] text-[#a0a0b0] hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Project Steps Tab */}
        {modalType === 'projects' && (
          <div className="flex border-b border-[#2a2a35] px-6 bg-[#1a1a24]/30 overflow-x-auto scrollbar-thin">
            {[
              { num: 1, label: 'Basic Info' },
              { num: 2, label: 'Story & Details' },
              { num: 3, label: 'Testimonials' },
              { num: 4, label: 'Metrics' },
              { num: 5, label: 'Sections' }
            ].map((step) => (
              <button
                key={step.num}
                type="button"
                onClick={() => setActiveStep(step.num)}
                className={`py-3 px-4 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                  activeStep === step.num
                    ? 'border-[#7727ff] text-[#a77aff]'
                    : 'border-transparent text-[#a0a0b0] hover:text-white'
                }`}
              >
                {step.num}. {step.label}
              </button>
            ))}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* PROJECTS FORM */}
          {modalType === 'projects' && (
            <>
              {activeStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#a0a0b0] mb-2">Project Title *</label>
                      <input
                        type="text"
                        required
                        value={formData.title || ''}
                        onChange={(e) => handleChange('title', e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-xl text-white text-sm focus:outline-none focus:border-[#7727ff]"
                        placeholder="e.g., AuraFirm Digital Platform"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#a0a0b0] mb-2">Client Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.client_name || ''}
                        onChange={(e) => handleChange('client_name', e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-xl text-white text-sm focus:outline-none focus:border-[#7727ff]"
                        placeholder="e.g., AuraFirm Inc."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#a0a0b0] mb-2">Category *</label>
                      <select
                        value={formData.category || categories[0]}
                        onChange={(e) => handleChange('category', e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-xl text-white text-sm focus:outline-none focus:border-[#7727ff]"
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#a0a0b0] mb-2">Live URL</label>
                      <input
                        type="url"
                        value={formData.visit_url || ''}
                        onChange={(e) => handleChange('visit_url', e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-xl text-white text-sm focus:outline-none focus:border-[#7727ff]"
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#a0a0b0] mb-2">Hero Headline</label>
                    <input
                      type="text"
                      value={formData.hero_headline || ''}
                      onChange={(e) => handleChange('hero_headline', e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-xl text-white text-sm focus:outline-none focus:border-[#7727ff]"
                      placeholder="Catchy headline summarizing the impact"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#a0a0b0] mb-2">Short Description</label>
                    <textarea
                      value={formData.short_description || ''}
                      onChange={(e) => handleChange('short_description', e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-xl text-white text-sm focus:outline-none focus:border-[#7727ff]"
                      placeholder="Brief card summary"
                    />
                  </div>

                  <div className="flex items-center gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_published ?? true}
                        onChange={(e) => handleChange('is_published', e.target.checked)}
                        className="rounded border-[#2a2a35] text-[#7727ff] focus:ring-0"
                      />
                      <span className="text-sm font-medium text-white">Published</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_featured ?? false}
                        onChange={(e) => handleChange('is_featured', e.target.checked)}
                        className="rounded border-[#2a2a35] text-[#7727ff] focus:ring-0"
                      />
                      <span className="text-sm font-medium text-white">Featured on Homepage</span>
                    </label>
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#a0a0b0] mb-2">The Challenge</label>
                    <textarea
                      value={formData.challenge || ''}
                      onChange={(e) => handleChange('challenge', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-xl text-white text-sm focus:outline-none focus:border-[#7727ff]"
                      placeholder="What obstacle or problem did the client face?"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#a0a0b0] mb-2">Our Solution</label>
                    <textarea
                      value={formData.solution || ''}
                      onChange={(e) => handleChange('solution', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-xl text-white text-sm focus:outline-none focus:border-[#7727ff]"
                      placeholder="How did DS Softwares engineer the solution?"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#a0a0b0] mb-2">The Results & Impact</label>
                    <textarea
                      value={formData.results || ''}
                      onChange={(e) => handleChange('results', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-xl text-white text-sm focus:outline-none focus:border-[#7727ff]"
                      placeholder="Quantifiable business outcomes achieved"
                    />
                  </div>
                </div>
              )}

              {activeStep === 3 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-sm text-[#a77aff]">Project Testimonials</h4>
                    <button type="button" onClick={addTestimonial} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#7727ff] rounded-xl text-xs font-medium text-white hover:bg-[#6417ed]">
                      <Plus size={14} /> Add Quote
                    </button>
                  </div>
                  {projectTestimonials.length === 0 ? (
                    <p className="text-xs text-[#808095] text-center py-6">No specific quote added for this project.</p>
                  ) : (
                    projectTestimonials.map((t, idx) => (
                      <div key={idx} className="p-4 border border-[#2a2a35] rounded-xl space-y-3 bg-[#1a1a24]/40">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-white">Review #{idx + 1}</span>
                          <button type="button" onClick={() => removeTestimonial(idx)} className="text-red-400 hover:text-red-300">
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <textarea
                          value={t.quote_text}
                          onChange={(e) => updateTestimonial(idx, 'quote_text', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 bg-[#131318] border border-[#2a2a35] rounded-lg text-xs text-white"
                          placeholder="Client review text..."
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={t.author_name}
                            onChange={(e) => updateTestimonial(idx, 'author_name', e.target.value)}
                            className="px-3 py-1.5 bg-[#131318] border border-[#2a2a35] rounded-lg text-xs text-white"
                            placeholder="Author name"
                          />
                          <input
                            type="text"
                            value={t.author_title}
                            onChange={(e) => updateTestimonial(idx, 'author_title', e.target.value)}
                            className="px-3 py-1.5 bg-[#131318] border border-[#2a2a35] rounded-lg text-xs text-white"
                            placeholder="e.g., Founder & CEO"
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeStep === 4 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-sm text-[#a77aff]">Project Metrics & KPIs</h4>
                    <button type="button" onClick={addMetric} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#7727ff] rounded-xl text-xs font-medium text-white hover:bg-[#6417ed]">
                      <Plus size={14} /> Add Metric
                    </button>
                  </div>
                  {projectMetrics.length === 0 ? (
                    <p className="text-xs text-[#808095] text-center py-6">No metric badges added yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {projectMetrics.map((m, idx) => (
                        <div key={idx} className="p-3 border border-[#2a2a35] rounded-xl bg-[#1a1a24]/40 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-white">Metric #{idx + 1}</span>
                            <button type="button" onClick={() => removeMetric(idx)} className="text-red-400 hover:text-red-300">
                              <Trash2 size={13} />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <input
                              type="text"
                              value={m.prefix || ''}
                              onChange={(e) => updateMetric(idx, 'prefix', e.target.value)}
                              className="px-2 py-1 bg-[#131318] border border-[#2a2a35] rounded text-xs text-white"
                              placeholder="Prefix (e.g. ₹)"
                            />
                            <input
                              type="text"
                              value={m.value}
                              onChange={(e) => updateMetric(idx, 'value', e.target.value)}
                              className="px-2 py-1 bg-[#131318] border border-[#2a2a35] rounded text-xs text-white"
                              placeholder="Value (e.g. 50L+)"
                            />
                            <input
                              type="text"
                              value={m.suffix || ''}
                              onChange={(e) => updateMetric(idx, 'suffix', e.target.value)}
                              className="px-2 py-1 bg-[#131318] border border-[#2a2a35] rounded text-xs text-white"
                              placeholder="Suffix (e.g. % or /mo)"
                            />
                            <input
                              type="text"
                              value={m.label}
                              onChange={(e) => updateMetric(idx, 'label', e.target.value)}
                              className="px-2 py-1 bg-[#131318] border border-[#2a2a35] rounded text-xs text-white"
                              placeholder="Label (e.g. Revenue)"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeStep === 5 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-sm text-[#a77aff]">Custom Page Sections</h4>
                    <button type="button" onClick={addSection} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#7727ff] rounded-xl text-xs font-medium text-white hover:bg-[#6417ed]">
                      <Plus size={14} /> Add Section
                    </button>
                  </div>
                  {projectSections.length === 0 ? (
                    <p className="text-xs text-[#808095] text-center py-6">No custom sections added yet.</p>
                  ) : (
                    projectSections.map((s, idx) => (
                      <div key={idx} className="p-4 border border-[#2a2a35] rounded-xl bg-[#1a1a24]/40 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-white">Section #{idx + 1}</span>
                          <button type="button" onClick={() => removeSection(idx)} className="text-red-400 hover:text-red-300">
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <select
                            value={s.section_type}
                            onChange={(e) => updateSection(idx, 'section_type', e.target.value)}
                            className="px-3 py-1.5 bg-[#131318] border border-[#2a2a35] rounded-lg text-xs text-white"
                          >
                            {sectionTypes.map((type) => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={s.title}
                            onChange={(e) => updateSection(idx, 'title', e.target.value)}
                            className="px-3 py-1.5 bg-[#131318] border border-[#2a2a35] rounded-lg text-xs text-white"
                            placeholder="Section Title"
                          />
                        </div>
                        <textarea
                          value={s.body}
                          onChange={(e) => updateSection(idx, 'body', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-1.5 bg-[#131318] border border-[#2a2a35] rounded-lg text-xs text-white"
                          placeholder="Section body text..."
                        />
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}

          {/* SERVICES FORM WITH VISUAL ICON PICKER */}
          {modalType === 'services' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#a0a0b0] mb-2">Service Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-xl text-white text-sm focus:outline-none focus:border-[#7727ff]"
                  placeholder="e.g., AI & Automation Solutions"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#a0a0b0] mb-2">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-xl text-white text-sm focus:outline-none focus:border-[#7727ff]"
                  placeholder="Describe what this service delivers to clients"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#a0a0b0] mb-2">Select Visual Icon</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
                  {availableServiceIcons.map((item) => {
                    const isSelected = (formData.icon || '') === item.name
                    const IconComp = item.icon
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => handleChange('icon', item.name)}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs transition-all ${
                          isSelected
                            ? 'border-[#7727ff] bg-[#6417ed25] text-white shadow-[0_0_12px_#7727ff55]'
                            : 'border-[#2a2a35] bg-[#1a1a24] text-[#a0a0b0] hover:text-white hover:border-[#3a3a45]'
                        }`}
                        title={item.label}
                      >
                        <IconComp size={18} className={isSelected ? 'text-[#a77aff]' : 'text-[#8e8a99]'} />
                        <span className="text-[10px] mt-1 truncate max-w-full font-medium">{item.name}</span>
                      </button>
                    )
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.icon || ''}
                    onChange={(e) => handleChange('icon', e.target.value)}
                    className="w-full px-4 py-2 bg-[#1a1a24] border border-[#2a2a35] rounded-xl text-xs text-white focus:outline-none focus:border-[#7727ff]"
                    placeholder="Or type custom Lucide icon name..."
                  />
                  {formData.icon && serviceIconMap[formData.icon] && (
                    <div className="flex items-center justify-center size-9 rounded-xl bg-[#6417ed25] border border-[#7727ff40] text-[#a77aff] shrink-0">
                      {(() => {
                        const PreviewIcon = serviceIconMap[formData.icon]
                        return <PreviewIcon size={16} />
                      })()}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#a0a0b0] mb-2">Display Sort Order</label>
                <input
                  type="number"
                  value={formData.sort_order ?? 0}
                  onChange={(e) => handleChange('sort_order', parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-xl text-white text-sm focus:outline-none focus:border-[#7727ff]"
                />
              </div>
            </div>
          )}

          {/* BLOG POSTS FORM */}
          {(modalType === 'blog' || modalType === 'blog_posts') && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#a0a0b0] mb-2">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-xl text-white text-sm focus:outline-none focus:border-[#7727ff]"
                    placeholder="Article title"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#a0a0b0] mb-2">Slug *</label>
                  <input
                    type="text"
                    required
                    value={formData.slug || ''}
                    onChange={(e) => handleChange('slug', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-xl text-white text-sm focus:outline-none focus:border-[#7727ff]"
                    placeholder="article-url-slug"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#a0a0b0] mb-2">Category</label>
                  <select
                    value={formData.category || blogCategories[0]}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-xl text-white text-sm focus:outline-none focus:border-[#7727ff]"
                  >
                    {blogCategories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#a0a0b0] mb-2">Status</label>
                  <select
                    value={formData.status || 'draft'}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-xl text-white text-sm focus:outline-none focus:border-[#7727ff]"
                  >
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#a0a0b0] mb-2">Excerpt</label>
                <textarea
                  value={formData.excerpt || ''}
                  onChange={(e) => handleChange('excerpt', e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-xl text-white text-sm focus:outline-none focus:border-[#7727ff]"
                  placeholder="Summary for article previews"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#a0a0b0] mb-2">Content (Markdown)</label>
                <textarea
                  value={formData.content || ''}
                  onChange={(e) => handleChange('content', e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-xl text-white text-sm font-mono focus:outline-none focus:border-[#7727ff]"
                  placeholder="# Post content in Markdown..."
                />
              </div>
            </div>
          )}

          {/* TESTIMONIALS FORM */}
          {modalType === 'testimonials' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#a0a0b0] mb-2">Project Association</label>
                <select
                  value={formData.project_id || ''}
                  onChange={(e) => handleChange('project_id', e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-xl text-white text-sm focus:outline-none focus:border-[#7727ff]"
                >
                  <option value="">General (No specific project)</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.title} ({p.client_name})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#a0a0b0] mb-2">Quote Text *</label>
                <textarea
                  required
                  value={formData.quote_text || ''}
                  onChange={(e) => handleChange('quote_text', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-xl text-white text-sm focus:outline-none focus:border-[#7727ff]"
                  placeholder="The client's testimonial..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#a0a0b0] mb-2">Author Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.author_name || ''}
                    onChange={(e) => handleChange('author_name', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-xl text-white text-sm focus:outline-none focus:border-[#7727ff]"
                    placeholder="Author name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#a0a0b0] mb-2">Author Title & Company</label>
                  <input
                    type="text"
                    value={formData.author_title || ''}
                    onChange={(e) => handleChange('author_title', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-xl text-white text-sm focus:outline-none focus:border-[#7727ff]"
                    placeholder="e.g. Chief Product Officer at Acme"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#a0a0b0] mb-2">Rating (1 to 5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.rating || 5}
                  onChange={(e) => handleChange('rating', parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-xl text-white text-sm focus:outline-none focus:border-[#7727ff]"
                />
              </div>
            </div>
          )}

          {/* TEAM MEMBERS FORM */}
          {(modalType === 'team' || modalType === 'team_members') && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#a0a0b0] mb-2">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-xl text-white text-sm focus:outline-none focus:border-[#7727ff]"
                    placeholder="e.g., Sarah Johnson"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#a0a0b0] mb-2">Role / Job Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.role || ''}
                    onChange={(e) => handleChange('role', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-xl text-white text-sm focus:outline-none focus:border-[#7727ff]"
                    placeholder="e.g., Lead Systems Architect"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#a0a0b0] mb-2">Bio</label>
                <textarea
                  value={formData.bio || ''}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-xl text-white text-sm focus:outline-none focus:border-[#7727ff]"
                  placeholder="Short professional biography"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#a0a0b0] mb-2">Sort Order</label>
                  <input
                    type="number"
                    value={formData.sort_order ?? 0}
                    onChange={(e) => handleChange('sort_order', parseInt(e.target.value))}
                    className="w-full px-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-xl text-white text-sm focus:outline-none focus:border-[#7727ff]"
                  />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active ?? true}
                      onChange={(e) => handleChange('is_active', e.target.checked)}
                      className="rounded border-[#2a2a35] text-[#7727ff] focus:ring-0"
                    />
                    <span className="text-sm font-medium text-white">Active Member</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* FAQS FORM */}
          {modalType === 'faqs' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#a0a0b0] mb-2">Question *</label>
                <input
                  type="text"
                  required
                  value={formData.question || ''}
                  onChange={(e) => handleChange('question', e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-xl text-white text-sm focus:outline-none focus:border-[#7727ff]"
                  placeholder="e.g., Who owns the code after delivery?"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#a0a0b0] mb-2">Answer *</label>
                <textarea
                  required
                  value={formData.answer || ''}
                  onChange={(e) => handleChange('answer', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-xl text-white text-sm focus:outline-none focus:border-[#7727ff]"
                  placeholder="Detailed answer for clients..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#a0a0b0] mb-2">Category</label>
                  <select
                    value={formData.category || faqCategories[0]}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-xl text-white text-sm focus:outline-none focus:border-[#7727ff]"
                  >
                    {faqCategories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#a0a0b0] mb-2">Sort Order</label>
                  <input
                    type="number"
                    value={formData.sort_order ?? 0}
                    onChange={(e) => handleChange('sort_order', parseInt(e.target.value))}
                    className="w-full px-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-xl text-white text-sm focus:outline-none focus:border-[#7727ff]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#2a2a35] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2.5 rounded-xl border border-[#2a2a35] text-xs font-semibold text-[#a0a0b0] hover:text-white hover:bg-[#1a1a24] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7727ff] to-[#6417ed] hover:shadow-lg hover:shadow-purple-500/20 text-xs font-semibold text-white transition-all"
            >
              <Save size={15} />
              <span>{editingItem ? 'Save Changes' : 'Create Item'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
