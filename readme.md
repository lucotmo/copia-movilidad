## BC-Moviliad Marketplace

### Instalación
Después de clonar el repositorio se debe instalar dependencias usando `npm install` o `yarn`. Se requiere el paquete global [gulp-cli](https://gulpjs.com/docs/en/getting-started/quick-start#install-the-gulp-command-line-utility) para trabajar con el proyecto.

### Funcionamiento
El proyecto funciona en dos versiones *desarrollo* y *producción* para ello se emplea una configuración de webpack y de gulp diferente para cada una. Así mismo para construir o ejecutar el proyecto en forma local se debe correr un comando especifico:

`$ npm run start` ó `$ yarn start` para correr en *desarrollo*


`$ npm run build` ó `$ yarn run build` para contruir en *producción*

### Ambientes
Se refiere a la distribución de cuentas en VTEX del proyecto, encontraremos aquí también el versionamiento de *desarrollo* y *producción* estos se dividen en ambientes (y ramas) de la siguiente manera:

- *Producción*: Rama `master` ambiente https://movilidadco.myvtex.com
- *Desarrollo*: Rama `develop` ambiente https://testmovilidadco.myvtex.com

> Para construir los archivos del ambiente de desarrollo se debe usar el comando:
> `$npm run build:qa` ó `$yarn run build:qa`