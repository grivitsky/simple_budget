# Budget Tracker - Telegram Mini App

A production-ready Telegram Mini App for tracking budgets, built with the Telegram UI Kit.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Visit http://localhost:5173 to see the app.

## 📱 Features

- **4 Tab Navigation**: Home, Budget, Stats, Settings
- **Telegram UI Components**: Beautiful, native-feeling interface
- **TypeScript**: Fully typed for better development experience
- **Production Ready**: Configured for Vercel deployment

## 🏗️ Project Structure

```
simple_budget/
├── app/                    # Your Telegram Mini App
│   ├── pages/             # Tab pages (Home, Budget, Stats, Settings)
│   ├── App.tsx            # Main app with tab navigation
│   ├── main.tsx           # React entry point
│   └── index.html         # HTML entry
├── src/                    # UI Kit components library
│   ├── components/        # All UI components
│   ├── icons/             # Icon library
│   ├── helpers/           # Utility functions
│   └── hooks/             # React hooks
└── dist/                  # Built app (after build)
```

## 📦 Deployment

### Deploy to Vercel

1. Push to GitHub:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push
   ```

2. Go to [vercel.com](https://vercel.com) → New Project

3. Import your repository

4. Deploy (auto-configured via `vercel.json`)

### Set Up in Telegram

1. Talk to [@BotFather](https://t.me/BotFather)
2. Create bot: `/newbot`
3. Create mini app: `/newapp`
4. Enter your Vercel URL
5. Test in Telegram!

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## 🎨 Customization

### Change Tab Icons

Edit `app/App.tsx` and import different icons:

```tsx
import { Icon28Archive } from '../src/icons/28/archive';
import { Icon28Edit } from '../src/icons/28/edit';
```

Available icon sizes: 12, 16, 20, 24, **28** (recommended for tabs), 32, 36

### Add Components

Browse available components in `src/components/`:
- **Blocks**: Button, Card, Badge, Cell, List, etc.
- **Form**: Input, Checkbox, Select, Slider, etc.
- **Typography**: Title, Text, Caption, etc.
- **Feedback**: Spinner, Progress, Skeleton, etc.

See examples at [tgui.xelene.me](https://tgui.xelene.me/)

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run storybook:dev` | Run Storybook (UI Kit docs) |
| `npm run build:lib` | Build UI Kit library |

## 📚 Resources

- **UI Kit Storybook**: https://tgui.xelene.me/
- **Telegram Bot API**: https://core.telegram.org/bots/webapps
- **Example Apps**: https://github.com/Telegram-Mini-Apps/TGUI-Example
- **Deployment Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🛠️ Tech Stack

- React 18
- TypeScript
- Vite
- Telegram UI Kit
- Telegram Web App API

## 📄 License

MIT

---

Built with [Telegram UI Kit](https://github.com/Telegram-Mini-Apps/TelegramUI)
