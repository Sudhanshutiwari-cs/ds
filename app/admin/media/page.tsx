'use client'

import React, { useState, useRef } from 'react'
import {
  Camera,
  Upload,
  Grid,
  List,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  ImageIcon,
  FileText,
  Loader2
} from 'lucide-react'
import { useAdmin, supabase } from '@/components/admin/AdminContext'
import { bucketNames } from '@/components/admin/types'

export default function AdminMediaPage() {
  const { setSuccess, setError } = useAdmin()

  const [activeBucket, setActiveBucket] = useState(bucketNames[0])
  const [mediaView, setMediaView] = useState<'grid' | 'list'>('grid')
  const [files, setFiles] = useState<any[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (!selectedFiles || selectedFiles.length === 0) return

    setIsUploading(true)
    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        const filePath = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`

        const { error: uploadError } = await supabase.storage
          .from(activeBucket)
          .upload(filePath, file)

        if (uploadError) {
          console.warn('Upload warning:', uploadError)
        }
      }

      setSuccess('Files uploaded to bucket successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to upload files')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#131318] p-5 rounded-2xl border border-[#2a2a35]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white">Media Library</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#7727ff]/20 text-[#a77aff] border border-[#7727ff]/30">
              Storage Buckets
            </span>
          </div>
          <p className="text-sm text-[#a0a0b0] mt-1">
            Upload and organize media assets, portfolio screenshots, and brand graphics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#1a1a24] p-1 rounded-xl border border-[#2a2a35]">
            <button
              onClick={() => setMediaView('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                mediaView === 'grid' ? 'bg-[#7727ff] text-white' : 'text-[#a0a0b0] hover:text-white'
              }`}
              title="Grid View"
            >
              <Grid size={15} />
            </button>
            <button
              onClick={() => setMediaView('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                mediaView === 'list' ? 'bg-[#7727ff] text-white' : 'text-[#a0a0b0] hover:text-white'
              }`}
              title="List View"
            >
              <List size={15} />
            </button>
          </div>

          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#7727ff] to-[#6417ed] rounded-xl hover:shadow-lg hover:shadow-purple-500/30 text-sm font-medium text-white transition-all disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload size={16} />
                <span>Upload Media</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bucket Selector Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {bucketNames.map((bucket) => (
          <button
            key={bucket}
            onClick={() => setActiveBucket(bucket)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
              activeBucket === bucket
                ? 'bg-gradient-to-r from-[#7727ff] to-[#6417ed] text-white shadow-md shadow-purple-500/20'
                : 'bg-[#131318] text-[#a0a0b0] hover:bg-[#1a1a24] hover:text-white border border-[#2a2a35]'
            }`}
          >
            {bucket}
          </button>
        ))}
      </div>

      {/* Upload Dropzone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-[#2a2a35] hover:border-[#7727ff] rounded-3xl p-10 text-center cursor-pointer transition-colors bg-[#131318]/50 hover:bg-[#131318] group"
      >
        <div className="size-14 rounded-2xl bg-[#7727ff]/10 text-[#a77aff] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
          <Upload size={24} />
        </div>
        <h3 className="text-base font-semibold text-white">Click to upload files into `{activeBucket}`</h3>
        <p className="text-xs text-[#a0a0b0] mt-1 max-w-sm mx-auto">
          Supports PNG, JPG, WEBP, SVG, MP4, and PDF documents. Files are stored directly in Supabase Storage.
        </p>
      </div>

      {/* Empty State / Assets Preview */}
      <div className="bg-[#131318] rounded-2xl border border-[#2a2a35] p-8 text-center text-[#808090]">
        <ImageIcon size={40} className="mx-auto mb-3 opacity-40" />
        <p className="text-sm font-medium text-white">Bucket `{activeBucket}` Connected</p>
        <p className="text-xs text-[#808090] mt-1">
          Files uploaded here can be attached to project case studies, client proposals, and site branding.
        </p>
      </div>
    </div>
  )
}
