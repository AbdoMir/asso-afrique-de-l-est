'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart, Check, Star, Crown, Sparkles, User, CreditCard,
  ArrowRight, Info, Lock, Building2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { toast } from '@/components/ui/Toaster'
import { cn } from '@/lib/utils'
import type { MembershipFormula, MembershipType } from '@/types'

// ─── Formulas ──────────────────────────────────────────────────────────────────

const FORMULAS: MembershipFormula[] = [
  {
    id: 'simple',
    label: 'Adhésion simple',
    amount: 10,
    frequency: 'once',
    description: 'Devenez membre de l\'association',
    benefits: [
      'Carte de membre officielle',
      'Newsletter mensuelle',
      'Accès aux événements publics',
      'Reçu fiscal CERFA',
    ],
    provider: 'helloasso',
    color: 'from-warm-400 to-warm-500',
    badge: undefined,
  },
  {
    id: 'monthly_5',
    label: 'Don solidaire',
    amount: 5,
    frequency: 'monthly',
    description: 'Soutenez nos actions au quotidien',
    benefits: [
      'Reçu fiscal annuel automatique',
      'Newsletter mensuelle',
      'Rapport d\'impact annuel',
      'Résiliation sans engagement',
    ],
    provider: 'stripe',
    color: 'from-primary-400 to-primary-500',
    badge: undefined,
  },
  {
    id: 'monthly_10',
    label: 'Don engagé',
    amount: 10,
    frequency: 'monthly',
    description: 'Rejoignez notre cercle d\'engagés',
    benefits: [
      'Tout du Don solidaire',
      'Invitations aux événements internes',
      'Accès aux bilans trimestriels',
      'Badge adhérent sur le site',
    ],
    provider: 'stripe',
    color: 'from-accent-400 to-primary-500',
    highlighted: true,
    badge: 'Populaire',
  },
  {
    id: 'monthly_20',
    label: 'Don soutien',
    amount: 20,
    frequency: 'monthly',
    description: 'Devenez un pilier de l\'association',
    benefits: [
      'Tout du Don engagé',
      'Témoignage d\'impact personnalisé',
      'Goodies de l\'association',
      'Rencontre annuelle avec l\'équipe',
    ],
    provider: 'stripe',
    color: 'from-secondary-500 to-secondary-600',
    badge: 'Premium',
  },
]

const FORMULA_ICONS: Record<MembershipType, React.ReactNode> = {
  simple: <User className="w-5 h-5" />,
  monthly_5: <Heart className="w-5 h-5" />,
  monthly_10: <Star className="w-5 h-5" />,
  monthly_20: <Crown className="w-5 h-5" />,
}

// ─── Validation schema ─────────────────────────────────────────────────────────

const donationSchema = z.object({
  first_name: z.string().min(2, 'Prénom requis (minimum 2 caractères)'),
  last_name: z.string().min(2, 'Nom requis (minimum 2 caractères)'),
  email: z.string().email('Adresse email invalide'),
  phone: z.string().optional(),
  address: z.string().min(5, 'Adresse requise'),
  city: z.string().min(2, 'Ville requise'),
  zip_code: z.string().regex(/^\d{5}$/, 'Code postal invalide (5 chiffres)'),
  comment: z.string().optional(),
  accept_statutes: z.literal(true, {
    errorMap: () => ({ message: 'Vous devez accepter les statuts de l\'association' }),
  }),
  newsletter_consent: z.boolean().optional(),
  sepa_mandate_consent: z.boolean().optional(),
}).refine(
  (data) => {
    // SEPA mandate required for monthly donations
    return true // validated dynamically based on formula
  }
)

type DonationFormData = z.infer<typeof donationSchema>

// ─── Step indicator ────────────────────────────────────────────────────────────

function StepIndicator({ step, current }: { step: number; current: number }) {
  const isCompleted = current > step
  const isActive = current === step
  return (
    <div className={cn(
      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all',
      isCompleted && 'bg-secondary-500 text-white',
      isActive && 'bg-primary-500 text-white ring-4 ring-primary-100',
      !isCompleted && !isActive && 'bg-warm-200 text-warm-500'
    )}>
      {isCompleted ? <Check className="w-4 h-4" /> : step}
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function DonationSection() {
  const [selectedFormula, setSelectedFormula] = useState<MembershipType>('monthly_10')
  const [step, setStep] = useState<1 | 2 | 3>(1) // 1: formula, 2: info, 3: payment
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formula = FORMULAS.find((f) => f.id === selectedFormula)!
  const isMonthly = formula.frequency === 'monthly'

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<DonationFormData>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      newsletter_consent: true,
    },
  })

  const sepaConsent = watch('sepa_mandate_consent')

  async function onSubmit(data: DonationFormData) {
    if (isMonthly && !sepaConsent) {
      toast({
        title: 'Mandat SEPA requis',
        description: 'Veuillez accepter le mandat de prélèvement SEPA pour continuer.',
        variant: 'error',
      })
      return
    }

    setIsSubmitting(true)
    try {
      if (formula.provider === 'helloasso') {
        // HelloAsso checkout
        const response = await fetch('/api/helloasso/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            formula: selectedFormula,
            amount: formula.amount,
            ...data,
          }),
        })
        const result = await response.json()
        if (result.redirectUrl) {
          window.location.href = result.redirectUrl
        } else {
          throw new Error(result.error || 'Erreur HelloAsso')
        }
      } else {
        // Stripe SEPA subscription
        const response = await fetch('/api/stripe/create-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            formula: selectedFormula,
            priceId: getPriceId(selectedFormula),
            ...data,
          }),
        })
        const result = await response.json()
        if (result.clientSecret) {
          // Redirect to payment confirmation page (choix CB ou SEPA)
          window.location.href = `/adherer-soutenir/confirmation?client_secret=${result.clientSecret}`
        } else {
          throw new Error(result.error || 'Erreur Stripe')
        }
      }
    } catch (error) {
      toast({
        title: 'Une erreur est survenue',
        description: error instanceof Error ? error.message : 'Veuillez réessayer ou nous contacter.',
        variant: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  function getPriceId(formulaId: MembershipType): string {
    const map: Record<MembershipType, string> = {
      simple: '',
      monthly_5: process.env.NEXT_PUBLIC_STRIPE_PRICE_5 || '',
      monthly_10: process.env.NEXT_PUBLIC_STRIPE_PRICE_10 || '',
      monthly_20: process.env.NEXT_PUBLIC_STRIPE_PRICE_20 || '',
    }
    return map[formulaId]
  }

  return (
    <section className="section bg-gradient-hero" id="formules">
      <div className="container-custom">
        {/* Steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {[
            { n: 1, label: 'Formule' },
            { n: 2, label: 'Coordonnées' },
            { n: 3, label: 'Paiement' },
          ].map((s, i) => (
            <React.Fragment key={s.n}>
              <div className="flex flex-col items-center gap-1">
                <StepIndicator step={s.n} current={step} />
                <span className={cn(
                  'text-xs font-medium',
                  step === s.n ? 'text-primary-600' : 'text-warm-400'
                )}>
                  {s.label}
                </span>
              </div>
              {i < 2 && (
                <div className={cn(
                  'h-0.5 flex-1 max-w-16 rounded transition-colors',
                  step > s.n ? 'bg-primary-500' : 'bg-warm-200'
                )} />
              )}
            </React.Fragment>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ── Step 1: Formula Selection ── */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
            >
              <div className="text-center mb-10">
                <h2 className="section-title">Choisissez votre formule</h2>
                <p className="section-subtitle mx-auto">
                  Adhésion annuelle ou don mensuel récurrent — chaque contribution compte.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto mb-10">
                {FORMULAS.map((f) => (
                  <motion.button
                    key={f.id}
                    onClick={() => setSelectedFormula(f.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      'formula-card text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500',
                      selectedFormula === f.id && 'selected',
                      f.highlighted && selectedFormula !== f.id && 'ring-1 ring-accent-300'
                    )}
                    aria-pressed={selectedFormula === f.id}
                  >
                    {/* Badge */}
                    {f.badge && (
                      <span className={cn(
                        'absolute -top-3 left-4 px-3 py-1 rounded-full text-xs font-bold text-white',
                        f.highlighted
                          ? 'bg-accent-500'
                          : 'bg-secondary-500'
                      )}>
                        {f.badge}
                      </span>
                    )}

                    {/* Icon */}
                    <div className={cn(
                      'w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center text-white mb-4',
                      f.color
                    )}>
                      {FORMULA_ICONS[f.id]}
                    </div>

                    {/* Label */}
                    <h3 className="font-display font-bold text-warm-900 text-lg mb-1">
                      {f.label}
                    </h3>
                    <p className="text-warm-500 text-sm mb-3">{f.description}</p>

                    {/* Price */}
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-3xl font-black font-display text-primary-500">
                        {f.amount}€
                      </span>
                      <span className="text-warm-400 text-sm">
                        {f.frequency === 'monthly' ? '/mois' : '/an'}
                      </span>
                    </div>

                    {/* Benefits */}
                    <ul className="space-y-2">
                      {f.benefits.map((benefit) => (
                        <li key={benefit} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-secondary-500 shrink-0 mt-0.5" />
                          <span className="text-warm-600">{benefit}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Selected indicator */}
                    {selectedFormula === f.id && (
                      <div className="absolute top-4 right-4 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Summary + CTA */}
              <div className="max-w-lg mx-auto">
                <div className="bg-white rounded-2xl p-6 shadow-card border border-warm-100 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-semibold text-warm-900">{formula.label}</p>
                      <p className="text-warm-500 text-sm">
                        via {formula.provider === 'helloasso' ? 'HelloAsso' : 'Stripe SEPA'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black font-display text-primary-500">
                        {formula.amount}€
                      </p>
                      <p className="text-warm-400 text-xs">
                        {formula.frequency === 'monthly' ? 'par mois' : 'une fois par an'}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-warm-400 flex items-center gap-1.5 border-t border-warm-100 pt-3">
                    <Lock className="w-3.5 h-3.5 text-secondary-400" />
                    Paiement sécurisé — Déductible à 66% des impôts
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                  onClick={() => setStep(2)}
                >
                  Continuer avec cette formule
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Personal Information ── */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
            >
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="section-title">Vos coordonnées</h2>
                  <p className="text-warm-500">
                    Ces informations sont nécessaires pour votre reçu fiscal et votre carte de membre.
                  </p>
                </div>

                <form onSubmit={handleSubmit(() => setStep(3))} noValidate>
                  <div className="card p-6 md:p-8 space-y-5">
                    {/* Name row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Prénom"
                        placeholder="Marie"
                        required
                        error={errors.first_name?.message}
                        {...register('first_name')}
                      />
                      <Input
                        label="Nom"
                        placeholder="Dupont"
                        required
                        error={errors.last_name?.message}
                        {...register('last_name')}
                      />
                    </div>

                    {/* Email & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Email"
                        type="email"
                        placeholder="marie@example.fr"
                        required
                        error={errors.email?.message}
                        {...register('email')}
                      />
                      <Input
                        label="Téléphone"
                        type="tel"
                        placeholder="+33 6 12 34 56 78"
                        error={errors.phone?.message}
                        {...register('phone')}
                      />
                    </div>

                    {/* Address */}
                    <Input
                      label="Adresse"
                      placeholder="12 rue de la Paix"
                      required
                      error={errors.address?.message}
                      {...register('address')}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Code postal"
                        placeholder="75001"
                        required
                        maxLength={5}
                        error={errors.zip_code?.message}
                        {...register('zip_code')}
                      />
                      <Input
                        label="Ville"
                        placeholder="Paris"
                        required
                        error={errors.city?.message}
                        {...register('city')}
                      />
                    </div>

                    {/* Comment */}
                    <Textarea
                      label="Commentaire libre"
                      placeholder="Un message pour l'association, une question..."
                      {...register('comment')}
                    />

                    {/* Consents */}
                    <div className="space-y-4 pt-2">
                      {/* Accept statutes */}
                      <label className="flex items-start gap-3 cursor-pointer">
                        <div className="relative mt-0.5">
                          <input
                            type="checkbox"
                            className="peer sr-only"
                            {...register('accept_statutes')}
                          />
                          <div className="w-5 h-5 border-2 border-warm-300 rounded peer-checked:bg-primary-500 peer-checked:border-primary-500 transition-colors" />
                          <Check className="absolute inset-0 w-3 h-3 m-auto text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-warm-900">
                            J&apos;accepte les statuts de l&apos;association{' '}
                            <span className="text-primary-500">*</span>
                          </p>
                          <p className="text-xs text-warm-500 mt-0.5">
                            <a href="/legal/statuts" target="_blank" className="underline hover:text-primary-500">
                              Lire les statuts
                            </a>{' '}
                            de l&apos;Association Afrique de l&apos;Est et ses amis (loi 1901)
                          </p>
                        </div>
                      </label>
                      {errors.accept_statutes && (
                        <p className="error-message ml-8">{errors.accept_statutes.message}</p>
                      )}

                      {/* SEPA consent (monthly only) */}
                      {isMonthly && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                          <label className="flex items-start gap-3 cursor-pointer">
                            <div className="relative mt-0.5">
                              <input
                                type="checkbox"
                                className="peer sr-only"
                                {...register('sepa_mandate_consent')}
                              />
                              <div className="w-5 h-5 border-2 border-blue-300 rounded peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-colors" />
                              <Check className="absolute inset-0 w-3 h-3 m-auto text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-blue-900 flex items-center gap-1.5">
                                <Building2 className="w-4 h-4" />
                                Mandat de prélèvement SEPA{' '}
                                <span className="text-primary-500">*</span>
                              </p>
                              <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                                J&apos;autorise l&apos;Association Afrique de l&apos;Est et ses amis 
                                (créancier SEPA) à envoyer des instructions à ma banque pour débiter 
                                mon compte du montant de <strong>{formula.amount}€</strong> chaque mois. 
                                Ce mandat est conforme à la directive européenne sur les services de paiement 
                                (DSP2). Je peux le révoquer à tout moment.
                              </p>
                            </div>
                          </label>
                          {isMonthly && !sepaConsent && (
                            <p className="text-xs text-blue-600 flex items-center gap-1 mt-2 ml-8">
                              <Info className="w-3.5 h-3.5" />
                              Requis pour les dons mensuels
                            </p>
                          )}
                        </div>
                      )}

                      {/* Newsletter */}
                      <label className="flex items-start gap-3 cursor-pointer">
                        <div className="relative mt-0.5">
                          <input
                            type="checkbox"
                            className="peer sr-only"
                            defaultChecked
                            {...register('newsletter_consent')}
                          />
                          <div className="w-5 h-5 border-2 border-warm-300 rounded peer-checked:bg-secondary-500 peer-checked:border-secondary-500 transition-colors" />
                          <Check className="absolute inset-0 w-3 h-3 m-auto text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                        </div>
                        <p className="text-sm text-warm-600">
                          Je souhaite recevoir la newsletter de l&apos;association 
                          (actualités, événements, témoignages)
                        </p>
                      </label>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center gap-3 mt-6">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setStep(1)}
                      className="flex-1"
                    >
                      ← Retour
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="flex-2"
                      rightIcon={<ArrowRight className="w-5 h-5" />}
                    >
                      Continuer vers le paiement
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Payment ── */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
            >
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="section-title">Récapitulatif & Paiement</h2>
                </div>

                {/* Order summary */}
                <div className="card p-6 mb-6">
                  <h3 className="font-semibold text-warm-900 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary-500" />
                    Votre commande
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-warm-100">
                      <span className="text-warm-700">{formula.label}</span>
                      <span className="font-bold text-warm-900">
                        {formula.amount}€
                        {formula.frequency === 'monthly' && <span className="text-warm-400 font-normal text-sm">/mois</span>}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-warm-500">
                      <span>Déduction fiscale (66%)</span>
                      <span className="text-secondary-600 font-medium">
                        -{(formula.amount * 0.66).toFixed(2)}€
                        {formula.frequency === 'monthly' && '/mois'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center font-bold text-warm-900 pt-2 border-t border-warm-100">
                      <span>Coût réel pour vous</span>
                      <span className="text-primary-500">
                        {(formula.amount * 0.34).toFixed(2)}€
                        {formula.frequency === 'monthly' && '/mois'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment provider info */}
                <div className="card p-6 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-warm-100 flex items-center justify-center">
                      {formula.provider === 'helloasso' ? (
                        <span className="text-xl">🟢</span>
                      ) : (
                        <CreditCard className="w-5 h-5 text-warm-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-warm-900">
                        {formula.provider === 'helloasso'
                          ? 'Paiement via HelloAsso'
                          : 'Carte bancaire ou prélèvement SEPA via Stripe'}
                      </p>
                      <p className="text-sm text-warm-500">
                        {formula.provider === 'helloasso'
                          ? 'Vous serez redirigé vers la plateforme HelloAsso'
                          : 'Vous choisirez CB ou SEPA sur la page suivante'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-warm-50 rounded-xl p-4 text-sm text-warm-600 space-y-1">
                    <p className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-secondary-500 shrink-0" />
                      Connexion sécurisée SSL/TLS
                    </p>
                    <p className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-secondary-500 shrink-0" />
                      Certifié PCI-DSS — Aucune donnée bancaire stockée
                    </p>
                    <p className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-secondary-500 shrink-0" />
                      Reçu fiscal CERFA envoyé chaque janvier
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep(2)}
                    className="flex-1"
                  >
                    ← Retour
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    className="flex-2"
                    isLoading={isSubmitting}
                    onClick={handleSubmit(onSubmit)}
                    leftIcon={<Lock className="w-4 h-4" />}
                  >
                    {formula.provider === 'helloasso'
                      ? 'Payer via HelloAsso'
                      : 'Continuer vers le paiement'}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

// Import needed for Shield, FileCheck used in Step 3
import { Shield, FileCheck, Lock as LockIcon } from 'lucide-react'
