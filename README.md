# The Grounds — réplica de diseño (pestaña DINE)

Réplica estática del diseño visual de la pestaña **DINE** de [thegrounds.com.au](https://thegrounds.com.au/), hecha como ejercicio de estudio de diseño web.

> **Aviso:** proyecto no oficial, sin relación ni respaldo de The Grounds of Alexandria. El nombre, el logo, los textos, las fotos y los videos son propiedad de sus dueños (la marca Winnie the Pooh es de Disney). Las imágenes y los videos no están incluidos en este repositorio: se cargan desde los servidores originales y solo sirven como relleno. Reemplázalos por material propio antes de cualquier uso real.

## Cómo verla

Abre `index.html` en el navegador. No necesita instalación ni build.

## Qué replica

- **Colores:** verde `#205C40` (hover `#173D2C`), fondo `#F8F8F4`, texto `#121212`, líneas `#C5C4AC` y marrón `#635B49`. Están todos como variables CSS al inicio del archivo.
- **Tipografía:** Trade Gothic LT Std Bold Extended (títulos y botones), TradeGothic LT Regular (textos) y Germaine (pestañas). Son fuentes comerciales: si están instaladas se usan; si no, se cargan los sustitutos gratuitos Archivo y Marcellus de Google Fonts.
- **Layout:** contenedor de 1366 px, hero a pantalla completa con carrusel de video, y las secciones Dine + Drink, What's On, Events (tarjetas en arco), Shop (video al pasar el mouse) y footer con newsletter.
- **Interacción:** carrusel automático de 6 s, animaciones de entrada al hacer scroll, menú móvil y formulario de newsletter de demostración (no envía datos).

## Cómo se obtuvo

Ingeniería inversa del sitio en vivo con [REA](https://github.com/morluto/rea): captura del DOM y de pantallas en Chrome a 1920×1080, y extracción de los valores de diseño desde las hojas de estilo del sitio (Elementor).
