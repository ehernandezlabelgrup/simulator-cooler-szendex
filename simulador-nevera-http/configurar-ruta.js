#!/usr/bin/env node

// Script para configurar rutas predefinidas en el simulador
const fs = require('fs');
const path = require('path');

const RUTAS_PREDEFINIDAS = {
  'madrid-barcelona': {
    ORIGEN_NOMBRE: 'Almacén Central Madrid',
    ORIGEN_LAT: '40.4168',
    ORIGEN_LNG: '-3.7038',
    DESTINO_NOMBRE: 'Centro Comercial Barcelona',
    DESTINO_LAT: '41.3851',
    DESTINO_LNG: '2.1734'
  },
  'valencia-sevilla': {
    ORIGEN_NOMBRE: 'Depósito Valencia',
    ORIGEN_LAT: '39.4699',
    ORIGEN_LNG: '-0.3763',
    DESTINO_NOMBRE: 'Centro Logístico Sevilla',
    DESTINO_LAT: '37.3891',
    DESTINO_LNG: '-5.9845'
  },
  'bilbao-madrid': {
    ORIGEN_NOMBRE: 'Puerto de Bilbao',
    ORIGEN_LAT: '43.2630',
    ORIGEN_LNG: '-2.9350',
    DESTINO_NOMBRE: 'Centro Madrid',
    DESTINO_LAT: '40.4168',
    DESTINO_LNG: '-3.7038'
  },
  'zaragoza-valencia': {
    ORIGEN_NOMBRE: 'Hub Logístico Zaragoza',
    ORIGEN_LAT: '41.6488',
    ORIGEN_LNG: '-0.8891',
    DESTINO_NOMBRE: 'Puerto de Valencia',
    DESTINO_LAT: '39.4699',
    DESTINO_LNG: '-0.3763'
  },
  'test-local': {
    ORIGEN_NOMBRE: 'Punto A Test',
    ORIGEN_LAT: '40.0000',
    ORIGEN_LNG: '-4.0000',
    DESTINO_NOMBRE: 'Punto B Test',
    DESTINO_LAT: '41.0000',
    DESTINO_LNG: '-3.0000'
  }
};

function mostrarMenu() {
  console.log('\n🗺️  Configurador de Rutas - Simulador HTTP Nevera');
  console.log('='.repeat(50));
  console.log('\nRutas predefinidas disponibles:');
  
  Object.keys(RUTAS_PREDEFINIDAS).forEach((key, index) => {
    const ruta = RUTAS_PREDEFINIDAS[key];
    console.log(`${index + 1}) ${key.toUpperCase()}`);
    console.log(`   ${ruta.ORIGEN_NOMBRE} → ${ruta.DESTINO_NOMBRE}`);
  });
  
  console.log(`${Object.keys(RUTAS_PREDEFINIDAS).length + 1}) Configuración personalizada`);
  console.log(`${Object.keys(RUTAS_PREDEFINIDAS).length + 2}) Salir`);
}

function actualizarEnv(configuracion) {
  const envPath = path.join(__dirname, '.env');
  
  try {
    let contenidoEnv = fs.readFileSync(envPath, 'utf8');
    
    // Actualizar cada variable
    Object.keys(configuracion).forEach(key => {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      const nuevaLinea = `${key}=${configuracion[key]}`;
      
      if (contenidoEnv.match(regex)) {
        contenidoEnv = contenidoEnv.replace(regex, nuevaLinea);
      } else {
        contenidoEnv += `\n${nuevaLinea}`;
      }
    });
    
    fs.writeFileSync(envPath, contenidoEnv);
    console.log('✅ Archivo .env actualizado correctamente');
    
    // Mostrar configuración actual
    console.log('\n📋 Configuración actual:');
    console.log(`   Serial: ${process.env.SERIAL_NEVERA || 'No configurado'}`);
    console.log(`   Origen: ${configuracion.ORIGEN_NOMBRE} (${configuracion.ORIGEN_LAT}, ${configuracion.ORIGEN_LNG})`);
    console.log(`   Destino: ${configuracion.DESTINO_NOMBRE} (${configuracion.DESTINO_LAT}, ${configuracion.DESTINO_LNG})`);
    console.log(`   ID Preparación: ${process.env.ID_PREPARACION || 'No configurado'}`);
    console.log(`   ID Extracción: ${process.env.ID_EXTRACCION || 'No configurado'}`);
    
  } catch (error) {
    console.error('❌ Error al actualizar .env:', error.message);
  }
}

function configuracionPersonalizada() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const configuracion = {};

  console.log('\n🔧 Configuración personalizada');
  console.log('Ingresa los datos de tu ruta:');

  return new Promise((resolve) => {
    rl.question('Nombre del origen: ', (origen_nombre) => {
      configuracion.ORIGEN_NOMBRE = origen_nombre;
      
      rl.question('Latitud del origen: ', (origen_lat) => {
        configuracion.ORIGEN_LAT = origen_lat;
        
        rl.question('Longitud del origen: ', (origen_lng) => {
          configuracion.ORIGEN_LNG = origen_lng;
          
          rl.question('Nombre del destino: ', (destino_nombre) => {
            configuracion.DESTINO_NOMBRE = destino_nombre;
            
            rl.question('Latitud del destino: ', (destino_lat) => {
              configuracion.DESTINO_LAT = destino_lat;
              
              rl.question('Longitud del destino: ', (destino_lng) => {
                configuracion.DESTINO_LNG = destino_lng;
                
                rl.close();
                resolve(configuracion);
              });
            });
          });
        });
      });
    });
  });
}

async function main() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  mostrarMenu();

  rl.question('\nSelecciona una opción: ', async (opcion) => {
    const numero = parseInt(opcion);
    const rutas = Object.keys(RUTAS_PREDEFINIDAS);
    
    if (numero >= 1 && numero <= rutas.length) {
      const rutaSeleccionada = rutas[numero - 1];
      const configuracion = RUTAS_PREDEFINIDAS[rutaSeleccionada];
      
      console.log(`\n✅ Seleccionaste: ${rutaSeleccionada.toUpperCase()}`);
      actualizarEnv(configuracion);
      
    } else if (numero === rutas.length + 1) {
      const configuracion = await configuracionPersonalizada();
      actualizarEnv(configuracion);
      
    } else if (numero === rutas.length + 2) {
      console.log('👋 ¡Hasta luego!');
    } else {
      console.log('❌ Opción inválida');
    }
    
    rl.close();
  });
}

if (require.main === module) {
  main();
}
