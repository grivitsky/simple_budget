# Deployment Guide - Budget Tracker Telegram Mini App

Complete guide to deploy your Telegram Mini App to Vercel and integrate with Telegram.

## Prerequisites

- Node.js 18+ installed
- Git installed
- Vercel account (free tier works)
- Telegram account

---

## 📦 Step 1: Install Dependencies

```bash
npm install
```

## 🧪 Step 2: Test Locally

```bash
npm run dev
```

Visit http://localhost:5173 to test the app.

**Test the 4 tabs**:
- Home - Welcome screen
- Budget - Budget management
- Stats - Statistics
- Settings - Settings list

---

## 🚀 Step 3: Deploy to Vercel

### Option A: Vercel Dashboard (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Deploy Telegram mini app"
   git push origin main
   ```

2. **Go to Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "Add New Project"

3. **Import Repository**:
   - Select your repository
   - Vercel auto-detects configuration from `vercel.json`
   - Click "Deploy"

4. **Copy URL**:
   - Wait for deployment to complete
   - Copy your deployment URL (e.g., `https://your-app.vercel.app`)

### Option B: Vercel CLI

1. **Install CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. Follow prompts and copy the deployment URL

---

## 🤖 Step 4: Create Telegram Bot

1. **Open Telegram** and find [@BotFather](https://t.me/BotFather)

2. **Create Bot**:
   ```
   Send: /newbot
   ```
   - Enter bot name (e.g., "Budget Tracker Bot")
   - Enter username (e.g., "my_budget_bot")
   - Copy the bot token (keep it secret!)

3. **Create Mini App**:
   ```
   Send: /newapp
   ```
   - Select your bot from the list
   - Enter details:
     - **Title**: Budget Tracker
     - **Description**: Track your expenses and manage your budget easily
     - **Photo**: 640x360 image (optional)
     - **Demo GIF**: Animation preview (optional)
     - **Short Name**: budget (or your choice)
     - **Web App URL**: Your Vercel URL

4. **Get Link**:
   - BotFather sends you a link
   - This is your Mini App link!

---

## 🎉 Step 5: Test in Telegram

1. Click the link from BotFather
2. Your app opens in Telegram
3. Test all 4 tabs
4. Check that navigation works
5. Verify styles look correct

**Desktop**: Web version works for testing  
**Mobile**: Best experience in Telegram mobile app

---

## 🔧 Step 6: Customize Your App

### Modify Pages

Edit files in `app/pages/`:

```tsx
// app/pages/BudgetPage.tsx
import { Input } from '../../src/components/Form/Input/Input';
import { Button } from '../../src/components/Blocks/Button/Button';

const BudgetPage = () => {
  const [amount, setAmount] = useState('');
  
  return (
    <div className="page-content">
      <Input 
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter amount"
      />
      <Button onClick={() => saveBudget(amount)}>
        Save
      </Button>
    </div>
  );
};
```

### Change Tab Icons

```tsx
// app/App.tsx
import { Icon28Archive } from '../src/icons/28/archive';
import { Icon28Edit } from '../src/icons/28/edit';
import { Icon28Heart } from '../src/icons/28/heart';
import { Icon28Stats } from '../src/icons/28/stats';
```

Available icons in `src/icons/`: 12, 16, 20, 24, **28** (best for tabs), 32, 36

### Add State Management

```tsx
// app/App.tsx or use Context
import { useState, createContext } from 'react';

export const BudgetContext = createContext();

function App() {
  const [budget, setBudget] = useState(0);
  
  return (
    <BudgetContext.Provider value={{ budget, setBudget }}>
      {/* Your app */}
    </BudgetContext.Provider>
  );
}
```

### Connect to Backend

```tsx
// app/pages/StatsPage.tsx
import { useEffect, useState } from 'react';

const StatsPage = () => {
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    fetch('https://api.example.com/stats')
      .then(res => res.json())
      .then(data => setStats(data));
  }, []);
  
  return (
    // Display stats
  );
};
```

---

## 🔄 Continuous Deployment

After initial setup, updates are automatic:

```bash
# Make changes to your app
git add .
git commit -m "Add new feature"
git push

# Vercel automatically redeploys!
```

Your Mini App updates automatically in Telegram.

---

## 🐛 Troubleshooting

### App Doesn't Load in Telegram

**Check URL**:
- Ensure URL is HTTPS (Vercel provides this)
- Verify URL in BotFather is correct
- Try opening URL in browser first

**Check Deployment**:
- Visit Vercel dashboard
- Check deployment logs
- Ensure build succeeded

**Clear Cache**:
- Close and reopen Telegram
- Try on different device

### Styles Look Broken

**Check CSS Import**:
```tsx
// app/main.tsx should have:
import '@telegram-apps/telegram-ui/dist/styles.css';
import './styles.css';
```

**Check Build**:
```bash
npm run build
# Check for errors
```

### TypeScript Errors

**Update Dependencies**:
```bash
npm install
```

**Check tsconfig**:
- Ensure `app/tsconfig.json` exists
- Check paths are correct

### Navigation Not Working

**Check State**:
```tsx
// app/App.tsx
const [currentTab, setCurrentTab] = useState<TabId>('home');
```

**Check Tab IDs**:
- Ensure all tab IDs are unique
- Match TabId type definition

---

## 🎨 Using UI Components

Browse all available components:

### Common Components

```tsx
// Blocks
import { Button, Card, Badge, Cell, List } from '../src/components/Blocks';

// Form
import { Input, Checkbox, Select, Switch } from '../src/components/Form';

// Typography
import { Title, Text, Caption } from '../src/components/Typography';

// Feedback
import { Spinner, Progress } from '../src/components/Feedback';
```

### Examples

**Form with validation**:
```tsx
<Card>
  <Input 
    header="Budget Name"
    placeholder="Monthly budget"
    status={error ? 'error' : undefined}
  />
  <Button size="l" stretched>Save</Button>
</Card>
```

**List with cells**:
```tsx
<List>
  <Cell subtitle="Current balance">
    $1,234.56
  </Cell>
  <Cell subtitle="This month">
    $567.89
  </Cell>
</List>
```

See all components at [tgui.xelene.me](https://tgui.xelene.me/)

---

## 🔐 Environment Variables

Add secrets in Vercel dashboard:

1. Go to Project Settings → Environment Variables
2. Add variables:
   - `API_URL`
   - `API_KEY`
   etc.

Access in code:
```tsx
const apiUrl = import.meta.env.VITE_API_URL;
```

---

## 📱 Telegram Features

### MainButton

```tsx
useEffect(() => {
  const tg = window.Telegram?.WebApp;
  if (tg) {
    tg.MainButton.setText('Submit');
    tg.MainButton.show();
    tg.MainButton.onClick(() => {
      // Handle click
    });
  }
}, []);
```

### User Data

```tsx
const tg = window.Telegram?.WebApp;
const user = tg?.initDataUnsafe?.user;

console.log(user?.id);        // User ID
console.log(user?.username);  // Username
console.log(user?.first_name); // First name
```

### Theme Colors

```tsx
const tg = window.Telegram?.WebApp;
const bgColor = tg?.backgroundColor;
const textColor = tg?.themeParams?.text_color;
```

---

## 📚 Additional Resources

- **Telegram Bot API**: https://core.telegram.org/bots/webapps
- **UI Kit Docs**: https://tgui.xelene.me/
- **Example Apps**: https://github.com/Telegram-Mini-Apps/TGUI-Example
- **Vercel Docs**: https://vercel.com/docs
- **Telegram Dev Community**: https://t.me/miniappsdevs

---

## ✅ Checklist

- [ ] Install dependencies (`npm install`)
- [ ] Test locally (`npm run dev`)
- [ ] Push to GitHub
- [ ] Deploy to Vercel
- [ ] Create bot with @BotFather
- [ ] Create mini app with @BotFather
- [ ] Test in Telegram
- [ ] Customize your app
- [ ] Add features
- [ ] Launch! 🚀

---

## 💡 Tips

1. **Test on Mobile**: Mini apps work best in Telegram mobile app
2. **Use Placeholders**: Add loading states with Skeleton component
3. **Handle Errors**: Show user-friendly error messages
4. **Optimize Images**: Use compressed images for faster loading
5. **Cache Data**: Use localStorage for better UX
6. **Follow Telegram HIG**: Match Telegram's design patterns

---

**Need help?** Open an issue or check the [Telegram Mini Apps docs](https://core.telegram.org/bots/webapps).
