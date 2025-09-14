# 🚀 Deployment Guide - Orange Party Website

This guide explains how to deploy the Orange Party website to GitHub Pages using GitHub Actions.

## 📋 Prerequisites

- GitHub account
- Git installed locally
- Node.js and npm installed

## 🔧 Setup Steps

### 1. Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `orangeparty-website` (or your preferred name)
3. Make it public (required for GitHub Pages on free accounts)
4. Don't initialize with README (we already have one)

### 2. Connect Local Repository to GitHub

```bash
# Add GitHub as remote origin
git remote add origin https://github.com/YOUR_USERNAME/orangeparty-website.git

# Push to GitHub
git push -u origin master
```

### 3. Configure GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll down to **Pages** section
4. Under **Source**, select **"GitHub Actions"**
5. Click **Save**

### 4. Optional: Configure Branch Protection (Recommended)

To prevent accidental pushes to the live branch:

1. Go to **Settings** > **Branches**
2. Click **Add rule**
3. Branch name pattern: `live`
4. Check **Restrict pushes that create files**
5. Check **Require a pull request before merging**
6. Click **Create**

This ensures the live branch only receives controlled merges.

### 5. Branch Strategy

This project uses a two-branch deployment strategy:

- **`master`** - Development branch
  - All development work happens here
  - Runs tests and build checks on push
  - Does NOT deploy to production

- **`live`** - Production branch
  - Only for production-ready code
  - Automatically deploys to GitHub Pages when updated
  - Should only receive merges from master

## 🌐 Access Your Deployed Site

After successful deployment, your site will be available at:
```
https://YOUR_USERNAME.github.io/orangeparty-website/
```

## 🔄 Development Workflow

### For Development (master branch):
1. Make changes locally
2. Test with `npm run dev`
3. Build and test with `npm run build`
4. Commit and push to master:
   ```bash
   git add .
   git commit -m "Your update message"
   git push origin master
   ```
5. GitHub Actions will run tests and build checks

### For Production Deployment:
1. Ensure master branch is ready for production
2. Create and merge to live branch:
   ```bash
   # Create live branch from master (first time only)
   git checkout -b live
   git push -u origin live

   # For subsequent deployments
   git checkout live
   git merge master
   git push origin live
   ```
3. GitHub Actions will automatically deploy to GitHub Pages

## 📁 Project Structure

```
.github/workflows/
  deploy.yml          # GitHub Actions deployment workflow

src/
  pages/
    Index.tsx         # Landing page
    Forum.tsx         # Discussion forum
  components/         # React components
  lib/               # Utility functions

public/
  manifest.webmanifest # PWA manifest

dist/                # Built files (auto-generated)
```

## ⚙️ Configuration Files

- **vite.config.ts**: Configured for GitHub Pages with dynamic base path
- **deploy.yml**: GitHub Actions workflow for automated deployment
- **package.json**: Build scripts and dependencies
- **tailwind.config.ts**: Styling configuration

## 🐛 Troubleshooting

### Build Fails
- Check console output in GitHub Actions tab
- Ensure all dependencies are in package.json
- Run `npm run build` locally to test

### 404 Errors
- Verify the base path in vite.config.ts matches your repository name
- Check that GitHub Pages source is set to "GitHub Actions"

### Assets Not Loading
- The Vite config automatically sets the correct base path
- Assets paths should be relative in the built files

### Permission Denied
- Ensure repository has "Read and write permissions" in Settings > Actions > General

## 🔒 Security Notes

- Repository must be public for free GitHub Pages
- No sensitive data should be committed to the repository
- All configuration is handled through environment variables in GitHub Actions

## 📚 Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

---

**🍊 Orange Party - A Third Way Forward**

*Not an official political party - Community discussion platform*