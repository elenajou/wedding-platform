'use client'

const h1: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontStyle: 'italic', fontWeight: 300, color: '#201d19', marginBottom: '0.5rem' }
const h2: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontStyle: 'italic', fontWeight: 300, color: '#201d19', marginTop: '2rem', marginBottom: '0.75rem' }
const h3: React.CSSProperties = { fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#b08d57', fontFamily: "'EB Garamond', serif", fontWeight: 400, marginTop: '1.25rem', marginBottom: '0.5rem' }
const p: React.CSSProperties = { fontSize: 15, lineHeight: 1.7, color: '#3a3328', fontFamily: "'EB Garamond', serif", marginBottom: '0.75rem' }
const note: React.CSSProperties = { fontSize: 14, lineHeight: 1.65, color: '#5a5040', fontFamily: "'EB Garamond', serif", fontStyle: 'italic', background: '#fdf9f3', border: '0.5px solid #e8dfc8', borderLeft: '3px solid #b08d57', padding: '10px 14px', borderRadius: 2, margin: '1rem 0' }
const divider: React.CSSProperties = { border: 'none', borderTop: '0.5px solid #e0d8c8', margin: '2rem 0' }

function Table({ rows }: { rows: [string, string][] }) {
  return (
    <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'EB Garamond', serif" }}>
        <tbody>
          {rows.map(([a, b], i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? '#faf7f2' : '#fff' }}>
              <td style={{ padding: '8px 12px', fontSize: 14, color: '#201d19', fontWeight: 500, borderBottom: '0.5px solid #ede8df', whiteSpace: 'nowrap', minWidth: 140 }}>{a}</td>
              <td style={{ padding: '8px 12px', fontSize: 14, color: '#3a3328', borderBottom: '0.5px solid #ede8df' }}>{b}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function HelpTab() {
  return (
    <div style={{ maxWidth: 720 }}>
      <p style={h1}>Ayuda — Manual de uso</p>
      <p style={{ ...p, color: '#7a6e5f', fontStyle: 'italic' }}>
        Todo lo que necesitas saber para administrar tu invitación digital desde este panel.
      </p>

      <hr style={divider} />

      {/* Navigation */}
      <p style={h2}>Navegación</p>
      <p style={p}>Las pestañas en la parte superior te dan acceso a cada sección del panel. Las pestañas disponibles dependen de las funciones activadas en tu cuenta.</p>
      <Table rows={[
        ['Boda', 'Nombres, fecha, lugar, textos del Hero y carta de invitación'],
        ['Mesas', 'Crear y nombrar mesas de recepción'],
        ['Grupos', 'Grupos de invitación con contraseña de acceso'],
        ['Invitados', 'Lista completa de invitados con mesa y grupo asignados'],
        ['Secciones', 'Reordenar y ocultar secciones de la invitación'],
        ['Tema', 'Plantillas, paletas de colores y fondos por sección'],
        ['Confirmaciones', 'Ver quién confirmó asistencia y quién declinó'],
        ['Agenda', 'Programa del día (hora, evento, descripción)'],
        ['FAQ', 'Preguntas frecuentes que verán los invitados'],
        ['Fotos', 'Galería de fotos de la pareja'],
      ]} />

      <hr style={divider} />

      {/* Boda */}
      <p style={h2}>Boda</p>
      <p style={p}>Esta pestaña contiene la información central de tu evento.</p>

      <p style={h3}>Pareja</p>
      <p style={p}>Ingresa el nombre de la novia y el novio tal como deben aparecer en la invitación.</p>

      <p style={h3}>Evento</p>
      <Table rows={[
        ['Fecha de boda', 'Selecciona desde el calendario. Alimenta la cuenta regresiva.'],
        ['Límite de confirmación', 'Texto libre, por ejemplo "1 de noviembre de 2025".'],
        ['Ceremonia / Recepción', 'Hora y lugar de cada evento.'],
      ]} />

      <p style={h3}>Coordinador</p>
      <p style={p}>El nombre y correo del coordinador aparecen en la sección FAQ para que los invitados puedan contactarlo en lugar de hacerlo directamente contigo.</p>

      <p style={h3}>Sección principal (Hero)</p>
      <Table rows={[
        ['Texto superior (eyebrow)', 'Texto pequeño sobre los nombres. Ej: "Save the Date"'],
        ['Tagline', 'Frase debajo de los nombres de la pareja'],
        ['Saludo', 'Comienzo del mensaje personalizado al invitado'],
        ['Cuerpo de texto', 'Resto del mensaje de bienvenida'],
        ['URL de fuente', 'Google Fonts URL para la tipografía de los nombres'],
      ]} />

      <p style={h3}>Carta de invitación</p>
      <p style={p}>Texto en la pantalla del sobre, antes de que el invitado abra la invitación: Encabezado, Saludo y Cuerpo de texto.</p>

      <p style={h3}>Video</p>
      <Table rows={[
        ['Tipo de fuente', 'YouTube, Vimeo, o video autoalojado'],
        ['ID de video / URL', 'ID de YouTube/Vimeo, o URL directa si es autoalojado'],
        ['URL de póster', 'Imagen que se muestra antes de reproducir el video'],
      ]} />

      <p style={h3}>Idiomas adicionales</p>
      <p style={p}>Si tu invitación está en más de un idioma, verás campos adicionales para el Hero y la carta en cada idioma extra. El idioma principal usa los campos normales; los demás tienen su propia sección debajo de cada bloque.</p>

      <hr style={divider} />

      {/* Mesas */}
      <p style={h2}>Mesas</p>
      <p style={p}>Crea las mesas del salón para asignar invitados a ellas.</p>
      <ol style={{ ...p, paddingLeft: 20, marginBottom: 0 }}>
        <li style={{ marginBottom: 4 }}>Ingresa el nombre de la mesa y la capacidad.</li>
        <li style={{ marginBottom: 4 }}>Haz clic en <strong>Agregar</strong>.</li>
        <li>Puedes editar o eliminar mesas en cualquier momento.</li>
      </ol>

      <hr style={divider} />

      {/* Grupos */}
      <p style={h2}>Grupos</p>
      <p style={p}>Los grupos permiten que una familia o pareja use un solo código para acceder a la invitación.</p>

      <p style={h3}>¿Por qué usar grupos?</p>
      <ul style={{ ...p, paddingLeft: 20 }}>
        <li style={{ marginBottom: 4 }}>Una familia comparte un solo código de acceso.</li>
        <li style={{ marginBottom: 4 }}>Puedes definir exactamente cuántos asientos tiene ese grupo.</li>
        <li>El formulario de RSVP muestra los nombres de cada miembro del grupo.</li>
      </ul>

      <p style={h3}>Cómo crear un grupo</p>
      <Table rows={[
        ['Nombre del grupo', 'Por ejemplo "Familia García"'],
        ['Lugares', 'Número de asientos reservados para este grupo'],
        ['Contraseña', 'Código corto que usarán para acceder. Ej: "GARCIA25"'],
        ['Idioma', 'es, en, o zh — la invitación abre en ese idioma automáticamente'],
      ]} />

      <hr style={divider} />

      {/* Invitados */}
      <p style={h2}>Invitados</p>
      <p style={p}>Administra la lista completa de personas invitadas.</p>

      <Table rows={[
        ['Nombre', 'Nombre completo del invitado'],
        ['Teléfono', 'Con código de país: +52 55 1234 5678'],
        ['Email', 'Opcional'],
        ['Mesa', 'Nombre de la mesa asignada'],
        ['Idioma', 'Código: es, en o zh'],
        ['Grupo', 'Grupo de invitación al que pertenece'],
      ]} />

      <p style={h3}>¿Cómo accede el invitado?</p>
      <p style={p}>El invitado ingresa su número de teléfono o la contraseña del grupo en la pantalla del sobre. El sistema lo identifica y personaliza la invitación con su nombre.</p>

      <div style={note}>
        Si un invitado no puede acceder, verifica que su teléfono esté registrado exactamente como él lo ingresará, incluyendo el código de país (por ejemplo +52 para México).
      </div>

      <hr style={divider} />

      {/* Secciones */}
      <p style={h2}>Secciones</p>
      <p style={p}>Controla el orden y la visibilidad de las secciones de la invitación.</p>

      <p style={h3}>Reordenar</p>
      <p style={p}>Usa los botones ▲ y ▼ para cambiar el orden en que aparecen las secciones en la invitación.</p>

      <p style={h3}>Ocultar una sección</p>
      <p style={p}>Desmarca la casilla <strong>Visible</strong> para ocultar una sección. Los invitados no la verán, pero tu configuración se conserva. Puedes reactivarla cuando quieras.</p>

      <div style={note}>
        Haz clic en <strong>Guardar Orden</strong> para aplicar los cambios de orden y visibilidad.
      </div>

      <hr style={divider} />

      {/* Tema */}
      <p style={h2}>Tema</p>
      <p style={p}>Personaliza el diseño visual de cada sección de forma independiente. Abre cualquier sección del acordeón para ver sus opciones y la vista previa en tiempo real.</p>

      <p style={h3}>Plantilla</p>
      <p style={p}>Cada sección tiene entre 2 y 5 variantes de diseño. Haz clic en una miniatura para seleccionarla — la vista previa se actualiza de inmediato.</p>

      <p style={h3}>Paleta de colores</p>
      <p style={p}>La paleta controla el color principal, fondo, superficies y botones de esa sección. Opciones: Gold, Blush, Forest, Navy.</p>

      <p style={h3}>Fondo</p>
      <Table rows={[
        ['URL de imagen', 'Pega una URL directa de imagen (Unsplash, Cloudinary, etc.)'],
        ['Color de fondo', 'Color sólido; se combina con la imagen si hay una'],
        ['Color de texto', 'Sobrescribe el color de todos los textos de la sección'],
        ['Opacidad de superposición', '0% = imagen sin capa / 100% = imagen completamente cubierta'],
      ]} />

      <p style={h3}>Vista previa</p>
      <p style={p}>El panel de la derecha muestra la sección exactamente como se vería en un iPhone 14 Pro Max, incluyendo fondo, superposición y color de texto.</p>

      <div style={note}>
        Recuerda hacer clic en <strong>Guardar</strong> cuando termines de ajustar los estilos.
      </div>

      <hr style={divider} />

      {/* Confirmaciones */}
      <p style={h2}>Confirmaciones</p>
      <p style={p}>Muestra el estado de los RSVPs recibidos: total de respuestas, cuántos asistirán, total de invitados que asistirán, y cuántos declinaron.</p>

      <div style={note}>
        Si necesitas corregir un RSVP, elimínalo y pide al invitado que vuelva a enviarlo desde su invitación.
      </div>

      <hr style={divider} />

      {/* Agenda */}
      <p style={h2}>Agenda</p>
      <p style={p}>Crea el programa del día para la sección de Agenda de la invitación.</p>
      <Table rows={[
        ['Orden (#)', 'Número que determina el orden de los eventos'],
        ['Hora', 'Texto libre: "4:00 PM", "Mediodía", etc.'],
        ['ISO hora', 'Formato para "happening now": 2025-12-06T16:00'],
        ['Nombre del evento', '"Ceremonia", "Coctel", "Cena", etc.'],
      ]} />

      <hr style={divider} />

      {/* FAQ */}
      <p style={h2}>FAQ</p>
      <p style={p}>Crea las preguntas frecuentes que aparecen en la invitación. El coordinador registrado en la pestaña Boda aparece como contacto al final de esta sección.</p>

      <p style={h3}>Sugerencias de preguntas</p>
      <ul style={{ ...p, paddingLeft: 20, marginBottom: 0 }}>
        {['¿Cuál es el código de vestimenta?', '¿Puedo traer niños?', '¿Habrá estacionamiento?', '¿Hay opciones vegetarianas?', '¿A qué hora debo llegar?'].map(q => (
          <li key={q} style={{ marginBottom: 4 }}>{q}</li>
        ))}
      </ul>

      <hr style={divider} />

      {/* Fotos */}
      <p style={h2}>Fotos</p>
      <p style={p}>Agrega fotos para la galería de la invitación usando URLs directas a imágenes.</p>
      <Table rows={[
        ['URL de imagen', 'URL pública directa (Unsplash, Cloudinary, Google Drive público)'],
        ['Texto alt', 'Descripción breve de la foto (accesibilidad)'],
        ['Pie de foto', 'Texto que aparece al ver la foto en pantalla completa'],
        ['# (orden)', 'Número que define el orden de aparición en la galería'],
      ]} />
      <div style={note}>
        Usa imágenes de al menos 800px de ancho para que se vean nítidas en pantallas retina.
      </div>

      <hr style={divider} />

      {/* FAQ del panel */}
      <p style={h2}>Preguntas frecuentes del panel</p>

      {[
        {
          q: '¿Los cambios son inmediatos?',
          a: 'Sí. Al guardar, la invitación se actualiza en segundos. Los invitados que ya tengan la página abierta verán los cambios al recargar.',
        },
        {
          q: '¿Puedo tener la invitación en varios idiomas?',
          a: 'Sí, si tu configuración incluye más de un idioma. Los textos extra se ingresan en la pestaña Boda. Los invitados cambian de idioma con el selector en la invitación.',
        },
        {
          q: '¿Qué pasa si oculto una sección?',
          a: 'La sección desaparece de la invitación pública, pero tu configuración se conserva. Puedes activarla de nuevo desde Secciones.',
        },
        {
          q: '¿Puedo cambiar la contraseña del panel?',
          a: 'No desde aquí. Contacta a tu coordinador de plataforma para restablecerla.',
        },
        {
          q: 'El invitado dice que su teléfono no funciona. ¿Qué hago?',
          a: 'Verifica en Invitados que el número esté guardado exactamente como el invitado lo ingresará, incluyendo el código de país (por ejemplo +52 para México).',
        },
      ].map(({ q, a }) => (
        <div key={q} style={{ marginBottom: '1.25rem' }}>
          <p style={{ fontFamily: "'EB Garamond', serif", fontSize: 15, fontWeight: 600, color: '#201d19', marginBottom: 4 }}>{q}</p>
          <p style={{ ...p, marginBottom: 0, color: '#5a5040' }}>{a}</p>
        </div>
      ))}

      <div style={{ height: '2rem' }} />
    </div>
  )
}
