'use client'

import Link from 'next/link'
import React, { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Phone, MapPin, Send, CheckCircle2, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { PrivacyNotice } from '@/components/ui/PrivacyNotice'
import { toast } from '@/components/ui/Toaster'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbJsonLd } from '@/lib/seo'
import { getDictionary, type Dictionary } from '@/lib/dictionaries'
import { pathFor, type Locale } from '@/lib/i18n'
import { ASSOCIATION_ADDRESS } from '@/lib/association'

type ContactDict = Dictionary['pages']['contact']

const EMAIL =
  process.env.NEXT_PUBLIC_ASSOCIATION_EMAIL || 'asso.afrique.est.et.ses.amis@outlook.fr'
const PHONE_DISPLAY = process.env.NEXT_PUBLIC_ASSOCIATION_PHONE || '06 05 67 59 11'

// Les messages de validation étant traduits, le schéma se construit à partir
// du dictionnaire plutôt que d'être figé au chargement du module.
const makeSchema = (t: ContactDict) =>
  z.object({
    name: z.string().min(2, t.errorName),
    email: z.string().email(t.errorEmail),
    phone: z.string().optional(),
    subject: z.string().min(3, t.errorSubject),
    message: z.string().min(10, t.errorMessage),
  })

type FormData = z.infer<ReturnType<typeof makeSchema>>

export function ContactPage({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale)
  const t = dict.pages.contact
  const homePath = pathFor('home', locale)

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const schema = useMemo(() => makeSchema(t), [t])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', phone: '', subject: '', message: '' },
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || t.errorGeneric)
      }

      setSuccess(true)
      toast({
        title: t.toastSuccessTitle,
        description: t.toastSuccessText,
        variant: 'success',
      })
      reset()
    } catch (err: any) {
      toast({
        title: t.toastErrorTitle,
        description: err.message || t.toastErrorText,
        variant: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const details = [
    { icon: Mail, label: t.emailLabel, value: EMAIL, href: `mailto:${EMAIL}` },
    { icon: Phone, label: t.phoneLabel, value: PHONE_DISPLAY, href: 'tel:+33605675911' },
    { icon: MapPin, label: t.addressLabel, value: ASSOCIATION_ADDRESS, href: null },
  ]

  return (
    <div className="min-h-screen">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: dict.nav.home, path: homePath },
          { name: t.breadcrumb, path: pathFor('contact', locale) },
        ])}
      />

      <section className="hero-bg py-16 md:py-24 relative overflow-hidden" aria-labelledby="contact-title">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary-100/40 -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
        <div className="container-custom relative">
          <nav aria-label={t.breadcrumb} className="mb-6">
            <ol className="flex items-center gap-2 text-sm text-warm-500">
              <li>
                <Link href={homePath} className="hover:text-primary-500 transition-colors">
                  {dict.nav.home}
                </Link>
              </li>
              <li><ChevronRight className="w-4 h-4 rtl:rotate-180" /></li>
              <li className="text-warm-700 font-medium">{t.breadcrumb}</li>
            </ol>
          </nav>

          <div className="max-w-3xl">
            <span className="section-badge bg-primary-50 text-primary-600">{t.badge}</span>
            <h1 id="contact-title" className="font-display font-black text-warm-900 mb-6">
              {t.titleBefore} <span className="gradient-text">{t.titleHighlight}</span>
            </h1>
            <p className="text-xl text-warm-600 leading-relaxed max-w-2xl">{t.subtitle}</p>
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Coordonnées */}
            <div className="lg:col-span-5 space-y-6">
              <h2 className="font-display font-black text-2xl text-warm-900">{t.detailsTitle}</h2>
              <p className="text-warm-600 mb-8 leading-relaxed">{t.detailsText}</p>

              <div className="space-y-4">
                {details.map((item) => (
                  <div
                    key={item.label}
                    className="p-5 border border-warm-100 rounded-2xl bg-warm-50/50 flex gap-4 items-start hover:border-primary-300 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white border border-warm-100 flex items-center justify-center text-primary-500 shrink-0 shadow-sm">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-warm-500 uppercase tracking-wider mb-1">
                        {item.label}
                      </p>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="font-bold text-warm-900 text-base hover:text-primary-500 transition-colors"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <span className="font-bold text-warm-900 text-base">{item.value}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 rounded-3xl bg-secondary-900 text-white space-y-4">
                <h3 className="font-bold text-lg text-secondary-300">{t.hoursTitle}</h3>
                <p className="text-sm text-warm-300 leading-relaxed">{t.hoursText}</p>
                <div className="text-xs text-warm-400 space-y-2">
                  {t.hours.map((slot, i) => (
                    <div
                      key={slot.label}
                      className={`flex justify-between ${
                        i < t.hours.length - 1 ? 'border-b border-secondary-800 pb-1.5' : ''
                      }`}
                    >
                      <span>{slot.label}</span>
                      <span className="font-bold text-white">{slot.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Formulaire */}
            <div className="lg:col-span-7 bg-warm-50/50 border border-warm-100 rounded-3xl p-8 md:p-10 shadow-sm">
              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="text-center py-12"
                  >
                    <CheckCircle2 className="w-16 h-16 text-secondary-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-warm-900 mb-2">{t.successTitle}</h3>
                    <p className="text-warm-600 mb-6 max-w-sm mx-auto">{t.successText}</p>
                    <Button variant="outline" size="sm" onClick={() => setSuccess(false)}>
                      {t.writeAnother}
                    </Button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <h2 className="font-display font-black text-2xl text-warm-900 mb-4">
                      {t.formTitle}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        type="text"
                        label={t.nameLabel}
                        placeholder={t.namePlaceholder}
                        required
                        error={errors.name?.message}
                        {...register('name')}
                      />
                      <Input
                        type="email"
                        label={t.emailLabel}
                        placeholder={t.emailPlaceholder}
                        required
                        error={errors.email?.message}
                        {...register('email')}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        type="tel"
                        label={t.phoneOptional}
                        placeholder={t.phonePlaceholder}
                        error={errors.phone?.message}
                        {...register('phone')}
                      />
                      <Input
                        type="text"
                        label={t.subjectLabel}
                        placeholder={t.subjectPlaceholder}
                        required
                        error={errors.subject?.message}
                        {...register('subject')}
                      />
                    </div>

                    <Textarea
                      label={t.messageLabel}
                      placeholder={t.messagePlaceholder}
                      required
                      error={errors.message?.message}
                      {...register('message')}
                    />

                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full justify-center mt-6"
                      isLoading={loading}
                      rightIcon={<Send className="w-4 h-4" />}
                    >
                      {t.submit}
                    </Button>

                    <PrivacyNotice
                      purpose={t.privacyPurpose}
                      retention={t.privacyRetention}
                      className="mt-4"
                    />
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
