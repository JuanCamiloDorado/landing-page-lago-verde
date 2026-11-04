# Landing page Lago Verde

Landing page estática para **Lago Verde**. Su layout y diseño visual están basados en la pestaña **DINE** de [thegrounds.com.au](https://thegrounds.com.au/), reconstruidos con ingeniería inversa como ejercicio de diseño web.

> **Aviso:** proyecto sin relación ni respaldo de The Grounds of Alexandria. Las fotos y los videos todavía se cargan desde los servidores de The Grounds y solo sirven como relleno: les pertenecen y no están incluidos en este repositorio. También son de relleno los nombres de los locales y las ubicaciones (Alexandria, South Eveleigh). Hay que reemplazarlos por contenido propio de Lago Verde antes de cualquier uso real.

## Cómo verla

Abre `index.html` en el navegador. No necesita instalación ni build.

## Qué incluye

- **Logo:** `assets/logo-lago-verde.png` (verde, en el footer) y `assets/logo-lago-verde-white.png` (blanco, en el menú sobre el hero), ambos con fondo transparente.
- **Colores:** verde `#205C40` (hover `#173D2C`), fondo `#F8F8F4`, texto `#121212`, líneas `#C5C4AC` y marrón `#635B49`. Están todos como variables CSS al inicio del archivo.
- **Tipografía:** Trade Gothic LT Std Bold Extended (títulos y botones), TradeGothic LT Regular (textos) y Germaine (pestañas y logo). Son fuentes comerciales: si están instaladas se usan; si no, se cargan los sustitutos gratuitos Archivo y Marcellus de Google Fonts.
- **Layout:** contenedor de 1366 px, hero a pantalla completa con carrusel, y las secciones Dine + Drink, What's On, Events (tarjetas en arco), Shop (video al pasar el mouse) y footer con newsletter.
- **Interacción:** carrusel automático de 6 s, animaciones de entrada al hacer scroll, menú móvil y formulario de newsletter de demostración (no envía datos).

## Cómo se obtuvo el diseño

Ingeniería inversa del sitio en vivo con [REA](https://github.com/morluto/rea): captura del DOM y de pantallas en Chrome a 1920×1080, y extracción de los valores de diseño desde las hojas de estilo del sitio (Elementor).
