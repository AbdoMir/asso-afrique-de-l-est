'use client'

import { Download } from 'lucide-react'

export function DownloadButton() {
  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault()
        alert("Le téléchargement des statuts au format PDF (Simulé) a démarré.")
      }}
      className="inline-flex items-center gap-2 text-sm font-bold text-white bg-primary-500 hover:bg-primary-600 px-4 py-2.5 rounded-xl shadow-warm transition-all hover:-translate-y-0.5"
    >
      <Download className="w-4 h-4" />
      Télécharger les Statuts (PDF)
    </a>
  )
}
