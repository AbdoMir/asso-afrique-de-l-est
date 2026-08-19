'use client'

import React, { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PrivacyNotice } from '@/components/ui/PrivacyNotice'
import { toast } from '@/components/ui/Toaster'
import type { Dictionary } from '@/lib/dictionaries'

type NewsletterDict = Dictionary['home']['newsletter']

// Les messages d'erreur étant traduits, le schéma se construit à partir du
// dictionnaire plutôt que d'être figé au chargement du module.
const makeSchema = (dict: NewsletterDict) =>
  z.object({
    email: z.string().email(dict.errorEmail),
    first_name: z.string().optional(),
    // `boolean` affiné plutôt que `literal(true)` : la case part décochée, le
    // formulaire doit donc pouvoir représenter l'état « pas encore consenti ».
    consent: z.boolean().refine((value) => value, { message: dict.errorConsent }),
  })

type FormData = z.infer<ReturnType<typeof makeSchema>>

export function NewsletterSection({ dict }: { dict: NewsletterDict }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const schema = useMemo(() => makeSchema(dict), [dict])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      first_name: '',
      // Décoché par défaut : le consentement doit résulter d'un acte positif de
      // l'internaute (CJUE Planet49, C-673/17).
      consent: false,
    },
  })

  const onSubmit = async (data: FormData) => {
    setStatus('loading')
    setErrorMessage('')

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || dict.errorGeneric)
      }

      setStatus('success')
      toast({
        title: dict.toastSuccessTitle,
        description: dict.toastSuccessText,
        variant: 'success',
      })
      reset()
    } catch (err: any) {
      setStatus('error')
      setErrorMessage(err.message || dict.errorGeneric)
      toast({
        title: dict.toastErrorTitle,
        description: err.message || dict.toastErrorText,
        variant: 'error',
      })
    }
  }

  return (
    <section className="section bg-warm-900 text-white relative overflow-hidden" aria-label="Newsletter">
      {/* Decorative patterns */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
      <div className="absolute top-1/2 left-0 w-96 h-96 rounded-full bg-primary-500/10 blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-secondary-500/10 blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <span className="section-badge bg-warm-800 text-warm-200 border border-warm-700">
            <Mail className="w-4 h-4 text-primary-400" />
            {dict.badge}
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-black mb-6">
            {dict.titleBefore} <span className="gradient-text">{dict.titleHighlight}</span>
          </h2>
          <p className="text-warm-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            {dict.text}
          </p>

          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-warm-800/50 border border-secondary-500/30 rounded-3xl p-8 max-w-lg mx-auto text-center"
              >
                <CheckCircle2 className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">{dict.successTitle}</h3>
                <p className="text-warm-300 mb-6">{dict.successText}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStatus('idle')}
                  className="border-warm-600 text-warm-200 hover:bg-warm-800"
                >
                  {dict.another}
                </Button>
              </motion.div>
            ) : (
              <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit(onSubmit)}
                className="max-w-2xl mx-auto space-y-4 text-left"
              >
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder={dict.firstNamePlaceholder}
                      className="bg-warm-800/80 border-warm-700 text-white placeholder-warm-500 focus:ring-primary-500 focus:border-transparent rounded-xl"
                      {...register('first_name')}
                    />
                  </div>
                  <div className="flex-[2]">
                    <Input
                      type="email"
                      placeholder={dict.emailPlaceholder}
                      required
                      error={errors.email?.message}
                      className="bg-warm-800/80 border-warm-700 text-white placeholder-warm-500 focus:ring-primary-500 focus:border-transparent rounded-xl"
                      {...register('email')}
                    />
                  </div>
                  <div className="sm:self-start">
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      isLoading={status === 'loading'}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                      className="w-full whitespace-nowrap py-3 px-6 rounded-xl"
                    >
                      {dict.submit}
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-3 mt-4">
                  <input
                    id="consent"
                    type="checkbox"
                    className="mt-1 h-4.5 w-4.5 rounded border-warm-700 text-primary-500 focus:ring-primary-500 bg-warm-800/80 cursor-pointer"
                    {...register('consent')}
                  />
                  <label htmlFor="consent" className="text-xs text-warm-400 leading-normal cursor-pointer select-none">
                    {dict.consent}
                  </label>
                </div>
                {errors.consent && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {errors.consent.message}
                  </p>
                )}

                <PrivacyNotice
                  purpose={dict.privacyPurpose}
                  retention={dict.privacyRetention}
                  tone="dark"
                  className="mt-4"
                />
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
