const axios = require('axios');

async function listAllEndpoints() {
  try {
    console.log('Obteniendo todos los endpoints disponibles...');
    
    // Obtener la documentación de la API
    const docsResponse = await axios.get('http://localhost:3007/api-docs-json', {
      timeout: 5000
    });
    
    const paths = docsResponse.data.paths;
    console.log('\n=== ENDPOINTS DISPONIBLES ===\n');
    
    // Mostrar todos los endpoints
    Object.keys(paths).forEach(path => {
      console.log(`${path}:`);
      Object.keys(paths[path]).forEach(method => {
        console.log(`  ${method.toUpperCase()}`);
      });
      console.log('');
    });
    
  } catch (error) {
    if (error.response) {
      console.error('Error al obtener la documentación de la API:', error.response.status);
    } else {
      console.error('Error de conexión:', error.message);
    }
  }
}

listAllEndpoints();