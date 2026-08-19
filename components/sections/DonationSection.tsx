'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClientSafe } from '@/lib/supabase/client'
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
import { PrivacyNotice } from '@/components/ui/PrivacyNotice'
import { toast } from '@/components/ui/Toaster'
import { cn } from '@/lib/utils'
import type { MembershipType } from '@/types'
import type { Dictionary } from '@/lib/dictionaries'

type DonationDict = Dictionary['pages']['support']['donation']

// ─── Formulas ──────────────────────────────────────────────────────────────────

/** Montants, périodicité et habillage. Les textes viennent du dictionnaire. */
const FORMULAS = [
  { id: 'simple' as MembershipType, amount: 10, monthly: false, color: 'from-warm-400 to-warm-500', highlighted: false, badge: null },
  { id: 'monthly_5' as MembershipType, amount: 5, monthly: true, color: 'from-primary-400 to-primary-500', highlighted: false, badge: null },
  { id: 'monthly_10' as MembershipType, amount: 10, monthly: true, color: 'from-accent-400 to-primary-500', highlighted: true, badge: 'popular' as const },
  { id: 'monthly_20' as MembershipType, amount: 20, monthly: true, color: 'from-secondary-500 to-secondary-600', highlighted: false, badge: 'premium' as const },
]

// URLs complètes des formulaires HelloAsso, copiées depuis le back-office
// (rubrique « Widgets et boutons » de chaque formulaire). On ne reconstruit
// pas ces URLs à partir d'un slug : leur format dépend du type de formulaire
// et une URL devinée mènerait à une 404 en pleine page de paiement.
//
// Seuls les formulaires HelloAsso déclenchent l'émission automatique du reçu
// fiscal CERFA — l'API Checkout, elle, ne le fait pas.
// https://dev.helloasso.com/docs/guide-dintégration
const HELLOASSO_FORM_URLS: Record<MembershipType, string> = {
  simple: process.env.NEXT_PUBLIC_HELLOASSO_URL_ADHESION || '',
  monthly_5: process.env.NEXT_PUBLIC_HELLOASSO_URL_DON || '',
  monthly_10: process.env.NEXT_PUBLIC_HELLOASSO_URL_DON || '',
  monthly_20: process.env.NEXT_PUBLIC_HELLOASSO_URL_DON || '',
}

const FORMULA_ICONS: Record<MembershipType, React.ReactNode> = {
  simple: <User className="w-5 h-5" />,
  monthly_5: <Heart className="w-5 h-5" />,
  monthly_10: <Star className="w-5 h-5" />,
  monthly_20: <Crown className="w-5 h-5" />,
}

// ─── Validation schema ─────────────────────────────────────────────────────────

const makeDonationSchema = (t: DonationDict) => z.object({
  first_name: z.string().min(2, t.errorFirstName),
  last_name: z.string().min(2, t.errorLastName),
  email: z.string().email(t.errorEmail),
  phone: z.string().optional(),
  address: z.string().min(5, t.errorAddress),
  city: z.string().min(2, t.errorCity),
  zip_code: z.string().regex(/^\d{5}$/, t.errorZip),
  comment: z.string().optional(),
  accept_statutes: z.literal(true, {
    errorMap: () => ({ message: t.errorStatutes }),
  }),
  newsletter_consent: z.boolean().optional(),
  sepa_mandate_consent: z.boolean().optional(),
}).refine(
  (data) => {
    // SEPA mandate required for monthly donations
    return true // validated dynamically based on formula
  }
)

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

export function DonationSection({ dict }: { dict: DonationDict }) {
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
  const isMonthly = formula.monthly

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<DonationFormData>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      // Décoché par défaut : un consentement pré-coché n'est pas un acte positif
      // et ne vaut pas consentement au sens du RGPD (CJUE Planet49, C-673/17).
      newsletter_consent: false,
    },
  })

  const sepaConsent = watch('sepa_mandate_consent')

  // Le paiement s'effectue sur HelloAsso, qui ne nous transmet aucune donnée
  // permettant d'identifier le compte : le rattachement du don à l'espace
  // adhérent se fait uniquement sur l'email du payeur. On pré-remplit donc
  // celui du compte connecté, et on l'indique explicitement à l'étape suivante.
  const [accountEmail, setAccountEmail] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClientSafe()
    if (!supabase) return

    supabase.auth.getUser().then(({ data }) => {
      const email = data.user?.email
      if (email) {
        setAccountEmail(email)
        setValue('email', email)
      }
    })
  }, [setValue])

  async function onSubmit(data: DonationFormData) {
    if (isMonthly && !sepaConsent) {
      toast({
        title: t.toastSepaTitle,
        description: t.toastSepaText,
        variant: 'error',
      })
      return
    }

    const formUrl = HELLOASSO_FORM_URLS[selectedFormula]

    if (!formUrl) {
      toast({
        title: t.toastUnavailableTitle,
        description:
          'Le formulaire de paiement n\'est pas encore configuré. Merci de nous contacter directement.',
        variant: 'error',
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Le consentement newsletter est propre à l'association : HelloAsso ne le
      // collecte pas, on l'enregistre donc avant la redirection.
      if (data.newsletter_consent) {
        await fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: data.email,
            first_name: data.first_name,
            consent: true,
          }),
        }).catch(() => {
          // Un échec d'inscription newsletter ne doit pas bloquer le paiement.
        })
      }

      // L'identité et l'adresse du donateur sont saisies sur HelloAsso, qui en
      // a besoin pour éditer le reçu fiscal.
      window.location.href = formUrl
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
                      <p className="text-warm-500 text-sm">{t.viaHelloAsso}</p>
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
                    {/* Name row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label={t.firstName}
                        placeholder="Marie"
                        required
                        error={errors.first_name?.message}
                        {...register('first_name')}
                      />
                      <Input
                        label={t.lastName}
                        placeholder="Dupont"
                        required
                        error={errors.last_name?.message}
                        {...register('last_name')}
                      />
                    </div>

                    {/* Email & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label={t.email}
                        type="email"
                        placeholder="marie@example.fr"
                        required
                        error={errors.email?.message}
                        {...register('email')}
                      />
                      <Input
                        label={t.phone}
                        type="tel"
                        placeholder="+33 6 12 34 56 78"
                        error={errors.phone?.message}
                        {...register('phone')}
                      />
                    </div>

                    {/* Address */}
                    <Input
                      label={t.address}
                      placeholder="12 rue de la Paix"
                      required
                      error={errors.address?.message}
                      {...register('address')}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label={t.zipCode}
                        placeholder="75001"
                        required
                        maxLength={5}
                        error={errors.zip_code?.message}
                        {...register('zip_code')}
                      />
                      <Input
                        label={t.city}
                        placeholder="Paris"
                        required
                        error={errors.city?.message}
                        {...register('city')}
                      />
                    </div>

                    {/* Comment */}
                    <Textarea
                      label={t.comment}
                      placeholder={t.commentPlaceholder}
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
                                {t.sepaTitle}{' '}
                                <span className="text-primary-500">*</span>
                              </p>
                              <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                                {t.sepaTextBefore}
                                <strong>{formula.amount}€</strong>
                                {t.sepaTextAfter}
                              </p>
                            </div>
                          </label>
                          {isMonthly && !sepaConsent && (
                            <p className="text-xs text-blue-600 flex items-center gap-1 mt-2 ml-8">
                              <Info className="w-3.5 h-3.5" />
                              {t.sepaRequired}
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

                  {/* Le don n'est rattaché au compte que si l'email du payeur
                      correspond : c'est la seule clé dont on dispose. */}
                  {accountEmail && (
                    <div className="mb-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex gap-3">
                      <Info className="w-5 h-5 shrink-0 text-amber-600" />
                      <p className="text-sm leading-relaxed">
                        {t.accountEmailBefore}
                        <span className="font-semibold">{accountEmail}</span>
                        {t.accountEmailAfter}
                      </p>
                    </div>
                  )}

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

// Import needed for Shield, FileCheck used in Step 3
import { Shield, FileCheck, Lock as LockIcon } from 'lucide-react'
