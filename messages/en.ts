import type { Dictionary } from './fr'

/**
 * English translation.
 *
 * The explicit `: Dictionary` annotation is what makes this file safe: TypeScript
 * rejects a missing key as well as a stray one, so the build fails rather than
 * silently serving French text on an English page.
 */
export const en: Dictionary = {
  nav: {
    home: 'Home',
    about: 'About us',
    actions: 'Our actions',
    focus: 'Our focus',
    partners: 'Partners',
    support: 'Join & support',
    appointment: 'Book a meeting',
    contact: 'Contact',
    allActions: 'All our actions',
    translation: 'Translation',
    youth: 'Youth',
    employment: 'Employment',
    donate: 'Donate',
    join: 'Become a member',
    donateMonthly: 'Give monthly',
    joinAssociation: 'Become a member',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    mainNav: 'Main navigation',
    logoAria: 'Home — Association Afrique de l’Est et ses amis',
    languageLabel: 'Change language',
    skipToContent: 'Skip to main content',
    brandShort: 'East Africa & Friends',
  },

  footer: {
    ctaTitle: 'Support our mission',
    ctaText: 'Every monthly gift directly funds one family’s integration.',
    brandLine:
      'A local-law association supporting East African families as they build their lives in France, since 2025.',
    associationTitle: 'The association',
    supportTitle: 'Support us',
    legalTitle: 'Legal information',
    securePaymentVia: 'Secure payment via',
    receiptNote: 'Tax receipt issued automatically each January',
    taxTitle: 'Tax deduction',
    taxTextBefore: 'Your donations are ',
    taxTextAfter: ' tax-deductible from French income tax (art. 200 of the CGI).',
    madeIn: 'Made in France • Data hosted in Europe',
    links: {
      donateOnce: 'Make a one-off gift',
      appointment: 'Book a meeting',
      memberArea: 'Member area',
      legalNotice: 'Legal notice',
      privacy: 'Privacy policy',
      statutes: 'Association statutes',
      receipts: 'CERFA tax receipts',
      partnersGovernance: 'Partners & governance',
    },
  },

  home: {
    meta: {
      title: 'East Africa & Friends Association — Strasbourg',
      description:
        'A Strasbourg association supporting East African families: French classes (FLE), school support, employment guidance and translation. Free appointments.',
    },
    hero: {
      badge: 'Local-law association — Alsace',
      titleBefore: 'Together, let us build',
      titleHighlight: 'the future',
      titleAfter: 'of East African families in France',
      subtitle:
        'We support East African families as they settle in France: French classes (FLE), youth mentoring, employment guidance and translation services.',
      ctaPrimary: 'Give monthly',
      ctaSecondary: 'Discover the association',
      familiesCount: '120+ families',
      familiesTrust: 'place their trust in us',
      recognised: 'Recognised as serving the public interest',
      photoAlt: 'A member of the community supported by the association',
      origins: {
        DJ: 'Djibouti',
        SO: 'Somalia',
        ET: 'Ethiopia',
        SL: 'Somaliland',
        ER: 'Eritrea',
        SD: 'Sudan',
      },
    },
    actions: {
      badge: 'Our actions',
      title: 'What we actually do',
      link: 'All our actions',
      ongoing: 'Ongoing',
      beneficiaries: 'beneficiaries',
      items: [
        {
          title: 'Welcome and administrative guidance',
          description:
            'One-to-one help understanding and completing official paperwork: residence permits, benefits, school enrolment, access to healthcare.',
          tags: ['Paperwork', 'All situations'],
        },
        {
          title: 'Intensive French classes (FLE)',
          description:
            'Weekly French-as-a-foreign-language classes for adults, taught by qualified volunteers. All levels welcome, from the alphabet to workplace situations.',
          tags: ['French', 'Adults', 'Weekly'],
        },
        {
          title: 'Integration through sport',
          description:
            'Team sports for young people aged 5 to 20: a way to build cohesion, self-confidence and lasting integration.',
          tags: ['Sport', 'Ages 5-20'],
        },
        {
          title: 'Independence',
          description:
            'End-to-end support towards full civic and professional integration, so that everyone becomes the author of their own path in France.',
          tags: ['Integration', 'Citizenship'],
        },
      ],
    },
    impact: {
      badge: 'Our impact',
      title: 'Numbers that speak',
      subtitle:
        'Every donation turns into concrete action for the families we support day after day.',
      quote:
        'Behind every number there is a family that has found its place in France, a child who has caught up at school, a parent who has landed a job.',
      quoteAuthor: '— The association team',
      stats: [
        {
          suffix: ' months',
          label: 'of French classes funded',
          description: 'French-as-a-foreign-language classes for adults',
        },
        {
          suffix: '',
          label: 'families supported',
          description: 'Since the association was founded',
        },
        {
          suffix: '%',
          label: 'employment placement rate',
          description: 'Of the people we support have found work',
        },
        {
          suffix: '',
          label: 'translations completed',
          description: 'Official documents, doctors, schools',
        },
        {
          suffix: '+',
          label: 'young people supported',
          description: 'School support and cultural activities',
        },
        {
          suffix: ' year',
          label: 'serving families',
          description: 'Association founded in 2025',
        },
      ],
    },
    focus: {
      badge: 'Our focus',
      title: 'Three priority areas',
      subtitle:
        'Our programmes are designed around the real needs of the families we support.',
      learnMore: 'Find out more',
      items: [
        {
          title: 'Translation',
          description:
            'We help families through French administrative procedures with volunteer translation: prefecture, family benefits office, schools, hospitals.',
          stats: '1,240 documents translated',
        },
        {
          title: 'Youth',
          description:
            'Creative workshops, school support and sports for East African children and teenagers in France. Nurturing roots, opening horizons.',
          stats: '65+ young people supported',
        },
        {
          title: 'Employment',
          description:
            'Tailored employment support: writing a CV, preparing for interviews, and introductions to partner employers committed to diversity.',
          stats: '89% employment placement',
        },
      ],
    },
    testimonials: {
      badge: 'Testimonials',
      title: 'Their lives changed because of you',
      previous: 'Previous testimonial',
      next: 'Next testimonial',
      dotLabel: 'Testimonial',
      items: [
        {
          name: 'Amina K.',
          role: 'Ethiopia → Strasbourg (2025)',
          quote:
            'Thanks to the French classes, the association helped me get into nursing school in France. I am still studying today. I am endlessly grateful.',
          program: 'French classes + Employment',
        },
        {
          name: 'Hassan M.',
          role: 'Somalia → Strasbourg (2025)',
          quote:
            'When I arrived in France, I understood nothing. The association translated everything for me: the prefecture paperwork, the meetings at my children’s school. They gave me back my dignity at the hardest of times.',
          program: 'Translation + Integration',
        },
        {
          name: 'Fatouma A.',
          role: 'Djibouti → Strasbourg (2026)',
          quote:
            'My son was struggling at school. The association’s youth workshops transformed him. He is now top of his class and dreams of becoming a doctor. You changed our lives.',
          program: 'Youth support',
        },
        {
          name: 'Saba T.',
          role: 'Eritrea → Strasbourg (2026)',
          quote:
            'The team helped me write my CV, prepare for interviews and understand the French job market. Within three months I had a fixed-term contract through an inclusive staffing agency. A real springboard into my new life.',
          program: 'Employment support',
        },
      ],
    },
    donationCta: {
      badge: 'Stand with us',
      titleBefore: 'Every gesture counts for',
      titleHighlight: 'the integration of families',
      text: 'Your regular monthly gift funds our French classes (FLE), homework help for young people, employment guidance and social translation services over the long term. You give stability, and hope.',
      guarantee1: '66% tax-deductible • Annual tax receipt issued automatically',
      guarantee2: 'Secure HelloAsso payment • Cancel any time',
      chooseTitle: 'Choose how you help:',
      popular: 'Popular',
      seeAll: 'See all the options',
      formulas: [
        { action: '€5/month', desc: 'funds one hour of French classes each month' },
        { action: '€10/month', desc: 'funds school support for one child' },
        { action: '€20/month', desc: 'funds one employment support pathway' },
        { action: 'One-off gift', desc: 'membership from €10, no commitment' },
      ],
    },
    newsletter: {
      titleBefore: 'Subscribe to our',
      titleHighlight: 'newsletter',
      text: 'Each month, get the association’s news, upcoming events, and inspiring stories about families finding their footing.',
      firstNamePlaceholder: 'Your first name (optional)',
      emailPlaceholder: 'Your email address',
      submit: 'Subscribe',
      consent:
        'I agree to receive information emails from Association Afrique de l’Est. You can unsubscribe at any time using the links in our emails.',
      successTitle: 'Welcome aboard!',
      successText: 'Your subscription is confirmed. Our next email will reach you shortly.',
      another: 'Subscribe another address',
      privacyPurpose: 'to send you our newsletter',
      privacyRetention: 'until you unsubscribe',
      badge: 'Stay informed',
      errorEmail: 'Invalid email address',
      errorConsent: 'Please agree to receive our communications',
      errorGeneric: 'Something went wrong.',
      toastSuccessTitle: 'You are subscribed! 🎉',
      toastSuccessText: 'Thank you for subscribing to our newsletter.',
      toastErrorTitle: 'Error',
      toastErrorText: 'We could not sign you up right now.',
    },
  },

  pages: {
    actions: {
      meta: {
        title: 'French classes, employment, youth',
        description:
          'Our four programmes in Strasbourg: French classes (FLE) in small groups, employment guidance, school support and translation. Free and open to all.',
      },
      breadcrumb: 'Our actions',
      badge: 'Work on the ground',
      titleBefore: 'Our programmes for',
      titleHighlight: 'everyday life',
      subtitle:
        'From learning the language to finding work, we build concrete programmes around what families actually need.',
      activeProgram: 'Running programme',
      supportProgram: 'Support this programme',
      illustrationAlt: 'Illustration for',
      items: [
        {
          title: 'French as a Foreign Language (FLE)',
          desc: 'Weekly French workshops in small groups by level, led by qualified volunteer teachers. The aim is the everyday independence that comes with being able to communicate.',
          stats: [
            { label: 'Hours taught per year', value: '320h' },
            { label: 'Active learners', value: '50 learners' },
            { label: 'Ability groups', value: '4 levels' },
          ],
        },
        {
          title: 'Employment guidance',
          desc: 'A tailored pathway helping adults define a career plan, write their CV, prepare for interviews and meet partner companies ready to give them a chance.',
          stats: [
            { label: 'People placed per year', value: '10 in work' },
            { label: 'Coaching workshops', value: '2 per month' },
            { label: 'Partner companies', value: '6 organisations' },
          ],
        },
        {
          title: 'School support & youth',
          desc: 'Homework help and tutoring for children from primary through secondary school. We also organise cultural outings — museums, parks, theatres — to broaden horizons and help young people flourish.',
          stats: [
            { label: 'Children supported', value: '45 pupils' },
            { label: 'Volunteer tutors', value: '15 students' },
            { label: 'Cultural outings', value: '6 per year' },
          ],
        },
        {
          title: 'Translation & social interpreting',
          desc: 'Language assistance at medical, administrative and school appointments. We translate official letters so that rights remain genuinely accessible and no one falls through the cracks because of language.',
          stats: [
            { label: 'Files translated per year', value: '150 files' },
            { label: 'In-person interpreting', value: '60 appointments' },
            { label: 'Languages covered', value: 'Amharic, Tigrinya, Somali…' },
          ],
        },
      ],
      impactTitle: 'Our impact in 2026',
      impactStats: [
        { value: '120', label: 'Families helped' },
        { value: '320h', label: 'French classes' },
        { value: '10', label: 'Stable jobs' },
        { value: '150', label: 'Translations' },
      ],
    },

    focus: {
      meta: {
        title: 'Translation, youth, employment',
        description:
          'Our three areas of support: medical and administrative interpreting, school success for children, and employment for newly arrived adults.',
      },
      breadcrumb: 'Our focus',
      badge: 'Our core pillars',
      titleBefore: 'Three areas that decide',
      titleHighlight: 'whether integration holds',
      subtitle:
        'We concentrate our work on three decisive issues, so that newly arrived families start on solid ground.',
      benefit: 'Get this support',
      volunteer: 'Volunteer in this area',
      verifiedTestimonial: 'Verified testimonial',
      items: [
        {
          title: 'Translation & interpreting',
          desc: 'Removing language barriers so that rights remain within reach.',
          details: [
            'Medical interpreting, so that healthcare is safe and properly understood.',
            'Translation of official documents, administrative letters and school correspondence.',
            'Briefing public bodies on the cultural specifics of the Horn of Africa.',
          ],
          testimonialText:
            '“The language barrier was an impassable wall when I arrived. The association’s translators came with me to the doctor and the town hall, and that unlocked everything.”',
          testimonialAuthor: 'Kidane T., beneficiary',
        },
        {
          title: 'Youth & schooling',
          desc: 'Supporting children’s school success and cultural growth.',
          details: [
            'Weekly homework help and one-to-one tutoring in French, maths and English.',
            'Following the parent–teacher relationship to prevent drop-out and keep dialogue open.',
            'Creative workshops in speaking, writing and basic computing.',
            'Monthly cultural outings — theatres, museums, libraries — and nature trips during the holidays.',
          ],
          testimonialText:
            '“Thanks to Wednesday school support, my son got his confidence back in French. His marks improved and he loves the cultural outings.”',
          testimonialAuthor: 'Rahma A., mother of a pupil',
        },
        {
          title: 'Employment support',
          desc: 'Building independence through lasting work.',
          details: [
            'Workshops on writing CVs and cover letters that match French hiring conventions.',
            'Mock interviews with volunteer professionals.',
            'Identifying and evidencing skills gained abroad, including recognition of qualifications.',
            'Direct introductions to our network of inclusive partner employers.',
          ],
          testimonialText:
            '“The association helped me rewrite my CV and prepare for interviews. Today I have signed my first permanent contract, in logistics.”',
          testimonialAuthor: 'Yusuf M., now in work',
        },
      ],
    },

    about: {
      meta: {
        title: 'About us',
        description:
          'Meet Association Afrique de l’Est et ses amis: our story, our team and the values behind the way we support families in Strasbourg.',
      },
      breadcrumb: 'About us',
      badge: 'Our association',
      titleBefore: 'Building a bridge towards',
      titleHighlight: 'integration that lasts',
      subtitle:
        'Since 2025, Association Afrique de l’Est et ses amis has supported families from Somalia, Somaliland, Ethiopia, Sudan, Eritrea and Djibouti as they settle in Strasbourg.',
      historyTitle: 'Our story & our mission',
      historyP1:
        'Settling in a new country is a long road, blocked at every turn by paperwork, language and isolation. The association was founded in 2025 out of that observation.',
      historyP2:
        'One conviction underpins everything we do: integration holds when people learn the language, when children succeed at school, when parents become financially independent, and when official procedures stop being a wall.',
      quote: '“Making Strasbourg a place of opportunity for the Horn of Africa.”',
      quoteAuthor: '— Ismael Ali Moussa, President',
      photoAlt: 'Association members meeting and supporting one another',
      yearsValue: '1 year',
      yearsLabel: 'of continuous commitment alongside families in France.',
      valuesBadge: 'Our foundations',
      valuesTitle: 'The values that guide us',
      valuesSubtitle:
        'Four guiding principles, shared by every one of our volunteers, shape what the association does.',
      values: [
        {
          title: 'Active solidarity',
          desc: 'We offer families direct, concrete support through day-to-day work on the ground.',
        },
        {
          title: 'Integration that works',
          desc: 'We make settling in France easier while valuing the cultural wealth each person brings.',
        },
        {
          title: 'Sharing & exchange',
          desc: 'We create warm, intercultural spaces where isolation breaks down.',
        },
        {
          title: 'Closeness & listening',
          desc: 'Our support is tailored to each family’s own path and particular needs.',
        },
      ],
      teamBadge: 'Governance',
      teamTitle: 'The association’s team',
      teamSubtitle: 'Volunteers and professionals committed to solidarity.',
      photoOf: 'Photograph of',
      team: [
        {
          role: 'President',
          bio: 'Carries the association’s vision and represents it before Strasbourg institutions.',
        },
        {
          role: 'Treasurer',
          bio: 'Safeguards sound financial management and budget transparency.',
        },
        {
          role: 'Secretary',
          bio: 'Coordinates the welcome of families and schedules drop-in sessions and French classes.',
        },
      ],
      recruiting:
        'We are looking for people to join our leadership team and build this bridge with us.',
      ctaTitle: 'Join our story',
      ctaText:
        'Whether you give your time as a French teacher or an administrative guide, or support our work with a monthly gift, you change the lives of dozens of families.',
      ctaPrimary: 'Become a member or donor',
      ctaSecondary: 'Become a volunteer',
    },

    partners: {
      meta: {
        title: 'Partners and governance',
        description:
          'Our institutional, community and corporate partners, and the transparent, democratic way the association is governed.',
      },
      breadcrumb: 'Partners & governance',
      badge: 'Trust & solidarity',
      titleBefore: 'Partners &',
      titleHighlight: 'financial transparency',
      subtitle:
        'We believe in working in partnership, and in the open. Here are the organisations behind us and the way we govern ourselves.',
      governanceTitle: 'Governance in the open',
      governanceText:
        'Association Afrique de l’Est et ses amis is a non-profit organisation governed under Alsace-Moselle local law. Decisions are collective, democratic and open to scrutiny.',
      governancePoints: [
        {
          title: 'Annual elections',
          desc: 'The board and the executive committee are re-elected every year by the general meeting of members.',
        },
        {
          title: 'Financial transparency',
          desc: 'Our accounts are certified each year and presented publicly in our financial report, available on request.',
        },
        {
          title: 'Overheads kept low',
          desc: 'More than 92% of our resources go directly to work on the ground with families.',
        },
      ],
      financeTitle: 'Financial transparency: where the money goes',
      financeRows: [
        { label: 'Programmes (classes, translation, employment)', value: '92.4%' },
        { label: 'Communication and fundraising costs', value: '4.8%' },
        { label: 'Administrative running costs', value: '2.8%' },
      ],
      financeNote:
        '* Certified figures for the 2025 financial year. The association qualifies for French tax relief as a public-interest organisation (articles 200 and 238 bis of the tax code).',
      partnersBadge: 'A network of trust',
      partnersTitle: 'They back our work',
      partnersSubtitle:
        'Public grants, support from other associations and private philanthropy are what let our programmes continue.',
      groups: [
        {
          category: 'Institutions',
          items: [
            {
              name: 'Bas-Rhin Prefecture',
              desc: 'Support with residency and integration procedures.',
            },
            {
              name: 'State services',
              desc: 'Coordination on reception schemes for newly arrived people.',
            },
            {
              name: 'Integration bodies',
              desc: 'Partnerships on language and social integration pathways.',
            },
          ],
        },
        {
          category: 'City & region',
          items: [
            {
              name: 'City of Strasbourg',
              desc: 'Support for local work and the provision of meeting spaces.',
            },
            {
              name: 'Eurométropole',
              desc: 'Links with neighbourhood sports and social facilities.',
            },
            {
              name: 'Priority neighbourhoods',
              desc: 'Targeted work with families in priority neighbourhoods.',
            },
          ],
        },
        {
          category: 'Local & sport',
          items: [
            {
              name: 'Local sports clubs',
              desc: 'Partnerships making it easier for young people to join and be equipped.',
            },
            {
              name: 'Neighbourhood associations',
              desc: 'Joint work on intercultural events and community ties.',
            },
            {
              name: 'Volunteer networks',
              desc: 'Mobilising volunteer translators and support workers.',
            },
          ],
        },
      ],
    },

    support: {
      meta: {
        title: 'Join and donate',
        description:
          'Become a member for €10 a year, or give monthly. CERFA tax receipt sent automatically, 66% tax-deductible, cancel in one click.',
      },
      breadcrumb: 'Join & support',
      badge: 'Join us',
      titleBefore: 'Join us &',
      titleHighlight: 'support our mission',
      subtitle:
        'Every euro counts. Your support directly funds French classes, youth workshops and employment guidance for East African families in France.',
      heroStats: [
        { value: '€5', label: 'per month', sub: 'to get started' },
        { value: '66%', label: 'deductible', sub: 'from income tax' },
        { value: '100%', label: 'secure', sub: 'HelloAsso' },
      ],
      guarantees: [
        { title: '100% secure payment', description: 'HelloAsso secures every transaction.' },
        { title: 'Automatic tax receipt', description: 'HelloAsso sends your CERFA 11580*03 receipt.' },
        { title: 'Cancel in one click', description: 'Stop your monthly gift at any time, no commitment.' },
        { title: '66% deductible', description: 'Your donations are 66% deductible from French income tax.' },
      ],
      whyBadge: 'Why become a member?',
      whyTitle: 'More than a donation',
      whySubtitle:
        'Joining the association means committing in a concrete way, and becoming part of a community that works for families every day.',
      reasons: [
        {
          title: 'Fund integration directly',
          description:
            'Your membership fee funds French classes, youth support and employment guidance for the families we work with.',
        },
        {
          title: 'A community that shows up',
          description:
            'Join a network of members and volunteers who share the same commitment to solidarity and mutual aid.',
        },
        {
          title: 'Inside information',
          description:
            'A monthly newsletter, early invitations to our events, and the highlights of association life.',
        },
        {
          title: 'A say in how we work',
          description:
            'As a member you can take part in the general meeting and vote on the association’s direction.',
        },
      ],
      loading: 'Loading…',
      taxTitle: 'tax deduction',
      taxText:
        'As a public-interest association, our donations give you a 66% income tax reduction on the amount given, up to 20% of your taxable income (article 200 of the French tax code).',
      taxExampleTitle: 'A concrete example',
      taxRows: [
        { don: '€5/month = €60/year', revient: '€20.40/year in reality', saving: '€39.60 saved' },
        { don: '€10/month = €120/year', revient: '€40.80/year in reality', saving: '€79.20 saved' },
        { don: '€20/month = €240/year', revient: '€81.60/year in reality', saving: '€158.40 saved' },
      ],
      taxFootnote: '* After the 66% tax deduction',
      faqBadge: 'Frequently asked questions',
      faqTitle: 'Any questions?',
      faqs: [
        {
          q: 'How do I get my tax receipt?',
          a: 'Payments are collected by HelloAsso, which issues and emails your tax receipt (CERFA 11580*03) automatically, to the address used at payment. You can also find it any time in your HelloAsso account, under “My payments”.',
        },
        {
          q: 'How do I cancel my monthly gift?',
          a: 'You can cancel your monthly gift at any time from your member area, with no fee or penalty. Your subscription stops at the end of the current month.',
        },
        {
          q: 'Is my data secure?',
          a: 'Yes. Your personal and banking data is protected under the GDPR. Payments are handled by HelloAsso, which is PCI-DSS certified. We never store your banking details.',
        },
        {
          q: 'Can I change the amount I give?',
          a: 'Yes, you can change your monthly amount from your member area. The change takes effect the following month.',
        },
        {
          q: 'Can I both join and give monthly?',
          a: 'Absolutely. You can become a member (€10/year) and also give monthly. The two combine, and each qualifies for the corresponding tax deduction.',
        },
      ],
      altBadge: 'Other ways to pay',
      altTitle: 'Other ways to support us',
      altSubtitle:
        'Besides paying online through HelloAsso, you can also support us by bank transfer or in person.',
      transferTitle: 'Bank transfer',
      transferText:
        'Best suited to larger annual gifts. Put your name and email in the reference so that we can send you your tax receipt.',
      transferHolder: 'Account holder',
      cashTitle: 'Cash or cheque',
      cashText:
        'Hand your donation over in person during our drop-in hours. You will be given a receipt on the spot.',
      openingDays: [
        { day: 'Tuesday', hours: '2pm–6pm' },
        { day: 'Saturday', hours: '10am–1pm' },
      ],

      donation: {
        steps: ['Plan', 'Your details', 'Payment'],
        badgePopular: 'Popular',
        badgePremium: 'Premium',
        formulas: [
          {
            label: 'Standard membership',
            description: 'Become a member of the association',
            benefits: [
              'Official membership card',
              'Monthly newsletter',
              'Access to public events',
              'CERFA tax receipt',
            ],
          },
          {
            label: 'Supporter',
            description: 'Back our day-to-day work',
            benefits: [
              'Automatic annual tax receipt',
              'Monthly newsletter',
              'Annual impact report',
              'Cancel any time',
            ],
          },
          {
            label: 'Committed supporter',
            description: 'Join our circle of committed donors',
            benefits: [
              'Everything in Supporter',
              'Invitations to internal events',
              'Access to quarterly reports',
              'Member badge on the site',
            ],
          },
          {
            label: 'Pillar supporter',
            description: 'Become a pillar of the association',
            benefits: [
              'Everything in Committed supporter',
              'A personalised impact story',
              'Association merchandise',
              'Annual meeting with the team',
            ],
          },
        ],
        step1Title: 'Choose your plan',
        step1Subtitle: 'Annual membership or a recurring monthly gift — every contribution counts.',
        perMonth: '/month',
        perYear: '/year',
        viaHelloAsso: 'via HelloAsso',
        monthlyLabel: 'per month',
        yearlyLabel: 'once a year',
        secureLine: 'Secure payment — 66% tax-deductible',
        continueWithFormula: 'Continue with this plan',
        step2Title: 'Your details',
        step2Subtitle: 'We need these for your tax receipt and your membership card.',
        firstName: 'First name',
        lastName: 'Surname',
        email: 'Email',
        phone: 'Phone',
        address: 'Address',
        zipCode: 'Postcode',
        city: 'Town or city',
        comment: 'Message (optional)',
        commentPlaceholder: 'A message for the association, a question…',
        acceptStatutes: 'I accept the association’s statutes',
        readStatutes: 'Read the statutes',
        readStatutesSuffix: 'of Association Afrique de l’Est et ses amis',
        sepaTitle: 'SEPA direct debit mandate',
        sepaTextBefore:
          'I authorise Association Afrique de l’Est et ses amis (SEPA creditor) to instruct my bank to debit my account by ',
        sepaTextAfter:
          ' each month. This mandate complies with the European payment services directive (PSD2). I can revoke it at any time.',
        sepaRequired: 'Required for monthly gifts',
        newsletterLabel:
          'I would like to receive the association’s newsletter (news, events, stories)',
        back: '← Back',
        continueToPayment: 'Continue to payment',
        privacyPurpose: 'to manage your membership and issue your tax receipt',
        privacyRetention: '6 years, under our accounting obligations',
        step3Title: 'Summary & payment',
        orderTitle: 'Your order',
        taxReductionLabel: 'Tax reduction (66%)',
        realCostLabel: 'Real cost after tax',
        debitNoteBefore: '💡 You will be charged ',
        debitNoteAfter:
          ', all of which goes to the association. A CERFA tax receipt will let you deduct 66% of that amount from your income tax at your next return.',
        paymentVia: 'Payment via HelloAsso',
        redirectNote: 'You will be redirected to the HelloAsso platform',
        accountEmailBefore: 'On HelloAsso, please pay using the address ',
        accountEmailAfter:
          ' — it is what links your payment to your member area. With a different address the gift will be recorded but will not appear in your account.',
        sslNote: 'Secure SSL/TLS connection',
        pciNote: 'PCI-DSS certified — no banking data stored',
        cerfaNote: 'CERFA tax receipt issued automatically by HelloAsso',
        payButton: 'Pay via HelloAsso',
        errorFirstName: 'First name required (at least 2 characters)',
        errorLastName: 'Surname required (at least 2 characters)',
        errorEmail: 'Invalid email address',
        errorAddress: 'Address required',
        errorCity: 'Town or city required',
        errorZip: 'Invalid postcode (5 digits)',
        errorStatutes: 'You must accept the association’s statutes',
        toastSepaTitle: 'SEPA mandate required',
        toastSepaText: 'Please accept the SEPA direct debit mandate to continue.',
        toastUnavailableTitle: 'Payment temporarily unavailable',
        toastUnavailableText:
          'The payment form is not configured yet. Please contact us directly.',
        toastErrorTitle: 'Something went wrong',
        toastErrorText: 'Please try again or get in touch.',
      },
    },

    contact: {
      meta: {
        title: 'Contact',
        description:
          'Get in touch with Association Afrique de l’Est et ses amis in Strasbourg: family support, volunteering, partnerships. We reply within 48 working hours.',
      },
      breadcrumb: 'Contact',
      badge: 'Get in touch',
      titleBefore: 'A question?',
      titleHighlight: 'Write to us',
      subtitle:
        'Whether you are a family looking for support, a would-be volunteer or a potential partner, our team is listening.',
      detailsTitle: 'How to reach us',
      detailsText: 'Contact us directly, or come and meet us during our drop-in hours.',
      emailLabel: 'Email address',
      phoneLabel: 'Telephone',
      addressLabel: 'Postal address',
      hoursTitle: '📅 Drop-in hours',
      hoursText: 'No appointment needed for first steps and urgent interpreting.',
      hours: [
        { label: 'Tuesday (administrative help)', value: '2pm – 6pm' },
        { label: 'Wednesday (school support)', value: '2pm – 5pm' },
        { label: 'Saturday (French classes)', value: '10am – 1pm' },
      ],
      formTitle: 'Send a message',
      nameLabel: 'Full name / organisation',
      namePlaceholder: 'Jane Smith',
      emailPlaceholder: 'jane.smith@example.com',
      phoneOptional: 'Phone (optional)',
      phonePlaceholder: '+33 6 12 34 56 78',
      subjectLabel: 'Subject',
      subjectPlaceholder: 'Request for support, volunteering…',
      messageLabel: 'Your message',
      messagePlaceholder: 'How can we help?…',
      submit: 'Send the message',
      successTitle: 'Message sent!',
      successText:
        'Thank you for getting in touch. A member of the team will contact you very shortly.',
      writeAnother: 'Write another message',
      privacyPurpose: 'to handle your request and reply to it',
      privacyRetention: '12 months',
      errorName: 'Name must be at least 2 characters',
      errorEmail: 'Invalid email address',
      errorSubject: 'Subject must be at least 3 characters',
      errorMessage: 'Message must be at least 10 characters',
      errorGeneric: 'Something went wrong.',
      toastSuccessTitle: 'Message sent! 📬',
      toastSuccessText: 'We have received your request and will reply shortly.',
      toastErrorTitle: 'Error',
      toastErrorText: 'We could not send your message right now.',
    },

    appointment: {
      meta: {
        title: 'Book an appointment',
        description:
          'Book a slot with the association in Strasbourg: administrative help (benefits, prefecture, housing), French classes and workshops. Members and non-members welcome.',
      },
      breadcrumb: 'Book an appointment',
      badge: 'Booking',
      titleBefore: 'Let us',
      titleHighlight: 'meet',
      subtitle:
        'Book a slot for administrative help, a French class, a workshop, or anything else. Open to members and non-members alike.',
      typesTitle: 'Types of appointment',
      typesText: 'Choose the type of appointment, then a slot from those on offer.',
      types: [
        {
          label: 'Administrative help',
          description: 'Help with procedures: benefits, prefecture, housing, and more.',
        },
        {
          label: 'French classes & workshops',
          description: 'Book your place in a French class or a workshop',
        },
        {
          label: 'General appointment',
          description: 'Something else? Let us meet and talk it through',
        },
      ],
      memberTitle: '👋 Already a member?',
      memberText: 'Sign in to find all your appointments in your member area.',
      memberLink: 'Sign in →',
      step1: '1. Type of appointment',
      step2: '2. Choose a slot',
      step3: '3. Your details',
      loadingSlots: 'Loading available slots…',
      noSlots: 'No slots are available for this type at the moment.',
      noSlotsHint: 'Contact us directly and we will find a solution.',
      nameLabel: 'Full name',
      namePlaceholder: 'Jane Smith',
      emailLabel: 'Email address',
      emailPlaceholder: 'jane.smith@example.com',
      phoneLabel: 'Phone (optional)',
      phonePlaceholder: '+33 6 12 34 56 78',
      reasonLabel: 'Tell us what you need (optional)',
      reasonPlaceholder: 'I would rather talk about it in person',
      reasonHint:
        'We will go into detail at the appointment — there is no need to write your personal situation here.',
      reasons: {
        aide_administrative: 'Administrative help',
        cours_francais: 'French classes',
        emploi: 'Employment',
        traduction: 'Translation',
        autre: 'Something else',
      },
      submit: 'Confirm the appointment',
      successTitle: 'Appointment confirmed!',
      successText: 'A confirmation email with all the details has just been sent to you.',
      bookAnother: 'Book another appointment',
      privacyPurpose: 'to arrange your appointment and prepare your support',
      privacyRetention: '12 months after the appointment',
      errorGeneric: 'Something went wrong.',
      toastSuccessTitle: 'Appointment confirmed! 📅',
      toastSuccessText: 'You will receive a confirmation email.',
      toastErrorTitle: 'Error',
      toastErrorText: 'We could not confirm the appointment.',
    },
  },
}
