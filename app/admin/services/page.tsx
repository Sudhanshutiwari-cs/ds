'use client'

import React, { useState } from 'react'
import {
  Wrench,
  Plus,
  Search,
  ExternalLink,
  Edit,
  Trash2,
  ArrowUpRight
} from 'lucide-react'
import { useAdmin } from '@/components/admin/AdminContext'
import { serviceIconMap } from '@/components/admin/types'

export default function AdminServicesPage() {
  const { services, openCreateModal, openEditModal, handleDelete } = useAdmin()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredServices = services.filter((service: any) => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      service.name?.toLowerCase().includes(term) ||
      service.description?.toLowerCase().includes(term) ||
      service.icon?.toLowerCase().includes(term)
    )
  })

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#131318] p-5 rounded-2xl border border-[#2a2a35]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white">Services</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#7727ff]/20 text-[#a77aff] border border-[#7727ff]/30">
              {services.length} Total
            </span>
          </div>
          <p className="text-sm text-[#a0a0b0] mt-1">
            Manage public services catalog & offerings displayed on website
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a0a0b0]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search services..."
              className="w-full pl-9 pr-3 py-2 bg-[#1a1a24] border border-[#2a2a35] rounded-xl text-sm focus:outline-none focus:border-[#7727ff] text-white placeholder-[#606070]"
            />
          </div>

          <a
            href="/services"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1a1a24] hover:bg-[#252532] border border-[#2a2a35] rounded-xl text-xs font-medium text-[#a0a0b0] hover:text-white transition-all"
            title="Preview public services page"
          >
            <ExternalLink size={14} />
            <span>View Live Page</span>
          </a>

          <button
            onClick={() => openCreateModal('services')}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#7727ff] to-[#6417ed] rounded-xl hover:shadow-lg hover:shadow-purple-500/30 text-sm font-medium text-white transition-all"
          >
            <Plus size={16} />
            New Service
          </button>
        </div>
      </div>

      {/* Services Grid */}
      {services.length === 0 ? (
        <div className="bg-[#131318] rounded-2xl border border-[#2a2a35] p-12 text-center">
          <Wrench size={48} className="mx-auto text-[#a0a0b0] mb-4 opacity-50" />
          <p className="text-lg font-medium text-white">No services yet</p>
          <p className="text-sm text-[#a0a0b0] mt-1 mb-6">
            Create your first service offering to display on your public agency site.
          </p>
          <button
            onClick={() => openCreateModal('services')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#7727ff] to-[#6417ed] rounded-xl text-sm font-medium text-white hover:shadow-lg hover:shadow-purple-500/30"
          >
            <Plus size={16} /> Create Service
          </button>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="bg-[#131318] rounded-2xl border border-[#2a2a35] p-10 text-center text-[#a0a0b0]">
          <Search size={32} className="mx-auto mb-2 opacity-50" />
          <p>No services match "{searchTerm}"</p>
          <button onClick={() => setSearchTerm('')} className="mt-3 text-xs text-[#a77aff] hover:underline">
            Clear search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((service: any) => {
            const IconComp = (service.icon && serviceIconMap[service.icon]) || Wrench
            return (
              <div
                key={service.id}
                className="bg-[#131318] rounded-2xl border border-[#2a2a35] p-6 hover:border-[#7727ff]/50 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="size-11 rounded-xl bg-[#6417ed]/20 border border-[#7727ff]/30 text-[#a77aff] flex items-center justify-center shrink-0 shadow-[0_0_15px_#7727ff22]">
                        <IconComp size={22} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-base text-white group-hover:text-[#a77aff] transition-colors">
                          {service.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-mono text-[#a0a0b0]">
                            Icon: {service.icon || 'default'}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#2a2a35] text-[#a0a0b0]">
                            Order #{service.sort_order ?? 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal('services', service)}
                        className="p-2 rounded-lg bg-[#2a2a35] hover:bg-[#3a3a45] text-white transition-colors"
                        title="Edit Service"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete('services', service.id)}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                        title="Delete Service"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {service.description ? (
                    <p className="text-sm text-[#a0a0b0] line-clamp-3 leading-relaxed">
                      {service.description}
                    </p>
                  ) : (
                    <p className="text-xs text-[#505060] italic">No description provided</p>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-[#2a2a35]/60 flex items-center justify-between text-xs text-[#a0a0b0]">
                  <span className="flex items-center gap-1 text-[11px] text-green-400">
                    <span className="size-1.5 rounded-full bg-green-400 animate-pulse" /> Active on website
                  </span>
                  <a
                    href={`/services#${service.name?.toLowerCase().replace(/\s+/g, '-')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#a77aff] flex items-center gap-1 transition-colors"
                  >
                    View on page <ArrowUpRight size={12} />
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
