# Supports imprimés

Affiche A4 et flyer A5 de l'association, dont le message central est de faire
connaître le site : un QR code renvoie vers `https://asso.afrique.est-sa.org`
pour la prise de rendez-vous en ligne.

Direction visuelle retenue, **« Le pont »** : une courbe partage la page en deux
rives, crème en haut et bleu canard en bas, avec un câble orange qui la longe.
Le QR se pose sur l'autre rive. La palette suit celle du logo (orange → bleu
canard) plutôt que le vert du site — c'est le logo qui dicte, puisque c'est lui
que les familles reconnaissent déjà. Les deux directions écartées sont
conservées dans `src/archive/`.

Ce dossier est indépendant du site : il n'entre ni dans le build Next.js, ni
dans les globs Tailwind, et n'ajoute aucune dépendance à `package.json`.

## Trilingue : français, anglais, arabe

La communauté d'Afrique de l'Est accueillie par l'association est francophone,
anglophone **ou** arabophone. Une affiche uniquement en français exclurait une
partie de ceux à qui elle s'adresse. Le français porte donc l'accroche (le
support est affiché en France, le site est en français), l'anglais et l'arabe la
reprennent au même niveau, et les quatre services sont donnés dans les trois
langues.

Deux mises en page différentes selon le format :

- **A4** — trois colonnes, une par langue. La grille dit d'elle-même « on vous
  parle dans votre langue ».
- **A5** — 148 mm ne permettent pas trois colonnes lisibles : les langues
  s'empilent sous chaque service.

**L'arabe est toujours ferré à gauche**, comme le français et l'anglais, pour
que les trois langues forment une même colonne de lecture. Ferré à droite, il
partait seul à l'autre bout du bloc et le lien avec le service se perdait.

### Deux pièges RTL, tous deux déjà rencontrés

**1. L'alignement.** `direction: rtl` fait résoudre le `text-align: start` par
défaut vers la **droite** : retirer un `text-align: right` ne suffit donc pas, il
faut poser `text-align: left` explicitement. La classe `.ar` de `charte.css`
s'en charge une fois pour toutes, et `.ar.centre` sert aux rares blocs centrés
(sous le QR code).

**2. L'ordre des listes.** Ne **jamais** mettre une liste française sur une ligne
et sa traduction arabe sur la ligne d'en dessous en espérant que les termes se
correspondent verticalement. La ligne arabe se compose de droite à gauche : le
premier élément de la source atterrit à l'extrême **droite**, et l'ordre apparaît
inversé par rapport au français. La bande des six pays est ainsi restée un temps
avec « الصومال » (Somalie) sous *Djibouti* et « جيبوتي » (Djibouti) sous
*Somalie*.

La parade est structurelle : **une colonne par élément**, chacune contenant son
terme français et sa traduction arabe. C'est ce que fait `.pays` dans les deux
maquettes. Toute liste bilingue à venir doit suivre le même principe.

`direction` reste actif dans tous les cas : c'est lui qui gouverne le sens du
texte et la position de la ponctuation, seul l'alignement du bloc est ramené sur
la marge commune.

L'arabe est composé en **Noto Sans Arabic** (Inter et Outfit ne couvrent pas
l'écriture arabe), avec un corps majoré d'environ 15 % et un interligne plus
généreux : à taille égale, l'œil arabe est plus petit et les signes suscrits ont
besoin de place. La classe `.ar` de `charte.css` applique tout cela.

> **Les traductions anglaises et arabes doivent être relues par un locuteur
> natif avant impression.** L'association a des traducteurs — c'est justement
> l'un de ses services. Une faute sur un tract imprimé en volume ne se rattrape
> pas.

## Produire les PDF

```bash
node print/build.mjs            # tout rendre
node print/build.mjs flyer      # ne rendre que les documents correspondants
```

Chaque maquette HTML de `src/` est rendue par **Chrome headless** en PDF
vectoriel dans `out/`, plus un PNG de relecture dans `out/apercus/`. Le texte et
le QR restent des tracés : nets à n'importe quelle taille d'impression.

Les maquettes sont des pages web ordinaires — pour travailler la mise en page,
ouvrir `src/affiche-a4.html` directement dans un navigateur.

> **Fermer les PDF dans le lecteur avant de reconstruire.** Sous Windows,
> Acrobat verrouille le fichier en écriture ; Chrome échoue alors à réécrire le
> PDF **tout en sortant en code 0**. `build.mjs` compare la date de
> modification avant et après le rendu et s'arrête net si le fichier n'a pas
> bougé — sans ce garde-fou, le build annonçait « OK » en laissant en place un
> PDF périmé, et `verifier.py` validait ensuite l'ancien fichier.
>
> Conséquence pour la relecture : **contrôler les PDF de `out/`, pas seulement
> les aperçus de `out/apercus/`**. Ils sont produits par deux passes Chrome
> distinctes et peuvent diverger, précisément dans ce cas.

Pour un imprimeur, lui fournir `out/affiche-a4.pdf` et `out/flyer-a5.pdf` : il
fait son imposition lui-même. Il demandera probablement un fond perdu de 3 mm —
se modifie dans la règle `@page` des maquettes. Pour un tirage en interne, la
fonction « 2 pages par feuille » de la boîte de dialogue d'impression suffit.

## Contrôler avant impression

```bash
pip install pymupdf opencv-python-headless
python print/tools/verifier.py
```

Trois contrôles, dans l'ordre de ce qui coûte le plus cher à rater :

1. **Le QR se décode-t-il**, rendu depuis le PDF à 300 dpi, vers la bonne URL ?
2. **Aucun repli de police** ? Chrome vectorise les webfonts en Type3 ; toute
   police *nommée* dans le PDF signale un caractère absent des familles
   embarquées, remplacé par une police système. Ce contrôle a déjà rattrapé deux
   cas : un `U+2011` (trait d'union insécable) qui faisait basculer un titre
   entier en Times New Roman, et une flèche `→` qui passait trois lignes du
   verso en Segoe UI. **S'en tenir aux caractères couverts par Inter, Outfit et
   Noto Sans Arabic**, et dessiner les symboles en CSS ou en SVG. C'est aussi ce
   contrôle qui garantit que l'arabe est bien composé en Noto Sans Arabic.
3. **Le format** est-il exactement A4 ou A5 ?

Ces contrôles ne remplacent pas l'épreuve papier : imprimer **à 100 %** (jamais
« ajuster à la page »), vérifier la lisibilité à 3 m pour l'affiche et à 40 cm
pour le flyer, et **scanner le QR avec un téléphone sur le papier imprimé**.

## Organisation

```
print/
├── src/
│   ├── charte.css        # jetons de couleur et de typo, cadre de page
│   ├── affiche-a4.html   # affiche d'affichage public
│   ├── flyer-a5.html     # tract, 2 pages = recto + verso
│   └── archive/          # les deux directions écartées
├── assets/
│   ├── fonts.css         # Inter + Outfit + Noto Sans Arabic, base64 (généré)
│   ├── logo.png          # logo détouré, fond transparent (généré)
│   ├── logo-mono.png     # silhouette orange unie, pour l'impression 2 couleurs
│   └── qr-site.svg       # QR vectoriel vers le site (généré)
├── tools/                # préparation des assets et contrôle qualité
├── build.mjs
└── out/                  # PDF et aperçus (générés)
```

Les dimensions sont en `mm` et les tailles de texte en `pt` : ces documents sont
physiques, pas des écrans.

## Régénérer les assets

Aucun de ces scripts n'a besoin d'être relancé au quotidien — seulement si
l'URL, le logo ou les polices changent.

```bash
# QR code (si l'adresse du site change)
pip install qrcode
python print/tools/gen-qr.py https://asso.afrique.est-sa.org print/assets/qr-site.svg

# Polices (récupérées sur Google Fonts, puis embarquées en base64)
node print/tools/embed-fonts.mjs

# Logo (détourage + variante monochrome)
node print/tools/detour-logo.mjs <source.png> print/assets/logo.png
```

Le logo n'existait sous aucune forme source dans le dépôt : il a été extrait de
l'image embarquée dans `Affiche Association Afrique Est Ses Amis.pdf` avec
PyMuPDF, puis détouré. **Si l'association retrouve le fichier d'origine
(vectoriel de préférence), le substituer** : la version actuelle plafonne à
2342 px de large.

## Points à valider avant tout tirage

- [x] **Adresse** — `B'CoWorker, Espace Européen de l'Entreprise, 23 rue de la
      Haye, 67300 Schiltigheim`, confirmée par l'association. Elle contredit à
      la fois `.env.example` (45 Bd la Fontaine, Strasbourg) et le repli codé
      dans `components/layout/Footer.tsx` (Lingolsheim) : **le site affiche donc
      une mauvaise adresse et devrait être corrigé.**
- [ ] **Chiffres d'impact** — `components/sections/ImpactSection.tsx` annonce
      « 89 % d'insertion emploi », « 1240 traductions », « 120 familles ». Aucun
      n'est repris sur le papier tant que l'association ne les confirme pas.
- [ ] **Numéro RNA** — encore `WXXXXXXXXXX` dans `.env.example`. Mention omise
      des supports.
- [ ] **Réseaux sociaux** — les liens du Footer pointent vers les accueils
      génériques (`facebook.com`…). Aucune icône sociale sur les supports tant
      que les vrais comptes ne sont pas connus.
- [ ] **Traductions anglaises et arabes** — à faire relire par un locuteur natif
      avant tout tirage (voir plus haut).
