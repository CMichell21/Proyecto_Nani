const BASE_STYLES = `
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 13px;
      color: #1a1a2e;
      background: #fff;
      padding: 40px 50px;
      line-height: 1.7;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #886BC1;
      padding-bottom: 24px;
      margin-bottom: 30px;
    }
    .logo-text {
      font-size: 32px;
      font-weight: 900;
      color: #886BC1;
      letter-spacing: 2px;
    }
    .logo-sub {
      font-size: 11px;
      color: #FF768A;
      letter-spacing: 4px;
      text-transform: uppercase;
      margin-top: 4px;
    }
    .doc-title {
      font-size: 20px;
      font-weight: 800;
      color: #1a1a2e;
      margin-top: 16px;
    }
    .doc-meta {
      font-size: 11px;
      color: #888;
      margin-top: 6px;
    }
    h2 {
      font-size: 14px;
      font-weight: 800;
      color: #886BC1;
      margin: 28px 0 10px 0;
      border-left: 4px solid #FF768A;
      padding-left: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    h3 {
      font-size: 13px;
      font-weight: 700;
      color: #1a1a2e;
      margin: 16px 0 6px 0;
    }
    p { margin-bottom: 10px; text-align: justify; }
    ul { margin: 8px 0 12px 22px; }
    li { margin-bottom: 6px; }
    .highlight-box {
      background: #f7f0ff;
      border: 1.5px solid #886BC1;
      border-radius: 8px;
      padding: 14px 18px;
      margin: 14px 0;
    }
    .warning-box {
      background: #fff5f5;
      border: 1.5px solid #FF768A;
      border-radius: 8px;
      padding: 14px 18px;
      margin: 14px 0;
    }
    .warning-box strong { color: #c0392b; }
    .table-wrap { margin: 12px 0; overflow-x: auto; }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    th {
      background: #886BC1;
      color: white;
      padding: 10px 12px;
      text-align: left;
      font-weight: 700;
    }
    td { padding: 9px 12px; border-bottom: 1px solid #eee; }
    tr:nth-child(even) td { background: #faf5ff; }
    .footer {
      margin-top: 40px;
      border-top: 2px solid #eee;
      padding-top: 18px;
      font-size: 11px;
      color: #888;
      text-align: center;
    }
    .footer a { color: #886BC1; }
    .badge {
      display: inline-block;
      background: #FF768A;
      color: white;
      border-radius: 12px;
      padding: 2px 10px;
      font-size: 11px;
      font-weight: 700;
    }
  </style>
`;

export const TERMS_CLIENTE_HTML = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Términos y Condiciones — Clientes Nani</title>
  ${BASE_STYLES}
</head>
<body>

  <div class="header">
    <div class="logo-text">NANI</div>
    <div class="logo-sub">Cuidamos lo que más amas</div>
    <div class="doc-title">Términos y Condiciones — Clientes</div>
    <div class="doc-meta">Versión 1.0 &nbsp;|&nbsp; Vigente desde enero 2025 &nbsp;|&nbsp; Honduras</div>
  </div>

  <h2>1. Acerca de Nani</h2>
  <p>
    <strong>Nani</strong> es una plataforma tecnológica con sede en Honduras que conecta a familias con niñeras
    certificadas y de confianza. Al registrarte como cliente aceptas íntegramente los presentes Términos y
    Condiciones, que tienen carácter vinculante para ambas partes.
  </p>
  <p>
    Nani actúa como intermediaria y no como empleadora directa de las niñeras. La responsabilidad del servicio
    prestado recae sobre la niñera asignada y el cliente de manera conjunta conforme a lo acordado en la reserva.
  </p>

  <h2>2. Política de Cancelación de Reservas</h2>
  <p>
    Entendemos que pueden surgir imprevistos; sin embargo, para proteger el ingreso de nuestras niñeras y
    garantizar la calidad del servicio, aplicamos la siguiente política:
  </p>

  <div class="table-wrap">
    <table>
      <tr>
        <th>Tiempo de anticipación a la cancelación</th>
        <th>Cargo aplicado</th>
      </tr>
      <tr>
        <td>Más de 3 días antes del servicio</td>
        <td><span style="color:#22c55e; font-weight:700;">Sin cargo (reembolso total)</span></td>
      </tr>
      <tr>
        <td>Entre 2 y 3 días antes del servicio</td>
        <td><span style="color:#f59e0b; font-weight:700;">25% del monto total</span></td>
      </tr>
      <tr>
        <td>1 día antes o el mismo día del servicio</td>
        <td><span style="color:#ef4444; font-weight:700;">100% del monto total (cobro completo)</span></td>
      </tr>
    </table>
  </div>

  <div class="highlight-box">
    <strong>¿Cómo se calcula el tiempo?</strong> Se toma como referencia la hora programada de inicio del servicio.
    Si el servicio comienza a las 8:00 a.m. del lunes y el cliente cancela el domingo (menos de 24 horas antes),
    se cobra el 100%.
  </div>

  <h3>2.1 Procedimiento de cancelación</h3>
  <ul>
    <li>La cancelación debe realizarse desde la pantalla de seguimiento de la reserva dentro de la aplicación.</li>
    <li>No se aceptan cancelaciones por mensajes de texto, llamadas ni redes sociales.</li>
    <li>El monto cobrado por cancelación no es reembolsable.</li>
    <li>En caso de emergencia médica debidamente documentada, Nani evaluará el caso individualmente.</li>
  </ul>

  <h3>2.2 Cancelaciones reiteradas</h3>
  <div class="warning-box">
    <strong>Advertencia:</strong> Si un cliente acumula <strong>5 o más cancelaciones</strong> dentro de un
    período de 90 días, Nani se reserva el derecho de suspender temporalmente su cuenta para revisión de conducta.
  </div>

  <h2>3. Política de Pagos y Sanciones</h2>
  <h3>3.1 Métodos de pago aceptados</h3>
  <ul>
    <li>Tarjeta de débito o crédito (Visa / Mastercard) — débito automático al confirmar.</li>
    <li>Efectivo — el cliente paga directamente a la niñera al finalizar el servicio.</li>
  </ul>

  <h3>3.2 Incumplimiento de pago</h3>
  <p>
    El incumplimiento de pago es una falta grave dentro de la plataforma. Se entiende por incumplimiento cuando:
  </p>
  <ul>
    <li>El cliente seleccionó pago en efectivo y no realizó el pago al finalizar el servicio.</li>
    <li>Una tarjeta guardada fue rechazada y el cliente no regularizó la situación en 48 horas.</li>
  </ul>

  <div class="warning-box">
    <strong>Consecuencias del incumplimiento de pago:</strong>
    <ul style="margin-top:8px;">
      <li><strong>1.er incumplimiento:</strong> Advertencia formal + deuda registrada en cuenta.</li>
      <li><strong>2.do incumplimiento:</strong> Suspensión temporal de la cuenta (7 días).</li>
      <li><strong>3.er incumplimiento:</strong> <span class="badge">BLOQUEO PERMANENTE</span> de la aplicación sin posibilidad de reactivación.</li>
    </ul>
  </div>

  <h3>3.3 Propinas</h3>
  <p>
    Las propinas son voluntarias. Si el cliente desea reconocer el excelente trabajo de su niñera, puede
    agregar una propina al momento de confirmar la reserva o al finalizar el servicio desde la app.
  </p>

  <h2>4. Responsabilidades del Cliente</h2>
  <ul>
    <li>Proporcionar información verídica sobre sus hijos (edad, condiciones médicas, alergias).</li>
    <li>Asegurarse de que el hogar sea un ambiente seguro para la niñera y los niños.</li>
    <li>Estar disponible por teléfono durante el servicio en caso de emergencia.</li>
    <li>Respetar el horario acordado. Las horas adicionales se cobran según la tarifa de la niñera.</li>
    <li>No solicitar tareas fuera del alcance del cuidado infantil (limpieza general, mandados, etc.).</li>
  </ul>

  <h2>5. Trato a la Niñera</h2>
  <p>
    Nani garantiza un entorno de respeto mutuo. Cualquier queja de maltrato, acoso o conducta inapropiada
    hacia la niñera resultará en la <strong>suspensión inmediata y permanente</strong> del cliente, con posible
    reporte a las autoridades correspondientes.
  </p>

  <h2>6. Protección de Datos</h2>
  <p>
    La información personal del cliente se maneja de conformidad con la Ley de Protección de Datos de Honduras.
    Nani no comparte datos con terceros salvo los requeridos para prestar el servicio.
  </p>

  <h2>7. Modificaciones a los Términos</h2>
  <p>
    Nani se reserva el derecho de actualizar estos Términos en cualquier momento. Los usuarios serán notificados
    mediante la aplicación con al menos 7 días de anticipación antes de que los cambios entren en vigor.
  </p>

  <div class="footer">
    <p>Nani Honduras &nbsp;|&nbsp; Soporte: soporte@nani.hn &nbsp;|&nbsp; WhatsApp: +504 9999-0000</p>
    <p style="margin-top:6px;">© 2025 Nani Technologies. Todos los derechos reservados.</p>
    <p style="margin-top:6px;">Al marcar "Acepto los Términos y Condiciones" durante el registro, confirmas haber leído y aceptado íntegramente este documento.</p>
  </div>

</body>
</html>
`;

export const TERMS_NINERA_HTML = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Términos y Condiciones — Niñeras Nani</title>
  ${BASE_STYLES}
</head>
<body>

  <div class="header">
    <div class="logo-text">NANI</div>
    <div class="logo-sub">Cuidamos lo que más amas</div>
    <div class="doc-title">Términos y Condiciones — Niñeras</div>
    <div class="doc-meta">Versión 1.0 &nbsp;|&nbsp; Vigente desde enero 2025 &nbsp;|&nbsp; Honduras</div>
  </div>

  <h2>1. Acerca de Nani</h2>
  <p>
    <strong>Nani</strong> es una plataforma tecnológica hondureña que conecta a niñeras certificadas con familias
    que necesitan cuidado infantil de calidad y confianza. Al registrarte como niñera en Nani, aceptas
    íntegramente estos Términos y Condiciones como condición indispensable para operar en la plataforma.
  </p>
  <p>
    La relación entre Nani y la niñera es la de proveedor de plataforma y prestadora de servicios independiente.
    Nani no actúa como empleadora; sin embargo, establece estándares mínimos de calidad que todas las niñeras
    deben cumplir.
  </p>

  <h2>2. Código de Vestimenta y Presentación Personal</h2>
  <p>
    La imagen de la niñera representa directamente la marca Nani ante las familias. Por ello, se exige una
    presentación impecable en todo momento de servicio.
  </p>

  <h3>2.1 Vestimenta requerida</h3>
  <div class="highlight-box">
    <strong>La niñera debe presentarse siempre con atuendo formal o semiformal:</strong>
    <ul style="margin-top:8px;">
      <li>Blusa o camisa de vestir (colores neutros o pasteles preferibles: blanco, beige, azul claro, rosa pastel).</li>
      <li>Pantalón de vestir o falda a la rodilla.</li>
      <li>Zapatos cerrados cómodos y limpios.</li>
      <li>Cabello recogido o peinado ordenado.</li>
      <li>Maquillaje discreto (si aplica).</li>
      <li>Uñas cortas y limpias.</li>
    </ul>
  </div>

  <h3>2.2 Vestimenta prohibida durante el servicio</h3>
  <ul>
    <li>Shorts, bermudas o minifaldas.</li>
    <li>Sandalias, chancletas o zapatos abiertos.</li>
    <li>Ropa con estampados llamativos, mensajes o imágenes inapropiadas.</li>
    <li>Ropa transparente o escotada.</li>
    <li>Ropa deportiva (excepto si el servicio lo requiere expresamente y fue acordado con el cliente).</li>
  </ul>

  <h3>2.3 Sanciones por incumplimiento del código de vestimenta</h3>
  <div class="warning-box">
    <strong>El incumplimiento del código de vestimenta se sancionará de la siguiente manera:</strong>
    <ul style="margin-top:8px;">
      <li><strong>1.er incidente:</strong> Advertencia formal registrada en el perfil.</li>
      <li><strong>2.do incidente:</strong> Suspensión temporal de 7 días sin posibilidad de aceptar reservas.</li>
      <li><strong>3.er incidente:</strong> <span class="badge">SUSPENSIÓN PERMANENTE</span> de la plataforma.</li>
    </ul>
    <p style="margin-top:8px;">Las sanciones se emiten con base en reportes del cliente o verificación por parte del equipo Nani.</p>
  </div>

  <h2>3. Puntualidad y Compromiso</h2>
  <ul>
    <li>La niñera debe llegar al domicilio del cliente <strong>al menos 10 minutos antes</strong> del inicio del servicio.</li>
    <li>Se debe realizar el check-in mediante el código QR del cliente al momento de ingresar.</li>
    <li>El check-out debe realizarse con el código QR al finalizar el servicio.</li>
    <li>No se permite abandonar el servicio antes del horario acordado sin comunicación previa.</li>
  </ul>

  <h3>3.1 Retrasos</h3>
  <div class="table-wrap">
    <table>
      <tr>
        <th>Tiempo de retraso</th>
        <th>Consecuencia</th>
      </tr>
      <tr>
        <td>Menos de 10 minutos</td>
        <td>Sin sanción (primer retraso); advertencia del segundo en adelante.</td>
      </tr>
      <tr>
        <td>10 a 30 minutos</td>
        <td>Advertencia formal registrada en el perfil.</td>
      </tr>
      <tr>
        <td>Más de 30 minutos sin aviso</td>
        <td>Descuento del 10% del pago + advertencia formal.</td>
      </tr>
      <tr>
        <td>No presentarse (no-show)</td>
        <td>Suspensión de 14 días + multa equivalente al 30% de la tarifa pactada.</td>
      </tr>
    </table>
  </div>

  <h2>4. Política de Cancelación para Niñeras</h2>
  <p>
    Las cancelaciones por parte de la niñera afectan directamente a la familia. Por esto, se aplican las
    siguientes políticas:
  </p>

  <div class="table-wrap">
    <table>
      <tr>
        <th>Tiempo de anticipación</th>
        <th>Sanción aplicada</th>
      </tr>
      <tr>
        <td>Más de 3 días antes</td>
        <td><span style="color:#22c55e; font-weight:700;">Sin sanción</span></td>
      </tr>
      <tr>
        <td>Entre 1 y 3 días antes</td>
        <td><span style="color:#f59e0b; font-weight:700;">Advertencia formal en el perfil</span></td>
      </tr>
      <tr>
        <td>El mismo día del servicio</td>
        <td><span style="color:#ef4444; font-weight:700;">Multa del 15% de la tarifa + advertencia</span></td>
      </tr>
      <tr>
        <td>5 cancelaciones o más en 90 días</td>
        <td><span class="badge">SUSPENSIÓN PERMANENTE</span></td>
      </tr>
    </table>
  </div>

  <h2>5. Responsabilidades con los Niños</h2>
  <ul>
    <li>Mantener a los niños bajo supervisión constante durante todo el servicio.</li>
    <li>Seguir las instrucciones de alimentación, medicación y rutinas proporcionadas por los padres.</li>
    <li>En caso de emergencia médica, llamar de inmediato al 911 y al padre/madre, y reportar la emergencia mediante el botón de emergencia de la aplicación.</li>
    <li>No administrar medicamentos no indicados por los padres.</li>
    <li>No dejar el domicilio con los niños sin autorización expresa del cliente.</li>
    <li>No utilizar el teléfono personal de manera excesiva durante el servicio; mantener la atención en los niños en todo momento.</li>
  </ul>

  <h2>6. Uso de las Instalaciones del Cliente</h2>
  <ul>
    <li>Tratar el hogar del cliente con el mayor cuidado y respeto.</li>
    <li>No utilizar artículos personales del cliente sin autorización.</li>
    <li>No invitar a terceras personas al domicilio durante el servicio.</li>
    <li>Cualquier daño accidental debe reportarse de inmediato al cliente y a Nani.</li>
  </ul>

  <h2>7. Confidencialidad</h2>
  <p>
    La niñera se compromete a mantener total confidencialidad sobre la información personal, familiar, económica
    y de rutina de los clientes. Queda estrictamente prohibido compartir información del cliente en redes
    sociales u otros medios, bajo pena de <strong>suspensión permanente inmediata</strong> y posibles acciones legales.
  </p>

  <h2>8. Calificaciones y Reseñas</h2>
  <p>
    Al finalizar cada servicio, el cliente puede calificar a la niñera. Las calificaciones afectan la visibilidad
    del perfil en la plataforma. Nani se reserva el derecho de suspender cuentas con una calificación promedio
    inferior a 3.0 estrellas de manera sostenida (más de 10 reseñas).
  </p>

  <h2>9. Comisión de la Plataforma</h2>
  <p>
    Nani cobra una comisión por el uso de la plataforma, la cual es deducida automáticamente del pago de cada
    servicio. El monto de la comisión es transparente y visible en el resumen de cada reserva antes de aceptarla.
  </p>

  <h2>10. Modificaciones a los Términos</h2>
  <p>
    Nani se reserva el derecho de actualizar estos Términos en cualquier momento. Las niñeras serán notificadas
    mediante la aplicación con al menos 7 días de anticipación.
  </p>

  <div class="footer">
    <p>Nani Honduras &nbsp;|&nbsp; Soporte: soporte@nani.hn &nbsp;|&nbsp; WhatsApp: +504 9999-0000</p>
    <p style="margin-top:6px;">© 2025 Nani Technologies. Todos los derechos reservados.</p>
    <p style="margin-top:6px;">Al marcar "Acepto los Términos y Condiciones" durante el registro, confirmas haber leído y aceptado íntegramente este documento.</p>
  </div>

</body>
</html>
`;
