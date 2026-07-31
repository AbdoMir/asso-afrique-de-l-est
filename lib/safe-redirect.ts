/**
 * Vrai si la chaîne contient un caractère de contrôle ou un espace.
 *
 * Placés dans un en-tête `Location`, un retour chariot ou un saut de ligne
 * permettent d'y injecter des en-têtes supplémentaires (response splitting).
 *
 * Écrit par comparaison de codes plutôt qu'avec une expression régulière : une
 * classe de caractères contenant des octets de contrôle littéraux est
 * invisible à la relecture et se corrompt facilement.
 */
function hasControlOrSpace(value: string): boolean {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i)
    // 0x20 = espace, 0x7f = DEL, en dessous de 0x20 = caractères de contrôle.
    if (code <= 0x20 || code === 0x7f) return true
  }
  return false
}

/**
 * Filtre une destination de redirection fournie par l'utilisateur.
 *
 * Le paramètre `?redirect=` circule dans les liens de connexion : sans ce
 * filtre, un attaquant enverrait un lien légitime vers le site pointant vers
 * `?redirect=https://faux-site.example` pour rejouer une page de connexion et
 * récupérer des identifiants.
 *
 * Seuls les chemins internes sont acceptés — ni URL absolue, ni forme
 * « protocol-relative » (`//hote`), qui est une URL absolue déguisée.
 *
 * @returns le chemin demandé s'il est sûr, sinon `fallback`.
 */
export function safeRedirectPath(
  requested: string | null | undefined,
  fallback = '/espace-adherent'
): string {
  if (!requested) return fallback

  if (hasControlOrSpace(requested)) return fallback

  // Un backslash est normalisé en slash par plusieurs navigateurs : `/\evil`
  // devient `//evil`, soit une redirection externe.
  if (!requested.startsWith('/') || requested.startsWith('//') || requested.startsWith('/\\')) {
    return fallback
  }

  return requested
}
