# Guía de Conexión a Cosmos DB - ImpactX Web Frontend

Esta guía contiene la configuración de acceso a **Azure Cosmos DB NoSQL** para el repositorio de Frontend Web.

## Credenciales de Conexión (Desarrollo / Pruebas)

* **Account Endpoint:** `https://impactx-db-west-final.documents.azure.com:443/`
* **Account Key (Lectura y Escritura):** `<REPLACE_WITH_YOUR_COSMOS_KEY>`
* **Base de Datos Principal:** `ImpactX-Data`
* **Base de Datos Temporal/Test:** `TestDatabase`

---

## ⚠️ IMPORTANTE: Seguridad en Frontend del Navegador

> [!CAUTION]
> **NUNCA incrustes la clave de acceso directo (Account Key) dentro del código JS que se descarga y ejecuta en el navegador del cliente (HTML estático, React components, Angular/Vue SPA).**
> Cualquier usuario podría abrir la consola de desarrollador del navegador (F12), ver tu código JS y robar las credenciales de Cosmos DB, lo que les daría acceso total para leer, borrar o alterar tus bases de datos.

### Buenas Prácticas de Frontend:
1. **Consumir APIs de Backend:** El frontend debe realizar llamadas seguras HTTP (ej. `fetch('/api/users')`) a **`ImpactX-backend-apis`**, la cual se encarga de conectar de forma privada y segura con Cosmos DB.
2. **Server-Side Rendering (SSR) o Serverless Functions:** Si usas frameworks como Next.js, Nuxt.js o Azure Static Web Apps, puedes realizar las llamadas a Cosmos DB en las rutas del servidor (Server-Side Routes / Edge Functions). Allí sí es seguro usar las variables de entorno de Cosmos DB ya que ese código nunca se envía al navegador del usuario.

---

## Cómo usar Cosmos DB Studio para Validaciones Locales

Como desarrollador de Frontend, puedes usar Cosmos DB Studio para ver qué información te está mandando el backend o validar la estructura de los datos:

1. Descarga e instala **Cosmos DB Studio**.
2. Crea una nueva conexión ingresando los siguientes datos:
   * **Name:** `ImpactX`
   * **Endpoint:** `https://impactx-db-west-final.documents.azure.com:443/`
   * **Key:** `<REPLACE_WITH_YOUR_COSMOS_KEY>`
   * **Serverless:** Desmarcado
   * **Folder:** En blanco
3. Haz clic en **OK**.
4. Haz doble clic en el contenedor que estés depurando.
5. En la ventana central escribe:
   ```sql
   SELECT * FROM c
   ```
6. Haz clic en el botón de **Play (Triángulo Negro)**.
