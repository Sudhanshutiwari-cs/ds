'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'
import {
  Project,
  MediaAsset,
  SiteSettings,
  SETTING_KEYS
} from './types'

// Admin credentials
export const ADMIN_EMAIL = 'admin@dssoftwares.in'
export const ADMIN_PASSWORD = 'ADMIN1239'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

interface AdminContextType {
  // Auth
  isAuthenticated: boolean
  loginEmail: string
  setLoginEmail: (val: string) => void
  loginPassword: string
  setLoginPassword: (val: string) => void
  showPassword: boolean
  setShowPassword: (val: boolean) => void
  loginError: string
  isLoggingIn: boolean
  handleLogin: (e: React.FormEvent) => Promise<void>
  handleLogout: () => void

  // Data
  projects: Project[]
  services: any[]
  testimonials: any[]
  blogPosts: any[]
  contacts: any[]
  teamMembers: any[]
  faqs: any[]
  mediaAssets: MediaAsset[]
  siteSettings: SiteSettings | null
  newContactsCount: number
  loading: boolean
  isRefreshing: boolean
  error: string | null
  success: string | null
  setError: (val: string | null) => void
  setSuccess: (val: string | null) => void
  fetchAllData: () => Promise<void>
  refreshData: () => Promise<void>

  // Modals & Item Actions
  showModal: boolean
  setShowModal: (val: boolean) => void
  modalType: string
  editingItem: any
  openCreateModal: (type: string) => void
  openEditModal: (type: string, item: any) => void
  closeModal: () => void
  handleSaveItem: (data: any) => Promise<void>
  handleDelete: (type: string, id: string) => Promise<void>
  handleStatusChange: (contactId: string, newStatus: string) => Promise<void>

  // UI state
  sidebarOpen: boolean
  setSidebarOpen: (val: boolean) => void
  commandPaletteOpen: boolean
  setCommandPaletteOpen: (val: boolean) => void
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: React.ReactNode }) {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  // Feedback and UI
  const [loading, setLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)

  // Data states
  const [projects, setProjects] = useState<Project[]>([])
  const [services, setServices] = useState<any[]>([])
  const [testimonials, setTestimonials] = useState<any[]>([])
  const [blogPosts, setBlogPosts] = useState<any[]>([])
  const [contacts, setContacts] = useState<any[]>([])
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [faqs, setFAQs] = useState<any[]>([])
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([])
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null)

  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<string>('')
  const [editingItem, setEditingItem] = useState<any>(null)

  // Check existing auth on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const authStatus = sessionStorage.getItem('ds_admin_auth')
      if (authStatus === 'true') {
        setIsAuthenticated(true)
      }
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setIsLoggingIn(true)

    await new Promise(resolve => setTimeout(resolve, 600))

    if (loginEmail === ADMIN_EMAIL && loginPassword === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('ds_admin_auth', 'true')
      }
      setSuccess('Login successful! Welcome back.')
      setTimeout(() => setSuccess(null), 3000)
    } else {
      setLoginError('Invalid email or password. Please try again.')
    }

    setIsLoggingIn(false)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('ds_admin_auth')
    }
    setLoginEmail('')
    setLoginPassword('')
    setLoginError('')
    setSidebarOpen(false)
  }

  const fetchAllData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [projectsRes, servicesRes, testimonialsRes, blogRes, contactsRes, teamRes, faqsRes, settingsRes] = await Promise.all([
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('services').select('*').order('sort_order'),
        supabase.from('testimonials').select('*').order('created_at', { ascending: false }),
        supabase.from('blog_posts').select('*').order('created_at', { ascending: false }),
        supabase.from('contact_submissions').select('*').order('created_at', { ascending: false }),
        supabase.from('team_members').select('*').order('sort_order'),
        supabase.from('faqs').select('*').order('sort_order'),
        supabase.from('site_settings').select('*').eq('is_active', true),
      ])

      setProjects(projectsRes.data || [])
      setServices(servicesRes.data || [])
      setTestimonials(testimonialsRes.data || [])
      setBlogPosts(blogRes.data || [])
      setContacts(contactsRes.data || [])
      setTeamMembers(teamRes.data || [])
      setFAQs(faqsRes.data || [])

      if (settingsRes.data && settingsRes.data.length > 0) {
        const parsedSettings: SiteSettings = {
          site_name: '',
          site_description: '',
          contact_email: '',
          contact_phone: '',
          address: '',
          social_links: {},
          seo_settings: {
            meta_title: '',
            meta_description: '',
            google_analytics_id: ''
          }
        }

        settingsRes.data.forEach((item: any) => {
          if (item.setting_key === SETTING_KEYS.SITE_INFO && item.setting_value) {
            parsedSettings.site_name = item.setting_value.name || ''
            parsedSettings.site_description = item.setting_value.description || ''
          } else if (item.setting_key === SETTING_KEYS.CONTACT_INFO && item.setting_value) {
            parsedSettings.contact_email = item.setting_value.email || ''
            parsedSettings.contact_phone = item.setting_value.phone || ''
            parsedSettings.address = item.setting_value.address || ''
          } else if (item.setting_key === SETTING_KEYS.SOCIAL_LINKS && item.setting_value) {
            parsedSettings.social_links = item.setting_value || {}
          } else if (item.setting_key === SETTING_KEYS.SEO_SETTINGS && item.setting_value) {
            parsedSettings.seo_settings = item.setting_value || {}
          }
        })

        setSiteSettings(parsedSettings)
      }
    } catch (err: any) {
      console.error('Error fetching admin data:', err)
      setError('Failed to fetch data from Supabase. Working in offline mode.')
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshData = async () => {
    setIsRefreshing(true)
    await fetchAllData()
    setIsRefreshing(false)
    setSuccess('Data synchronized successfully!')
    setTimeout(() => setSuccess(null), 3000)
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData()
    }
  }, [isAuthenticated, fetchAllData])

  const newContactsCount = useMemo(() => {
    return contacts.filter((c: any) => !c.is_read).length
  }, [contacts])

  // Modals
  const openCreateModal = (type: string) => {
    setModalType(type)
    setEditingItem(null)
    setShowModal(true)
  }

  const openEditModal = (type: string, item: any) => {
    setModalType(type)
    setEditingItem(item)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingItem(null)
    setModalType('')
  }

  const handleSaveItem = async (formData: any) => {
    try {
      const tableName = modalType === 'projects' ? 'projects' :
        modalType === 'services' ? 'services' :
        modalType === 'testimonials' ? 'testimonials' :
        modalType === 'blog' || modalType === 'blog_posts' ? 'blog_posts' :
        modalType === 'team' || modalType === 'team_members' ? 'team_members' :
        modalType === 'faqs' ? 'faqs' : ''

      if (!tableName) return

      if (editingItem?.id) {
        const { error: updateError } = await supabase
          .from(tableName)
          .update(formData)
          .eq('id', editingItem.id)

        if (updateError) throw updateError
        setSuccess('Item updated successfully!')
      } else {
        const { error: insertError } = await supabase
          .from(tableName)
          .insert([formData])

        if (insertError) throw insertError
        setSuccess('Item created successfully!')
      }

      closeModal()
      fetchAllData()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      console.error('Error saving item:', err)
      setError(err.message || 'Failed to save changes.')
      setTimeout(() => setError(null), 4000)
    }
  }

  const handleDelete = async (type: string, id: string) => {
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) return
    try {
      const tableName = type === 'projects' ? 'projects' :
        type === 'services' ? 'services' :
        type === 'testimonials' ? 'testimonials' :
        type === 'blog' || type === 'blog_posts' ? 'blog_posts' :
        type === 'contacts' || type === 'contact_submissions' ? 'contact_submissions' :
        type === 'team' || type === 'team_members' ? 'team_members' :
        type === 'faqs' ? 'faqs' : ''

      if (!tableName) return

      const { error: delError } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id)

      if (delError) throw delError
      setSuccess('Item deleted successfully!')
      fetchAllData()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      console.error('Error deleting item:', err)
      setError(err.message || 'Failed to delete item.')
      setTimeout(() => setError(null), 4000)
    }
  }

  const handleStatusChange = async (contactId: string, newStatus: string) => {
    try {
      const { error: statusError } = await supabase
        .from('contact_submissions')
        .update({ status: newStatus, is_read: true })
        .eq('id', contactId)

      if (statusError) throw statusError
      setSuccess('Contact status updated!')
      fetchAllData()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      console.error('Error updating status:', err)
      setError('Failed to update contact status.')
      setTimeout(() => setError(null), 4000)
    }
  }

  return (
    <AdminContext.Provider
      value={{
        isAuthenticated,
        loginEmail,
        setLoginEmail,
        loginPassword,
        setLoginPassword,
        showPassword,
        setShowPassword,
        loginError,
        isLoggingIn,
        handleLogin,
        handleLogout,
        projects,
        services,
        testimonials,
        blogPosts,
        contacts,
        teamMembers,
        faqs,
        mediaAssets,
        siteSettings,
        newContactsCount,
        loading,
        isRefreshing,
        error,
        success,
        setError,
        setSuccess,
        fetchAllData,
        refreshData,
        showModal,
        setShowModal,
        modalType,
        editingItem,
        openCreateModal,
        openEditModal,
        closeModal,
        handleSaveItem,
        handleDelete,
        handleStatusChange,
        sidebarOpen,
        setSidebarOpen,
        commandPaletteOpen,
        setCommandPaletteOpen
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}
