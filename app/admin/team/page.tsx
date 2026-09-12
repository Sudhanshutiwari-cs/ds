'use client'

import React from 'react'
import {
  Users2,
  Plus,
  User,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { useAdmin } from '@/components/admin/AdminContext'

export default function AdminTeamPage() {
  const { teamMembers, openCreateModal, openEditModal, handleDelete } = useAdmin()

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#131318] p-5 rounded-2xl border border-[#2a2a35]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white">Team Members</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#7727ff]/20 text-[#a77aff] border border-[#7727ff]/30">
              {teamMembers.length} Total
            </span>
          </div>
          <p className="text-sm text-[#a0a0b0] mt-1">
            Manage agency leadership, staff profiles, roles, and bio information
          </p>
        </div>

        <button
          onClick={() => openCreateModal('team')}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#7727ff] to-[#6417ed] rounded-xl hover:shadow-lg hover:shadow-purple-500/30 text-sm font-medium text-white transition-all"
        >
          <Plus size={16} />
          New Team Member
        </button>
      </div>

      {/* Team Grid */}
      {teamMembers.length === 0 ? (
        <div className="bg-[#131318] rounded-2xl border border-[#2a2a35] p-12 text-center">
          <Users2 size={48} className="mx-auto text-[#a0a0b0] mb-4 opacity-50" />
          <p className="text-lg font-medium text-white">No team members added yet</p>
          <p className="text-sm text-[#a0a0b0] mt-1 mb-6">
            Add your team roster to build client trust on the agency website.
          </p>
          <button
            onClick={() => openCreateModal('team')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#7727ff] to-[#6417ed] rounded-xl text-sm font-medium text-white hover:shadow-lg hover:shadow-purple-500/30"
          >
            <Plus size={16} /> Add Team Member
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((member: any) => (
            <div
              key={member.id}
              className="bg-[#131318] rounded-2xl border border-[#2a2a35] p-6 hover:border-[#7727ff]/50 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-xl bg-gradient-to-br from-[#7727ff] to-[#6417ed] flex items-center justify-center font-bold text-white text-base shadow-lg shadow-purple-500/20">
                      {member.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-white group-hover:text-[#a77aff] transition-colors">
                        {member.name}
                      </h3>
                      <p className="text-xs text-[#a77aff] font-medium">{member.role}</p>
                    </div>
                  </div>

                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal('team', member)}
                      className="p-1.5 rounded-lg bg-[#2a2a35] hover:bg-[#3a3a45] text-white transition-colors"
                      title="Edit Profile"
                    >
                      <Edit size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete('team', member.id)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                      title="Delete Profile"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {member.bio ? (
                  <p className="text-xs text-[#c0c0d0] leading-relaxed line-clamp-3">
                    {member.bio}
                  </p>
                ) : (
                  <p className="text-xs text-[#505060] italic">No bio written</p>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-[#2a2a35]/60 flex items-center justify-between text-xs text-[#808090]">
                <span className="flex items-center gap-1 text-[11px] text-green-400">
                  <span className="size-1.5 rounded-full bg-green-400" /> Active
                </span>
                <span>Sort Order: #{member.sort_order ?? 0}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
