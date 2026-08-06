# Conformité RGPD — Association Afrique de l'Est et ses amis

> **À quoi sert ce fichier.** C'est le journal de bord de la conformité du site.
> Il répond à une question : *« si la CNIL nous contrôle demain, qu'est-ce qu'on
> montre ? »* Chaque exigence y a un statut, une preuve (fichier ou migration),
> et une date. Le RGPD appelle ça le principe de **responsabilité** (art. 5.2) :
> il ne suffit pas d'être conforme, il faut pouvoir le démontrer.
>
> **Comment le maintenir.** À chaque modification touchant des données
> personnelles : mettre à jour la ligne concernée du tableau de bord, et ajouter
> une entrée dans le journal en bas de page. Si un traitement nouveau apparaît
> (nouveau formulaire, nouvel outil, nouveau sous-traitant), l'ajouter aux
> sections 3, 4 et 5 **avant** la mise en production.

- **Responsable de traitement** : Association Afrique de l'Est et ses amis (loi 1901)
- **Représentant légal** : Ismael Ali Moussa, Président
- **Référent RGPD** : *à désigner* (voir point 13)
- **Dernière revue** : 6 août 2026

---

## 1. Pourquoi le RGPD s'applique à nous

Aucune exemption ne joue pour une association loi 1901. Dès lors qu'on collecte
des noms, des emails, des adresses, des dons ou des documents, on est
**responsable de traitement** au sens de l'art. 4 RGPD, soumis au RGPD et à la
loi Informatique et Libertés.

Deux particularités **aggravent** nos obligations :

1. **Données potentiellement sensibles (art. 9).** L'accompagnement
   administratif, les documents déposés par les adhérents et les notes libres de
   rendez-vous peuvent révéler une situation migratoire, une origine, parfois de
   la santé. Le simple fait d'adhérer à une association « Afrique de l'Est » peut
   déjà être considéré comme révélateur d'une origine.
2. **Registre des traitements obligatoire (art. 30).** L'exemption « moins de
   250 personnes » ne s'applique pas : nos traitements sont réguliers et
   touchent potentiellement des données sensibles.

**Ce qui n'est PAS obligatoire pour nous** : la désignation d'un DPO (nous ne
sommes ni autorité publique, ni acteur du suivi à grande échelle). Un référent
RGPD interne suffit.

---

## 2. Tableau de bord de conformité

Légende : ✅ fait · 🚧 en cours · ❌ à faire · ⬜ non applicable

### Exigences techniques (site web)

| # | Exigence | Statut | Preuve / fichier |
|---|---|---|---|
| 1 | Politique de confidentialité exacte et complète | ✅ | [app/legal/confidentialite/page.tsx](../app/legal/confidentialite/page.tsx) |
| 2 | Consentement newsletter par acte positif (pas de case pré-cochée) | ✅ | [NewsletterSection.tsx](../components/sections/NewsletterSection.tsx), [DonationSection.tsx](../components/sections/DonationSection.tsx) |
| 3 | Mécanisme de désinscription newsletter | ✅ | [api/newsletter/unsubscribe](../app/api/newsletter/unsubscribe/route.ts) |
| 4 | Mention d'information au point de collecte (art. 13) | ✅ | [components/ui/PrivacyNotice.tsx](../components/ui/PrivacyNotice.tsx) |
| 5 | Registre des traitements (art. 30) | 🚧 | ébauche section 3 — à formaliser hors code |
| 6 | Droit à l'effacement + portabilité outillés | ✅ | [api/compte/export](../app/api/compte/export/route.ts), [api/compte/suppression](../app/api/compte/suppression/route.ts) |
| 7 | Purge automatique selon les durées annoncées | ✅ | [api/cron/purge](../app/api/cron/purge/route.ts), [vercel.json](../vercel.json) |
| 8 | Sous-traitants listés + DPA signés + TIA | 🚧 | section 4 — DPA à récupérer |
| 9 | Encadrement des documents adhérents (art. 9) | 🚧 | durée + purge faites ; consentement explicite à ajouter |
| 10 | Politique couvrant destinataires, transferts, droits complets | ✅ | politique réécrite le 6 août 2026 |
| 11 | Mentions légales complètes (RNA, SIRET, adresse) | ❌ | placeholders à remplir en production |
| 12 | Journalisation des accès administrateurs | ❌ | aucune table d'audit |
| 13 | Référent RGPD désigné + procédure de violation (72 h) | ❌ | à faire hors code |
| 14 | Analyse de risque écrite (AIPD non requise mais à justifier) | ❌ | à faire hors code |
| 15 | Consentement parental pour les mineurs de moins de 15 ans | ❌ | à évaluer selon le public réel |

### Sécurité (art. 32) — socle déjà en place

| Mesure | Statut | Preuve |
|---|---|---|
| Base de données hébergée en UE (Supabase `eu-north-1`, Stockholm) | ✅ | vérifié via l'API Supabase |
| RLS activée sur toutes les tables, policies par utilisateur | ✅ | [001_initial_schema.sql](../supabase/migrations/001_initial_schema.sql) |
| Buckets de stockage privés, cloisonnés par `user_id` | ✅ | [004_member_documents.sql](../supabase/migrations/004_member_documents.sql) |
| Aucune donnée bancaire stockée (HelloAsso, certifié PCI-DSS) | ✅ | aucun IBAN/PAN en base |
| Double opt-in newsletter avec preuve de consentement horodatée | ✅ | migration 010, appliquée le 6 août 2026 |
| Double authentification (TOTP) obligatoire pour le staff | ✅ | migration 006, [app/admin/securite](../app/admin/securite/page.tsx) |
| Limitation de débit sur les routes publiques et admin | ✅ | [lib/rate-limit.ts](../lib/rate-limit.ts) |
| Validation des fichiers déposés (magic bytes, taille, type) | ✅ | [lib/file-validation.ts](../lib/file-validation.ts) |
| Droit de rectification en self-service | ✅ | onglet Profil de l'espace adhérent |

---

## 3. Registre des traitements (ébauche technique)

> ⚠️ Cette section est le **socle technique** du registre, pas le registre
> officiel. Le registre formel doit reprendre le modèle CNIL (finalité, base
> légale, catégories de personnes, destinataires, transferts, durées, mesures de
> sécurité) et être signé par le président. Voir point 5 du tableau de bord.

| Traitement | Finalité | Base légale | Données | Durée |
|---|---|---|---|---|
| **Comptes adhérents** | Gestion de l'espace adhérent | Contrat (art. 6.1.b) | Identité, email, téléphone, adresse | Adhésion + 3 ans |
| **Adhésions & dons** | Gestion administrative, reçus fiscaux | Obligation légale + contrat | Identité, montants, références HelloAsso | 6 ans (obligation comptable) |
| **Reçus fiscaux CERFA** | Justification fiscale | Obligation légale (art. 6.1.c) | Identité, adresse, montant, n° CERFA | 6 ans |
| **Newsletter** | Information des sympathisants | Consentement (art. 6.1.a) | Email, prénom, preuve de consentement | Jusqu'à désinscription |
| **Messages de contact** | Réponse aux demandes | Intérêt légitime (art. 6.1.f) | Identité, email, téléphone, message | 12 mois |
| **Rendez-vous** | Organisation de l'accompagnement | Intérêt légitime / consentement | Identité, email, téléphone, notes libres | 12 mois après le RDV |
| **Documents adhérents** | Accompagnement administratif | Consentement explicite (art. 9.2.a) | Documents déposés (PDF, images) | 24 mois |
| **Mesure d'audience** | Statistiques de fréquentation | Intérêt légitime (sans cookie) | Données agrégées, aucun identifiant persistant | Agrégé |
| **Limitation de débit** | Sécurité, anti-abus | Intérêt légitime (art. 6.1.f) | Adresse IP | 10 minutes glissantes |

---

## 4. Sous-traitants et destinataires

| Sous-traitant | Rôle | Localisation | DPA | À faire |
|---|---|---|---|---|
| **Supabase** | Base de données, authentification, stockage | 🇪🇺 Stockholm (`eu-north-1`) | à archiver | Récupérer le DPA signé |
| **Vercel Inc.** | Hébergement, mesure d'audience | 🇺🇸 US (edge UE) | à archiver | DPA + TIA (transfert hors UE) |
| **Resend** | Envoi des emails transactionnels | 🇺🇸 US | à archiver | DPA + TIA |
| **Upstash** | Compteurs de limitation de débit (IP) | à vérifier | à archiver | Vérifier la région, DPA |
| **HelloAsso** | Paiements, adhésions, reçus fiscaux CERFA | 🇫🇷 France | à archiver | Récupérer le DPA |

**TIA (Transfer Impact Assessment)** : requis pour Vercel, Resend et Upstash si
les données transitent hors UE. À documenter avant la prochaine revue.

---

## 5. Durées de conservation appliquées

Ces durées sont **appliquées automatiquement** par la tâche planifiée
[app/api/cron/purge/route.ts](../app/api/cron/purge/route.ts), exécutée chaque
nuit à 3 h ([vercel.json](../vercel.json)).

La source de vérité est [lib/retention.ts](../lib/retention.ts). Une durée
modifiée là-bas doit être répercutée **ici** et dans la **politique de
confidentialité** — annoncer une durée qu'on n'applique pas est un manquement à
l'art. 13 à part entière.

⚠️ La variable `CRON_SECRET` doit être définie dans les variables
d'environnement Vercel : sans elle, la route de purge refuse toutes les requêtes
et **plus aucune donnée n'est supprimée**.

| Donnée | Durée | Fondement |
|---|---|---|
| Messages de contact | 12 mois | Fin du traitement de la demande |
| Réservations de rendez-vous | 12 mois après le créneau | Suivi de l'accompagnement |
| Créneaux de rendez-vous passés | 12 mois | Cohérence avec les réservations |
| Inscriptions newsletter non confirmées | 7 jours | Consentement jamais donné |
| Documents adhérents | 24 mois | Fin de l'accompagnement |
| Dons, adhésions, reçus fiscaux | 6 ans | Obligation comptable et fiscale |
| Comptes adhérents inactifs | 3 ans | Recommandation CNIL — *non automatisé* |

---

## 6. Droits des personnes — comment on répond

| Droit | Mise en œuvre | Où |
|---|---|---|
| **Accès / portabilité** (art. 15, 20) | Export JSON en un clic | Espace adhérent → Profil |
| **Rectification** (art. 16) | Modification en self-service | Espace adhérent → Profil |
| **Effacement** (art. 17) | Suppression de compte en self-service | Espace adhérent → Profil |
| **Opposition** (art. 21) | Lien de désinscription newsletter | Pied des emails |
| **Limitation** (art. 18) | Sur demande par email | Politique de confidentialité |
| **Réclamation** | Mention CNIL | Politique de confidentialité |

**Délai de réponse légal : 1 mois.** Pour les demandes reçues par email, tenir
une trace de la date de réception et de la date de réponse.

⚠️ **L'effacement n'est pas total, et c'est légal.** Les dons et reçus fiscaux
sont conservés 6 ans au titre de l'obligation comptable (art. 17.3.b RGPD). Lors
d'une suppression de compte, l'identité nécessaire au reçu CERFA est archivée
dans `fiscal_receipts.archived_identity` et le lien vers le compte est rompu.

---

## 7. Ce qui reste à faire (hors code)

Ces points ne se règlent pas dans le dépôt — ils demandent une décision ou un
document de l'association.

1. **Registre des traitements formel** — reprendre la section 3 sur le modèle
   CNIL, le faire valider et signer par le président.
2. **Récupérer et archiver les DPA** des cinq sous-traitants (section 4).
3. **Rédiger les TIA** pour les sous-traitants américains.
4. **Remplir RNA et SIRET** dans les variables d'environnement de production
   (`NEXT_PUBLIC_RNA`, `NEXT_PUBLIC_ASSOCIATION_SIRET`) et **trancher l'adresse
   du siège** : `.env.example` indique Strasbourg, le code retombe sur
   Lingolsheim.
5. **Désigner un référent RGPD** et écrire la procédure de violation de données
   (notification CNIL sous 72 h).
6. **Écrire l'analyse de risque** justifiant qu'une AIPD n'est pas requise — un
   document court, mais c'est lui qui protège en cas de contrôle.
7. **Consentement explicite art. 9** pour le dépôt de documents : ajouter une
   case dédiée avant l'envoi, distincte de l'adhésion.
8. **Mineurs** : si des jeunes de moins de 15 ans peuvent s'inscrire, prévoir le
   recueil du consentement parental.
9. **Journalisation des accès admin** : table d'audit recensant qui consulte
   quel message ou quel rendez-vous.

---

## 8. Journal des modifications

### 6 août 2026 — Mise en conformité technique

Corrections des points 1, 2, 3, 4, 6 et 7 du tableau de bord.
Migration [011_rgpd_droits_personnes.sql](../supabase/migrations/011_rgpd_droits_personnes.sql),
appliquée en production le 6 août 2026.

- **Politique de confidentialité réécrite.** Elle annonçait Plausible Analytics
  alors que le site charge Vercel Web Analytics : annoncer un outil et en
  utiliser un autre est un manquement à l'art. 13. Le texte décrit désormais
  l'outil réellement en place, et couvre les rendez-vous, les documents
  adhérents, les destinataires, les transferts hors UE, l'ensemble des droits et
  la réclamation auprès de la CNIL.
- **Cases de consentement décochées par défaut.** La newsletter était
  pré-cochée sur le formulaire de don et sur le bloc newsletter — un
  consentement pré-coché est invalide (CJUE *Planet49*).
- **Désinscription newsletter.** Route de désinscription en un clic à partir
  d'un jeton, page de confirmation, lien ajouté au pied des emails et en-têtes
  `List-Unsubscribe` (RFC 8058).
- **Mentions d'information** ajoutées sous chaque formulaire (contact,
  rendez-vous, don, newsletter).
- **Export et suppression de compte** en self-service depuis l'espace adhérent.
  Les reçus fiscaux ne sont plus détruits en cascade : ils survivent détachés du
  compte, avec l'identité figée dans `archived_identity`, pour honorer à la fois
  le droit à l'effacement et l'obligation comptable de 6 ans.
- **Purge automatique** quotidienne appliquant les durées de la section 5.

**À faire avant le prochain déploiement** : définir `CRON_SECRET` dans les
variables d'environnement Vercel.

### 6 août 2026 — Migrations 008, 009 et 010 : jamais appliquées

Découvert en testant la purge : les migrations 008, 009 et 010 existaient dans
le dépôt mais **n'avaient jamais été appliquées à la base de production**.
Conséquences, actives jusqu'à ce jour :

- Le **double opt-in newsletter n'était pas en vigueur** — les colonnes
  `confirmed`, `confirmation_token` et `confirmed_at` n'existaient pas. La
  preuve de consentement que le dépôt semblait apporter n'existait donc pas.
- L'**inscription à la newsletter renvoyait une erreur 500** : la route lisait
  une colonne absente. Personne ne pouvait s'inscrire.
- La policy `UPDATE` trop permissive sur les réservations était toujours active.
- Le webhook HelloAsso n'avait pas sa clé d'idempotence, et rien n'empêchait la
  surréservation d'un créneau.

Les trois migrations ont été appliquées le 6 août 2026. Les 3 inscrits existants
ont été considérés confirmés à leur date d'inscription, comme le prévoit la
migration 010 : les repasser en « non confirmé » les aurait désabonnés sans le
leur demander.

Un créneau de rendez-vous du 30 juillet avait une durée nulle
(`end_at = start_at`) et bloquait la contrainte `end_at > start_at` de la
migration 009. Il a été **réparé** (fin repoussée d'une heure) plutôt que
supprimé, pour ne pas emporter la réservation qui lui était rattachée.

> **Leçon à retenir** : la présence d'un fichier de migration dans le dépôt ne
> prouve rien. Avant d'affirmer qu'une mesure est en place, vérifier l'état réel
> de la base.

### Antérieur

- Double authentification TOTP obligatoire pour le staff (migration 006)
- Migration des paiements vers HelloAsso : plus aucune donnée bancaire en base
