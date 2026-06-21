# FX Checker

## Implémenté
- Convertisseur temps réel (Send/Receive/Swap)
- Ticker de marché (5 paires avec variation 24h)
- Picker de devises avec recherche
- Chart d'historique des taux (1d à 5y)
- Comparaison multi-devises avec pin/unpin
- Favoris persistés (localStorage)
- Log de conversions persisté (localStorage)
- Navigation par tabs (History/Compare/Favorites/Log)
- Gestion des états vides et des erreurs API

## Non implémenté (limitation connue)
- Accessibilité clavier complète (focus, Escape, navigation Tab)
- ARIA live regions pour les annonces dynamiques
- Rôles ARIA sémantiques sur les tabs (tablist/tab/tabpanel)
- Structure HTML calquée sur le starter-code (architecture React custom à la place)

## Stack
React + Vite, Chart.js, API Frankfurter, localStorage