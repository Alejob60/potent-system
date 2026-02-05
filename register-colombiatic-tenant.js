const axios = require('axios');

async function registerColombiaticTenant() {
  try {
    console.log('Registrando tenant "colombiatic" como tenant propietario...');
    
    // Datos para registrar a Colombiatic como tenant propietario
    const ownerTenantData = {
      tenantName: 'Colombiatic',
      contactEmail: 'contacto@colombiatic.com',
      websiteUrl: 'https://colombiatic.com',
      businessIndustry: 'Technology'
    };
    
    // Registrar como tenant propietario
    const response = await axios.post(
      'http://localhost:3007/api/meta-agent/owner-tenant/register',
      ownerTenantData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Tenant "colombiatic" registrado exitosamente como tenant propietario');
    console.log('Datos de respuesta:', response.data);
    
    // Registrar los servicios del tenant
    const servicesData = {
      services: [
        {
          id: "desarrollo-web",
          name: "Desarrollo de Sitios Web",
          description: "Creamos sitios web modernos y responsivos adaptados a tus necesidades",
          benefits: [
            "Diseño a medida",
            "Optimización para móviles",
            "Integración con redes sociales",
            "SEO básico incluido"
          ],
          priceRange: "$500 - $5,000",
          purchaseProcess: [
            "Consulta inicial",
            "Propuesta de diseño",
            "Desarrollo",
            "Pruebas y ajustes",
            "Entrega y capacitación"
          ],
          paymentLink: "https://colombiatic.com/pagar/desarrollo-web",
          category: "web"
        },
        {
          id: "tienda-online",
          name: "Tiendas Online",
          description: "Creamos tiendas virtuales completas con pasarelas de pago y gestión de inventario",
          benefits: [
            "Ventas 24/7",
            "Pasarelas de pago seguras",
            "Gestión de inventario",
            "Informes de ventas"
          ],
          priceRange: "$1,500 - $10,000",
          purchaseProcess: [
            "Análisis de requerimientos",
            "Selección de plataforma",
            "Diseño UI/UX",
            "Desarrollo e integraciones",
            "Pruebas y lanzamiento"
          ],
          paymentLink: "https://colombiatic.com/pagar/tienda-online",
          category: "ecommerce"
        },
        {
          id: "app-movil",
          name: "Aplicaciones Móviles",
          description: "Desarrollamos aplicaciones móviles nativas para iOS y Android",
          benefits: [
            "Experiencia nativa",
            "Integración con hardware",
            "Notificaciones push",
            "Actualizaciones regulares"
          ],
          priceRange: "$3,000 - $15,000",
          purchaseProcess: [
            "Definición de requisitos",
            "Diseño de interfaces",
            "Desarrollo por plataformas",
            "Pruebas beta",
            "Publicación en stores"
          ],
          paymentLink: "https://colombiatic.com/pagar/app-movil",
          category: "mobile"
        }
      ]
    };
    
    // Actualizar los productos y servicios del tenant
    const servicesResponse = await axios.put(
      'http://localhost:3007/api/meta-agent/tenants/colombiatic/products-services',
      servicesData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Servicios del tenant "colombiatic" actualizados exitosamente');
    console.log('Datos de respuesta:', servicesResponse.data);
    
  } catch (error) {
    if (error.response) {
      console.error('❌ Error al registrar el tenant:', error.response.data);
      console.error('Status:', error.response.status);
    } else {
      console.error('❌ Error de conexión:', error.message);
    }
  }
}

// Ejecutar el registro
registerColombiaticTenant();