# Conformité RGPD — Association Afrique de l'Est et ses amis

> **À quoi sert ce fichier.** Il répond à une question : *« si la CNIL nous
> contrôle demain, qu'est-ce qu'on montre ? »* Chaque exigence y a une preuve —
> un fichier, une migration. Le RGPD appelle ça le principe de
> **responsabilité** (art. 5.2) : il ne suffit pas d'être conforme, il faut
> pouvoir le démontrer.
>
> **Comment le maintenir.** À chaque modification touchant des données
> personnelles, mettre à jour la ligne concernée. Si un traitement nouveau
> apparaît — formulaire, outil, sous-traitant — l'ajouter aux sections 4, 5 et 6
> **avant** la mise en production.

- **Responsable de traitement** : Association Afrique de l'Est et ses amis,
  association de droit local (Alsace-Moselle), SIRET 107 843 583 00017
- **Représentant légal** : Ismael Ali Moussa, Président
- **Référent RGPD** : *à désigner*
- **Dernière revue** : 12 août 2026

---

## 1. Pourquoi le RGPD s'applique

Aucune exemption ne joue pour une association, quel que soit son régime. Dès
lors qu'on collecte des noms, des emails, des dons ou des rendez-vous, on est
**responsable de traitement** (art. 4), soumis au RGPD et à la loi Informatique
et Libertés.

Deux particularités pèsent plus lourd que la moyenne :

1. **Données de l'art. 9.** Le suivi des rendez-vous extérieurs porte sur des
   données de santé et des situations administratives. Le fait même d'adhérer à
   une association « Afrique de l'Est » peut par ailleurs révéler une origine.
2. **Registre obligatoire (art. 30).** L'exemption « moins de 250 personnes »
   ne s'applique pas : les traitements sont réguliers et touchent des données
   sensibles.

**Pas de DPO obligatoire** : l'association n'est ni autorité publique, ni acteur
du suivi à grande échelle. Un référent interne suffit.

---

## 2. Ce qui est en place

### Droits des personnes et transparence

| Exigence | Preuve |
|---|---|
| Politique de confidentialité exacte et complète | [confidentialite/page.tsx](../app/legal/confidentialite/page.tsx) |
| Mention d'information à chaque point de collecte (art. 13) | [PrivacyNotice.tsx](../components/ui/PrivacyNotice.tsx) |
| Mentions légales complètes (SIRET, régime de droit local) | [lib/association.ts](../lib/association.ts) |
| Accès, portabilité et effacement en self-service | [api/compte/export](../app/api/compte/export/route.ts), [api/compte/suppression](../app/api/compte/suppression/route.ts) |
| Rectification en self-service | onglet Profil de l'espace adhérent |
| Consentement newsletter par acte positif, avec double opt-in | [NewsletterSection.tsx](../components/sections/NewsletterSection.tsx), migration 010 |
| Désinscription en un clic (lien + RFC 8058) | [api/newsletter/unsubscribe](../app/api/newsletter/unsubscribe/route.ts) |
| Purge automatique des durées annoncées | [api/cron/purge](../app/api/cron/purge/route.ts), [vercel.json](../vercel.json) |

### Minimisation

| Exigence | Preuve |
|---|---|
| Aucun dépôt de document par les adhérents | migration 014 |
| Aucun champ libre dans les formulaires publics | motif en liste fermée, migration 014 |
| Consentement explicite art. 9 pour le suivi des rendez-vous | trigger `external_appointments_consent_guard`, migration 015 |
| Le seul champ libre restant est cadré par son libellé | « Documents à apporter », interface d'administration |

### Sécurité (art. 32)

| Mesure | Preuve |
|---|---|
| Base de données en UE (Supabase `eu-north-1`, Stockholm) | API Supabase |
| RLS active sur toutes les tables, policies par utilisateur | migrations 001 à 015 |
| Clé `service_role` jamais exposée au navigateur | [lib/supabase/admin.ts](../lib/supabase/admin.ts) |
| Double authentification TOTP obligatoire pour le staff | migration 006, [lib/admin-guard.ts](../lib/admin-guard.ts) |
| Journalisation des accès aux données personnelles | [lib/audit.ts](../lib/audit.ts), table `audit_log` |
| Politique de mot de passe et rejet des mots de passe fuités | [lib/password-policy.ts](../lib/password-policy.ts) |
| En-têtes de sécurité HTTP (CSP, HSTS, X-Frame-Options…) | [next.config.js](../next.config.js) |
| Limitation de débit sur les routes publiques et admin | [lib/rate-limit.ts](../lib/rate-limit.ts) |
| Bucket de stockage privé, limité en taille et en types MIME | `fiscal-receipts`, migration 012 |
| Fonctions `SECURITY DEFINER` retirées de l'API publique | migration 012 |
| Aucune donnée bancaire en base (HelloAsso, PCI-DSS) | vérifié en base |
| Sauvegardes outillées et vérifiées | [scripts/sauvegarde.mjs](../scripts/sauvegarde.mjs), [SAUVEGARDES.md](SAUVEGARDES.md) |

---

## 3. Ce qui reste à faire

Rien de bloquant côté code. Ce qui suit demande une décision, un document ou une
signature de l'association.

### Documents à produire

| # | Quoi | Pourquoi ça compte |
|---|---|---|
| 1 | **Registre des traitements** au format CNIL, signé par le président | C'est le premier document réclamé lors d'un contrôle. L'ébauche technique est prête en section 4 |
| 2 | **DPA des cinq sous-traitants**, et analyses de transfert pour les trois américains | Obligation de l'art. 28. Aucun n'est archivé à ce jour |
| 3 | **Procédure de violation de données** (notification CNIL sous 72 h) | Le jour où ça arrive, il est trop tard pour l'écrire |
| 4 | **Analyse de risque** justifiant qu'une AIPD n'est pas requise | Un document court, mais c'est lui qui protège en cas de contrôle |

### Décisions à prendre

| # | Quoi | Enjeu |
|---|---|---|
| 5 | **Désigner un référent RGPD** | Sans nom, personne ne répond aux demandes d'exercice de droits |
| 6 | **Encadrer le traitement manuel des documents** | Le RGPD s'applique aux dossiers papier classés (art. 2.1). Une boîte mail ou un classeur sont **moins** protégés que ce qui vient d'être retiré du site. Décider où ces pièces vivent, qui y accède, et combien de temps |
| 7 | **Tester une restauration** sur un projet Supabase jetable, puis trancher entre plan gratuit et plan Pro | L'export est vérifié, la restauration reste théorique — voir [SAUVEGARDES.md](SAUVEGARDES.md) |
| 8 | **Mineurs de moins de 15 ans** | Si le focus Jeunesse accueille des mineurs, le consentement parental est requis |

### Corrections mineures

| # | Quoi |
|---|---|
| 9 | Ajouter aux mentions légales le **volume et le folio** d'inscription au registre des associations du tribunal judiciaire |
| 10 | **Statuts** : le document publié se dit régi par la loi de 1901, alors que le répertoire SIRENE classe l'association en droit local. Incohérence à faire trancher — le site n'y touche pas, c'est un document de l'association |

---

## 4. Registre des traitements (ébauche technique)

> Socle technique du registre, pas le registre officiel. Le document formel doit
> reprendre le modèle CNIL et être signé — voir point 1 ci-dessus.

| Traitement | Finalité | Base légale | Données | Durée |
|---|---|---|---|---|
| **Comptes adhérents** | Gestion de l'espace adhérent | Contrat (6.1.b) | Identité, email, téléphone, adresse | Adhésion + 3 ans |
| **Adhésions et dons** | Gestion administrative | Obligation légale et contrat | Identité, montants, références HelloAsso | 6 ans |
| **Reçus fiscaux CERFA** | Justification fiscale | Obligation légale (6.1.c) | Identité, adresse, montant, n° CERFA | 6 ans |
| **Rendez-vous avec l'association** | Organisation de l'accompagnement | Intérêt légitime (6.1.f) | Identité, contact, motif en liste fermée | 12 mois |
| **Rendez-vous extérieurs** | Aider l'adhérent à suivre ses démarches | **Consentement explicite (9.2.a)** | Catégorie, intitulé, date, lieu, pièces à apporter | 3 mois après la date |
| **Newsletter** | Information des sympathisants | Consentement (6.1.a) | Email, prénom, preuve horodatée | Jusqu'à désinscription |
| **Messages de contact** | Réponse aux demandes | Intérêt légitime (6.1.f) | Identité, contact, message | 12 mois |
| **Journal des accès** | Sécurité et traçabilité | Intérêt légitime (6.1.f) | Auteur, action, ressource, adresse IP | 12 mois |
| **Mesure d'audience** | Statistiques de fréquentation | Intérêt légitime (6.1.f) | Agrégé, sans identifiant persistant | — |
| **Limitation de débit** | Protection contre les abus | Intérêt légitime (6.1.f) | Adresse IP | 10 minutes |

---

## 5. Sous-traitants

| Sous-traitant | Rôle | Localisation | DPA |
|---|---|---|---|
| **Supabase** | Base de données, authentification, stockage | 🇪🇺 Suède | à récupérer — intègre les clauses contractuelles types |
| **HelloAsso** | Paiements, adhésions, reçus CERFA | 🇫🇷 France | à récupérer |
| **Vercel** | Hébergement et mesure d'audience | 🇺🇸 États-Unis | à récupérer, plus une analyse de transfert (certifié DPF) |
| **Resend** | Emails transactionnels et rappels | 🇺🇸 États-Unis | à récupérer, plus une analyse de transfert |
| **Upstash** | Compteurs anti-abus (adresses IP) | à vérifier | à récupérer |

---

## 6. Durées de conservation

Appliquées chaque nuit par [api/cron/purge](../app/api/cron/purge/route.ts). La
source de vérité est [lib/retention.ts](../lib/retention.ts) : une durée
modifiée là-bas doit l'être **ici et dans la politique de confidentialité**.
Annoncer une durée qu'on n'applique pas est un manquement à l'art. 13 à part
entière.

| Donnée | Durée | Fondement |
|---|---|---|
| Rendez-vous extérieurs | 3 mois après la date | Données art. 9 : la durée utile la plus courte |
| Inscriptions newsletter non confirmées | 7 jours | Sans confirmation, aucun consentement n'a été donné |
| Messages de contact | 12 mois | Fin du traitement de la demande |
| Rendez-vous avec l'association | 12 mois | Suivi de l'accompagnement |
| Journal des accès | 12 mois | Recommandation CNIL (6 mois à 1 an) |
| Comptes inactifs | 3 ans | Recommandation CNIL — *non automatisé* |
| Dons, adhésions, reçus fiscaux | 6 ans | Obligation comptable — *jamais purgés* |

---

## 7. Droits des personnes

| Droit | Mise en œuvre |
|---|---|
| **Accès et portabilité** (15, 20) | Export JSON — espace adhérent, onglet Profil |
| **Rectification** (16) | Self-service — espace adhérent, onglet Profil |
| **Effacement** (17) | Suppression de compte — espace adhérent, onglet Profil |
| **Opposition** (21) | Lien de désinscription au pied des emails |
| **Retrait du consentement** (7.3) | Case à décocher pour le suivi des rendez-vous ; suppression possible entrée par entrée |
| **Limitation** (18) | Sur demande, par email |
| **Réclamation** | Mention CNIL dans la politique de confidentialité |

**Délai de réponse légal : un mois.** Pour les demandes reçues par email, garder
trace de la date de réception et de la date de réponse.

⚠️ **L'effacement n'est pas total, et c'est légal.** Dons et reçus fiscaux sont
conservés 6 ans au titre de l'obligation comptable (art. 17.3.b). Lors d'une
suppression de compte, l'identité nécessaire au CERFA est figée dans
`fiscal_receipts.archived_identity`, et le lien vers le compte est rompu.

---

## 8. Décisions structurantes

Trois choix méritent d'être compris par qui reprendra ce dossier.

**Le suivi des rendez-vous repose sur un consentement, pas sur l'intérêt
légitime.** Un rendez-vous médical est une donnée de santé, un rendez-vous en
préfecture révèle une situation administrative : seul le consentement explicite
(art. 9.2.a) autorise ce traitement. Il est recueilli par l'adhérent lui-même,
horodaté pour être démontrable (art. 7.1), et vérifié **deux fois** — par l'API
puis par un trigger en base. Son retrait bloque toute nouvelle saisie sans
effacer les rendez-vous déjà notés : les supprimer d'office priverait la
personne de rendez-vous qu'elle attend peut-être.

**Le rejet des mots de passe compromis est une compensation.** Supabase réserve
cette protection à ses offres payantes. L'API HaveIBeenPwned étant publique,
elle est appelée directement : le mot de passe ne quitte jamais le navigateur,
seuls les 5 premiers caractères de son empreinte SHA-1 transitent, et l'appel
passe par notre propre serveur pour ne pas exposer l'adresse IP de l'adhérent.

**Le plan gratuit Supabase ne fournit aucune sauvegarde automatique** —
contrairement à une idée répandue, les 7 jours de rétention commencent au plan
Pro. D'où le script de sauvegarde maison, et le manifeste de décomptes qui rend
une restauration vérifiable plutôt que supposée.

---

## 9. Journal

| Date | Ce qui a changé |
|---|---|
| **12 août 2026** | Fin du dépôt de documents ; suivi des rendez-vous extérieurs sous consentement explicite ; motif en liste fermée ; rappels la veille (migrations 014-015) |
| **11 août 2026** | Journalisation des accès aux données personnelles (migration 013) |
| **10 août 2026** | Dispositif de sauvegarde ; identité légale corrigée — association de **droit local**, non loi 1901, donc sans numéro RNA |
| **6 août 2026** | Politique de confidentialité réécrite ; désinscription newsletter ; consentements décochés ; export et suppression de compte ; purge automatique ; en-têtes de sécurité ; politique de mot de passe ; migrations 008 à 012 appliquées |
| **Antérieur** | Double authentification TOTP du staff ; migration des paiements vers HelloAsso, qui retire toute donnée bancaire de la base |
