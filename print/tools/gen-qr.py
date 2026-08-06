"""Genere le QR code du site en SVG vectoriel (un seul <path>, fill=currentColor).

Vectoriel = net a n'importe quelle taille d'impression, contrairement a un PNG.
Correction d'erreur H (~30 % de redondance) : le code reste scannable meme
partiellement abime ou masque sur un panneau d'affichage.

    pip install qrcode
    python print/tools/gen-qr.py https://asso.afrique.est-sa.org print/assets/qr-site.svg
"""

import sys

import qrcode

QUIET_ZONE = 2  # modules de marge blanche (4 recommandes, 2 suffisent car le
# document reserve deja une marge blanche autour du QR)


def main() -> int:
    if len(sys.argv) != 3:
        print(__doc__)
        return 1

    url, dest = sys.argv[1], sys.argv[2]

    qr = qrcode.QRCode(
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        border=QUIET_ZONE,
        box_size=1,
    )
    qr.add_data(url)
    qr.make(fit=True)

    matrix = qr.get_matrix()
    size = len(matrix)

    # Un seul path : chaque module noir devient un carre de 1x1 dans un viewBox
    # aux dimensions de la matrice. Le document decide ensuite de la taille reelle.
    parts = [
        f"M{x} {y}h1v1h-1z"
        for y, row in enumerate(matrix)
        for x, cell in enumerate(row)
        if cell
    ]

    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" '
        f'shape-rendering="crispEdges" role="img" '
        f'aria-label="QR code vers {url}">'
        f'<path fill="currentColor" d="{"".join(parts)}"/>'
        f"</svg>\n"
    )

    with open(dest, "w", encoding="utf-8") as f:
        f.write(svg)

    print(f"{dest} — version {qr.version}, matrice {size}x{size}, {len(parts)} modules")
    print(f"cible : {url}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
