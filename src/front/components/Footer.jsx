export const Footer = () => (
  <footer className="bg-gray-900 text-gray-200">
    <div className="max-w-6xl mx-auto px-6 d-flex justify-content-around">
      {/* Columna 1: Conócenos */}
      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <i className="fa-solid fa-users mr-2 text-blue-500"></i> Conócenos
        </h3>
        <ul className="space-y-3">
          <li className="flex items-center hover:text-blue-400 transition-colors">
            <i className="fa-solid fa-angle-right mr-2"></i>
            <a href="#">Sobre quiénes somos</a>
          </li>
          <li className="flex items-center hover:text-blue-400 transition-colors">
            <i className="fa-solid fa-angle-right mr-2"></i>
            <a href="#">Sostenibilidad</a>
          </li>
        </ul>
      </div>

      {/* Columna 2: Atención al Cliente */}
      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <i className="fa-solid fa-headset mr-2 text-blue-500"></i> Atención al Cliente
        </h3>
        <ul className="space-y-3">
          <li className="flex items-center hover:text-blue-400 transition-colors">
            <i className="fa-solid fa-angle-right mr-2"></i>
            <a href="#">Política de devolución y reembolso</a>
          </li>
          <li className="flex items-center hover:text-blue-400 transition-colors">
            <i className="fa-solid fa-angle-right mr-2"></i>
            <a href="#">Política de propiedad intelectual</a>
          </li>
          <li className="flex items-center hover:text-blue-400 transition-colors">
            <i className="fa-solid fa-angle-right mr-2"></i>
            <a href="#">Política de envíos</a>
          </li>
        </ul>
      </div>

      {/* Columna 3: Ayuda */}
      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <i className="fa-solid fa-circle-question mr-2 text-blue-500"></i> Ayuda
        </h3>
        <ul className="space-y-3">
          <li className="flex items-center hover:text-blue-400 transition-colors">
            <i className="fa-solid fa-angle-right mr-2"></i>
            <a href="#">Centro de ayuda y preguntas frecuentes</a>
          </li>
          <li className="flex items-center hover:text-blue-400 transition-colors">
            <i className="fa-solid fa-angle-right mr-2"></i>
            <a href="#">Centro de seguridad</a>
          </li>
          <li className="flex items-center hover:text-blue-400 transition-colors">
            <i className="fa-solid fa-angle-right mr-2"></i>
            <a href="#">Reglamento de Servicios Digitales</a>
          </li>
        </ul>
      </div>
    </div>

    {/* Divider */}
    <div className="border-t border-gray-700 mt-10"></div>

    {/* Pie de página */}
    <div className="mt-6 text-center text-sm text-gray-400">
      <p>&copy; {new Date().getFullYear()} Todos los derechos reservados.</p>
    </div>
  </footer>
);
