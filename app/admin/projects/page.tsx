'use client'

import React, { useState } from 'react'
import {
  FolderKanban,
  Plus,
  Search,
  ExternalLink,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react'
import { useAdmin } from '@/components/admin/AdminContext'
import { categories } from '@/components/admin/types'

export default function AdminProjectsPage() {
  const { projects, openCreateModal, openEditModal, handleDelete, handleSaveItem } = useAdmin()

  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredProjects = projects.filter((project: any) => {
    const matchesCategory = categoryFilter === 'ALL' || project.category === categoryFilter
    if (!matchesCategory) return false
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      project.title?.toLowerCase().includes(term) ||
      project.client_name?.toLowerCase().includes(term) ||
      project.hero_headline?.toLowerCase().includes(term)
    )
  })

  const togglePublish = async (project: any) => {
    await handleSaveItem({
      ...project,
      is_published: !project.is_published
    })
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#131318] p-5 rounded-2xl border border-[#2a2a35]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white">Portfolio Projects</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#7727ff]/20 text-[#a77aff] border border-[#7727ff]/30">
              {projects.length} Total
            </span>
          </div>
          <p className="text-sm text-[#a0a0b0] mt-1">
            Manage project case studies, client stories, metrics & deliverables
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a0a0b0]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search projects by title, client..."
              className="w-full pl-9 pr-3 py-2 bg-[#1a1a24] border border-[#2a2a35] rounded-xl text-sm focus:outline-none focus:border-[#7727ff] text-white placeholder-[#606070]"
            />
          </div>

          <a
            href="/projects"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1a1a24] hover:bg-[#252532] border border-[#2a2a35] rounded-xl text-xs font-medium text-[#a0a0b0] hover:text-white transition-all"
            title="Preview public projects page"
          >
            <ExternalLink size={14} />
            <span>View Live Page</span>
          </a>

          <button
            onClick={() => openCreateModal('projects')}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#7727ff] to-[#6417ed] rounded-xl hover:shadow-lg hover:shadow-purple-500/30 text-sm font-medium text-white transition-all"
          >
            <Plus size={16} />
            New Project
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <button
          onClick={() => setCategoryFilter('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
            categoryFilter === 'ALL'
              ? 'bg-gradient-to-r from-[#7727ff] to-[#6417ed] text-white shadow-md shadow-purple-500/20'
              : 'bg-[#131318] text-[#a0a0b0] hover:bg-[#1a1a24] hover:text-white border border-[#2a2a35]'
          }`}
        >
          All ({projects.length})
        </button>
        {categories.map((cat) => {
          const count = projects.filter((p: any) => p.category === cat).length
          if (count === 0) return null
          return (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                categoryFilter === cat
                  ? 'bg-gradient-to-r from-[#7727ff] to-[#6417ed] text-white shadow-md shadow-purple-500/20'
                  : 'bg-[#131318] text-[#a0a0b0] hover:bg-[#1a1a24] hover:text-white border border-[#2a2a35]'
              }`}
            >
              <span>{cat}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${categoryFilter === cat ? 'bg-white/20 text-white' : 'bg-[#2a2a35] text-[#808090]'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="bg-[#131318] rounded-2xl border border-[#2a2a35] p-12 text-center">
          <FolderKanban size={48} className="mx-auto text-[#a0a0b0] mb-4 opacity-50" />
          <p className="text-lg font-medium text-white">No projects yet</p>
          <p className="text-sm text-[#a0a0b0] mt-1 mb-6">
            Add case studies to showcase your agency's craftsmanship to prospective clients.
          </p>
          <button
            onClick={() => openCreateModal('projects')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#7727ff] to-[#6417ed] rounded-xl text-sm font-medium text-white hover:shadow-lg hover:shadow-purple-500/30"
          >
            <Plus size={16} /> Create Project
          </button>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-[#131318] rounded-2xl border border-[#2a2a35] p-10 text-center text-[#a0a0b0]">
          <Search size={32} className="mx-auto mb-2 opacity-50" />
          <p>No projects match your filter criteria</p>
          <button
            onClick={() => {
              setCategoryFilter('ALL')
              setSearchTerm('')
            }}
            className="mt-3 text-xs text-[#a77aff] hover:underline"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project: any) => (
            <div
              key={project.id}
              className="bg-[#131318] rounded-2xl border border-[#2a2a35] p-6 hover:border-[#7727ff]/50 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#7727ff]/15 text-[#a77aff] border border-[#7727ff]/30">
                    {project.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => togglePublish(project)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        project.is_published
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                      }`}
                      title={project.is_published ? 'Published (Click to Unpublish)' : 'Draft (Click to Publish)'}
                    >
                      {project.is_published ? <Eye size={13} /> : <EyeOff size={13} />}
                    </button>
                    <button
                      onClick={() => openEditModal('projects', project)}
                      className="p-1.5 rounded-lg bg-[#2a2a35] hover:bg-[#3a3a45] text-white transition-colors"
                      title="Edit Project"
                    >
                      <Edit size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete('projects', project.id)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-lg text-white group-hover:text-[#a77aff] transition-colors line-clamp-1">
                  {project.title}
                </h3>
                <p className="text-xs text-[#a0a0b0] mt-0.5">Client: {project.client_name}</p>

                {project.short_description && (
                  <p className="text-xs text-[#c0c0d0] mt-3 line-clamp-2 leading-relaxed">
                    {project.short_description}
                  </p>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-[#2a2a35]/60 flex items-center justify-between text-xs text-[#a0a0b0]">
                <span className={`flex items-center gap-1.5 text-[11px] ${project.is_published ? 'text-green-400' : 'text-yellow-400'}`}>
                  <span className={`size-1.5 rounded-full ${project.is_published ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`} />
                  {project.is_published ? 'Live on site' : 'Draft mode'}
                </span>

                {project.slug ? (
                  <a
                    href={`/projects/${project.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-white transition-colors text-xs text-[#a77aff]"
                  >
                    <span>View Case Study</span>
                    <ExternalLink size={12} />
                  </a>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
