'use client'

import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, Loader2, Mail, MapPin, Phone } from 'lucide-react'
import { FormEvent, useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const projectTypes = ['Website', 'Custom software', 'Branding & UI/UX', 'Social media', 'Other']

const budgetRanges = [
  'Under ₹50,000',
  '₹50,000 – ₹1,00,000',
  '₹1,00,000 – ₹2,50,000',
  '₹2,50,000 – ₹5,00,000',
  '₹5,00,000 – ₹10,00,000',
  '₹10,00,000+',
  'Flexible / Not sure yet'
]

// Country codes with dial codes and validation patterns
const countryCodes = [
  { code: '+91', country: 'India', flag: '🇮🇳', pattern: /^[6-9]\d{9}$/, placeholder: '98765 43210' },
  { code: '+1', country: 'US/Canada', flag: '🇺🇸', pattern: /^\d{10}$/, placeholder: '(555) 000-0000' },
  { code: '+44', country: 'UK', flag: '🇬🇧', pattern: /^\d{10}$/, placeholder: '7700 900123' },
  { code: '+61', country: 'Australia', flag: '🇦🇺', pattern: /^\d{9}$/, placeholder: '491 570 006' },
  { code: '+971', country: 'UAE', flag: '🇦🇪', pattern: /^\d{9}$/, placeholder: '50 123 4567' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬', pattern: /^\d{8}$/, placeholder: '8123 4567' },
  { code: '+49', country: 'Germany', flag: '🇩🇪', pattern: /^\d{10,11}$/, placeholder: '151 12345678' },
  { code: '+33', country: 'France', flag: '🇫🇷', pattern: /^\d{9}$/, placeholder: '6 12 34 56 78' },
  { code: '+81', country: 'Japan', flag: '🇯🇵', pattern: /^\d{10}$/, placeholder: '90 1234 5678' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷', pattern: /^\d{9,10}$/, placeholder: '10 1234 5678' },
  { code: '+86', country: 'China', flag: '🇨🇳', pattern: /^\d{11}$/, placeholder: '138 1234 5678' },
  { code: '+7', country: 'Russia', flag: '🇷🇺', pattern: /^\d{10}$/, placeholder: '912 345 6789' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷', pattern: /^\d{10,11}$/, placeholder: '11 91234 5678' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦', pattern: /^\d{9}$/, placeholder: '82 123 4567' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬', pattern: /^\d{10}$/, placeholder: '803 123 4567' },
  { code: '+971', country: 'Saudi Arabia', flag: '🇸🇦', pattern: /^\d{9}$/, placeholder: '50 123 4567' },
  { code: '+63', country: 'Philippines', flag: '🇵🇭', pattern: /^\d{10}$/, placeholder: '917 123 4567' },
  { code: '+64', country: 'New Zealand', flag: '🇳🇿', pattern: /^\d{9}$/, placeholder: '21 123 456' },
  { code: '+353', country: 'Ireland', flag: '🇮🇪', pattern: /^\d{9}$/, placeholder: '85 123 4567' },
  { code: '+31', country: 'Netherlands', flag: '🇳🇱', pattern: /^\d{9}$/, placeholder: '6 12345678' },
  { code: '+46', country: 'Sweden', flag: '🇸🇪', pattern: /^\d{9}$/, placeholder: '70 123 45 67' },
  { code: '+47', country: 'Norway', flag: '🇳🇴', pattern: /^\d{8}$/, placeholder: '912 34 567' },
  { code: '+45', country: 'Denmark', flag: '🇩🇰', pattern: /^\d{8}$/, placeholder: '12 34 56 78' },
  { code: '+358', country: 'Finland', flag: '🇫🇮', pattern: /^\d{9,10}$/, placeholder: '40 123 4567' },
  { code: '+48', country: 'Poland', flag: '🇵🇱', pattern: /^\d{9}$/, placeholder: '512 345 678' },
  { code: '+34', country: 'Spain', flag: '🇪🇸', pattern: /^\d{9}$/, placeholder: '612 34 56 78' },
  { code: '+39', country: 'Italy', flag: '🇮🇹', pattern: /^\d{9,10}$/, placeholder: '312 345 6789' },
  { code: '+30', country: 'Greece', flag: '🇬🇷', pattern: /^\d{10}$/, placeholder: '691 234 5678' },
  { code: '+90', country: 'Turkey', flag: '🇹🇷', pattern: /^\d{10}$/, placeholder: '532 123 4567' },
  { code: '+52', country: 'Mexico', flag: '🇲🇽', pattern: /^\d{10}$/, placeholder: '55 1234 5678' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷', pattern: /^\d{10}$/, placeholder: '11 1234 5678' },
  { code: '+56', country: 'Chile', flag: '🇨🇱', pattern: /^\d{9}$/, placeholder: '9 1234 5678' },
  { code: '+57', country: 'Colombia', flag: '🇨🇴', pattern: /^\d{10}$/, placeholder: '312 345 6789' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾', pattern: /^\d{9,10}$/, placeholder: '12 345 6789' },
  { code: '+66', country: 'Thailand', flag: '🇹🇭', pattern: /^\d{9}$/, placeholder: '81 234 5678' },
  { code: '+84', country: 'Vietnam', flag: '🇻🇳', pattern: /^\d{9,10}$/, placeholder: '912 345 678' },
  { code: '+62', country: 'Indonesia', flag: '🇮🇩', pattern: /^\d{9,11}$/, placeholder: '812 3456 7890' },
  { code: '+63', country: 'Pakistan', flag: '🇵🇰', pattern: /^\d{10}$/, placeholder: '312 3456789' },
  { code: '+880', country: 'Bangladesh', flag: '🇧🇩', pattern: /^\d{10}$/, placeholder: '1712 345678' },
  { code: '+94', country: 'Sri Lanka', flag: '🇱🇰', pattern: /^\d{9}$/, placeholder: '77 123 4567' },
  { code: '+977', country: 'Nepal', flag: '🇳🇵', pattern: /^\d{10}$/, placeholder: '984 1234567' },
  { code: '+960', country: 'Maldives', flag: '🇲🇻', pattern: /^\d{7}$/, placeholder: '771 2345' },
  { code: '+975', country: 'Bhutan', flag: '🇧🇹', pattern: /^\d{8}$/, placeholder: '17 123 456' },
  { code: '+92', country: 'Saudi Arabia', flag: '🇸🇦', pattern: /^\d{9}$/, placeholder: '50 123 4567' },
  { code: '+968', country: 'Oman', flag: '🇴🇲', pattern: /^\d{8}$/, placeholder: '9123 4567' },
  { code: '+965', country: 'Kuwait', flag: '🇰🇼', pattern: /^\d{8}$/, placeholder: '5123 4567' },
  { code: '+973', country: 'Bahrain', flag: '🇧🇭', pattern: /^\d{8}$/, placeholder: '3312 3456' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦', pattern: /^\d{8}$/, placeholder: '3312 3456' },
  { code: '+971', country: 'Dubai', flag: '🇦🇪', pattern: /^\d{9}$/, placeholder: '50 123 4567' },
  { code: '+20', country: 'Egypt', flag: '🇪🇬', pattern: /^\d{10}$/, placeholder: '100 123 4567' },
  { code: '+212', country: 'Morocco', flag: '🇲🇦', pattern: /^\d{9}$/, placeholder: '612 345 678' },
  { code: '+216', country: 'Tunisia', flag: '🇹🇳', pattern: /^\d{8}$/, placeholder: '22 123 456' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪', pattern: /^\d{9}$/, placeholder: '712 345 678' },
  { code: '+255', country: 'Tanzania', flag: '🇹🇿', pattern: /^\d{9}$/, placeholder: '712 345 678' },
  { code: '+256', country: 'Uganda', flag: '🇺🇬', pattern: /^\d{9}$/, placeholder: '712 345 678' },
  { code: '+233', country: 'Ghana', flag: '🇬🇭', pattern: /^\d{9}$/, placeholder: '24 123 4567' },
  { code: '+234', country: 'Ethiopia', flag: '🇪🇹', pattern: /^\d{9}$/, placeholder: '91 123 4567' },
]

type ContactFormData = {
  name: string
  email: string
  company: string
  phone_country_code: string
  phone: string
  project_type: string
  budget_range: string
  message: string
}

type PhoneValidation = {
  isValid: boolean
  error: string
}

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submissionId, setSubmissionId] = useState<string | null>(null)
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0])
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [selectedProjectType, setSelectedProjectType] = useState<string>('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const serviceParam = params.get('service')
      if (serviceParam && projectTypes.includes(serviceParam)) {
        setSelectedProjectType(serviceParam)
      }
    }
  }, [])

  function validatePhoneNumber(phone: string, countryCode: string): PhoneValidation {
    const country = countryCodes.find(c => c.code === countryCode)
    if (!country) {
      return { isValid: false, error: 'Invalid country code' }
    }

    // Remove all non-digit characters for validation
    const digitsOnly = phone.replace(/\D/g, '')
    
    if (digitsOnly.length === 0) {
      return { isValid: false, error: 'Phone number is required' }
    }

    if (!country.pattern.test(digitsOnly)) {
      return { 
        isValid: false, 
        error: `Invalid ${country.country} phone number format. Expected: ${country.placeholder}` 
      }
    }

    return { isValid: true, error: '' }
  }

  function formatPhoneNumber(phone: string, countryCode: string): string {
    // Store the raw phone number without formatting
    return phone.replace(/\D/g, '')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setPhoneError(null)

    const formData = new FormData(event.currentTarget)
    const phoneRaw = (formData.get('phone') as string) || ''
    
    // Validate phone number
    const phoneValidation = validatePhoneNumber(phoneRaw, selectedCountry.code)
    if (!phoneValidation.isValid) {
      setPhoneError(phoneValidation.error)
      setIsSubmitting(false)
      return
    }

    // Format phone number for storage (digits only)
    const formattedPhone = formatPhoneNumber(phoneRaw, selectedCountry.code)
    
    const contactData: ContactFormData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      company: formData.get('company') as string,
      phone_country_code: selectedCountry.code,
      phone: formattedPhone,
      project_type: formData.get('projectType') as string,
      budget_range: formData.get('budget') as string,
      message: formData.get('message') as string,
    }

    try {
      // Get client IP and user agent
      const ipResponse = await fetch('https://api.ipify.org?format=json')
      const ipData = await ipResponse.json()
      const userAgent = navigator.userAgent

      // Insert into contact_submissions table
      const { data, error: insertError } = await supabase
        .from('contact_submissions')
        .insert({
          name: contactData.name,
          email: contactData.email,
          company: contactData.company,
          phone_country_code: contactData.phone_country_code,
          phone: contactData.phone,
          project_type: contactData.project_type,
          budget_range: contactData.budget_range,
          message: contactData.message,
          status: 'new',
          is_read: false,
          ip_address: ipData.ip,
          user_agent: userAgent,
        })
        .select('id')
        .single()

      if (insertError) {
        throw new Error(insertError.message)
      }

      setSubmissionId(data.id)
      setSubmitted(true)
    } catch (err) {
      console.error('Error submitting contact form:', err)
      setError('There was an error submitting your inquiry. Please try again or email us directly.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#050506] font-sans text-[#f7f5ff] selection:bg-[#7727ff]">
      <header className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:h-24 sm:px-6 lg:px-8">
        <a href="/" aria-label="DS Softwares home" className="text-xl font-black tracking-[-0.04em] sm:text-2xl">
          <span className="text-[#7727ff]">DS</span>Softwares<span className="text-[#7727ff]">.</span>
        </a>
        <a href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#aaa6b5] transition-colors hover:text-[#f7f5ff]">
          <ArrowLeft size={17} /> Back home
        </a>
      </header>

      <section className="relative px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-16 lg:pt-24">
        <div aria-hidden="true" className="pointer-events-none absolute -right-48 top-0 h-[560px] w-[560px] rounded-full bg-[#5014b8] opacity-30 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl gap-14 lg:grid-cols-[.85fr_1.15fr] lg:gap-20">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#a77aff]">Start a project</p>
            <h1 className="mt-5 text-balance text-4xl font-black leading-[1.08] tracking-[-0.045em] min-[380px]:text-5xl sm:mt-6 sm:text-6xl">
              Tell us what you want to build.
            </h1>
            <p className="mt-7 max-w-lg text-pretty text-lg leading-relaxed text-[#c2becb]">
              Share the challenge, the idea, or the goal. We&apos;ll help you find the right way forward.
            </p>

            <div className="mt-12 flex flex-col gap-4">
              <a href="mailto:hello@dssoftwares.in" className="flex min-w-0 items-center gap-3 rounded-2xl border border-[#514d57] bg-[#111013] p-4 transition-colors hover:border-[#7727ff] sm:gap-4 sm:p-5">
                <span className="flex size-11 items-center justify-center rounded-xl bg-[#6417ed]">
                  <Mail size={20} />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-bold uppercase tracking-[0.14em] text-[#77727f]">Email</span>
                  <span className="mt-1 block break-all font-bold">hello@dssoftwares.in</span>
                </span>
              </a>
              <a href="tel:+919956688553" className="flex items-center gap-4 rounded-2xl border border-[#514d57] bg-[#111013] p-5 transition-colors hover:border-[#7727ff]">
                <span className="flex size-11 items-center justify-center rounded-xl bg-[#6417ed]">
                  <Phone size={20} />
                </span>
                <span>
                  <span className="block text-xs font-bold uppercase tracking-[0.14em] text-[#77727f]">Phone</span>
                  <span className="mt-1 block font-bold">+91 99566 88553</span>
                </span>
              </a>
              <div className="flex items-center gap-4 rounded-2xl border border-[#514d57] bg-[#111013] p-5">
                <span className="flex size-11 items-center justify-center rounded-xl bg-[#6417ed]">
                  <Clock3 size={20} />
                </span>
                <span>
                  <span className="block text-xs font-bold uppercase tracking-[0.14em] text-[#77727f]">Response time</span>
                  <span className="mt-1 block font-bold">Within one business day</span>
                </span>
              </div>
              <div className="flex items-center gap-4 rounded-2xl border border-[#514d57] bg-[#111013] p-5">
                <span className="flex size-11 items-center justify-center rounded-xl bg-[#6417ed]">
                  <MapPin size={20} />
                </span>
                <span>
                  <span className="block text-xs font-bold uppercase tracking-[0.14em] text-[#77727f]">Location</span>
                  <span className="mt-1 block font-bold">Working with clients worldwide</span>
                </span>
              </div>
            </div>

            <div className="mt-10 border-l-2 border-[#7727ff] pl-5">
              <p className="text-sm font-bold">What happens next?</p>
              <p className="mt-2 text-sm leading-relaxed text-[#aaa6b5]">
                We&apos;ll review your brief, follow up with any questions, and arrange a focused discovery call.
              </p>
            </div>
          </div>

          <div className="min-w-0 rounded-3xl border border-[#514d57] bg-[#111013] p-4 min-[380px]:p-5 sm:p-9">
            {submitted ? (
              <div role="status" className="flex min-h-[620px] flex-col items-center justify-center text-center">
                <span className="flex size-16 items-center justify-center rounded-full bg-[#6417ed]">
                  <CheckCircle2 size={32} />
                </span>
                <h2 className="mt-7 text-3xl font-black tracking-tight">Your inquiry is ready.</h2>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-[#aaa6b5]">
                  Thank you for reaching out! We&apos;ve received your inquiry and will get back to you within one business day.
                  {submissionId && (
                    <span className="mt-2 block text-xs text-[#77727f]">
                      Reference ID: {submissionId.slice(0, 8)}
                    </span>
                  )}
                </p>
                <button 
                  type="button" 
                  onClick={() => {
                    setSubmitted(false)
                    setSubmissionId(null)
                    setError(null)
                  }} 
                  className="mt-8 rounded-lg border border-[#716d78] px-6 py-3 text-sm font-bold hover:border-[#f7f5ff]"
                >
                  Create another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-3 min-[420px]:flex-row min-[420px]:items-end min-[420px]:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a5cff]">Project inquiry</p>
                    <h2 className="mt-2 text-xl font-black min-[380px]:text-2xl">A few details to get started.</h2>
                  </div>
                  <span className="text-xs text-[#77727f]">All fields required unless marked optional</span>
                </div>

                {error && (
                  <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                    {error}
                  </div>
                )}

                <div className="mt-8 grid gap-5 sm:grid-cols-2">
                  <label className="flex flex-col gap-2 text-sm font-bold">
                    Your name
                    <input 
                      required 
                      name="name" 
                      autoComplete="name" 
                      className="rounded-xl border border-[#514d57] bg-[#09080b] px-4 py-3.5 text-base font-normal outline-none transition-colors placeholder:text-[#77727f] focus:border-[#9a5cff]" 
                      placeholder="Jane Smith" 
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm font-bold">
                    Work email
                    <input 
                      required 
                      type="email" 
                      name="email" 
                      autoComplete="email" 
                      className="rounded-xl border border-[#514d57] bg-[#09080b] px-4 py-3.5 text-base font-normal outline-none transition-colors placeholder:text-[#77727f] focus:border-[#9a5cff]" 
                      placeholder="jane@company.com" 
                    />
                  </label>
                </div>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <label className="flex flex-col gap-2 text-sm font-bold">
                    Company name
                    <input 
                      required 
                      name="company" 
                      autoComplete="organization" 
                      className="rounded-xl border border-[#514d57] bg-[#09080b] px-4 py-3.5 text-base font-normal outline-none transition-colors placeholder:text-[#77727f] focus:border-[#9a5cff]" 
                      placeholder="Your company" 
                    />
                  </label>
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-bold">
                      Phone <span className="text-xs font-normal text-[#77727f]">(optional)</span>
                    </span>
                    <div className="flex gap-2">
                      <select
                        name="phone_country_code"
                        value={selectedCountry.code}
                        onChange={(e) => {
                          const country = countryCodes.find(c => c.code === e.target.value)
                          setSelectedCountry(country || countryCodes[0])
                          setPhoneError(null)
                        }}
                        className="w-[120px] rounded-xl border border-[#514d57] bg-[#09080b] px-3 py-3.5 text-base font-normal outline-none transition-colors focus:border-[#9a5cff]"
                      >
                        {countryCodes.map((country) => (
                          <option key={country.code + country.country} value={country.code}>
                            {country.flag} {country.code}
                          </option>
                        ))}
                      </select>
                      <input 
                        type="tel" 
                        name="phone" 
                        autoComplete="tel" 
                        placeholder={selectedCountry.placeholder}
                        onChange={() => setPhoneError(null)}
                        className={`flex-1 rounded-xl border bg-[#09080b] px-4 py-3.5 text-base font-normal outline-none transition-colors placeholder:text-[#77727f] focus:border-[#9a5cff] ${
                          phoneError ? 'border-red-500' : 'border-[#514d57]'
                        }`}
                      />
                    </div>
                    {phoneError && (
                      <span className="text-xs text-red-400">{phoneError}</span>
                    )}
                    {!phoneError && (
                      <span className="text-xs text-[#77727f]">
                        {selectedCountry.country}: {selectedCountry.placeholder}
                      </span>
                    )}
                  </div>
                </div>

                <fieldset className="mt-6">
                  <legend className="text-sm font-bold">What can we help with?</legend>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {projectTypes.map((type) => (
                      <label key={type} className="cursor-pointer">
                        <input 
                          required 
                          type="radio" 
                          name="projectType" 
                          value={type} 
                          checked={selectedProjectType === type}
                          onChange={() => setSelectedProjectType(type)}
                          className="peer sr-only" 
                        />
                        <span className="block rounded-full border border-[#514d57] px-4 py-2.5 text-sm font-medium text-[#aaa6b5] transition-colors peer-checked:border-[#9a5cff] peer-checked:bg-[#6417ed] peer-checked:text-[#f7f5ff]">
                          {type}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <label className="mt-6 flex flex-col gap-2 text-sm font-bold">
                  Estimated budget (INR - ₹)
                  <select 
                    required 
                    name="budget" 
                    defaultValue="" 
                    className="rounded-xl border border-[#514d57] bg-[#09080b] px-4 py-3.5 text-base font-normal outline-none transition-colors focus:border-[#9a5cff]"
                  >
                    <option value="" disabled>Select a range</option>
                    {budgetRanges.map((range) => (
                      <option key={range} value={range}>{range}</option>
                    ))}
                  </select>
                </label>

                <label className="mt-5 flex flex-col gap-2 text-sm font-bold">
                  Tell us about your project
                  <textarea 
                    required 
                    name="message" 
                    rows={5} 
                    className="resize-y rounded-xl border border-[#514d57] bg-[#09080b] px-4 py-3.5 text-base font-normal leading-relaxed outline-none transition-colors placeholder:text-[#77727f] focus:border-[#9a5cff]" 
                    placeholder="What are you building, who is it for, and what does success look like?" 
                  />
                </label>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#6417ed] px-7 py-4 text-sm font-bold transition-colors hover:bg-[#7727ff] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9a5cff] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit inquiry <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <p className="mt-4 text-center text-xs leading-relaxed text-[#77727f]">
                  Your information is securely stored and will only be used to respond to your inquiry.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
       <footer className="border-t border-[#211d27] bg-[#09080b] px-4 py-12 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col justify-between gap-8 border-b border-[#211d27] pb-10 sm:gap-10 sm:pb-12 lg:flex-row lg:items-end">
              <div className="max-w-xl">
                <a href="/" aria-label="DS Softwares home" className="text-2xl font-black tracking-[-0.04em]"><span className="text-[#7727ff]">DS</span>Softwares<span className="text-[#7727ff]">.</span></a>
                <h2 className="mt-5 text-balance text-2xl font-black tracking-tight min-[380px]:text-3xl sm:mt-6 sm:text-4xl">Digital work that earns attention and drives growth.</h2>
                <p className="mt-4 max-w-lg text-sm leading-relaxed text-[#aaa6b5]">Strategy, design, development, social media, and long-term support—all from one accountable team.</p>
              </div>
              <a href="/contact" className="inline-flex w-full items-center justify-center rounded-lg bg-[#6417ed] px-7 py-4 text-sm font-bold transition-colors hover:bg-[#7727ff] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9a5cff] sm:w-fit">Start a project →</a>
            </div>
            <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
              <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a5cff]">Services</p><div className="mt-5 flex flex-col gap-3 text-sm text-[#aaa6b5]"><a className="hover:text-[#f7f5ff]" href="/services#custom-software">Custom software</a><a className="hover:text-[#f7f5ff]" href="/services#ai-automation">AI & Automation</a><a className="hover:text-[#f7f5ff]" href="/services#web-mobile-apps">Web & Mobile Apps</a><a className="hover:text-[#f7f5ff]" href="/services#branding-uiux">Branding & UI/UX</a><a className="hover:text-[#f7f5ff]" href="/services#social-media-growth">Social media</a></div></div>
              <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a5cff]">Company</p><div className="mt-5 flex flex-col gap-3 text-sm text-[#aaa6b5]"><a className="hover:text-[#f7f5ff]" href="/about">About us</a><a className="hover:text-[#f7f5ff]" href="/#work">Our work</a><a className="hover:text-[#f7f5ff]" href="/contact">Contact us</a></div></div>
              <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a5cff]">Legal</p><div className="mt-5 flex flex-col gap-3 text-sm text-[#aaa6b5]"><a className="hover:text-[#f7f5ff]" href="/privacy-policy">Privacy policy</a><a className="hover:text-[#f7f5ff]" href="/terms-and-conditions">Terms & conditions</a></div></div>
              <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a5cff]">Get in touch</p><div className="mt-5 flex flex-col gap-3 text-sm text-[#aaa6b5]"><a className="break-all hover:text-[#f7f5ff]" href="mailto:hello@dssoftwares.in">hello@dssoftwares.in</a><a className="hover:text-[#f7f5ff]" href="tel:+919956688553">+91 99566 88553</a><p>Available worldwide</p><p>Mon–Fri · 9:00–18:00</p></div></div>
            </div>
            <div className="flex flex-col justify-between gap-3 border-t border-[#211d27] pt-7 text-xs text-[#77727f] sm:flex-row"><p>© 2026 DS Softwares. All rights reserved.</p><p>Websites · Software · Social Media · Branding</p></div>
          </div>
        </footer>
    </main>
  )
}