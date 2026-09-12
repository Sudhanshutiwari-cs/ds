'use client'

import React from 'react'
import {
  Quote,
  Plus,
  Star,
  Edit,
  Trash2,
  FolderKanban
} from 'lucide-react'
import { useAdmin } from '@/components/admin/AdminContext'

export default function AdminTestimonialsPage() {
  const { testimonials, projects, openCreateModal, openEditModal, handleDelete } = useAdmin()

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#131318] p-5 rounded-2xl border border-[#2a2a35]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white">Client Testimonials</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#7727ff]/20 text-[#a77aff] border border-[#7727ff]/30">
              {testimonials.length} Total
            </span>
          </div>
          <p className="text-sm text-[#a0a0b0] mt-1">
            Manage client quotes, star ratings, and social proof reviews
          </p>
        </div>

        <button
          onClick={() => openCreateModal('testimonials')}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#7727ff] to-[#6417ed] rounded-xl hover:shadow-lg hover:shadow-purple-500/30 text-sm font-medium text-white transition-all"
        >
          <Plus size={16} />
          New Testimonial
        </button>
      </div>

      {/* Testimonials Grid */}
      {testimonials.length === 0 ? (
        <div className="bg-[#131318] rounded-2xl border border-[#2a2a35] p-12 text-center">
          <Quote size={48} className="mx-auto text-[#a0a0b0] mb-4 opacity-50" />
          <p className="text-lg font-medium text-white">No testimonials yet</p>
          <p className="text-sm text-[#a0a0b0] mt-1 mb-6">
            Add quotes and feedback from clients you've collaborated with.
          </p>
          <button
            onClick={() => openCreateModal('testimonials')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#7727ff] to-[#6417ed] rounded-xl text-sm font-medium text-white hover:shadow-lg hover:shadow-purple-500/30"
          >
            <Plus size={16} /> Create Testimonial
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testimonials.map((testimonial: any) => {
            const linkedProject = projects.find(p => p.id === testimonial.project_id)

            return (
              <div
                key={testimonial.id}
                className="bg-[#131318] rounded-2xl border border-[#2a2a35] p-6 hover:border-[#7727ff]/50 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    {/* Stars */}
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={15}
                          className={star <= (testimonial.rating || 5) ? 'text-yellow-400' : 'text-[#2a2a35]'}
                          fill={star <= (testimonial.rating || 5) ? 'currentColor' : 'none'}
                        />
                      ))}
                    </div>

                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal('testimonials', testimonial)}
                        className="p-1.5 rounded-lg bg-[#2a2a35] hover:bg-[#3a3a45] text-white transition-colors"
                        title="Edit Review"
                      >
                        <Edit size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete('testimonials', testimonial.id)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                        title="Delete Review"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <blockquote className="text-sm text-[#c0c0d0] italic leading-relaxed mb-4">
                    "{testimonial.quote_text}"
                  </blockquote>
                </div>

                <div className="pt-4 border-t border-[#2a2a35]/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-full bg-gradient-to-br from-[#7727ff] to-[#6417ed] flex items-center justify-center font-bold text-white text-xs">
                      {testimonial.author_name?.charAt(0) || 'A'}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">{testimonial.author_name}</p>
                      <p className="text-[11px] text-[#808090]">
                        {testimonial.author_title || 'Client Partner'}
                      </p>
                    </div>
                  </div>

                  {linkedProject && (
                    <span className="flex items-center gap-1 text-[11px] text-[#a77aff] bg-[#7727ff]/10 px-2 py-0.5 rounded-md border border-[#7727ff]/20">
                      <FolderKanban size={11} />
                      <span className="truncate max-w-[120px]">{linkedProject.title}</span>
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
