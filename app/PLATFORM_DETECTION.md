# Platform Detection Guide

## Overview

This application automatically detects the platform (iOS, macOS, or Base/Android) and applies appropriate styling to all UI components. The detection is seamless and requires no manual configuration in production.

## How It Works

### 1. Automatic Detection

The platform detection system works through the following flow:

```
Telegram WebApp API
      ↓
window.Telegram.WebApp.platform
      ↓
AppRoot component initialization
      ↓
Platform Context (via React Context)
      ↓
All child components (via usePlatform hook)
```

### 2. Detection Logic

Located in: `src/components/Service/AppRoot/hooks/helpers/getInitialPlatform.ts`

```typescript
export const getInitialPlatform = () => {
  const telegramData = getTelegramData();
  if (!telegramData) {
    return 'base';
  }

  if (['ios', 'macos'].includes(telegramData.platform)) {
    return 'ios';
  }

  return 'base';
};
```

**Result:**
- iOS/macOS devices → `platform: 'ios'`
- Android/Desktop/Other → `platform: 'base'`

### 3. Component Adaptation

All UI Kit components automatically adapt their styling based on the detected platform:

**Components with iOS-specific styling:**
- `Cell` - Different padding, typography
- `Button` - Different corner radius, padding
- `Tabbar` / `TabbarItem` - Different spacing, icon sizes
- `TabsList` / `TabsItem` - Different font weights
- `Section` - Different backgrounds, spacing
- And many more...

**Example (Cell component):**
```tsx
export const Cell = ({ ... }) => {
  const platform = usePlatform(); // Gets 'ios' or 'base'
  
  return (
    <div className={classNames(
      styles.wrapper,
      platform === 'ios' && styles['wrapper--ios'], // Applies iOS styles
      ...
    )}>
      ...
    </div>
  );
};
```

## Development Testing

### Testing iOS Styling Locally

To test iOS-specific styling without an actual iOS device:

**Option 1: Force iOS platform in AppRoot**

```tsx
// app/App.tsx
<AppRoot platform="ios">
  {/* All components will use iOS styling */}
</AppRoot>
```

**Option 2: Leave automatic detection (default)**

```tsx
// app/App.tsx
<AppRoot>
  {/* Platform detected from Telegram WebApp */}
</AppRoot>
```

### Comparing Platforms Side-by-Side

If you need to compare both platforms during development:

1. Open your app in two browser tabs
2. In one tab, use browser DevTools console:
   ```javascript
   // Mock iOS platform
   window.Telegram = {
     WebApp: {
       platform: 'ios',
       ready: () => {},
       expand: () => {},
       // ... other required properties
     }
   };
   ```
3. Refresh the page
4. The second tab will use base styling, first tab will use iOS styling

## Production Deployment

**No configuration needed!** 

The app automatically detects the platform when users access it through:
- Telegram iOS app → iOS styling
- Telegram macOS app → iOS styling
- Telegram Android app → Base styling
- Telegram Desktop → Base styling
- Telegram Web → Base styling

## Styling Differences

### iOS vs Base

| Aspect | iOS | Base (Material) |
|--------|-----|-----------------|
| Button corners | 10px radius | 8px radius |
| Cell padding | 12px vertical | 16px vertical |
| Tabbar padding | Smaller (8-24px) | Larger (12-28px) |
| Typography | SF Pro (system) | Roboto-like |
| Section backgrounds | Subtle, inset | Card-like |

## Troubleshooting

### Issue: Components not showing iOS styling on iPhone

**Possible causes:**
1. Check if `AppRoot` has a forced `platform="base"` prop
2. Verify Telegram WebApp API is available: `console.log(window.Telegram?.WebApp?.platform)`
3. Check if AppRoot component is wrapping your entire app

### Issue: Want to force a specific platform

**Solution:**
Add the `platform` prop to `AppRoot`:

```tsx
<AppRoot platform="ios">  // or "base"
  {/* Your app */}
</AppRoot>
```

## Technical Details

### Platform Context

The platform is stored in React Context and provided by `AppRoot`:

```tsx
// Simplified version
<PlatformContext.Provider value={platform}>
  {children}
</PlatformContext.Provider>
```

### usePlatform Hook

Components access the platform using:

```typescript
import { usePlatform } from 'hooks/usePlatform';

const MyComponent = () => {
  const platform = usePlatform(); // 'ios' | 'base'
  // ...
};
```

### CSS Modules

Platform-specific styles are defined in component CSS modules:

```css
.wrapper {
  /* Base styles */
}

.wrapper--ios {
  /* iOS-specific overrides */
}
```

## References

- Platform detection: `src/components/Service/AppRoot/hooks/helpers/getInitialPlatform.ts`
- Telegram helper: `src/helpers/telegram.ts`
- usePlatform hook: `src/hooks/usePlatform.ts`
- AppRoot component: `src/components/Service/AppRoot/AppRoot.tsx`

