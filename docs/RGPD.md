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
- **Dernière revue** : 6 août 2026 (audit d'architecture Supabase + Vercel, section 8)

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
| Chiffrement en transit (HSTS) | ✅ | `max-age=63072000; includeSubDomains`, déclaré dans [next.config.js](../next.config.js) |
| Fonctions `SECURITY DEFINER` non exposées via l'API | ✅ | migration 012 — `anon` et `authenticated` révoqués, vérifié en base |
| En-têtes de sécurité HTTP (CSP, X-Frame-Options…) | ✅ | [next.config.js](../next.config.js), CSP vérifiée au navigateur |
| Limites serveur sur les buckets (taille, types MIME) | ✅ | migration 012 — 4 Mo et 4 types sur `member-documents` |
| Protection contre les mots de passe compromis | ✅ *par compensation* | fonction native réservée au plan Pro Supabase — réimplémentée dans [lib/password-policy.ts](../lib/password-policy.ts) |
| Politique de mot de passe (longueur, composition) | ✅ | 12 caractères, lettre + chiffre — code et tableau de bord Supabase |
| Sauvegardes vérifiées et restauration testée | ❌ | jamais testé ; plan gratuit, pas de PITR — voir section 8 |
| Chiffrement applicatif des documents art. 9 | ❌ | absent — voir section 8 |

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
| **Supabase** | Base de données, authentification, stockage | 🇪🇺 Stockholm (`eu-north-1`) | à archiver | Récupérer le DPA signé (il intègre les CCT) |
| **Vercel Inc.** | Hébergement, mesure d'audience | 🇺🇸 US (edge UE) | à archiver | DPA + TIA. Vercel est certifié **Data Privacy Framework** — le vérifier sur le registre officiel et l'archiver |
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
10. **Tester une restauration de sauvegarde** et décider si le plan gratuit
    Supabase suffit — 7 jours de rétention, aucune restauration à un instant T,
    et mise en veille du projet après une semaine d'inactivité (art. 32).
11. **Chiffrement applicatif** des documents adhérents relevant de l'art. 9, ou
    décision motivée de s'en remettre au chiffrement au repos de Supabase.

### Correctifs techniques rapides (issus de l'audit d'architecture, section 8)

Tous traités. Pour mémoire :

- ✅ `CRON_SECRET` défini dans Vercel — route de purge vérifiée en production
  (401 sans authentification, au lieu du 503 précédent).
- ✅ Révocation des fonctions `SECURITY DEFINER`, en-têtes de sécurité HTTP,
  limites serveur des buckets (migration 012 et `next.config.js`).
- ✅ Mots de passe compromis : compensés par une vérification maison, la
  fonction native étant réservée au plan Pro (voir section 8).
- ✅ Réglages Supabase durcis : *Secure password change* activé, longueur
  minimale portée à 8, exigence lettres + chiffres, expiration des liens email
  ramenée de 3600 à 1800 secondes.

⚠️ **Le déploiement reste à faire** pour la partie code : les en-têtes de
sécurité et la politique de mot de passe ne seront actifs qu'après avoir poussé
`next.config.js`, `lib/password-policy.ts` et `app/api/auth/pwned/`.

---

## 8. Architecture Supabase + Vercel — audit du 6 août 2026

Audit mené à partir de l'article [« Gestion des données sensibles de l'Union
européenne avec Supabase et Vercel »](https://404-collective.com/blog/gestion-des-donnees-sensibles-de-l-union-europeenne-avec-supabase-et-vercel)
(404 Collective), dont chaque mesure a été confrontée à l'état réel du projet —
base de production et code — et non au dépôt seul.

> ⚠️ **Réserve sur l'article.** Il présente `eu-west-2` (Londres) comme une
> région UE. Depuis le Brexit, le Royaume-Uni est un **pays tiers** : y héberger
> des données reste possible grâce à la décision d'adéquation de 2021, mais cela
> constitue un transfert international, à traiter comme tel. Sa liste de régions
> est par ailleurs incomplète — `eu-north-1` (Stockholm), que nous utilisons,
> n'y figure pas alors qu'elle est bien dans l'UE.

### Mesures respectées

| Mesure préconisée | État | Preuve vérifiée |
|---|---|---|
| Région UE à la création du projet | ✅ | `eu-north-1` (Stockholm), API Supabase |
| RLS activé sur toutes les tables | ✅ | 9 tables sur 9, 21 policies au total |
| Ne jamais exposer `service_role` au navigateur | ✅ | présent uniquement dans [lib/supabase/admin.ts](../lib/supabase/admin.ts) ; aucun fichier `'use client'` ne l'importe |
| Aucun secret préfixé `NEXT_PUBLIC_` | ✅ | vérifié sur tout le code et `.env.example` |
| Opérations privilégiées via fonctions serveur | ✅ | route handlers Next.js, jamais le navigateur |
| MFA / TOTP pour les comptes privilégiés | ✅ | obligatoire pour le staff (migration 006) |
| Protection contre le bourrinage | ✅ | défauts Supabase + [lib/rate-limit.ts](../lib/rate-limit.ts) |
| Chiffrement en transit (HTTPS/TLS) | ✅ | HSTS `max-age=63072000` en production |
| Chiffrement au repos | ✅ | assuré par Supabase/AWS |
| Stockage privé des fichiers | ✅ | `fiscal-receipts` et `member-documents` : `public = false` |
| Droit d'accès — export | ✅ | [api/compte/export](../app/api/compte/export/route.ts) |
| Droit de rectification | ✅ | onglet Profil de l'espace adhérent |
| Droit à l'effacement | ✅ | [api/compte/suppression](../app/api/compte/suppression/route.ts) |
| Portabilité en format structuré (JSON) | ✅ | export JSON téléchargeable |
| Minimisation des données | ✅ | aucun champ superflu dans les formulaires |
| Pseudonymisation | 🟡 partielle | la suppression de compte détache les reçus fiscaux et fige l'identité dans `archived_identity` |
| Politique de suppression / anonymisation | ⚠️ écrite mais **inactive** | code en place, mais `CRON_SECRET` absent de Vercel → la route renvoie 503 |

### Mesures non respectées

| Mesure préconisée | État | Détail |
|---|---|---|
| **Signer les DPA Supabase et Vercel** | ❌ | Aucun DPA récupéré ni archivé. L'article le qualifie d'« indispensable ». Concerne aussi Resend, Upstash et HelloAsso. |
| **Vérifier les sauvegardes et tester la restauration** | ❌ | Jamais testé. Le projet s'est mis en veille pendant cet audit : c'est la signature du plan gratuit, qui n'offre que des sauvegardes quotidiennes conservées 7 jours et **aucune restauration à un instant T (PITR)**. L'art. 32 exige de pouvoir rétablir la disponibilité des données. |
| **Chiffrement applicatif des données très sensibles** | ❌ | Aucun. Or les documents déposés par les adhérents (titres de séjour, pièces administratives) relèvent potentiellement de l'art. 9. Ils reposent uniquement sur le chiffrement au repos de Supabase et sur le cloisonnement RLS. |
| **Registre des traitements** | 🚧 | Ébauche en section 3, pas de registre formel signé. |
| Fournisseurs d'identité OAuth | ⬜ | Non applicable : authentification par email et mot de passe uniquement. Ce n'est pas une obligation. |

### Écarts trouvés au-delà de l'article

Quatre écarts relevés pendant la vérification. **Trois ont été corrigés le
6 août 2026** ; le quatrième est un réglage de tableau de bord.

| Écart | État |
|---|---|
| Deux fonctions `SECURITY DEFINER` (`check_appointment_capacity()`, `rls_auto_enable()`) appelables par `anon` et `authenticated` via `/rest/v1/rpc/…` | ✅ corrigé — migration 012 |
| En-têtes de sécurité HTTP absents (seul HSTS était posé, par défaut Vercel) | ✅ corrigé — [next.config.js](../next.config.js) |
| Buckets sans `file_size_limit` ni `allowed_mime_types` : la validation n'existait qu'au niveau applicatif, contournable par une clé détournée | ✅ corrigé — migration 012 |
| Protection contre les mots de passe compromis désactivée | ✅ compensée — voir ci-dessous |

### Mots de passe compromis : mesure native indisponible, compensation retenue

**Le constat.** Supabase sait refuser les mots de passe figurant dans des fuites
connues, mais réserve la fonction à ses offres payantes. Sur le plan gratuit,
activer le curseur renvoie : *« Configuring leaked password protection via
HaveIBeenPwned.org is available on Pro Plans and up »*. La mesure préconisée
était donc inapplicable en l'état.

**La compensation.** L'API « Pwned Passwords » de HaveIBeenPwned est publique et
gratuite — l'offre Pro ne fait que l'appeler à votre place. Elle est donc
appelée directement, à l'inscription et à chaque changement de mot de passe
([lib/password-policy.ts](../lib/password-policy.ts),
[api/auth/pwned](../app/api/auth/pwned/route.ts)).

**Pourquoi cette implémentation est elle-même conforme.** Le mot de passe ne
quitte jamais le navigateur. Son empreinte SHA-1 y est calculée, et seuls les
**5 premiers caractères** de cette empreinte sont transmis — un préfixe partagé
par des centaines de milliers de mots de passe. La comparaison finale se fait
dans le navigateur. C'est le principe de *k-anonymat*. L'appel transite en outre
par notre propre serveur, de sorte que l'adresse IP de l'adhérent n'est jamais
exposée à un tiers, et que la CSP reste limitée à `'self'`.

**Comportement en cas de panne** : si HaveIBeenPwned est injoignable, le mot de
passe est accepté. Empêcher quelqu'un de créer son compte parce qu'un service
tiers est hors ligne serait un remède pire que le mal.

**Politique appliquée** : 12 caractères minimum, au moins une lettre et un
chiffre, rejet des mots de passe trop répétitifs, puis rejet de ceux présents
dans une fuite. Ce dernier contrôle est le plus efficace des quatre :
`Motdepasse1!` respecte toutes les règles de composition imaginables et figure
pourtant **6 869 fois** dans les fuites recensées.

> ⚠️ Ces règles existent à deux endroits : `lib/password-policy.ts` et le
> tableau de bord Supabase (Authentication → Sign In / Providers → Email). La
> règle appliquée est toujours **la plus stricte des deux**, puisque le contrôle
> applicatif s'exécute avant l'appel à Supabase.
>
> État actuel : exigence lettres + chiffres identique des deux côtés, mais
> longueur minimale à **12 dans le code** et **8 chez Supabase**. C'est donc 12
> qui s'applique. Porter le réglage Supabase à 12 supprimerait cet écart — sans
> quoi une règle durcie côté tableau de bord pourrait un jour dépasser celle du
> code et produire un message d'erreur brut en anglais.

**Sur la révocation des fonctions** — un piège à retenir : `revoke execute … from
anon, authenticated` ne suffit pas. PostgreSQL accorde `EXECUTE` au pseudo-rôle
`public` à la création de toute fonction, et les deux rôles en héritent. Il faut
révoquer sur `public`. Vérifié ensuite avec `has_function_privilege`, et le
trigger de capacité continue de fonctionner (test de surréservation rejouée : la
seconde réservation est bien refusée).

**Sur la CSP** — `'unsafe-inline'` est conservé sur les scripts : la plupart des
pages sont pré-rendues en statique et ne peuvent donc pas porter un nonce
calculé par requête. La CSP garde l'essentiel de son intérêt (aucun script
tiers, pas d'encadrement du site, `object-src 'none'`, `base-uri` verrouillé).
`'unsafe-eval'` n'est présent qu'en développement. Vérifiée au navigateur sur
l'accueil, l'adhésion, les rendez-vous, la connexion et les pages légales :
aucune violation, Supabase joignable, et un domaine non déclaré bien bloqué.

---

## 9. Journal des modifications

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

### 6 août 2026 — Purge activée et politique de mot de passe

- **`CRON_SECRET` défini dans Vercel.** La route de purge répond désormais 401
  au lieu de 503 : le secret est en place et le cron nocturne peut s'exécuter.
  La politique de confidentialité dit à nouveau vrai. À ce jour la purge ne
  supprimera rien — le projet a deux mois, aucune donnée n'a atteint son terme —
  mais le mécanisme est en place pour le jour où ce sera le cas.
- **Réglages d'authentification Supabase durcis** : *Secure password change*
  activé (session de moins de 24 h exigée pour changer de mot de passe),
  longueur minimale portée de 6 à 8, exigence lettres + chiffres, expiration des
  liens email ramenée de 1 h à 30 min. *Require current password when updating*
  laissé désactivé : il casserait le parcours « mot de passe oublié », qui par
  nature ne peut pas fournir l'ancien mot de passe.
- **Politique de mot de passe applicative** (voir section 8) : 12 caractères,
  lettre + chiffre, rejet des mots de passe déjà fuités via HaveIBeenPwned.
  10 tests unitaires ajoutés, dont la vérification qu'aucune donnée plus longue
  que les 5 premiers caractères de l'empreinte ne quitte le navigateur.

### 6 août 2026 — Durcissement technique (migration 012 + en-têtes HTTP)

Correction de trois des quatre écarts relevés par l'audit d'architecture.

- **Fonctions internes retirées de l'API publique.**
  `check_appointment_capacity()` et `rls_auto_enable()`, toutes deux en
  `security definer`, étaient appelables par n'importe quel visiteur via
  `/rest/v1/rpc/…`. Révocation sur `public` (et non sur `anon`/`authenticated`
  seuls, qui n'aurait rien retiré). Le trigger de capacité reste actif :
  vérifié par un test de surréservation.
- **En-têtes de sécurité HTTP** déclarés dans
  [next.config.js](../next.config.js) : CSP, `X-Frame-Options`,
  `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` et HSTS
  explicite. CSP vérifiée dans un navigateur sur six pages — aucune violation.
- **Limites serveur sur les buckets** : `member-documents` plafonné à 4 Mo et
  restreint aux PDF, JPEG, PNG et WEBP ; `fiscal-receipts` à 10 Mo et PDF
  uniquement. La validation applicative reste la première barrière, mais elle
  n'est plus la seule.

Reste hors dépôt : `CRON_SECRET` dans Vercel et la protection contre les mots de
passe compromis dans Supabase.

### 6 août 2026 — Audit de l'architecture Supabase + Vercel

Confrontation du projet aux mesures préconisées pour l'hébergement de données
sensibles européennes sur Supabase et Vercel. Résultat détaillé en section 8.

Le socle est conforme sur l'essentiel — région UE, RLS sur les 9 tables,
service_role jamais exposé, MFA staff, TLS, buckets privés, droits des personnes
outillés. Quatre manques structurels demeurent : **DPA non signés**,
**sauvegardes jamais testées** (plan gratuit, sans PITR), **aucun chiffrement
applicatif** sur les documents relevant de l'art. 9, et **registre non
formalisé**. Quatre écarts techniques ont par ailleurs été découverts :
protection contre les mots de passe compromis désactivée, deux fonctions
`SECURITY DEFINER` exposées via l'API REST, en-têtes de sécurité HTTP absents,
et buckets sans limite serveur.

Rappel : la purge automatique reste **inactive** faute de `CRON_SECRET` dans
Vercel, alors que la politique de confidentialité publiée en promet l'exécution
chaque nuit.

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
