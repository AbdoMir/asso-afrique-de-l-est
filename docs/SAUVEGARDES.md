# Sauvegardes et restauration

> **Le point de départ.** Le plan gratuit de Supabase ne fournit **aucune
> sauvegarde automatique** — contrairement à une idée répandue, les « 7 jours de
> sauvegardes quotidiennes » commencent au plan Pro. Sans le dispositif décrit
> ici, une migration ratée, une suppression accidentelle ou un incident chez
> l'hébergeur effacerait définitivement les comptes adhérents, leurs rendez-vous
> et les reçus fiscaux.
>
> L'art. 32 du RGPD impose « la capacité à rétablir la disponibilité des données
> à caractère personnel dans des délais appropriés en cas d'incident ». Une
> obligation comptable s'y ajoute : les reçus fiscaux CERFA doivent être
> conservés **6 ans**, ce qui est impossible à tenir sans sauvegarde.

---

## 1. Lancer une sauvegarde

```bash
node scripts/sauvegarde.mjs
```

Le script lit `.env.local`, se connecte avec la clé `service_role` et écrit dans
`sauvegardes/AAAA-MM-JJ-HH-MM/`. Aucun mot de passe de base de données n'est
nécessaire.

⚠️ **Le dossier produit contient des données personnelles**, dont les
rendez-vous extérieurs des adhérents — qui relèvent de l'art. 9 : un rendez-vous
médical est une donnée de santé. Il est exclu de git par `.gitignore`. Ne le
déposez jamais sur un partage public, et chiffrez-le avant archivage.

## 2. Ce qui est sauvegardé, et ce qui ne l'est pas

| Élément | Couvert | Par quoi |
|---|---|---|
| Tables applicatives (9) | ✅ | export JSON |
| Fichiers des reçus fiscaux | ✅ | téléchargés depuis le bucket |
| Liste des comptes | ✅ | `auth_users.json` |
| Schéma : tables, RLS, triggers, contraintes | ✅ | `supabase/migrations/`, versionné dans git |
| **Empreintes de mots de passe** | ❌ | l'API d'administration ne les renvoie jamais |

**Conséquence de la dernière ligne** : après une restauration, les adhérents
devront passer par « mot de passe oublié ». C'est une limite assumée, et le prix
à payer pour une sauvegarde qui ne manipule aucune empreinte de mot de passe.

Pour une sauvegarde intégrale — schéma, données et secrets d'authentification
compris — il faut la CLI et le mot de passe de la base, disponible dans le
tableau de bord (Settings → Database) :

```bash
npx supabase link --project-ref vjgwbmuxyxvwdrqdsicr
npx supabase db dump --file sauvegardes/complete.sql --data-only
npx supabase db dump --file sauvegardes/schema.sql
```

## 3. Le manifeste, pièce maîtresse

Chaque sauvegarde produit un `manifeste.json` recensant le nombre de lignes par
table et le nombre de fichiers. **C'est lui qui rend une restauration
vérifiable** : sans point de comparaison, « ça a l'air d'avoir marché » n'est pas
une vérification.

Relevé de la sauvegarde du 10 août 2026, confronté à la base au même instant.
⚠️ Ce relevé est **daté** : le dépôt de documents a été supprimé depuis (12 août
2026), et avec lui les 2 fichiers qui y figuraient. Relancer le script pour
obtenir un point de comparaison à jour.

| Table | Lignes |
|---|---|
| profiles | 2 |
| memberships | 0 |
| donations | 0 |
| fiscal_receipts | 0 |
| appointment_slots | 20 |
| appointment_bookings | 8 |
| contact_messages | 11 |
| newsletter_subscribers | 2 |
| external_appointments | 0 |
| auth.users | 2 |
| fichiers | 2 |

Correspondance exacte, et les deux PDF récupérés sont intègres (139 Ko et
981 Ko, signature `%PDF` vérifiée).

## 4. Restaurer

1. **Recréer le schéma** — appliquer les migrations de `supabase/migrations/`
   dans l'ordre, sur un projet neuf ou remis à zéro.
2. **Réinjecter les données** — table par table, dans cet ordre, pour respecter
   les clés étrangères :
   `profiles` → `memberships` → `donations` → `fiscal_receipts` →
   `appointment_slots` → `appointment_bookings` → `external_appointments` →
   `contact_messages` → `newsletter_subscribers`.
3. **Recréer les comptes** depuis `auth_users.json`, puis déclencher un envoi de
   réinitialisation de mot de passe à chacun.
4. **Réenvoyer les fichiers** dans le bucket `fiscal-receipts`, en conservant
   l'arborescence `fichiers/<bucket>/<user_id>/<nom>` — les policies de stockage
   s'appuient sur le dossier `user_id`, une arborescence aplatie casserait le
   cloisonnement.
5. **Vérifier** : comparer les décomptes obtenus au `manifeste.json`.

> **État de validation.** L'**export** est vérifié : décomptes et intégrité des
> fichiers concordent avec la source. La **restauration complète n'a pas encore
> été exécutée de bout en bout** — cela demande un projet Supabase de test. Tant
> que ce test n'a pas eu lieu, la procédure ci-dessus reste théorique, et l'art.
> 32 attend qu'on la vérifie « régulièrement ». C'est le prochain jalon.

## 5. À quelle fréquence

Tant que les volumes restent faibles, **une sauvegarde par semaine** et une
**avant chaque migration** suffisent. Les migrations sont le risque numéro un :
c'est là qu'on détruit des données par accident, pas dans l'usage courant.

## 6. Rester au plan gratuit, ou passer au plan Pro ?

| | Gratuit | Pro | Pro + PITR |
|---|---|---|---|
| Coût | 0 € | ~25 $/mois | ~125 $/mois et plus |
| Sauvegardes automatiques | **aucune** | quotidiennes, 7 jours | continues, perte max ~2 min |
| Mise en veille du projet | après ~1 semaine d'inactivité | non | non |
| Restauration | à faire soi-même | depuis le tableau de bord | à un instant précis |

**Recommandation.** Aujourd'hui, le plan gratuit accompagné de ce script est
défendable : deux comptes, aucun don enregistré, quelques rendez-vous. La perte
maximale se compte en jours de saisie.

Le calcul change dès que l'un de ces seuils est franchi :

- les **premiers reçus fiscaux CERFA** sont émis — leur conservation sur 6 ans
  devient une obligation légale, pas un confort ;
- le suivi des rendez-vous est utilisé par **plusieurs familles**, qui comptent
  dessus pour ne pas manquer une convocation ;
- plus personne ne pense à lancer le script.

Le troisième point est le plus probable des trois. Une sauvegarde qui dépend
d'un geste manuel finit toujours par être oubliée — et on s'en aperçoit le jour
où on en a besoin.
