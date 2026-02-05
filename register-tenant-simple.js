const axios = require('axios');

async function registerSimpleTenant() {
  try {
    console.log('Registrando tenant "colombiatic" usando el endpoint básico...');
    
    // Datos para registrar a Colombiatic como tenant
    const tenantData = {
      tenantName: 'Colombiatic',
      contactEmail: 'contacto@colombiatic.com',
      websiteUrl: 'https://colombiatic.com',
      businessIndustry: 'Technology',
      allowedOrigins: ['https://colombiatic.com'],
      permissions: ['read', 'write', 'admin']
    };
    
    // Registrar como tenant usando el endpoint básico
    const response = await axios.post(
      'http://localhost:3007/tenants/register',
      tenantData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Tenant "colombiatic" registrado exitosamente');
    console.log('Datos de respuesta:', response.data);
    
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
registerSimpleTenant();