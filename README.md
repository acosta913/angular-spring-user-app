# User App

Aplicación web para gestión de usuarios construida con Angular 17 en el front y consumiendo una API REST en Spring Boot. Permite listar, crear, editar y eliminar usuarios con autenticación basada en JWT y control de acceso por roles.

Este repositorio contiene únicamente el cliente Angular. La API se ejecuta por separado en `http://localhost:8090`.

## ¿Qué hace?

* Login con usuario y contraseña contra un endpoint `/login` que devuelve un JWT.
* Listado de usuarios con paginación del lado del servidor.
* Alta, edición y baja de usuarios (solo para administradores).
* Manejo de errores de validación devueltos por el backend mostrados en el formulario.
* Cierre de sesión y expiración automática del token.
* Navegación protegida por guards: si el token caduca, redirige al login; si el usuario no es admin, lo manda a `/forbidden`.

## Stack

* **Angular 17.3** con componentes *standalone* (sin NgModules)
* **TypeScript 5.4**
* **NgRx Store 19** para el estado global de la lista de usuarios y el paginador
* **RxJS** para flujos asíncronos y comunicación entre componentes
* **HttpClient** con un *interceptor* funcional que adjunta el `Authorization: Bearer <token>` a cada request
* **Bootstrap 5.3** para los estilos (vía CDN)
* **SweetAlert2** para diálogos de confirmación y mensajes
* **Karma + Jasmine** para pruebas unitarias

## Arquitectura

La aplicación arranca desde `src/main.ts` con `bootstrapApplication(AppComponent, appConfig)`. Toda la configuración (router, HttpClient, interceptor y store) está centralizada en `src/app/app.config.ts`.

### Estructura de carpetas

```
src/app/
├── components/
│   ├── auth/         # Pantalla de login
│   ├── forbidden/    # Pantalla de acceso denegado
│   ├── navbar/       # Barra de navegación con estado de sesión
│   ├── paginator/    # Componente de paginación reutilizable
│   ├── user-app/     # Componente contenedor (orquestador)
│   ├── user-form/    # Alta y edición de usuarios
│   └── user-view/    # Listado paginado
├── guards/
│   └── auth.guard.ts        # Protege rutas, valida expiración del JWT y rol admin
├── interceptors/
│   └── token.interceptor.ts # Adjunta el JWT a las peticiones HTTP
├── models/
│   └── user.ts
├── services/
│   ├── auth.service.ts          # Login, persistencia del token y datos del usuario
│   ├── user.service.ts          # CRUD contra la API
│   └── sharing-data.service.ts  # Bus de eventos entre componentes
├── store/
│   ├── users.actions.ts
│   └── users.reducer.ts
├── app.component.ts
├── app.config.ts
└── app.routes.ts
```

### Flujo de autenticación

1. El usuario envía credenciales desde `AuthComponent`.
2. `AuthService.loginUser()` hace POST a `/login` y recibe un JWT.
3. Se decodifica el *payload* del token (segundo segmento en base64) para leer el flag `isAdmin` y la fecha de expiración (`exp`).
4. Token y datos de sesión se guardan en `sessionStorage` y en memoria.
5. A partir de ahí, `tokenInterceptor` añade la cabecera `Authorization` en cada petición HTTP saliente.
6. `authGuard` se ejecuta en rutas protegidas (`/users/create`, `/users/edit/:id`) y revisa que la sesión esté activa, el token no haya expirado y el usuario sea admin.

### Comunicación entre componentes

El componente raíz `UserAppComponent` actúa como orquestador. Los componentes hijos (formularios, listado, login) no llaman directamente a los servicios de negocio: emiten eventos a través de `SharingDataService`, un servicio que expone varios `EventEmitter`. El contenedor se suscribe a esos eventos y se encarga de invocar al `UserService` o al `AuthService`, manejar el éxito o el error, y disparar la navegación correspondiente.

Esto permite mantener los componentes hijos enfocados en la UI y concentrar la lógica de orquestación en un único lugar.

### Paginación

El endpoint `/api/users/page/:page` devuelve un objeto con la forma de `Page<T>` de Spring Data (`content`, `number`, `totalPages`, etc.). El componente `PaginatorComponent` genera enlaces dinámicos a partir de ese objeto, así no es necesario almacenar la página actual en el cliente.

### Manejo de errores de validación

Cuando el backend responde con `400 Bad Request`, el cuerpo trae un mapa `{ campo: mensaje }`. El contenedor lo emite vía `errorsUserFormEventEmitter` y el formulario lo renderiza junto a cada campo, en lugar de hacer la validación en el front. Esto deja una única fuente de verdad para las reglas de negocio.

## Requisitos previos

* Node.js 18+ y npm
* Angular CLI 17 (opcional si se usan los scripts de npm)
* Una instancia del backend Spring Boot corriendo en `http://localhost:8090`

## Cómo levantarlo

```bash
# instalar dependencias
npm install

# servidor de desarrollo en http://localhost:4200
npm start

# build de producción en dist/user-app
npm run build

# pruebas unitarias
npm test
```

La URL del backend está fijada en `src/app/services/auth.service.ts` y `src/app/services/user.service.ts`. Si la API corre en otro host o puerto, hay que cambiarla en esos dos archivos.

## Rutas

| Ruta              | Componente         | Acceso             |
| ----------------- | ------------------ | ------------------ |
| `/`               | redirige a `/users/page/0` | público     |
| `/users`          | UserViewComponent  | público            |
| `/users/page/:n`  | UserViewComponent  | público            |
| `/users/create`   | UserFormComponent  | solo administrador |
| `/users/edit/:id` | UserFormComponent  | solo administrador |
| `/login`          | AuthComponent      | público            |
| `/forbidden`      | ForbiddenComponent | público            |

## Decisiones técnicas

* **Standalone components.** Se usó el enfoque sin NgModules introducido en Angular 14 y consolidado en 17, que reduce el *boilerplate* y hace más explícitas las dependencias de cada componente.
* **NgRx Store junto con un bus de eventos.** El store mantiene el estado de la lista y el paginador; el bus (`SharingDataService`) se usa para acciones puntuales que disparan llamadas HTTP. La idea fue practicar ambos enfoques sobre el mismo dominio.
* **Interceptor funcional.** Se usó la nueva sintaxis `HttpInterceptorFn` en vez de la clase tradicional con `HttpInterceptor`.
* **Guard funcional.** Igual que el interceptor, el guard se implementó como una `CanActivateFn` usando `inject()` en lugar de constructor.
* **Persistencia en `sessionStorage`.** Se eligió por sobre `localStorage` para que el token no sobreviva al cierre del navegador.

## Posibles mejoras

* Mover la URL del backend a un archivo de `environments`.
* Migrar a *Reactive Forms* con validadores y unificar el manejo de errores cliente/servidor.
* Agregar refresh token y manejo centralizado de errores 401 en el interceptor.
* Reemplazar el bus de eventos por *NgRx Effects* para que toda la lógica asíncrona pase por el store.
* Cobertura de tests por componente y servicio (hoy solo existe el spec por defecto de `AppComponent`).
