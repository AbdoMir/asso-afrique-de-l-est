/**
 * Dictionnaire français — référence de structure.
 *
 * Les traductions anglaise et arabe se déclarent `satisfies Dictionary` : le
 * compilateur refuse alors toute clé oubliée ou surnuméraire. Un texte ajouté
 * ici sans être traduit ailleurs casse le typage plutôt que d'apparaître en
 * français au milieu d'une page arabe.
 */
export const fr = {
  nav: {
    home: 'Accueil',
    about: 'Qui sommes-nous',
    actions: 'Nos actions',
    focus: 'Nos focus',
    partners: 'Partenaires',
    support: 'Adhérer & soutenir',
    appointment: 'Prendre RDV',
    contact: 'Contact',
    allActions: 'Toutes nos actions',
    translation: 'Traduction',
    youth: 'Jeunesse',
    employment: 'Emploi',
    donate: 'Faire un don',
    join: 'Adhérer',
    donateMonthly: 'Faire un don mensuel',
    joinAssociation: "Adhérer à l'association",
    openMenu: 'Ouvrir le menu',
    closeMenu: 'Fermer le menu',
    mainNav: 'Navigation principale',
    logoAria: "Accueil — Association Afrique de l'Est et ses amis",
    languageLabel: 'Changer de langue',
    skipToContent: 'Aller au contenu principal',
    brandShort: "Afrique de l'Est & ses amis",
  },

  footer: {
    ctaTitle: 'Soutenez notre mission',
    ctaText: "Chaque don mensuel finance directement l'intégration d'une famille.",
    brandLine:
      "Association de droit local accompagnant les familles d'Afrique de l'Est dans leur intégration en France depuis 2025.",
    associationTitle: "L'association",
    supportTitle: 'Nous soutenir',
    legalTitle: 'Informations légales',
    securePaymentVia: 'Paiement sécurisé via',
    receiptNote: 'Reçu fiscal automatique chaque janvier',
    taxTitle: 'Déduction fiscale',
    taxTextBefore: 'Vos dons sont déductibles à ',
    taxTextAfter: ' de votre impôt sur le revenu (art. 200 du CGI).',
    madeIn: 'Fait en France • Données hébergées en Europe',
    links: {
      donateOnce: 'Faire un don ponctuel',
      appointment: 'Prendre rendez-vous',
      memberArea: 'Espace adhérent',
      legalNotice: 'Mentions légales',
      privacy: 'Politique de confidentialité',
      statutes: "Statuts de l'association",
      receipts: 'Reçus fiscaux CERFA',
      partnersGovernance: 'Partenaires & gouvernance',
    },
  },

  home: {
    meta: {
      title: "Association Afrique de l'Est et ses amis — Strasbourg",
      description:
        "Association à Strasbourg qui accompagne les familles d'Afrique de l'Est : cours de français (FLE), soutien scolaire, accompagnement vers l'emploi et traduction. Rendez-vous gratuit.",
    },
    hero: {
      badge: 'Association de droit local — Alsace',
      titleBefore: 'Ensemble, construisons',
      titleHighlight: "l'avenir",
      titleAfter: "des familles d'Afrique de l'Est en France",
      subtitle:
        "Nous accompagnons les familles d'Afrique de l'Est dans leur intégration en France : cours de français (FLE), soutien jeunesse, aide à l'emploi et services de traduction.",
      ctaPrimary: 'Faire un don mensuel',
      ctaSecondary: "Découvrir l'association",
      familiesCount: '+120 familles',
      familiesTrust: 'nous font confiance',
      recognised: "Reconnu d'intérêt général",
      photoAlt: "Membre de la communauté soutenue par l'association",
      origins: {
        DJ: 'Djibouti',
        SO: 'Somalie',
        ET: 'Éthiopie',
        SL: 'Somaliland',
        ER: 'Érythrée',
        SD: 'Soudan',
      },
    },
    actions: {
      badge: 'Nos actions',
      title: 'Ce que nous faisons concrètement',
      link: 'Toutes nos actions',
      ongoing: 'En cours',
      beneficiaries: 'bénéficiaires',
      items: [
        {
          title: 'Accueil et orientation administrative',
          description:
            'Un accompagnement personnalisé pour comprendre et remplir les documents officiels : titre de séjour, allocations, scolarisation, accès aux soins.',
          tags: ['Administratif', 'Toutes situations'],
        },
        {
          title: 'Cours de français intensifs (FLE)',
          description:
            "Des cours hebdomadaires de français langue étrangère pour adultes, animés par des bénévoles certifiés. Tous niveaux acceptés, de l'alphabet aux situations professionnelles.",
          tags: ['FLE', 'Adultes', 'Hebdomadaire'],
        },
        {
          title: 'Intégration par le sport',
          description:
            "Des activités sportives collectives pour les jeunes de 5 à 20 ans : un vecteur de cohésion, de dépassement de soi et d'intégration durable.",
          tags: ['Sport', '5-20 ans'],
        },
        {
          title: 'Autonomie',
          description:
            'Un accompagnement global vers une insertion citoyenne et professionnelle complète, pour que chacun devienne pleinement acteur de son parcours en France.',
          tags: ['Insertion', 'Citoyenneté'],
        },
      ],
    },
    impact: {
      badge: 'Notre impact',
      title: 'Des chiffres qui parlent',
      subtitle:
        'Chaque don se traduit en actions concrètes pour les familles que nous accompagnons au quotidien.',
      quote:
        "Derrière chaque chiffre, il y a une famille qui a trouvé sa place en France, un enfant qui a progressé à l'école, un parent qui a décroché un emploi.",
      quoteAuthor: "— L'équipe de l'association",
      stats: [
        {
          suffix: ' mois',
          label: 'de cours FLE financés',
          description: 'Cours de français langue étrangère pour adultes',
        },
        {
          suffix: '',
          label: 'familles accompagnées',
          description: "Depuis la création de l'association",
        },
        {
          suffix: '%',
          label: "taux d'insertion emploi",
          description: 'Des personnes accompagnées ont trouvé un emploi',
        },
        {
          suffix: '',
          label: 'traductions réalisées',
          description: 'Documents officiels, médecins, écoles',
        },
        {
          suffix: '+',
          label: 'jeunes accompagnés',
          description: 'Soutien scolaire et activités culturelles',
        },
        {
          suffix: ' an',
          label: 'au service des familles',
          description: 'Association fondée en 2025',
        },
      ],
    },
    focus: {
      badge: 'Nos focus',
      title: "Trois axes d'action prioritaires",
      subtitle:
        'Nos programmes sont pensés pour répondre aux besoins réels des familles que nous accompagnons.',
      learnMore: 'En savoir plus',
      items: [
        {
          title: 'Traduction',
          description:
            'Nous aidons les familles à naviguer dans les démarches administratives françaises grâce à des services de traduction bénévoles : préfecture, CAF, écoles, hôpitaux.',
          stats: '1 240 documents traduits',
        },
        {
          title: 'Jeunesse',
          description:
            "Ateliers créatifs, soutien scolaire et activités sportives pour les enfants et adolescents d'Afrique de l'Est en France. Cultiver les racines, ouvrir les horizons.",
          stats: '65+ jeunes accompagnés',
        },
        {
          title: 'Emploi',
          description:
            "Accompagnement personnalisé vers l'emploi : rédaction de CV, préparation aux entretiens, mise en relation avec des employeurs partenaires sensibilisés à la diversité.",
          stats: "89% d'insertion emploi",
        },
      ],
    },
    testimonials: {
      badge: 'Témoignages',
      title: 'Ils ont changé de vie grâce à vous',
      previous: 'Témoignage précédent',
      next: 'Témoignage suivant',
      dotLabel: 'Témoignage',
      items: [
        {
          name: 'Amina K.',
          role: 'Éthiopie → Strasbourg (2025)',
          quote:
            "Grâce aux cours de français, l'association m'a accompagnée pour intégrer l'école d'infirmière en France. Aujourd'hui, je continue mon cursus. Je suis éternellement reconnaissante.",
          program: 'Cours FLE + Emploi',
        },
        {
          name: 'Hassan M.',
          role: 'Somalie → Strasbourg (2025)',
          quote:
            "Quand je suis arrivé en France, je ne comprenais rien. L'association a tout traduit pour moi : les papiers de la préfecture, les réunions à l'école de mes enfants. Ils m'ont redonné de la dignité dans les moments les plus difficiles.",
          program: 'Traduction + Intégration',
        },
        {
          name: 'Fatouma A.',
          role: 'Djibouti → Strasbourg (2026)',
          quote:
            "Mon fils avait des difficultés scolaires. Les ateliers jeunesse de l'association l'ont transformé. Il est maintenant en tête de classe et rêve d'être médecin. Vous avez changé notre vie.",
          program: 'Soutien Jeunesse',
        },
        {
          name: 'Saba T.',
          role: 'Érythrée → Strasbourg (2026)',
          quote:
            "L'équipe m'a accompagné pour créer mon CV, préparer mes entretiens et comprendre le marché du travail français. En 3 mois, j'ai obtenu un CDD auprès d'une agence d'intérim d'insertion. Un vrai tremplin vers ma nouvelle vie.",
          program: 'Accompagnement Emploi',
        },
      ],
    },
    donationCta: {
      badge: 'Soutien solidaire',
      titleBefore: 'Chaque geste compte pour',
      titleHighlight: "l'intégration des familles",
      text: "Votre don mensuel régulier permet de financer sur la durée nos cours de français (FLE), l'aide aux devoirs pour les jeunes, l'aide à l'emploi et nos services de traduction sociale. Vous donnez de la stabilité et de l'espoir.",
      guarantee1: "Déductible d'impôts à 66% • Reçu fiscal annuel automatique",
      guarantee2: 'Paiement sécurisé par Stripe • Sans engagement',
      chooseTitle: 'Choisissez votre soutien :',
      popular: 'Populaire',
      seeAll: 'Voir toutes les formules',
      formulas: [
        { action: '5€/mois', desc: 'finance 1 heure de FLE par mois' },
        { action: '10€/mois', desc: "finance le suivi scolaire d'un enfant" },
        { action: '20€/mois', desc: "finance 1 accompagnement vers l'emploi" },
        { action: 'Don ponctuel', desc: 'adhésion simple à partir de 10€, sans engagement' },
      ],
    },
    newsletter: {
      titleBefore: 'Inscrivez-vous à notre',
      titleHighlight: "lettre d'information",
      text: "Recevez chaque mois les actualités de l'association, nos prochains événements, et des témoignages inspirants sur l'intégration des familles.",
      firstNamePlaceholder: 'Votre prénom (facultatif)',
      emailPlaceholder: 'Votre adresse email',
      submit: "S'inscrire",
      consent:
        "J'accepte de recevoir des emails d'information de l'Association Afrique de l'Est. Vous pouvez vous désinscrire à tout moment à l'aide des liens de désinscription.",
      successTitle: 'Bienvenue à bord !',
      successText:
        'Votre inscription a été validée avec succès. Vous recevrez très bientôt notre prochain email.',
      another: 'Inscrire une autre adresse',
      privacyPurpose: 'pour vous envoyer notre newsletter',
      privacyRetention: "jusqu'à votre désinscription",
      badge: 'Restez informé(e)',
      errorEmail: 'Adresse email invalide',
      errorConsent: 'Vous devez accepter de recevoir nos communications',
      errorGeneric: 'Une erreur est survenue.',
      toastSuccessTitle: 'Inscription réussie ! 🎉',
      toastSuccessText: 'Merci de vous être inscrit à notre newsletter.',
      toastErrorTitle: 'Erreur',
      toastErrorText: 'Impossible de vous inscrire pour le moment.',
    },
  },

  pages: {
    actions: {
      meta: {
        title: 'Cours de FLE, emploi, jeunesse',
        description:
          "Nos quatre programmes à Strasbourg : cours de français (FLE) en petits groupes, accompagnement vers l'emploi, soutien scolaire et traduction. Gratuits et ouverts à tous.",
      },
      breadcrumb: 'Nos actions',
      badge: 'Actions sur le terrain',
      titleBefore: 'Nos projets pour',
      titleHighlight: 'accompagner le quotidien',
      subtitle:
        "De l'apprentissage de la langue à l'insertion professionnelle, nous développons des programmes concrets pour répondre aux besoins fondamentaux des familles.",
      activeProgram: 'Programme actif',
      supportProgram: 'Soutenir ce programme',
      illustrationAlt: 'Illustration pour',
      items: [
        {
          title: 'Français Langue Étrangère (FLE)',
          desc: "Des ateliers hebdomadaires d'apprentissage du français par petits groupes de niveau, animés par des formateurs bénévoles qualifiés. L'objectif est de donner l'autonomie de communication indispensable au quotidien.",
          stats: [
            { label: 'Heures dispensées / an', value: '320h' },
            { label: 'Bénéficiaires actifs', value: '50 apprenants' },
            { label: 'Groupes de niveau', value: '4 niveaux' },
          ],
        },
        {
          title: "Accompagnement vers l'emploi",
          desc: "Un parcours personnalisé pour aider les adultes à définir un projet professionnel, rédiger leur CV, préparer leurs entretiens et entrer en relation avec des entreprises partenaires prêtes à donner leur chance.",
          stats: [
            { label: 'Personnes insérées / an', value: '10 actifs' },
            { label: 'Ateliers de coaching', value: '2 par mois' },
            { label: 'Entreprises partenaires', value: '6 structures' },
          ],
        },
        {
          title: 'Soutien scolaire & jeunesse',
          desc: "Aide aux devoirs et tutorat pour les enfants du primaire au lycée. Nous organisons également des sorties culturelles (musées, parcs, théâtres) pour favoriser l'ouverture culturelle et l'épanouissement des jeunes.",
          stats: [
            { label: 'Enfants accompagnés', value: '45 élèves' },
            { label: 'Tuteurs bénévoles', value: '15 étudiants' },
            { label: 'Sorties culturelles', value: '6 par an' },
          ],
        },
        {
          title: 'Traduction & interprétariat social',
          desc: "Assistance linguistique lors des rendez-vous médicaux, administratifs ou scolaires. Traduction de courriers officiels pour garantir l'accès effectif aux droits et éviter les ruptures de parcours liées à la barrière de la langue.",
          stats: [
            { label: 'Dossiers traduits / an', value: '150 dossiers' },
            { label: 'Interventions physiques', value: '60 rendez-vous' },
            { label: 'Langues couvertes', value: 'Amharique, tigrigna, somali…' },
          ],
        },
      ],
      impactTitle: 'Notre impact en 2026',
      impactStats: [
        { value: '120', label: 'Familles aidées' },
        { value: '320h', label: 'Cours de FLE' },
        { value: '10', label: 'Emplois stables' },
        { value: '150', label: 'Traductions' },
      ],
    },

    focus: {
      meta: {
        title: 'Traduction, jeunesse, emploi',
        description:
          "Nos trois axes d'accompagnement : interprétariat médical et administratif, réussite scolaire des enfants, insertion professionnelle des adultes primo-arrivants.",
      },
      breadcrumb: 'Nos focus',
      badge: 'Nos piliers fondamentaux',
      titleBefore: 'Nos trois axes',
      titleHighlight: "de réussite et d'intégration",
      subtitle:
        'Nous concentrons nos actions autour de trois problématiques clés pour sécuriser le parcours des familles primo-arrivantes.',
      benefit: 'Bénéficier de cet accompagnement',
      volunteer: 'Devenir bénévole sur ce focus',
      verifiedTestimonial: 'Témoignage vérifié',
      items: [
        {
          title: 'Traduction & interprétariat',
          desc: 'Lever les barrières linguistiques pour un accès digne aux droits.',
          details: [
            "Aide à l'interprétariat médical pour garantir un suivi de santé de qualité et sécurisé.",
            "Traduction administrative ou d'usage de documents officiels, courriers administratifs et scolaires.",
            "Sensibilisation des administrations publiques aux spécificités culturelles de la Corne de l'Afrique.",
          ],
          testimonialText:
            "« La barrière de la langue était un mur infranchissable à mon arrivée. Les traducteurs de l'association m'ont accompagnée chez le médecin et à la mairie, ce qui a tout débloqué. »",
          testimonialAuthor: 'Kidane T., bénéficiaire',
        },
        {
          title: 'Jeunesse & scolarité',
          desc: "Accompagner la réussite scolaire et l'épanouissement culturel des enfants.",
          details: [
            'Aide aux devoirs et tutorat individuel hebdomadaire en français, mathématiques et anglais.',
            'Suivi de la relation parents-enseignants pour éviter le décrochage et favoriser le dialogue.',
            "Ateliers créatifs, d'expression orale, d'écriture et d'initiation à l'informatique.",
            'Sorties culturelles mensuelles (théâtres, musées, bibliothèques) et sorties nature pendant les vacances.',
          ],
          testimonialText:
            "« Grâce au soutien scolaire du mercredi, mon fils a repris confiance en lui en français. Ses notes se sont améliorées et il adore participer aux sorties culturelles. »",
          testimonialAuthor: "Rahma A., maman d'un élève",
        },
        {
          title: 'Accompagnement emploi',
          desc: "Favoriser l'autonomie par une insertion professionnelle durable.",
          details: [
            'Ateliers de rédaction de CV et de lettres de motivation adaptés aux codes du marché français.',
            "Simulations d'entretiens d'embauche avec des professionnels bénévoles.",
            "Identification et mise en avant des compétences acquises à l'étranger (VAE, équivalences).",
            "Mise en relation directe avec notre réseau d'entreprises inclusives partenaires.",
          ],
          testimonialText:
            "« L'association m'a aidé à refaire mon CV et à me préparer pour les entretiens. Aujourd'hui, j'ai signé mon premier CDI dans la logistique. »",
          testimonialAuthor: 'Yusuf M., inséré professionnellement',
        },
      ],
    },

    about: {
      meta: {
        title: 'Qui sommes-nous',
        description:
          "Découvrez l'Association Afrique de l'Est et ses amis. Notre histoire, notre équipe et nos valeurs fondamentales pour accompagner l'intégration des familles.",
      },
      breadcrumb: 'Qui sommes-nous',
      badge: 'Notre association',
      titleBefore: 'Bâtir un pont vers',
      titleHighlight: 'une intégration harmonieuse',
      subtitle:
        "Depuis 2025, l'Association Afrique de l'Est et ses amis accompagne à Strasbourg les familles originaires de Somalie, du Somaliland, d'Éthiopie, du Soudan, d'Érythrée et de Djibouti dans leurs démarches d'insertion en France.",
      historyTitle: 'Notre histoire & notre mission',
      historyP1:
        "L'intégration des familles primo-arrivantes est un parcours complexe jalonné d'obstacles administratifs, linguistiques et sociaux. C'est de ce constat qu'est née l'Association Afrique de l'Est et ses amis en 2025.",
      historyP2:
        "Notre action repose sur une conviction profonde : une intégration réussie passe par l'apprentissage de la langue, le soutien à la réussite scolaire des enfants, l'autonomisation économique des parents et la facilitation des démarches.",
      quote: "« Faire de Strasbourg une terre d'opportunités pour la Corne de l'Afrique. »",
      quoteAuthor: '— Ismael Ali Moussa, président',
      photoAlt: "Réunion d'échange et de soutien entre membres de l'association",
      yearsValue: '1 an',
      yearsLabel: "d'engagement continu et d'accompagnement solidaire en France.",
      valuesBadge: 'Nos fondations',
      valuesTitle: 'Les valeurs qui nous guident',
      valuesSubtitle:
        'Notre projet associatif repose sur quatre principes directeurs partagés par tous nos bénévoles.',
      values: [
        {
          title: 'Solidarité active',
          desc: 'Nous offrons un soutien direct et concret aux familles à travers des actions de terrain quotidiennes.',
        },
        {
          title: 'Intégration réussie',
          desc: "Nous facilitons l'adaptation en France tout en valorisant la richesse culturelle de chacun.",
        },
        {
          title: 'Partage & échange',
          desc: "Nous créons des espaces de rencontre interculturels et conviviaux pour briser l'isolement.",
        },
        {
          title: 'Proximité & écoute',
          desc: 'Notre accompagnement est personnalisé, adapté au parcours et aux besoins spécifiques de chaque famille.',
        },
      ],
      teamBadge: 'Gouvernance',
      teamTitle: "L'équipe de l'association",
      teamSubtitle: 'Des bénévoles et des professionnels engagés au service de la solidarité.',
      photoOf: 'Photo de',
      team: [
        {
          role: 'Président',
          bio: "Porte la vision de l'association et la représente auprès des institutions strasbourgeoises.",
        },
        {
          role: 'Trésorière',
          bio: "Veille à la saine gestion financière et à la transparence budgétaire de l'association.",
        },
        {
          role: 'Secrétaire',
          bio: "Coordonne l'accueil des familles et organise les plannings des permanences et des cours de FLE.",
        },
      ],
      recruiting:
        'Nous recherchons des talents pour compléter notre équipe dirigeante et bâtir ce pont ensemble !',
      ctaTitle: 'Rejoignez notre aventure solidaire',
      ctaText:
        "Que ce soit en donnant de votre temps comme formateur de français, accompagnateur administratif, ou en soutenant nos actions par un don mensuel, vous changez concrètement la vie de dizaines de familles.",
      ctaPrimary: 'Devenir adhérent ou donateur',
      ctaSecondary: 'Devenir bénévole',
    },

    partners: {
      meta: {
        title: 'Partenaires et gouvernance',
        description:
          "Découvrez nos partenaires institutionnels, associatifs et d'entreprise, ainsi que notre modèle de gouvernance transparent et démocratique.",
      },
      breadcrumb: 'Partenaires & gouvernance',
      badge: 'Confiance & solidarité',
      titleBefore: 'Partenaires &',
      titleHighlight: 'transparence financière',
      subtitle:
        "Nous croyons en un modèle d'action partenarial et transparent. Découvrez nos soutiens et notre gouvernance démocratique.",
      governanceTitle: 'Une gouvernance transparente',
      governanceText:
        "L'Association Afrique de l'Est et ses amis est une structure à but non lucratif gérée selon les principes du droit local alsacien-mosellan. Notre gouvernance est collégiale, démocratique et transparente.",
      governancePoints: [
        {
          title: 'Élections annuelles',
          desc: "Le conseil d'administration et le bureau sont renouvelés chaque année par l'assemblée générale des adhérents.",
        },
        {
          title: 'Transparence financière',
          desc: 'Nos comptes sont certifiés chaque année et présentés publiquement dans notre rapport financier, disponible sur demande.',
        },
        {
          title: 'Modération des frais',
          desc: 'Plus de 92 % de nos ressources financières sont directement affectées aux actions de terrain pour les familles.',
        },
      ],
      financeTitle: 'Transparence financière : emploi des ressources',
      financeRows: [
        { label: 'Actions sociales (cours, traduction, emploi)', value: '92,4 %' },
        { label: 'Frais de communication et de collecte', value: '4,8 %' },
        { label: 'Frais administratifs de fonctionnement', value: '2,8 %' },
      ],
      financeNote:
        "* Données certifiées sur l'exercice 2025. L'association est éligible aux réductions d'impôts au titre d'organisme d'intérêt général (articles 200 et 238 bis du CGI).",
      partnersBadge: 'Réseau de confiance',
      partnersTitle: 'Ils soutiennent notre action',
      partnersSubtitle:
        'Grâce aux subventions publiques, aux aides associatives et au mécénat privé, nous pérennisons nos actions.',
      groups: [
        {
          category: 'Institutions',
          items: [
            {
              name: 'Préfecture du Bas-Rhin',
              desc: "Accompagnement des démarches liées à la régularisation et à l'intégration.",
            },
            {
              name: "Services de l'État",
              desc: "Coordination sur les dispositifs d'accueil des primo-arrivants.",
            },
            {
              name: "Organismes d'intégration",
              desc: "Partenariats sur les parcours d'intégration linguistique et sociale.",
            },
          ],
        },
        {
          category: 'Ville & région',
          items: [
            {
              name: 'Ville de Strasbourg',
              desc: "Soutien aux actions locales et mise à disposition d'espaces d'accueil.",
            },
            {
              name: 'Eurométropole',
              desc: 'Passerelles avec les infrastructures sportives et sociales de quartier.',
            },
            {
              name: 'Quartiers prioritaires',
              desc: 'Actions ciblées en faveur des familles des quartiers prioritaires.',
            },
          ],
        },
        {
          category: 'Local & sport',
          items: [
            {
              name: 'Clubs sportifs locaux',
              desc: "Partenariats pour faciliter l'inscription et l'équipement des jeunes sportifs.",
            },
            {
              name: 'Associations de quartier',
              desc: 'Collaboration sur les événements interculturels et le lien social.',
            },
            {
              name: 'Réseaux de bénévoles',
              desc: 'Mobilisation de traducteurs et accompagnateurs bénévoles.',
            },
          ],
        },
      ],
    },

    support: {
      meta: {
        title: 'Adhérer et faire un don',
        description:
          "Adhérez pour 10 € par an ou soutenez par un don mensuel. Reçu fiscal CERFA envoyé automatiquement, 66 % déductibles de l'impôt, résiliation en un clic.",
      },
      breadcrumb: 'Adhérer & soutenir',
      badge: 'Rejoignez-nous',
      titleBefore: 'Adhérez &',
      titleHighlight: 'soutenez notre mission',
      subtitle:
        "Chaque euro compte. Votre soutien finance directement des cours de français, des ateliers jeunesse et un accompagnement à l'emploi pour les familles d'Afrique de l'Est en France.",
      heroStats: [
        { value: '5€', label: 'par mois', sub: 'pour commencer' },
        { value: '66%', label: 'déductibles', sub: 'des impôts' },
        { value: '100%', label: 'sécurisé', sub: 'Stripe' },
      ],
      guarantees: [
        { title: 'Paiement 100 % sécurisé', description: 'Stripe assure la sécurité de vos transactions.' },
        { title: 'Reçu fiscal automatique', description: "Votre reçu CERFA 11580*03 vous est envoyé chaque janvier par l'association." },
        { title: 'Résiliation en un clic', description: 'Annulez votre don mensuel à tout moment, sans engagement.' },
        { title: '66 % déductibles', description: "Vos dons sont déductibles à 66 % de l'impôt sur le revenu." },
      ],
      whyBadge: 'Pourquoi adhérer ?',
      whyTitle: "Bien plus qu'un don",
      whySubtitle:
        "Adhérer à l'association, c'est s'engager concrètement et rejoindre une communauté qui agit au quotidien pour l'intégration des familles.",
      reasons: [
        {
          title: "Soutenir concrètement l'intégration",
          description:
            "Votre cotisation finance directement les cours de français, le soutien jeunesse et l'accompagnement vers l'emploi des familles que nous accompagnons.",
        },
        {
          title: 'Une communauté solidaire',
          description:
            "Rejoignez un réseau d'adhérents et de bénévoles engagés autour des mêmes valeurs de solidarité et d'entraide.",
        },
        {
          title: 'Des informations privilégiées',
          description:
            'Newsletter mensuelle, invitations en avant-première à nos événements et temps forts de la vie associative.',
        },
        {
          title: 'Participer à la vie associative',
          description:
            "En tant qu'adhérent, vous pouvez prendre part à l'assemblée générale et voter sur les orientations de l'association.",
        },
      ],
      loading: 'Chargement…',
      taxTitle: 'de déduction fiscale',
      taxText:
        "En tant qu'association d'intérêt général, vos dons ouvrent droit à une réduction d'impôt de 66 % du montant versé, dans la limite de 20 % de votre revenu imposable (article 200 du CGI).",
      taxExampleTitle: 'Exemple concret',
      taxRows: [
        { don: '5 €/mois = 60 €/an', revient: '20,40 €/an réels', saving: '39,60 € économisés' },
        { don: '10 €/mois = 120 €/an', revient: '40,80 €/an réels', saving: '79,20 € économisés' },
        { don: '20 €/mois = 240 €/an', revient: '81,60 €/an réels', saving: '158,40 € économisés' },
      ],
      taxFootnote: '* Après déduction fiscale de 66 %',
      faqBadge: 'Questions fréquentes',
      faqTitle: 'Vous avez des questions ?',
      faqs: [
        {
          q: 'Comment obtenir mon reçu fiscal ?',
          a: "L'association édite votre reçu fiscal (CERFA 11580*03) chaque mois de janvier et vous l'envoie par email. Il couvre le total de vos dons de l'année écoulée. Vous le retrouvez également à tout moment dans votre espace adhérent, rubrique « Mes reçus fiscaux ».",
        },
        {
          q: 'Comment annuler mon don mensuel ?',
          a: 'Vous pouvez annuler votre don mensuel à tout moment depuis votre espace adhérent, sans frais ni pénalité. Votre abonnement sera arrêté à la fin du mois en cours.',
        },
        {
          q: 'Mes données sont-elles sécurisées ?',
          a: 'Absolument. Vos données personnelles et bancaires sont protégées conformément au RGPD. Les paiements sont traités par Stripe, certifié PCI-DSS niveau 1. Votre numéro de carte ne transite jamais par nos serveurs et nous ne le stockons nulle part.',
        },
        {
          q: 'Puis-je modifier le montant de mon don ?',
          a: 'Oui, vous pouvez modifier votre montant mensuel depuis votre espace adhérent. La modification prend effet au mois suivant.',
        },
        {
          q: "L'adhésion et le don mensuel sont-ils cumulables ?",
          a: "Oui ! Vous pouvez adhérer à l'association (10 €/an) et également faire un don mensuel. Les deux sont cumulables et chacun donne droit à la déduction fiscale correspondante.",
        },
      ],
      altBadge: 'Autres moyens de paiement',
      altTitle: "D'autres façons de nous soutenir",
      altSubtitle:
        'En plus du paiement en ligne par carte ou prélèvement SEPA, vous pouvez également nous soutenir par virement ou directement sur place.',
      transferTitle: 'Virement bancaire',
      transferText:
        'Idéal pour les dons annuels importants. Indiquez vos nom et email en référence afin que nous puissions vous adresser votre reçu fiscal.',
      transferHolder: 'Titulaire',
      cashTitle: 'Espèces ou chèque',
      cashText:
        "Remettez votre don en main propre lors de nos permanences d'accueil. Un reçu vous sera délivré sur place.",
      openingDays: [
        { day: 'Mardi', hours: '14h-18h' },
        { day: 'Samedi', hours: '10h-13h' },
      ],

      /** Formulaire de don en trois étapes, redirigeant vers Stripe Checkout. */
      donation: {
        steps: ['Formule', 'Coordonnées', 'Paiement'],
        badgePopular: 'Populaire',
        badgePremium: 'Premium',
        formulas: [
          {
            label: 'Adhésion simple',
            description: "Devenez membre de l'association",
            benefits: [
              'Carte de membre officielle',
              'Newsletter mensuelle',
              'Accès aux événements publics',
              'Reçu fiscal CERFA',
            ],
          },
          {
            label: 'Don solidaire',
            description: 'Soutenez nos actions au quotidien',
            benefits: [
              'Reçu fiscal annuel automatique',
              'Newsletter mensuelle',
              "Rapport d'impact annuel",
              'Résiliation sans engagement',
            ],
          },
          {
            label: 'Don engagé',
            description: "Rejoignez notre cercle d'engagés",
            benefits: [
              'Tout du Don solidaire',
              'Invitations aux événements internes',
              'Accès aux bilans trimestriels',
              'Badge adhérent sur le site',
            ],
          },
          {
            label: 'Don soutien',
            description: "Devenez un pilier de l'association",
            benefits: [
              'Tout du Don engagé',
              "Témoignage d'impact personnalisé",
              "Goodies de l'association",
              "Rencontre annuelle avec l'équipe",
            ],
          },
        ],
        step1Title: 'Choisissez votre formule',
        step1Subtitle:
          'Adhésion annuelle ou don mensuel récurrent — chaque contribution compte.',
        perMonth: '/mois',
        perYear: '/an',
        viaStripe: 'via Stripe',
        monthlyLabel: 'par mois',
        yearlyLabel: 'une fois par an',
        secureLine: 'Paiement sécurisé — déductible à 66 % des impôts',
        continueWithFormula: 'Continuer avec cette formule',
        step2Title: 'Vos coordonnées',
        step2Subtitle:
          'Ces informations sont nécessaires pour votre reçu fiscal et votre carte de membre.',
        acceptStatutes: "J'accepte les statuts de l'association",
        readStatutes: 'Lire les statuts',
        readStatutesSuffix: "de l'Association Afrique de l'Est et ses amis",
        newsletterLabel:
          "Je souhaite recevoir la newsletter de l'association (actualités, événements, témoignages)",
        back: '← Retour',
        continueToPayment: 'Continuer vers le paiement',
        privacyPurpose: 'pour gérer votre adhésion et éditer votre reçu fiscal',
        privacyRetention: '6 ans, au titre de nos obligations comptables',
        step3Title: 'Récapitulatif & paiement',
        orderTitle: 'Votre commande',
        taxReductionLabel: "Réduction d'impôt (66 %)",
        realCostLabel: 'Coût réel après impôts',
        debitNoteBefore: '💡 Vous serez prélevé de ',
        debitNoteAfter:
          ", intégralement reversés à l'association. Un reçu fiscal CERFA vous permettra de déduire 66 % de ce montant de votre impôt sur le revenu lors de votre prochaine déclaration.",
        paymentVia: 'Paiement via Stripe',
        redirectNote: 'Vous serez redirigé vers la page de paiement sécurisée de Stripe',
        sslNote: 'Connexion sécurisée SSL/TLS',
        pciNote: 'Certifié PCI-DSS — aucune donnée bancaire stockée',
        cerfaNote: "Reçu fiscal CERFA envoyé chaque janvier par l'association",
        payButton: 'Procéder au paiement',
        errorStatutes: "Vous devez accepter les statuts de l'association",
        toastUnavailableTitle: 'Paiement momentanément indisponible',
        toastUnavailableText:
          "Le formulaire de paiement n'est pas encore configuré. Merci de nous contacter directement.",
        toastErrorTitle: 'Une erreur est survenue',
        toastErrorText: 'Veuillez réessayer ou nous contacter.',
      },
    },

    contact: {
      meta: {
        title: 'Contact',
        description:
          "Contactez l'Association Afrique de l'Est et ses amis à Strasbourg : accompagnement des familles, bénévolat, partenariats. Réponse sous 48 h ouvrées.",
      },
      breadcrumb: 'Contact',
      badge: 'Nous contacter',
      titleBefore: 'Une question ?',
      titleHighlight: 'Écrivez-nous',
      subtitle:
        "Que vous soyez une famille sollicitant un accompagnement, un bénévole motivé, ou un partenaire potentiel, notre équipe est à votre écoute.",
      detailsTitle: 'Nos coordonnées',
      detailsText:
        "N'hésitez pas à nous contacter directement ou à venir nous rencontrer pendant nos permanences d'accueil.",
      emailLabel: 'Adresse email',
      phoneLabel: 'Téléphone',
      addressLabel: 'Adresse postale',
      hoursTitle: "📅 Permanences d'accueil",
      hoursText:
        "Sans rendez-vous pour les premières démarches et l'interprétariat d'urgence.",
      hours: [
        { label: 'Mardi (permanence administrative)', value: '14h00 - 18h00' },
        { label: 'Mercredi (soutien scolaire)', value: '14h00 - 17h00' },
        { label: 'Samedi (permanence FLE)', value: '10h00 - 13h00' },
      ],
      formTitle: 'Envoyer un message',
      nameLabel: 'Nom complet / structure',
      namePlaceholder: 'Jean Dupont',
      emailPlaceholder: 'jean.dupont@example.com',
      phoneOptional: 'Téléphone (facultatif)',
      phonePlaceholder: '+33 6 12 34 56 78',
      subjectLabel: 'Sujet',
      subjectPlaceholder: "Demande d'accompagnement, bénévolat…",
      messageLabel: 'Votre message',
      messagePlaceholder: 'Comment pouvons-nous vous aider ?…',
      submit: 'Envoyer le message',
      successTitle: 'Message envoyé !',
      successText:
        "Nous vous remercions pour votre intérêt. Un membre de l'équipe prendra contact avec vous très rapidement.",
      writeAnother: 'Écrire un autre message',
      privacyPurpose: 'pour traiter votre demande et y répondre',
      privacyRetention: '12 mois',
      errorName: 'Le nom doit contenir au moins 2 caractères',
      errorEmail: 'Adresse email invalide',
      errorSubject: 'Le sujet doit contenir au moins 3 caractères',
      errorMessage: 'Le message doit contenir au moins 10 caractères',
      errorGeneric: 'Une erreur est survenue.',
      toastSuccessTitle: 'Message envoyé ! 📬',
      toastSuccessText: 'Nous avons bien reçu votre demande et vous répondrons rapidement.',
      toastErrorTitle: 'Erreur',
      toastErrorText: "Impossible d'envoyer le message pour le moment.",
    },

    appointment: {
      meta: {
        title: 'Prendre rendez-vous',
        description:
          "Réservez un créneau avec l'association à Strasbourg : accompagnement administratif (CAF, préfecture, logement), cours de FLE et ateliers. Adhérents et non-adhérents.",
      },
      breadcrumb: 'Prendre rendez-vous',
      badge: 'Réservation',
      titleBefore: 'Prenons',
      titleHighlight: 'rendez-vous',
      subtitle:
        'Réservez un créneau pour un accompagnement administratif, un cours de FLE, un atelier, ou tout autre besoin. Ouvert aux adhérents comme aux non-adhérents.',
      typesTitle: 'Types de rendez-vous',
      typesText: 'Choisissez le type de rendez-vous, puis un créneau parmi ceux proposés.',
      types: [
        {
          label: 'Accompagnement administratif',
          description: 'Aide aux démarches : CAF, préfecture, logement, etc.',
        },
        {
          label: 'Cours de FLE & ateliers',
          description: 'Réservez votre place à un cours de français ou un atelier',
        },
        {
          label: 'Rendez-vous général',
          description: 'Une autre demande ? Prenons rendez-vous pour en discuter',
        },
      ],
      memberTitle: '👋 Déjà adhérent ?',
      memberText:
        'Connectez-vous pour retrouver tous vos rendez-vous dans votre espace membre.',
      memberLink: 'Se connecter →',
      step1: '1. Type de rendez-vous',
      step2: '2. Choisir un créneau',
      step3: '3. Vos coordonnées',
      loadingSlots: 'Chargement des créneaux disponibles…',
      noSlots: 'Aucun créneau disponible actuellement pour ce motif.',
      noSlotsHint: 'Contactez-nous directement, nous trouverons une solution.',
      nameLabel: 'Nom complet',
      namePlaceholder: 'Jean Dupont',
      emailLabel: 'Adresse email',
      emailPlaceholder: 'jean.dupont@example.com',
      phoneLabel: 'Téléphone (facultatif)',
      phonePlaceholder: '+33 6 12 34 56 78',
      reasonLabel: 'Précisez votre besoin (facultatif)',
      reasonPlaceholder: 'Je préfère en parler sur place',
      reasonHint:
        "Nous en parlerons plus en détail lors du rendez-vous — inutile d'écrire ici votre situation personnelle.",
      reasons: {
        aide_administrative: 'Aide administrative',
        cours_francais: 'Cours de français',
        emploi: 'Emploi',
        traduction: 'Traduction',
        autre: 'Autre',
      },
      submit: 'Confirmer le rendez-vous',
      successTitle: 'Rendez-vous confirmé !',
      successText: 'Un email de confirmation vient de vous être envoyé avec tous les détails.',
      bookAnother: 'Prendre un autre rendez-vous',
      privacyPurpose: 'pour organiser votre rendez-vous et préparer votre accompagnement',
      privacyRetention: '12 mois après le rendez-vous',
      errorGeneric: 'Une erreur est survenue.',
      toastSuccessTitle: 'Rendez-vous confirmé ! 📅',
      toastSuccessText: 'Vous allez recevoir un email de confirmation.',
      toastErrorTitle: 'Erreur',
      toastErrorText: 'Impossible de confirmer le rendez-vous.',
    },
  },
}

/**
 * Pas de `as const` : le type doit décrire « une chaîne » et non « cette
 * chaîne-là », sans quoi l'anglais et l'arabe ne pourraient rien contenir
 * d'autre que le texte français.
 */
export type Dictionary = typeof fr
