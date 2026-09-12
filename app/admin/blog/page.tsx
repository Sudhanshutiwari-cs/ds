'use client'

import React, { useState } from 'react'
import {
  Newspaper,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Calendar
} from 'lucide-react'
import { useAdmin } from '@/components/admin/AdminContext'
import { blogCategories } from '@/components/admin/types'

export default function AdminBlogPage() {
  const { blogPosts, openCreateModal, openEditModal, handleDelete } = useAdmin()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const filteredPosts = blogPosts.filter((post: any) => {
    const matchesStatus = statusFilter === 'ALL' || post.status === statusFilter
    if (!matchesStatus) return false
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      post.title?.toLowerCase().includes(term) ||
      post.slug?.toLowerCase().includes(term) ||
      post.category?.toLowerCase().includes(term)
    )
  })

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#131318] p-5 rounded-2xl border border-[#2a2a35]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white">Blog Posts & Articles</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#7727ff]/20 text-[#a77aff] border border-[#7727ff]/30">
              {blogPosts.length} Total
            </span>
          </div>
          <p className="text-sm text-[#a0a0b0] mt-1">
            Publish engineering insights, case studies, and company announcements
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a0a0b0]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search articles..."
              className="w-full pl-9 pr-3 py-2 bg-[#1a1a24] border border-[#2a2a35] rounded-xl text-sm focus:outline-none focus:border-[#7727ff] text-white placeholder-[#606070]"
            />
          </div>

          <button
            onClick={() => openCreateModal('blog')}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#7727ff] to-[#6417ed] rounded-xl hover:shadow-lg hover:shadow-purple-500/30 text-sm font-medium text-white transition-all"
          >
            <Plus size={16} />
            New Post
          </button>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2">
        {['ALL', 'published', 'draft', 'scheduled'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all capitalize ${
              statusFilter === status
                ? 'bg-gradient-to-r from-[#7727ff] to-[#6417ed] text-white shadow-md shadow-purple-500/20'
                : 'bg-[#131318] text-[#a0a0b0] hover:bg-[#1a1a24] hover:text-white border border-[#2a2a35]'
            }`}
          >
            {status} ({status === 'ALL' ? blogPosts.length : blogPosts.filter(b => b.status === status).length})
          </button>
        ))}
      </div>

      {/* Posts Table */}
      {blogPosts.length === 0 ? (
        <div className="bg-[#131318] rounded-2xl border border-[#2a2a35] p-12 text-center">
          <Newspaper size={48} className="mx-auto text-[#a0a0b0] mb-4 opacity-50" />
          <p className="text-lg font-medium text-white">No blog posts yet</p>
          <p className="text-sm text-[#a0a0b0] mt-1 mb-6">Write your first article to share insights with clients.</p>
          <button
            onClick={() => openCreateModal('blog')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#7727ff] to-[#6417ed] rounded-xl text-sm font-medium text-white hover:shadow-lg hover:shadow-purple-500/30"
          >
            <Plus size={16} /> Create Post
          </button>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="bg-[#131318] rounded-2xl border border-[#2a2a35] p-10 text-center text-[#a0a0b0]">
          <Search size={32} className="mx-auto mb-2 opacity-50" />
          <p>No articles match your current search.</p>
        </div>
      ) : (
        <div className="bg-[#131318] rounded-2xl border border-[#2a2a35] overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#1a1a24]/50 border-b border-[#2a2a35]">
              <tr className="text-left text-xs font-semibold text-[#808095] uppercase tracking-wider">
                <th className="px-6 py-4">Title & Slug</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Views</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a35]">
              {filteredPosts.map((post: any) => (
                <tr key={post.id} className="hover:bg-[#1a1a24]/40 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-sm text-white group-hover:text-[#a77aff] transition-colors">{post.title}</p>
                    <p className="text-xs text-[#808090] font-mono mt-0.5">/{post.slug}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-0.5 text-[10px] font-semibold bg-[#7727ff]/15 text-[#a77aff] rounded-full border border-[#7727ff]/30">
                      {post.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-full capitalize ${
                      post.status === 'published' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      post.status === 'draft' ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30' :
                      'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-[#a0a0b0]">
                    <div className="flex items-center gap-1">
                      <Eye size={13} className="text-[#808095]" />
                      <span>{post.view_count || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-[#808090]">
                    <div className="flex items-center gap-1">
                      <Calendar size={13} />
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal('blog', post)}
                        className="p-1.5 rounded-lg bg-[#2a2a35] hover:bg-[#3a3a45] text-white transition-colors"
                        title="Edit Post"
                      >
                        <Edit size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete('blog', post.id)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                        title="Delete Post"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
