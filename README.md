# Order Management System# OrderManagementApp



A responsive, fast-loading Angular web application integrated with Firebase Firestore for managing product orders with multilingual support (English and Marathi).This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.1.



## 🚀 Features## Development server



- **Responsive Design**: Mobile-first, works seamlessly on mobile, tablet, and desktopTo start a local development server, run:

- **Multilingual Support**: English and Marathi language support with ngx-translate

- **Firebase Integration**: Real-time data storage with Firestore```bash

- **Modern UI**: Clean, professional interface using Angular Materialng serve

- **Performance Optimized**: Lazy loading, OnPush change detection, caching```

- **Form Validation**: Comprehensive validation for all user inputs

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## 📋 Prerequisites

## Code scaffolding

- Node.js (v18 or higher)

- npm (v9 or higher)Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

- Angular CLI: `npm install -g @angular/cli`

- Firebase CLI: `npm install -g firebase-tools````bash

ng generate component component-name

## 🛠️ Installation```



```powershellFor a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

cd order-management-app

npm install```bash

```ng generate --help

```

## 🎯 Development

## Building

```powershell

ng serveTo build the project run:

```

```bash

Navigate to `http://localhost:4200/`ng build

```

## 🏗️ Build

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

```powershell

ng build --configuration production## Running unit tests

```

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

## 🔥 Firebase Setup

```bash

### Create Firestore Collectionsng test

```

#### Products Collection (`products`)

## Running end-to-end tests

```javascript

{For end-to-end (e2e) testing, run:

  name: "Milk",

  nameMr: "दूध",```bash

  sequence: 1ng e2e

}```

```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

### Deploy

## Additional Resources

```powershell

firebase loginFor more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

ng build --configuration production
firebase deploy
```

## 📁 Project Structure

```
├── src/app/
│   ├── core/           # Models & Services
│   ├── features/       # Product & Order components
│   ├── shared/         # Shared components
│   └── assets/i18n/    # Translations
```

## 🌍 Multilingual Support

- English (`en`)
- Marathi (`mr`)

Toggle languages using the navbar button.

## 📱 Responsive Design

- Mobile (< 600px): Single column
- Tablet (600px - 960px): Optimized spacing
- Desktop (> 960px): Multi-column grid

## 🔒 Security

Firestore rules ensure:
- Products: Read-only
- Orders: Create-only
- Protected from unauthorized access

Deploy rules:
```powershell
firebase deploy --only firestore:rules
```

## 🧪 Testing

```powershell
ng test
```

## 📊 Performance Goals

- Lighthouse Score > 90 (Performance, Accessibility, Best Practices, SEO)
- Lazy-loaded routes
- Cached product data
- Optimized change detection

---

**Built with ❤️ using Angular and Firebase**
