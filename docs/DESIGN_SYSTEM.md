# ImpactX Frontend — Sistema de diseño

Temas, modos y tokens de la aplicación. La marca visual de ImpactX se basa en tokens
CSS (`custom properties`) que los temas conmutan globalmente vía `data-theme`.

## Temas

Definidos en `src/styles/themes.css`, activados por `data-theme` en `<html>`:

| Tema | `data-theme` | Modo |
| --- | --- | --- |
| ImpactX Neon (predeterminado) | `impactx-neon` | oscuro |
| Profesional | `impactx-professional` | oscuro |
| Claro | `impactx-light` | claro |

Cambio: `ThemeSelector` (+ store `useThemeStore`), script anti-flicker inline en
`index.html` y aplicación inmediata en `AppProviders`.

## Tokens

`themes.css` define por tema:

- Color de marca: `--color-primary`, `--color-secondary`, `--color-brand`
- Fondos: `--color-bg-page`, panel (`raised`, `soft`, `elevated`)
- Texto: `--color-text-primary`, `--color-text-secondary`, `--color-text-muted`
- Bordes: `--color-border`, `--color-border-strong`
- Semántico: `--color-success`, `--color-warning`, `--color-error`, `--color-info`
- Foco: `--color-focus`
- Sombras, radios y transición.

## Utilidades

`utilities.css`:

- `.panel` — superficie elevada con borde y sombra.
- `.bg-page/.bg-panel-*` — variantes rápidas.
- `.content-wrap` — centrado horizontal con ancho máximo.
- `.focus-ring` — anillo de foco accesible reutilizable.
- Tipografías `.title/.body/.muted`, estados de carga (`.skeleton`, `.spinner`).

## Componentes

- **Form**: `Input`, `PasswordInput`, `Select`, `Checkbox`, `Label`, `FormField`
- **Feedback**: `Alert`, `Badge`, `Spinner`, `Skeleton`, `EmptyState`, `ErrorState`
- **Layout**: `Card`, `Modal`, `PageHeader`, `ThemeSelector`, `Button`, `IconButton`
- **Branding**: `ImpactXMark`, `ImpactXLogo`, `AppLogo`

## Accesibilidad

- etiquetas asociadas (`htmlFor`/`id`)
- `aria-pressed` (selector de temas), `aria-busy` (loading), `aria-hidden` en iconos
- foco visible y `:focus-visible` en controles
- orden semántico de encabezados por página
## Conservación de la paleta

La integración funcional no modifica `src/styles/themes.css`. Su SHA-256 de referencia es:

```text
fea329e321983c723bd72908ce27cf924f39124c3341f8f9bfb3d3b436c0b5d3
```

Los módulos nuevos usan exclusivamente tokens y utilidades existentes (`panel`, `text-primary`, `text-muted`, `text-brand`, etc.).
