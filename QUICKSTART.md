# Quick Start Guide

## 🚀 Getting Started in 3 Steps

### 1. Install & Run

```bash
npm install
npm run dev
```

Open http://localhost:5173

### 2. Deploy to Vercel

```bash
git add .
git commit -m "Initial commit"
git push

# Then import to Vercel or use CLI:
npx vercel
```

### 3. Set Up in Telegram

1. Talk to [@BotFather](https://t.me/BotFather)
2. `/newbot` → Create your bot
3. `/newapp` → Create mini app
4. Enter your Vercel URL
5. Done! 🎉

---

## 📁 Project Structure

```
app/                        # Your Telegram Mini App
├── App.tsx                # Main app with 4-tab navigation
├── pages/
│   ├── HomePage.tsx       # Home tab
│   ├── BudgetPage.tsx     # Budget tab
│   ├── StatsPage.tsx      # Stats tab
│   └── SettingsPage.tsx   # Settings tab
├── main.tsx               # React entry point
└── index.html             # HTML entry

src/                        # UI Kit Library
├── components/            # All UI components
├── icons/                 # Icons (12-36px sizes)
├── helpers/               # Utilities
└── hooks/                 # React hooks
```

---

## 🎨 4 Tabs Included

| Tab | Icon | Component | Features |
|-----|------|-----------|----------|
| 🏠 **Home** | Chat | HomePage | Welcome with Placeholder |
| 💖 **Budget** | Heart | BudgetPage | Budget cards |
| 📊 **Stats** | Stats | StatsPage | Statistics cards |
| ⚙️ **Settings** | Devices | SettingsPage | Settings list |

---

## ✏️ Customization Examples

### Change Tab Icons

```tsx
// app/App.tsx
import { Icon28Archive } from '../src/icons/28/archive';
import { Icon28Edit } from '../src/icons/28/edit';
```

### Add a New Tab

1. Create `app/pages/ProfilePage.tsx`:

```tsx
import { LargeTitle } from '../../src/components/Typography/LargeTitle/LargeTitle';

const ProfilePage = () => {
  return (
    <div className="page-content">
      <LargeTitle weight="1">Profile</LargeTitle>
      {/* Your content */}
    </div>
  );
};

export default ProfilePage;
```

2. Add to tabs array in `app/App.tsx`:

```tsx
{
  id: 'profile' as TabId,
  Icon: Icon28Edit,
  text: 'Profile',
  Component: ProfilePage,
}
```

### Use More Components

```tsx
import { Button } from '../../src/components/Blocks/Button/Button';
import { Input } from '../../src/components/Form/Input/Input';
import { Card } from '../../src/components/Blocks/Card/Card';

<Card>
  <Input placeholder="Enter amount" />
  <Button size="l">Save</Button>
</Card>
```

Browse all components at [tgui.xelene.me](https://tgui.xelene.me/)

---

## 📝 Common Scripts

```bash
# Development
npm run dev                # Start dev server
npm run build              # Build for production
npm run preview            # Preview build

# UI Kit Development
npm run storybook:dev      # Run Storybook
npm run build:lib          # Build UI library
```

---

## 🐛 Troubleshooting

**Port in use?**
```bash
npx kill-port 5173
npm run dev
```

**Module not found?**
```bash
rm -rf node_modules package-lock.json
npm install
```

**TypeScript errors?**
- Ensure Node.js 18+ installed
- Run `npm install` again

---

## 📚 Next Steps

- ✅ Customize pages in `app/pages/`
- ✅ Add your business logic
- ✅ Connect to backend API
- ✅ Deploy to Vercel
- ✅ Launch in Telegram!

**Need more help?** See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed guide.
