'use client'

import React, { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Check, Star, Crown, Sparkles, User, ArrowRight, Lock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PrivacyNotice } from '@/components/ui/PrivacyNotice'
import { toast } from '@/components/ui/Toaster'
import { cn } from '@/lib/utils'
import type { MembershipType } from '@/types'
import type { Dictionary } from '@/lib/dictionaries'
import type { Locale } from '@/lib/i18n'

type DonationDict = Dictionary['pages']['support']['donation']

// ─── Formulas ──────────────────────────────────────────────────────────────────

/** Montants, périodicité et habillage. Les textes viennent du dictionnaire. */
const FORMULAS = [
  { id: 'simple' as MembershipType, amount: 10, monthly: false, color: 'from-warm-400 to-warm-500', highlighted: false, badge: null },
  { id: 'monthly_5' as MembershipType, amount: 5, monthly: true, color: 'from-primary-400 to-primary-500', highlighted: false, badge: null },
  { id: 'monthly_10' as MembershipType, amount: 10, monthly: true, color: 'from-accent-400 to-primary-500', highlighted: true, badge: 'popular' as const },
  { id: 'monthly_20' as MembershipType, amount: 20, monthly: true, color: 'from-secondary-500 to-secondary-600', highlighted: false, badge: 'premium' as const },
]

const FORMULA_ICONS: Record<MembershipType, React.ReactNode> = {
  simple: <User className="w-5 h-5" />,
  monthly_5: <Heart className="w-5 h-5" />,
  monthly_10: <Star className="w-5 h-5" />,
  monthly_20: <Crown className="w-5 h-5" />,
}

// ─── Validation schema ─────────────────────────────────────────────────────────

/**
 * Le formulaire ne recueille plus que ce qui nous appartient en propre.
 *
 * Identité, adresse et coordonnées bancaires sont saisies sur la page de
 * paiement Stripe, qui les collecte de toute façon pour établir le paiement.
 * Les redemander ici serait une double saisie, et surtout une collecte sans
 * finalité : nous n'en aurions aucun usage avant que Stripe ne nous les
 * transmette par le webhook.
 *
 * Le mandat SEPA a disparu pour la même raison : Stripe le recueille sur sa
 * propre page, dans la formulation réglementaire, et en conserve la preuve.
 */
const makeDonationSchema = (t: DonationDict) =>
  z.object({
    accept_statutes: z.literal(true, {
      errorMap: () => ({ message: t.errorStatutes }),
    }),
    newsletter_consent: z.boolean().optional(),
  })

type DonationFormData = z.infer<ReturnType<typeof makeDonationSchema>>

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

const VALID_FORMULA_IDS = FORMULAS.map((f) => f.id)

export function DonationSection({ dict, locale }: { dict: DonationDict; locale: Locale }) {
  const t = dict
  const donationSchema = React.useMemo(() => makeDonationSchema(t), [t])
  const searchParams = useSearchParams()
  const requestedFormula = searchParams.get('formula')
  const initialFormula = VALID_FORMULA_IDS.includes(requestedFormula as MembershipType)
    ? (requestedFormula as MembershipType)
    : 'monthly_10'

  const [selectedFormula, setSelectedFormula] = useState<MembershipType>(initialFormula)
  const [step, setStep] = useState<1 | 2 | 3>(1) // 1: formula, 2: info, 3: payment
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formulaIndex = FORMULAS.findIndex((f) => f.id === selectedFormula)
  const formula = FORMULAS[formulaIndex]
  const formulaText = t.formulas[formulaIndex]

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DonationFormData>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      // Décoché par défaut : un consentement pré-coché n'est pas un acte positif
      // et ne vaut pas consentement au sens du RGPD (CJUE Planet49, C-673/17).
      newsletter_consent: false,
    },
  })

  /**
   * Ouvre la page de paiement Stripe.
   *
   * La session est créée côté serveur : le montant s'y déduit de la formule,
   * jamais d'une valeur envoyée par le navigateur, qu'il suffirait de modifier
   * pour adhérer à un centime.
   */
  async function onSubmit(data: DonationFormData) {
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formula: selectedFormula,
          acceptStatutes: true,
          newsletterConsent: data.newsletter_consent ?? false,
          locale,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.url) {
        toast({
          title: t.toastUnavailableTitle,
          description: result.error || t.toastUnavailableText,
          variant: 'error',
        })
        setIsSubmitting(false)
        return
      }

      // `assign` plutôt qu'une affectation de `location.href` : même effet,
      // mais la règle d'immutabilité du compilateur React interdit d'écrire
      // dans une variable extérieure au composant.
      window.location.assign(result.url)
    } catch (error) {
      toast({
        title: t.toastErrorTitle,
        description: error instanceof Error ? error.message : t.toastErrorText,
        variant: 'error',
      })
      setIsSubmitting(false)
    }
  }

  return (
    <section className="section bg-gradient-hero" id="don-mensuel">
      <div className="container-custom">
        {/* Steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {t.steps.map((label, i) => ({ n: i + 1, label })).map((s, i) => (
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
                <h2 className="section-title">{t.step1Title}</h2>
                <p className="section-subtitle mx-auto">{t.step1Subtitle}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto mb-10">
                {FORMULAS.map((f, fi) => (
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
                        {f.badge === 'popular' ? t.badgePopular : t.badgePremium}
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
                      {t.formulas[fi].label}
                    </h3>
                    <p className="text-warm-500 text-sm mb-3">{t.formulas[fi].description}</p>

                    {/* Price */}
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-3xl font-black font-display text-primary-500">
                        {f.amount}€
                      </span>
                      <span className="text-warm-400 text-sm">
                        {f.monthly ? t.perMonth : t.perYear}
                      </span>
                    </div>

                    {/* Benefits */}
                    <ul className="space-y-2">
                      {t.formulas[fi].benefits.map((benefit) => (
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
                      <p className="font-semibold text-warm-900">{formulaText.label}</p>
                      <p className="text-warm-500 text-sm">{t.viaStripe}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black font-display text-primary-500">
                        {formula.amount}€
                      </p>
                      <p className="text-warm-400 text-xs">
                        {formula.monthly ? t.monthlyLabel : t.yearlyLabel}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-warm-400 flex items-center gap-1.5 border-t border-warm-100 pt-3">
                    <Lock className="w-3.5 h-3.5 text-secondary-400" />
                    {t.secureLine}
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                  onClick={() => setStep(2)}
                >
                  {t.continueWithFormula}
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
                  <h2 className="section-title">{t.step2Title}</h2>
                  <p className="text-warm-500">{t.step2Subtitle}</p>
                </div>

                <form onSubmit={handleSubmit(() => setStep(3))} noValidate>
                  <div className="card p-6 md:p-8 space-y-5">
                    {/* Nom, adresse et coordonnées : saisis sur la page Stripe,
                        qui en a besoin pour le paiement et nous les transmet
                        ensuite par le webhook. Les redemander ici serait une
                        double saisie sans finalité propre. */}

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
                            {t.acceptStatutes}{' '}
                            <span className="text-primary-500">*</span>
                          </p>
                          <p className="text-xs text-warm-500 mt-0.5">
                            <a href="/legal/statuts" target="_blank" className="underline hover:text-primary-500">
                              {t.readStatutes}
                            </a>{' '}
                            {t.readStatutesSuffix}
                          </p>
                        </div>
                      </label>
                      {errors.accept_statutes && (
                        <p className="error-message ml-8">{errors.accept_statutes.message}</p>
                      )}

                      {/* Le mandat SEPA est recueilli par Stripe sur sa propre
                          page, dans la formulation réglementaire, et c'est lui
                          qui en conserve la preuve. Le doubler ici n'ajouterait
                          qu'une case à cocher sans valeur juridique. */}

                      {/* Newsletter */}
                      <label className="flex items-start gap-3 cursor-pointer">
                        <div className="relative mt-0.5">
                          <input
                            type="checkbox"
                            className="peer sr-only"
                            {...register('newsletter_consent')}
                          />
                          <div className="w-5 h-5 border-2 border-warm-300 rounded peer-checked:bg-secondary-500 peer-checked:border-secondary-500 transition-colors" />
                          <Check className="absolute inset-0 w-3 h-3 m-auto text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                        </div>
                        <p className="text-sm text-warm-600">
                          {t.newsletterLabel}
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
                      {t.back}
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="flex-2"
                      rightIcon={<ArrowRight className="w-5 h-5" />}
                    >
                      {t.continueToPayment}
                    </Button>
                  </div>

                  <PrivacyNotice
                    purpose={t.privacyPurpose}
                    retention={t.privacyRetention}
                    className="mt-4"
                  />
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
                  <h2 className="section-title">{t.step3Title}</h2>
                </div>

                {/* Order summary */}
                <div className="card p-6 mb-6">
                  <h3 className="font-semibold text-warm-900 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary-500" />
                    {t.orderTitle}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-warm-100">
                      <span className="text-warm-700">{formulaText.label}</span>
                      <span className="font-bold text-warm-900">
                        {formula.amount}€
                        {formula.monthly && <span className="text-warm-400 font-normal text-sm">{t.perMonth}</span>}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-warm-500">
                      <span>{t.taxReductionLabel}</span>
                      <span className="text-secondary-600 font-medium">
                        -{(formula.amount * 0.66).toFixed(2)}€
                        {formula.monthly && t.perMonth}
                      </span>
                    </div>
                    <div className="flex justify-between items-center font-bold text-warm-900 pt-2 border-t border-warm-100">
                      <span>{t.realCostLabel}</span>
                      <span className="text-primary-500">
                        {(formula.amount * 0.34).toFixed(2)}€
                        {formula.monthly && t.perMonth}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-warm-400 leading-relaxed mt-4 pt-4 border-t border-warm-100">
                    {t.debitNoteBefore}
                    {formula.amount}€{formula.monthly && t.perMonth}
                    {t.debitNoteAfter}
                  </p>
                </div>

                {/* Payment provider info */}
                <div className="card p-6 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-warm-100 flex items-center justify-center">
                      <span className="text-xl">🟢</span>
                    </div>
                    <div>
                      <p className="font-semibold text-warm-900">{t.paymentVia}</p>
                      <p className="text-sm text-warm-500">{t.redirectNote}</p>
                    </div>
                  </div>

                  {/* L'avertissement « réglez bien avec cette adresse » a
                      disparu avec HelloAsso. Le rattachement au compte ne
                      dépend plus de l'email du payeur : l'identifiant de
                      l'adhérent voyage dans les métadonnées de la session
                      Stripe, et le webhook le relit tel quel. */}

                  <div className="bg-warm-50 rounded-xl p-4 text-sm text-warm-600 space-y-1">
                    <p className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-secondary-500 shrink-0" />
                      {t.sslNote}
                    </p>
                    <p className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-secondary-500 shrink-0" />
                      {t.pciNote}
                    </p>
                    <p className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-secondary-500 shrink-0" />
                      {t.cerfaNote}
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
                    {t.back}
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    className="flex-2"
                    isLoading={isSubmitting}
                    onClick={handleSubmit(onSubmit)}
                    leftIcon={<Lock className="w-4 h-4" />}
                  >
                    {t.payButton}
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

// Icônes de l'étape 3. `Lock` est déjà importé en tête de fichier.
import { Shield, FileCheck } from 'lucide-react'
