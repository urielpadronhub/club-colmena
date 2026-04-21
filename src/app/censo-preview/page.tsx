'use client'

export default function CensoPreview() {
  return (
    <div className="min-h-screen bg-gray-200 py-8 px-4">
      <div className="max-w-[21cm] mx-auto bg-white shadow-2xl rounded-lg overflow-hidden">
        {/* Header con Logo */}
        <div className="bg-gradient-to-r from-amber-100 to-amber-50 p-6 border-b-4 border-amber-500">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <img 
              src="/logo-icono.png" 
              alt="Logo Club de La Colmena" 
              className="w-24 h-24 rounded-full shadow-lg border-4 border-amber-400"
            />
            {/* Título */}
            <div className="flex-1 text-center">
              <h1 className="text-3xl font-bold text-amber-800 tracking-wide">
                EL CLUB DE LA COLMENA
              </h1>
              <h2 className="text-xl font-bold text-amber-600 mt-1">
                CENSO INICIAL DE BECADOS
              </h2>
              <p className="text-gray-500 text-sm mt-2">
                Maracaibo, Estado Zulia - Venezuela
              </p>
            </div>
            {/* Logo derecho */}
            <img 
              src="/logo-icono.png" 
              alt="Logo" 
              className="w-24 h-24 rounded-full shadow-lg border-4 border-amber-400"
            />
          </div>
        </div>

        {/* Contenido del Formulario */}
        <div className="p-8">
          {/* Fecha y Número */}
          <div className="flex justify-between mb-6 pb-4 border-b-2 border-amber-200">
            <div className="font-semibold text-gray-700">
              Fecha de Censo: ______ / ______ / ________
            </div>
            <div className="font-semibold text-gray-700">
              N° de Censo: ________________
            </div>
          </div>

          {/* SECCIÓN 1: DATOS DE LA FAMILIA */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-blue-800 border-b-2 border-blue-800 pb-1 mb-4">
              1. DATOS DE LA FAMILIA
            </h3>
            <div className="flex items-center gap-4">
              <label className="font-semibold text-gray-700 w-48">APELLIDO DE LA FAMILIA:</label>
              <div className="flex-1 border-b-2 border-gray-400 h-8"></div>
            </div>
          </div>

          {/* SECCIÓN 2: REPRESENTANTES */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-blue-800 border-b-2 border-blue-800 pb-1 mb-4">
              2. DATOS DE LOS REPRESENTANTES
            </h3>
            
            {/* PADRE */}
            <div className="bg-amber-50 p-4 rounded-lg mb-4">
              <h4 className="font-bold text-amber-700 mb-3">PADRE / REPRESENTANTE MASCULINO</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <label className="w-40 text-gray-600">Nombre Completo:</label>
                  <div className="flex-1 border-b border-gray-400 h-6"></div>
                </div>
                <div className="flex items-center gap-4">
                  <label className="w-40 text-gray-600">Cédula de Identidad:</label>
                  <span className="text-gray-600">V-</span>
                  <div className="w-64 border-b border-gray-400 h-6"></div>
                </div>
                <div className="flex items-center gap-4">
                  <label className="w-40 text-gray-600">Teléfono:</label>
                  <div className="w-48 border-b border-gray-400 h-6"></div>
                </div>
              </div>
            </div>

            {/* MADRE */}
            <div className="bg-amber-50 p-4 rounded-lg">
              <h4 className="font-bold text-amber-700 mb-3">MADRE / REPRESENTANTE FEMENINO</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <label className="w-40 text-gray-600">Nombre Completo:</label>
                  <div className="flex-1 border-b border-gray-400 h-6"></div>
                </div>
                <div className="flex items-center gap-4">
                  <label className="w-40 text-gray-600">Cédula de Identidad:</label>
                  <span className="text-gray-600">V-</span>
                  <div className="w-64 border-b border-gray-400 h-6"></div>
                </div>
                <div className="flex items-center gap-4">
                  <label className="w-40 text-gray-600">Teléfono:</label>
                  <div className="w-48 border-b border-gray-400 h-6"></div>
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: ALUMNO */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-blue-800 border-b-2 border-blue-800 pb-1 mb-4">
              3. DATOS DEL ALUMNO POSTULADO
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <label className="w-48 text-gray-600 font-medium">Nombre Completo del Alumno:</label>
                <div className="flex-1 border-b border-gray-400 h-6"></div>
              </div>
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-4">
                  <label className="text-gray-600 font-medium">Edad:</label>
                  <div className="w-16 border-b border-gray-400 h-6"></div>
                  <span className="text-gray-600">años</span>
                </div>
                <div className="flex items-center gap-4">
                  <label className="text-gray-600 font-medium">Sexo:</label>
                  <span className="text-gray-600">M [ ] &nbsp;&nbsp; F [ ]</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="w-48 text-gray-600 font-medium">Grado a Cursar:</label>
                <div className="w-64 border-b border-gray-400 h-6"></div>
              </div>
            </div>
          </div>

          {/* SECCIÓN 4: DIRECCIÓN */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-blue-800 border-b-2 border-blue-800 pb-1 mb-4">
              4. DIRECCIÓN DE HABITACIÓN
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <label className="w-40 text-gray-600 font-medium">Dirección Completa:</label>
                <div className="flex-1 border-b border-gray-400 h-6"></div>
              </div>
              <div className="ml-40">
                <div className="border-b border-gray-400 h-6 w-full"></div>
              </div>
              <div className="flex items-center gap-4">
                <label className="w-40 text-gray-600 font-medium">Sector / Urbanización:</label>
                <div className="w-72 border-b border-gray-400 h-6"></div>
              </div>
              <div className="flex items-center gap-4">
                <label className="w-40 text-gray-600 font-medium">Parroquia:</label>
                <div className="w-72 border-b border-gray-400 h-6"></div>
              </div>
              <div className="flex items-center gap-4">
                <label className="w-40 text-gray-600 font-medium">Punto de Referencia:</label>
                <div className="flex-1 border-b border-gray-400 h-6"></div>
              </div>
            </div>
          </div>

          {/* SECCIÓN 5: PLANTEL */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-blue-800 border-b-2 border-blue-800 pb-1 mb-4">
              5. PLANTEL DE PROCEDENCIA
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <label className="w-40 text-gray-600 font-medium">Nombre del Plantel:</label>
                <div className="flex-1 border-b border-gray-400 h-6"></div>
              </div>
              <div className="flex items-center gap-4">
                <label className="w-40 text-gray-600 font-medium">Turno:</label>
                <span className="text-gray-600">Mañana [ ] &nbsp;&nbsp; Tarde [ ] &nbsp;&nbsp; Completo [ ]</span>
              </div>
              <div className="flex items-center gap-4">
                <label className="w-40 text-gray-600 font-medium">Último Grado Cursado:</label>
                <div className="w-64 border-b border-gray-400 h-6"></div>
              </div>
            </div>
          </div>

          {/* Línea decorativa */}
          <div className="border-t-4 border-amber-500 my-6"></div>

          {/* SECCIÓN 6: FIRMAS */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-blue-800 border-b-2 border-blue-800 pb-1 mb-4">
              6. FIRMAS DE CONFORMIDAD
            </h3>
            <div className="flex justify-around mt-8">
              <div className="text-center">
                <div className="border-b-2 border-gray-600 w-48 h-12 mb-2"></div>
                <p className="text-gray-600 font-medium">Firma del Representante</p>
                <div className="mt-4 border-b border-gray-400 w-40 h-6 mx-auto"></div>
                <p className="text-gray-500 text-sm mt-1">C.I.: </p>
              </div>
              <div className="text-center">
                <div className="border-2 border-gray-400 w-32 h-24 rounded-lg flex items-center justify-center bg-gray-50">
                  <span className="text-gray-400 text-sm">Huella Dactilar</span>
                </div>
              </div>
              <div className="text-center">
                <div className="border-b-2 border-gray-600 w-48 h-12 mb-2"></div>
                <p className="text-gray-600 font-medium">Fecha</p>
                <p className="text-gray-500 mt-2">____/____/________</p>
              </div>
            </div>
          </div>

          {/* Pie de página */}
          <div className="text-center text-gray-500 text-sm mt-8 pt-4 border-t border-gray-200">
            <p className="font-semibold text-amber-700">El Club de La Colmena - Unidos por la Educación</p>
            <p>Maracaibo, Estado Zulia, Venezuela</p>
            <p>📧 Contacto: clubdelacolmena@gmail.com</p>
          </div>
        </div>
      </div>

      {/* Botón para descargar */}
      <div className="text-center mt-6">
        <a 
          href="/download/censo_inicial_colmena.pdf" 
          className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all"
          download
        >
          📥 Descargar PDF para Imprimir
        </a>
        <p className="text-gray-500 text-sm mt-2">
          Formato carta - Listo para imprimir
        </p>
      </div>
    </div>
  )
}
