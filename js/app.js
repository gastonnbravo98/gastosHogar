const STORAGE_KEY = 'gastos';
const THEME_KEY = 'gastos_hogar_theme';
const CHART_COLORS = [
  '#FF6384',
  '#36A2EB',
  '#FFCE56',
  '#4BC0C0',
  '#9966FF',
  '#FF9F40',
  '#8AC926',
];

let gastosChart = null;

function obtenerDatos() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function guardarDatos(datos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(datos));
  actualizarEstadisticas();
  actualizarGrafico();
}

function obtenerMesActual() {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const anio = hoy.getFullYear();
  return `${mes}-${anio}`;
}

function validarFecha(fecha) {
  const match = /^(\d{2})-(\d{4})$/.exec(fecha);
  if (!match) return false;
  const mes = Number(match[1]);
  return mes >= 1 && mes <= 12;
}

function formatearFecha(input) {
  const valor = input.value.replace(/\D/g, '');
  if (valor.length >= 2) {
    if (valor.length === 2 && !input.value.includes('-')) {
      input.value = `${valor}-`;
    } else if (valor.length > 2) {
      input.value = `${valor.substring(0, 2)}-${valor.substring(2, 6)}`;
    }
  }
}

function escaparHTML(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

function mostrarMensaje(texto, tipo = 'info') {
  const mensajeDiv = document.getElementById('mensaje');
  mensajeDiv.innerHTML = `
    <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
      ${escaparHTML(texto)}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
    </div>
  `;

  setTimeout(() => {
    mensajeDiv.innerHTML = '';
  }, 5000);
}

function guardarGasto() {
  const categoriaEl = document.getElementById('categoria');
  const montoEl = document.getElementById('monto');
  const fechaEl = document.getElementById('fecha');

  const categoria = categoriaEl.value;
  const monto = parseFloat(montoEl.value);
  const fecha = fechaEl.value.trim() || obtenerMesActual();

  if (!categoria || Number.isNaN(monto) || monto <= 0) {
    mostrarMensaje('Por favor completa todos los campos correctamente.', 'danger');
    return;
  }

  if (!validarFecha(fecha)) {
    mostrarMensaje('Formato de fecha incorrecto. Usa MM-AAAA (mes 01 a 12).', 'danger');
    return;
  }

  const datos = obtenerDatos();
  if (!datos[fecha]) {
    datos[fecha] = [];
  }

  datos[fecha].push({ categoria, monto });
  guardarDatos(datos);

  mostrarMensaje(`Gasto guardado: $${monto.toLocaleString()} en ${categoria} (${fecha})`, 'success');

  categoriaEl.value = '';
  montoEl.value = '';
  fechaEl.value = '';

  const consultaEl = document.getElementById('consultaMes');
  if (consultaEl.value.trim() === fecha) {
    verGastos();
  }
}

function verGastos() {
  const fecha = document.getElementById('consultaMes').value.trim();
  const resultadoEl = document.getElementById('resultadoGastos');

  if (!fecha) {
    resultadoEl.innerHTML = `
      <div class="alert alert-info">
        <i class="fas fa-info-circle me-1"></i> Ingresa un mes en formato MM-AAAA para consultar.
      </div>
    `;
    return;
  }

  const datos = obtenerDatos();
  const lista = datos[fecha];

  if (!lista || lista.length === 0) {
    resultadoEl.innerHTML = `
      <div class="alert alert-warning">
        <i class="fas fa-exclamation-triangle me-1"></i> No hay gastos registrados para este mes.
      </div>
    `;
    return;
  }

  let total = 0;
  let itemsHTML = '';

  lista.forEach((g, index) => {
    total += g.monto;
    itemsHTML += `
      <div class="gasto-item">
        <div class="d-flex justify-content-between align-items-center gap-2">
          <span class="text-truncate"><i class="fas fa-tag me-1 text-primary"></i> ${escaparHTML(g.categoria)}</span>
          <div class="d-flex align-items-center gap-2 flex-shrink-0">
            <span class="fw-bold">$${g.monto.toLocaleString()}</span>
            <button type="button" class="btn btn-sm btn-outline-danger" data-fecha="${escaparHTML(fecha)}" data-index="${index}" aria-label="Eliminar gasto">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  });

  resultadoEl.innerHTML = `
    <h5 class="mb-3"><i class="fas fa-calendar-alt me-1"></i> Gastos de ${escaparHTML(fecha)}</h5>
    ${itemsHTML}
    <div class="alert alert-success mt-3 mb-0">
      <strong>Total: $${total.toLocaleString()}</strong>
    </div>
  `;
}

function eliminarGasto(fecha, index) {
  if (!confirm('¿Estás seguro de que quieres eliminar este gasto?')) {
    return;
  }

  const datos = obtenerDatos();
  if (!datos[fecha]) return;

  datos[fecha].splice(index, 1);
  if (datos[fecha].length === 0) {
    delete datos[fecha];
  }

  guardarDatos(datos);
  verGastos();
  mostrarMensaje('Gasto eliminado correctamente.', 'success');
}

function actualizarEstadisticas() {
  const datos = obtenerDatos();
  let total = 0;
  let cantidad = 0;

  Object.values(datos).forEach((mes) => {
    mes.forEach((gasto) => {
      total += gasto.monto;
      cantidad += 1;
    });
  });

  const promedio = cantidad > 0 ? total / cantidad : 0;

  document.getElementById('totalGastos').textContent = `$${total.toLocaleString()}`;
  document.getElementById('cantidadGastos').textContent = cantidad;
  document.getElementById('promedioGastos').textContent = `$${Math.round(promedio).toLocaleString()}`;
}

function actualizarGrafico() {
  const datos = obtenerDatos();
  const categorias = {};

  Object.values(datos).forEach((mes) => {
    mes.forEach((gasto) => {
      categorias[gasto.categoria] = (categorias[gasto.categoria] || 0) + gasto.monto;
    });
  });

  const canvas = document.getElementById('gastosChart');
  const ctx = canvas.getContext('2d');
  const esOscuro = document.documentElement.getAttribute('data-bs-theme') === 'dark';
  const textColor = esOscuro ? '#e9ecef' : '#495057';

  if (gastosChart) {
    gastosChart.destroy();
  }

  const labels = Object.keys(categorias);
  const values = Object.values(categorias);

  gastosChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels.length ? labels : ['Sin datos'],
      datasets: [
        {
          data: values.length ? values : [1],
          backgroundColor: labels.length ? CHART_COLORS : [esOscuro ? '#363d54' : '#e9ecef'],
          borderColor: esOscuro ? '#1e2230' : '#ffffff',
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: textColor,
            padding: 16,
          },
        },
        title: {
          display: true,
          text: 'Distribución de Gastos por Categoría',
          color: textColor,
          font: {
            size: 15,
            weight: '600',
          },
        },
        tooltip: {
          callbacks: {
            label(context) {
              if (!labels.length) return ' Sin gastos registrados';
              return ` ${context.label}: $${Number(context.raw).toLocaleString()}`;
            },
          },
        },
      },
    },
  });
}

function generarPDF() {
  const fecha = document.getElementById('consultaMes').value.trim();
  const datos = obtenerDatos();

  if (!fecha) {
    mostrarMensaje('Por favor ingresa un mes para generar el PDF.', 'warning');
    return;
  }

  if (!datos[fecha] || datos[fecha].length === 0) {
    mostrarMensaje('No hay gastos registrados para este mes.', 'warning');
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;

  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text('Reporte de Gastos del Hogar', pageWidth / 2, 30, { align: 'center' });

  doc.setFontSize(14);
  doc.setFont(undefined, 'normal');
  doc.text(`Mes: ${fecha}`, margin, 50);
  doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, margin, 60);

  let total = 0;
  datos[fecha].forEach((gasto) => {
    total += gasto.monto;
  });

  doc.text(`Total gastos: $${total.toLocaleString()}`, margin, 70);

  const tableData = datos[fecha].map((gasto, index) => [
    index + 1,
    gasto.categoria,
    `$${gasto.monto.toLocaleString()}`,
  ]);
  tableData.push(['', 'TOTAL', `$${total.toLocaleString()}`]);

  doc.autoTable({
    startY: 90,
    head: [['#', 'Categoría', 'Monto']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [102, 126, 234],
      textColor: 255,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 12,
      cellPadding: 5,
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 80 },
      2: { cellWidth: 40, halign: 'right' },
    },
  });

  const finalY = doc.lastAutoTable.finalY + 20;
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Estadísticas:', margin, finalY);

  doc.setFont(undefined, 'normal');
  doc.text(`• Cantidad de gastos: ${datos[fecha].length}`, margin, finalY + 10);
  doc.text(
    `• Promedio por gasto: $${Math.round(total / datos[fecha].length).toLocaleString()}`,
    margin,
    finalY + 20
  );

  const categorias = {};
  datos[fecha].forEach((gasto) => {
    categorias[gasto.categoria] = (categorias[gasto.categoria] || 0) + gasto.monto;
  });

  const categoriaMasCara = Object.entries(categorias).sort((a, b) => b[1] - a[1])[0];
  doc.text(
    `• Categoría más cara: ${categoriaMasCara[0]} ($${categoriaMasCara[1].toLocaleString()})`,
    margin,
    finalY + 30
  );

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('Generado por Gastos del Hogar App', pageWidth / 2, pageHeight - 10, { align: 'center' });

  const nombreArchivo = `gastos_${fecha.replace('-', '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(nombreArchivo);

  mostrarMensaje('PDF generado correctamente.', 'success');
}

function aplicarTema(tema) {
  document.documentElement.setAttribute('data-bs-theme', tema);
  const icon = document.getElementById('themeIcon');
  const btn = document.getElementById('themeToggle');
  if (icon && btn) {
    if (tema === 'dark') {
      icon.className = 'fas fa-sun';
      btn.setAttribute('aria-label', 'Cambiar a modo claro');
      btn.setAttribute('title', 'Cambiar a modo claro');
    } else {
      icon.className = 'fas fa-moon';
      btn.setAttribute('aria-label', 'Cambiar a modo oscuro');
      btn.setAttribute('title', 'Cambiar a modo oscuro');
    }
  }
  if (typeof Chart !== 'undefined' && document.getElementById('gastosChart')) {
    actualizarGrafico();
  }
}

function inicializarTema() {
  const guardado = localStorage.getItem(THEME_KEY);
  if (guardado === 'dark' || guardado === 'light') {
    aplicarTema(guardado);
    return;
  }
  const prefiereOscuro = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  aplicarTema(prefiereOscuro ? 'dark' : 'light');
}

function alternarTema() {
  const actual = document.documentElement.getAttribute('data-bs-theme') || 'light';
  const siguiente = actual === 'dark' ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, siguiente);
  aplicarTema(siguiente);
}

document.addEventListener('DOMContentLoaded', () => {
  inicializarTema();

  document.getElementById('themeToggle').addEventListener('click', alternarTema);
  document.getElementById('btnGuardar').addEventListener('click', guardarGasto);
  document.getElementById('btnVer').addEventListener('click', verGastos);
  document.getElementById('btnPdf').addEventListener('click', generarPDF);

  document.getElementById('fecha').addEventListener('input', (e) => formatearFecha(e.target));
  document.getElementById('consultaMes').addEventListener('input', (e) => formatearFecha(e.target));

  document.getElementById('resultadoGastos').addEventListener('click', (e) => {
    const deleteBtn = e.target.closest('button[data-fecha][data-index]');
    if (!deleteBtn) return;
    eliminarGasto(deleteBtn.dataset.fecha, Number(deleteBtn.dataset.index));
  });

  actualizarEstadisticas();
  actualizarGrafico();
});
