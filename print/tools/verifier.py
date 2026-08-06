"""Controle les PDF produits dans print/out/ avant qu'ils partent a l'impression.

Trois verifications, dans l'ordre de ce qui coute le plus cher a rater :

  1. Le QR code se decode-t-il, rendu a la taille physique reelle et en 300 dpi ?
     Un QR faux ou illisible, c'est un tirage entier a jeter.
  2. Les polices sont-elles embarquees ? Sinon l'imprimeur substitue et la
     maquette change sans prevenir.
  3. Le format est-il exactement A4 ou A5 ?

    pip install pymupdf opencv-python-headless
    python print/tools/verifier.py [https://url-attendue]
"""

import glob
import os
import sys

import cv2
import numpy as np
import pymupdf

RACINE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
SORTIE = os.path.join(RACINE, "out")
PT_EN_MM = 25.4 / 72
FORMATS = {"A4": (210, 297), "A5": (148, 210)}
DPI_CONTROLE = 300


def format_de(largeur_mm: float, hauteur_mm: float) -> str:
    for nom, (l, h) in FORMATS.items():
        if abs(largeur_mm - l) < 1 and abs(hauteur_mm - h) < 1:
            return nom
    return f"inconnu ({largeur_mm:.1f}x{hauteur_mm:.1f} mm)"


def controler(chemin: str, url_attendue: str) -> bool:
    doc = pymupdf.open(chemin)
    nom = os.path.basename(chemin)
    ok = True

    print(f"\n{nom}")

    for i, page in enumerate(doc):
        largeur = page.rect.width * PT_EN_MM
        hauteur = page.rect.height * PT_EN_MM
        fmt = format_de(largeur, hauteur)
        marque = "OK  " if fmt in FORMATS else "ECHEC"
        print(f"  {marque} page {i + 1} : {fmt}  ({largeur:.1f} x {hauteur:.1f} mm)")
        if fmt not in FORMATS:
            ok = False

        # Polices. Chrome vectorise les webfonts chargees en data: URI sous forme
        # de Type3 : les glyphes sont embarques comme traces, sans nom de police.
        # Chercher « Inter » ou « Outfit » ne peut donc rien donner. Le controle
        # utile est l'inverse : toute police NOMMEE trahit un repli sur une
        # police systeme, c'est-a-dire un glyphe absent de Inter ou d'Outfit.
        nommees = {
            f[3].split("+")[-1] for f in page.get_fonts(full=True) if f[2] != "Type3" and f[3]
        }
        replis = {p for p in nommees if not any(a in p for a in ("Inter", "Outfit"))}
        if replis:
            print(f"  ECHEC repli sur une police systeme : {', '.join(sorted(replis))}")
            print("        -> un caractere du document n'existe pas dans Inter/Outfit")
            ok = False
        else:
            print("  OK   aucun repli de police (glyphes vectorises par Chrome)")

        # QR : rendu a 300 dpi, comme sur une vraie epreuve papier.
        pix = page.get_pixmap(dpi=DPI_CONTROLE)
        img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, pix.n)
        gris = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY if pix.n == 3 else cv2.COLOR_RGBA2GRAY)

        # detectAndDecodeMulti et pas detectAndDecode : la detection simple
        # renonce des qu'une page porte plus d'un code. Tous les codes trouves
        # doivent pointer vers la meme URL.
        trouve, codes, _, _ = cv2.QRCodeDetector().detectAndDecodeMulti(gris)
        codes = [c for c in codes if c] if trouve else []

        if not codes:
            print(f"  ECHEC aucun QR code lisible a {DPI_CONTROLE} dpi")
            ok = False
        elif any(c != url_attendue for c in codes):
            mauvais = sorted({c for c in codes if c != url_attendue})
            print(f"  ECHEC QR pointant ailleurs que {url_attendue!r} : {mauvais}")
            ok = False
        else:
            pluriel = f" x{len(codes)}" if len(codes) > 1 else ""
            print(f"  OK   QR decode a {DPI_CONTROLE} dpi{pluriel} -> {codes[0]}")

    doc.close()
    return ok


def main() -> int:
    url = sys.argv[1] if len(sys.argv) > 1 else "https://asso.afrique.est-sa.org"
    fichiers = sorted(glob.glob(os.path.join(SORTIE, "*.pdf")))

    if not fichiers:
        print("Aucun PDF dans print/out/ — lancer d'abord : node print/build.mjs")
        return 1

    print(f"URL attendue : {url}")
    resultats = [controler(f, url) for f in fichiers]

    total, bons = len(resultats), sum(resultats)
    print(f"\n{bons}/{total} document(s) conformes.")
    return 0 if bons == total else 1


if __name__ == "__main__":
    raise SystemExit(main())
