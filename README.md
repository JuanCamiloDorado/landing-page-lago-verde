# Landing page Lago Verde

Landing page estática para **Lago Verde**. Su layout y diseño visual están basados en la pestaña **DINE** de [thegrounds.com.au](https://thegrounds.com.au/), reconstruidos con ingeniería inversa como ejercicio de diseño web.

> **Aviso:** proyecto sin relación ni respaldo de The Grounds of Alexandria. Las fotos y los videos todavía se cargan desde los servidores de The Grounds y solo sirven como relleno: les pertenecen y no están incluidos en este repositorio. También son de relleno los nombres de los locales y las ubicaciones (Alexandria, South Eveleigh). Hay que reemplazarlos por contenido propio de Lago Verde antes de cualquier uso real.

Toda la página está en español; los nombres de los locales siguen siendo de relleno.

## Cómo verla

Abre `index.html` en el navegador. No necesita instalación ni build.

## Qué incluye

- **Logo:** `assets/logo-lago-verde.png` (completo en verde, en el footer) y `assets/logo-lago-verde-compact-white.png` (blanco sin "Parque Comercial", en el menú sobre el hero). `assets/logo-lago-verde-white.png` es la versión completa en blanco, de repuesto. Todos con fondo transparente.
- **Íconos de categorías:** [Hugeicons](https://hugeicons.com/) (licencia MIT), insertados como SVG.
- **Colores:** verde `#205C40` (hover `#173D2C`), fondo `#F8F8F4`, texto `#121212`, líneas `#C5C4AC` y marrón `#635B49`. Están todos como variables CSS al inicio del archivo.
- **Tipografía:** Trade Gothic LT Std Bold Extended (títulos y botones), TradeGothic LT Regular (textos) y Germaine (pestañas). Son fuentes comerciales: si están instaladas se usan; si no, se cargan los sustitutos gratuitos Archivo y Marcellus de Google Fonts.
- **Layout:** contenedor de 1366 px, hero a pantalla completa con carrusel, y las secciones Dine + Drink, What's On, Events (tarjetas en arco), Shop (video al pasar el mouse) y footer con newsletter.
- **Contenido de Lago Verde:** la sección "De día y de noche" (horario, mascotas, zona de niños y planes por momento del día) sale del artículo [Qué hacer en Cali: disfruta Lago Verde de día y de noche](https://lagoverde.com.co/que-hacer-en-cali-disfruta-lago-verde-de-dia-y-de-noche/).
- **Opiniones:** la sección "Lo que dicen de Lago Verde" es una banda verde con la nota de Google (4,6 con 319 opiniones al 5 de noviembre de 2026), 5 citas destacadas que rotan solas y un carrusel continuo de 12 reseñas; cada una se abre completa en una ventana. Las reseñas están copiadas a mano de Google Maps y los nombres se muestran como nombre e inicial del apellido. Las citas siguen el patrón de carrusel de WAI-ARIA: tienen su propio botón para detener la rotación y se detienen cuando el teclado entra en ellas. Todo el movimiento se pausa con el botón "Pausar movimiento", al pasar el mouse y para quien tenga activado reducir movimiento. Es contenido estático: hay que actualizar la nota, el total y las reseñas de vez en cuando.
- **Cómo llegar:** al final de la página. Arriba, la dirección (Calle 16A #122-70, Pance) con botón para copiarla y dos datos rápidos (a pie desde la Icesi y parqueo); debajo, la ruta en carro en 4 pasos, botones para abrir Google Maps y Waze, y un mapa de Google insertado. La ruta salió de Google Maps el 5 de noviembre de 2026; hay que revisarla si cambian los sentidos de las vías. Los enlaces "Cómo llegar" del hero y de las secciones llevan a esta sección.
- **Interacción:** carrusel automático de 6 s, animaciones de entrada al hacer scroll, menú móvil y formulario de newsletter de demostración (no envía datos).

## Cómo se obtuvo el diseño

Ingeniería inversa del sitio en vivo con [REA](https://github.com/morluto/rea): captura del DOM y de pantallas en Chrome a 1920×1080, y extracción de los valores de diseño desde las hojas de estilo del sitio (Elementor).
