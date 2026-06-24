'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { toast } from '@/components/ui/Toaster'

const schema = z.object({
  email: z.string().email('Adresse email invalide'),
  first_name: z.string().optional(),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Vous devez accepter de recevoir nos communications' }),
  }),
})

type FormData = z.infer<typeof schema>

export function NewsletterSection() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

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
      consent: true,
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
        throw new Error(result.error || 'Une erreur est survenue.')
      }

      setStatus('success')
      toast({
        title: 'Inscription réussie ! 🎉',
        description: 'Merci de vous être inscrit à notre newsletter.',
        variant: 'success',
      })
      reset()
    } catch (err: any) {
      setStatus('error')
      setErrorMessage(err.message || 'Une erreur est survenue lors de l\'inscription.')
      toast({
        title: 'Erreur',
        description: err.message || 'Impossible de vous inscrire pour le moment.',
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
            Restez informé(e)
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-black mb-6">
            Inscrivez-vous à notre <span className="gradient-text">lettre d&apos;information</span>
          </h2>
          <p className="text-warm-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Recevez chaque mois les actualités de l&apos;association, nos prochains événements, 
            et des témoignages inspirants sur l&apos;intégration des familles.
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
                <h3 className="text-2xl font-bold mb-2">Bienvenue à bord !</h3>
                <p className="text-warm-300 mb-6">
                  Votre inscription a été validée avec succès. Vous recevrez très bientôt notre prochain email.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStatus('idle')}
                  className="border-warm-600 text-warm-200 hover:bg-warm-800"
                >
                  Inscrire une autre adresse
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
                      placeholder="Votre prénom (facultatif)"
                      className="bg-warm-800/80 border-warm-700 text-white placeholder-warm-500 focus:ring-primary-500 focus:border-transparent rounded-xl"
                      {...register('first_name')}
                    />
                  </div>
                  <div className="flex-[2]">
                    <Input
                      type="email"
                      placeholder="Votre adresse email"
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
                      S&apos;inscrire
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
                    J&apos;accepte de recevoir des emails d&apos;information de l&apos;Association Afrique de l&apos;Est. 
                    Vous pouvez vous désinscrire à tout moment à l&apos;aide des liens de désinscription.
                  </label>
                </div>
                {errors.consent && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {errors.consent.message}
                  </p>
                )}
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
