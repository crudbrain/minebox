# Plan: Thème Vert Sage Ant Design

## Contexte
- L'application utilise antd v6.4.5 avec `@ant-design/nextjs-registry`
- `components/providers.tsx` wrappe les enfants avec `AntdRegistry` mais **sans** `ConfigProvider` ni personnalisation de thème
- Aucune customisation de thème antd n'existe actuellement
- L'utilisateur veut un primaryColor vert sauge avec une palette harmonieuse

## Changements

### 1. Modifier `components/providers.tsx`

Ajouter `ConfigProvider` de antd avec une prop `theme` contenant les seed tokens suivants :

```tsx
import { ConfigProvider } from 'antd';

const theme = {
  token: {
    colorPrimary: '#8A9A86',
    colorSuccess: '#7A9A6A',
    colorWarning: '#C4A862',
    colorError: '#C46B6B',
    colorInfo: '#7A8FA5',
    colorBgBase: '#FAFAF8',
    colorTextBase: '#2D3430',
    colorLink: '#6B8A6A',
    colorLinkHover: '#5A7A5A',
    borderRadius: 6,
  },
};
```

Le wrapper devient :
```tsx
<QueryClientProvider client={queryClient}>
  <NuqsAdapter>
    <AntdRegistry>
      <ConfigProvider theme={theme}>
        {children}
      </ConfigProvider>
    </AntdRegistry>
  </NuqsAdapter>
</QueryClientProvider>
```

### Palette de couleurs

| Token | Hex | Rôle |
|---|---|---|
| `colorPrimary` | `#8A9A86` | Vert sauge — boutons, liens actifs, sélection |
| `colorSuccess` | `#7A9A6A` | Vert naturel — messages de succès |
| `colorWarning` | `#C4A862` | Kaki doré — avertissements |
| `colorError` | `#C46B6B` | Rose poudré — erreurs |
| `colorInfo` | `#7A8FA5` | Bleu acier — informations |
| `colorBgBase` | `#FAFAF8` | Blanc cassé chaud — fonds |
| `colorTextBase` | `#2D3430` | Forêt sombre — texte |
| `colorLink` | `#6B8A6A` | Vert sauge foncé — liens |
| `colorLinkHover` | `#5A7A5A` | Vert sauge plus foncé — hover liens |

L'algorithme par défaut d'antd dérive automatiquement tous les autres tokens (hover, active, border, etc.) à partir de ces seed tokens, garantissant l'harmonie.

## Validation
- Lancer `npm run build` pour vérifier qu'il n'y a pas d'erreurs de compilation
- Vérifier visuellement que les composants antd (boutons, menus, tags, modals) utilisent bien le vert sauge comme couleur primaire
