# Загрузка проекта на GitHub

Откройте терминал в папке, где находятся `index.html`, `script.js`, `style.css` и `README.md`.

## Новый пустой репозиторий

```powershell
git init
git branch -M main
git add .
git status
git commit -m "Initial commit: Tic Tac Toe Chaos"
git remote add origin https://github.com/USERNAME/REPOSITORY.git
git push -u origin main
```

Замените `USERNAME/REPOSITORY` на адрес созданного репозитория.

## Репозиторий уже подключён

```powershell
git add .
git commit -m "Update Tic Tac Toe Chaos"
git push
```

## Ошибка `remote origin already exists`

```powershell
git remote set-url origin https://github.com/USERNAME/REPOSITORY.git
git push -u origin main
```

## Проверка перед отправкой

```powershell
npm run verify
```

Ожидаемый результат подготовленной версии:

```text
32/32 unit tests passed
Project structure verification passed
```

## GitHub Pages

После загрузки откройте **Settings → Pages** и выберите:

```text
Source: Deploy from a branch
Branch: main
Folder: / (root)
```
