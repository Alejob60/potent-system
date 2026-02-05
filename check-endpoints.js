const axios = require('axios');

async function checkAvailableEndpoints() {
  try {
    console.log('Verificando endpoints disponibles...');
    
    // Verificar el endpoint de documentación
    const docsResponse = await axios.get('http://localhost:3007/api-docs-json', {
      timeout: 5000
    });
    
    const paths = docsResponse.data.paths;
    console.log('Endpoints disponibles:');
    
    // Filtrar solo los endpoints relacionados con tenants
    Object.keys(paths).forEach(path => {
      if (path.includes('tenant') || path.includes('owner')) {
        console.log(`  ${path}`);
        Object.keys(paths[path]).forEach(method => {
          console.log(`    ${method.toUpperCase()}`);
        });
      }
    });
    
  } catch (error) {
    if (error.response) {
      console.error('Error al obtener la documentación de la API:', error.response.status);
    } else {
      console.error('Error de conexión:', error.message);
    }
  }
}

checkAvailableEndpoints();