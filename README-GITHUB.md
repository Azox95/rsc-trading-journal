# 📚 Guide: Comment mettre sur GitHub Pages

## 🎯 Ce que tu dois faire sur GitHub

### Étape 1: Récupère ton repo
Tu as déjà ce repo:
```
https://github.com/Azox95/rsc-trading-journal
```

### Étape 2: Change le fichier HTML
**C'est simple:** Renomme le fichier `rsc-trading-journal-v3.html` en `index.html`

**Pourquoi?** GitHub Pages regarde le fichier `index.html` par défaut.

### Étape 3: Upload sur ton repo
Tu as plusieurs options:

#### Option A: GitHub Web Interface (le plus simple 👍)
1. Va sur https://github.com/Azox95/rsc-trading-journal
2. Clique sur **"Code"** (vert)
3. Clique sur **"Upload files"**
4. Sélectionne le fichier `index.html`
5. Remplace l'ancien si demandé
6. Clique **"Commit changes"**

#### Option B: Ligne de commande (pour les devs)
```bash
cd /path/to/rsc-trading-journal
# Copie le fichier
cp rsc-trading-journal-v3.html index.html

# Git
git add index.html
git commit -m "Update: V3 avec formulaire manuel + Trading/Backtesting séparé"
git push origin main
```

### Étape 4: Vérifie que c'est en ligne
Après upload, attends **2-3 minutes**, puis ouvre:
```
https://azox95.github.io/rsc-trading-journal/
```

✅ Tu devrais voir ton dashboard!

---

## 📝 Ce que CHANGE avec V3

### Ancien (V1/V2)
- ❌ Formulaire + Paste ensemble
- ❌ Un seul journal
- ❌ Couleurs basiques

### Nouveau (V3) ✨
- ✅ **2 journaux séparés**: Trading Réel + Backtesting
- ✅ **Formulaire manuel**: Ajoute 1 trade rapidement (plus rapide que copier-coller)
- ✅ **Couleurs traders uniques**:
  - Owen: 🟡 Jaune
  - Nassim: 🟣 Violet
  - Noa: 🟢 Vert
  - Joseph: 🟠 Orange
  - Tom: 🔵 Bleu
- ✅ **Dashboard global** qui combine les deux journaux
- ✅ **Storage séparé** (ne mixed pas Trading et Backtesting)

---

## 💻 Comment utiliser le nouveau formulaire

### Ajouter 1 trade rapidement:
1. Onglet **"Importer"**
2. Scroll vers le bas → **"Ajouter un Trade Manuellement"**
3. Remplis:
   - **Paire**: `EURUSD`
   - **Mois**: Sélectionne dans la liste
   - **Date(s)**: `06/01/25` ou `06/01/25→07/01/25`
   - **RR**: `2.5R` ou `-1R` ou `BE`
   - **Tendance**: ACHETEUR ou VENDEUR
   - **Trader**: Owen, Nassim, Noa, Joseph, Tom
4. Sélectionne le type: **Trading Réel** ou **Backtesting**
5. Clique **"✅ Ajouter ce Trade"**

### Importer plusieurs à la fois:
1. Onglet **"Importer"** (en haut)
2. Sélectionne le type
3. Colle tes données TAB-separated
4. Clique **"📥 Importer"**

---

## 📊 Structure des onglets

| Onglet | Description |
|--------|-------------|
| 📊 **Dashboard** | Stats globales (Trading + Backtesting combinés) |
| 👥 **Traders** | Card par trader avec ses stats individuelles |
| 📈 **Trading Journal** | Table de tous tes trades réels |
| 🔬 **Backtesting Journal** | Table de tous tes backtests |
| 📥 **Importer** | Formulaire manuel + Paste pour import batch |

---

## 🔗 URL finale

```
https://azox95.github.io/rsc-trading-journal/
```

(Remplace les anciens URLs par celle-ci)

---

## ⚡ Quick Tips

- ✅ Les données sont **sauvegardées automatiquement** dans le navigateur (localStorage)
- ✅ Tu peux fermer et revenir plus tard, tout est là
- ✅ Le formulaire réinitialise après chaque ajout
- ✅ Cherche par paire/trader dans les onglets Trading/Backtesting

---

## ❓ Besoin d'aide?

- **"Comment renommer le fichier?"** → Télécharge, renomme en index.html, reupload
- **"Ça marche pas?"** → Attends 5 min (cache GitHub Pages), rafraîchis avec Ctrl+Shift+R
- **"Je veux ajouter une autre couleur?"** → Code la couleur en hex dans les TRADERS config

---

**C'est prêt! 🚀**
