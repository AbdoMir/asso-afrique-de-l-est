/**
 * Injecte un bloc JSON-LD dans la page.
 *
 * `JSON.stringify` échappe déjà les guillemets ; reste `<` qui, dans une
 * chaîne du document, permettrait de fermer prématurément la balise <script>.
 * On le neutralise en \u003c, séquence que JSON.parse relit à l'identique.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\u003c'),
      }}
    />
  )
}
