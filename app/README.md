# Budget Tracker App

This is the main application directory for the Budget Tracker Telegram Mini App.

## Structure

```
app/
├── index.html         # Entry HTML with Telegram SDK
├── main.tsx          # React initialization
├── App.tsx           # Main component with tab navigation
├── styles.css        # Global styles
├── telegram.d.ts     # Telegram WebApp type definitions
└── pages/            # Page components for each tab
    ├── HomePage.tsx
    ├── BudgetPage.tsx
    ├── StatsPage.tsx
    └── SettingsPage.tsx
```

## Development

From the project root:

```bash
# Start dev server
npm run dev

# Build for production
npm run build
```

## Adding New Pages

1. Create a new page component in `pages/`:

```tsx
// pages/NewPage.tsx
import { LargeTitle } from '../../src/components/Typography/LargeTitle/LargeTitle';

const NewPage = () => {
  return (
    <div className="page-content">
      <LargeTitle weight="1">New Page</LargeTitle>
      {/* Your content */}
    </div>
  );
};

export default NewPage;
```

2. Import and add to tabs in `App.tsx`:

```tsx
import NewPage from './pages/NewPage';
import { Icon28Edit } from '../src/icons/28/edit';

// Add to tabs array:
{
  id: 'new' as TabId,
  Icon: Icon28Edit,
  text: 'New',
  Component: NewPage,
}
```

## Available UI Components

All components from `src/components/` are available:

- **Blocks**: Button, Card, Cell, List, Badge, etc.
- **Form**: Input, Checkbox, Select, Slider, etc.
- **Typography**: Title, Text, Caption, etc.
- **Feedback**: Spinner, Progress, Skeleton, etc.

See [Storybook](https://tgui.xelene.me/) for examples.

## Telegram Integration

The app automatically initializes Telegram WebApp on mount:

```tsx
useEffect(() => {
  const tg = window.Telegram?.WebApp;
  if (tg) {
    tg.ready();
    tg.expand();
  }
}, []);
```

Access Telegram features:
- `window.Telegram.WebApp.MainButton`
- `window.Telegram.WebApp.BackButton`
- `window.Telegram.WebApp.initDataUnsafe.user`
- `window.Telegram.WebApp.themeParams`

## Styling

- Global styles in `styles.css`
- Component styles use CSS modules (imported from UI Kit)
- Telegram theme colors are applied via AppRoot component

## Platform Detection (iOS vs Android)

The app automatically detects the platform and applies iOS or Material Design styling accordingly.

**See [PLATFORM_DETECTION.md](./PLATFORM_DETECTION.md) for complete details**, including:
- How automatic detection works
- Component adaptation
- Development testing tips
- Troubleshooting

Quick overview:
- **iOS/macOS devices** → iOS-specific styling (SF Pro font, iOS paddings, etc.)
- **Android/Desktop** → Material Design styling
- **No configuration needed** - works automatically via Telegram WebApp API

For development testing, you can force iOS styling:
```tsx
<AppRoot platform="ios">
  {/* Your app */}
</AppRoot>
```

## TypeScript

Type definitions are in `telegram.d.ts` for Telegram WebApp API.

Full TypeScript support with proper imports and aliases configured in `tsconfig.json`.
