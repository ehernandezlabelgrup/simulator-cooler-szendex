const axios = require('axios');
require('dotenv').config();

// Configuración del endpoint HTTP
const HTTP_ENDPOINT = process.env.HTTP_ENDPOINT || 'http://localhost:8000/api/nevera/eventos';
const HTTP_TIMEOUT = parseInt(process.env.HTTP_TIMEOUT) || 5000;

// Configuración del simulador
const SERIAL_NEVERA = process.env.SERIAL_NEVERA || '550e8400-e29b-41d4-a716-446655440000';
const ID_PREPARACION = process.env.ID_PREPARACION || 'PREP-2024-001';
const ID_EXTRACCION = process.env.ID_EXTRACCION || 'EXTR-2024-001';
const INTERVALO_MENSAJES = parseInt(process.env.INTERVALO_MENSAJES) || 5000; // 5 segundos

// Configuración de ruta
const ORIGEN = {
  nombre: process.env.ORIGEN_NOMBRE || 'Almacén Central Madrid',
  lat: parseFloat(process.env.ORIGEN_LAT) || 40.4168,
  lng: parseFloat(process.env.ORIGEN_LNG) || -3.7038
};

const DESTINO = {
  nombre: process.env.DESTINO_NOMBRE || 'Centro Comercial Barcelona',
  lat: parseFloat(process.env.DESTINO_LAT) || 41.3851,
  lng: parseFloat(process.env.DESTINO_LNG) || 2.1734
};

// Estados de la nevera
const ESTADOS = {
  PREPARADO: 'preparado',
  EN_TRANSITO: 'en transito',
  EN_EXTRACCION: 'en extraccion',
  EN_INTRODUCCION: 'en introduccion'
};

class SimuladorNeveraHTTP {
  constructor() {
    this.indiceCoordenadasTransito = 0;
    this.contadorMensajesTransito = 0;
    this.maxMensajesTransito = 6; // Número de mensajes "en tránsito" a enviar
    this.rutaCalculada = this.calcularRutaIntermedia();
    this.httpClient = this.configurarCliente();
  }

  // Configurar cliente HTTP
  configurarCliente() {
    return axios.create({
      timeout: HTTP_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'SimuladorNevera/1.0'
      }
    });
  }

  // Calcular puntos intermedios entre origen y destino
  calcularRutaIntermedia() {
    const puntos = [];
    const numPuntos = this.maxMensajesTransito;
    
    console.log(`🗺️  Calculando ruta de ${ORIGEN.nombre} a ${DESTINO.nombre}`);
    console.log(`📍 Origen: ${ORIGEN.lat}, ${ORIGEN.lng}`);
    console.log(`🎯 Destino: ${DESTINO.lat}, ${DESTINO.lng}`);
    
    for (let i = 0; i < numPuntos; i++) {
      const progreso = (i + 1) / (numPuntos + 1); // +1 para no llegar exactamente al destino
      
      // Interpolación lineal entre origen y destino
      const lat = ORIGEN.lat + (DESTINO.lat - ORIGEN.lat) * progreso;
      const lng = ORIGEN.lng + (DESTINO.lng - ORIGEN.lng) * progreso;
      
      // Añadir algo de variación realista a la ruta (simular carreteras)
      const variacionLat = (Math.random() - 0.5) * 0.01; // ±0.01 grados
      const variacionLng = (Math.random() - 0.5) * 0.01; // ±0.01 grados
      
      puntos.push({
        lat: parseFloat((lat + variacionLat).toFixed(6)),
        lng: parseFloat((lng + variacionLng).toFixed(6)),
        progreso: Math.round(progreso * 100)
      });
    }
    
    return puntos;
  }

  // Generar datos base de la nevera
  generarDatosBase() {
    return {
      SERIAL: SERIAL_NEVERA,
      TEMP: parseFloat((Math.random() * 10 - 5).toFixed(1)), // Entre -5°C y 5°C
      BAT: Math.floor(Math.random() * 100) + 1, // Entre 1% y 100%
      TIMESTAMP: Math.floor(Date.now() / 1000) // Timestamp Unix (segundos desde epoch)
    };
  }

  // Crear mensaje para estado "preparado"
  crearMensajePreparado() {
    const datosBase = this.generarDatosBase();
    return {
      ...datosBase,
      MESSAGE: ESTADOS.PREPARADO,
      ORIGIN: ORIGEN.nombre,
      DESTINATION: DESTINO.nombre,
      LAT: ORIGEN.lat,
      LNG: ORIGEN.lng,
      ID: ID_PREPARACION
    };
  }

  // Crear mensaje para estado "en tránsito"
  crearMensajeEnTransito() {
    const datosBase = this.generarDatosBase();
    const puntoRuta = this.rutaCalculada[this.indiceCoordenadasTransito];
    
    // Avanzar al siguiente punto de la ruta
    this.indiceCoordenadasTransito = (this.indiceCoordenadasTransito + 1) % this.rutaCalculada.length;
    
    return {
      ...datosBase,
      MESSAGE: ESTADOS.EN_TRANSITO,
      ORIGIN: ORIGEN.nombre,
      DESTINATION: DESTINO.nombre,
      LAT: puntoRuta.lat,
      LNG: puntoRuta.lng,
      progreso: puntoRuta.progreso
    };
  }

  // Crear mensaje para estado "en extracción"
  crearMensajeEnExtraccion() {
    const datosBase = this.generarDatosBase();
    return {
      ...datosBase,
      MESSAGE: ESTADOS.EN_EXTRACCION,
      ORIGIN: ORIGEN.nombre,
      DESTINATION: DESTINO.nombre,
      LAT: DESTINO.lat,
      LNG: DESTINO.lng,
      ID: ID_EXTRACCION
    };
  }

  // Crear mensaje para estado "en introducción"
  crearMensajeEnIntroduccion() {
    const datosBase = this.generarDatosBase();
    return {
      ...datosBase,
      MESSAGE: ESTADOS.EN_INTRODUCCION,
      ORIGIN: ORIGEN.nombre,
      DESTINATION: DESTINO.nombre,
      LAT: DESTINO.lat,
      LNG: DESTINO.lng
    };
  }

  // Enviar petición HTTP POST
  async enviarPeticionHTTP(mensaje) {
    try {
      const mensajeJson = JSON.stringify(mensaje, null, 2);
      
      console.log(`📤 Enviando petición HTTP: ${mensaje.MESSAGE}`);
      console.log(`🌐 Endpoint: ${HTTP_ENDPOINT}`);
      console.log(`📦 Payload:`, mensajeJson);
      console.log('─'.repeat(50));
      
      // Enviar petición POST sin esperar respuesta detallada
      const response = await this.httpClient.post(HTTP_ENDPOINT, mensaje);
      
      console.log(`✅ Petición enviada exitosamente - Status: ${response.status}`);
      return response;
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.error('❌ Error: No se puede conectar al servidor. Verifica que el endpoint esté disponible.');
      } else if (error.code === 'ENOTFOUND') {
        console.error('❌ Error: Dominio no encontrado. Verifica la URL del endpoint.');
      } else if (error.response) {
        console.error(`❌ Error HTTP ${error.response.status}: ${error.response.statusText}`);
      } else {
        console.error('❌ Error al enviar petición HTTP:', error.message);
      }
      // Continuamos sin lanzar el error para que el simulador siga funcionando
    }
  }

  // Esperar un intervalo de tiempo
  async esperar(milisegundos) {
    return new Promise(resolve => setTimeout(resolve, milisegundos));
  }

  // Ejecutar secuencia completa de mensajes
  async ejecutarSecuencia() {
    try {
      console.log('🚀 Iniciando secuencia de mensajes de nevera...');
      console.log(`🏠 Origen: ${ORIGEN.nombre} (${ORIGEN.lat}, ${ORIGEN.lng})`);
      console.log(`🎯 Destino: ${DESTINO.nombre} (${DESTINO.lat}, ${DESTINO.lng})`);
      console.log(`🌐 Endpoint: ${HTTP_ENDPOINT}`);
      console.log('─'.repeat(60));

      // 1. Mensaje "preparado"
      console.log('\n📦 FASE 1: PREPARACIÓN');
      const mensajePreparado = this.crearMensajePreparado();
      await this.enviarPeticionHTTP(mensajePreparado);
      await this.esperar(INTERVALO_MENSAJES);

      // 2. Mensajes "en tránsito" (múltiples)
      console.log('\n🚛 FASE 2: EN TRÁNSITO');
      for (let i = 0; i < this.maxMensajesTransito; i++) {
        const mensajeTransito = this.crearMensajeEnTransito();
        console.log(`   🗺️  Punto ${i + 1}/${this.maxMensajesTransito}: ${mensajeTransito.progreso}% del recorrido`);
        await this.enviarPeticionHTTP(mensajeTransito);
        
        if (i < this.maxMensajesTransito - 1) {
          await this.esperar(INTERVALO_MENSAJES);
        }
      }
      await this.esperar(INTERVALO_MENSAJES);

      // 3. Mensaje "en extracción"
      console.log('\n📤 FASE 3: EXTRACCIÓN');
      const mensajeExtraccion = this.crearMensajeEnExtraccion();
      await this.enviarPeticionHTTP(mensajeExtraccion);
      await this.esperar(INTERVALO_MENSAJES);

      // 4. Mensaje "en introducción"
      console.log('\n📥 FASE 4: INTRODUCCIÓN');
      const mensajeIntroduccion = this.crearMensajeEnIntroduccion();
      await this.enviarPeticionHTTP(mensajeIntroduccion);

      console.log('\n🎉 Secuencia de mensajes completada exitosamente');
      console.log('─'.repeat(60));
      
    } catch (error) {
      console.error('❌ Error durante la ejecución de la secuencia:', error);
      throw error;
    }
  }

  // Ejecutar secuencia en bucle continuo
  async ejecutarEnBucle(intervaloBucle = 60000) { // 1 minuto entre secuencias
    console.log(`🔄 Modo bucle activado (intervalo: ${intervaloBucle / 1000}s entre secuencias)`);
    
    while (true) {
      try {
        await this.ejecutarSecuencia();
        console.log(`⏰ Esperando ${intervaloBucle / 1000} segundos antes de la próxima secuencia...\n`);
        await this.esperar(intervaloBucle);
      } catch (error) {
        console.error('❌ Error en el bucle:', error);
        await this.esperar(5000); // Esperar 5 segundos antes de reintentar
      }
    }
  }
}

// Función principal
async function main() {
  const simulador = new SimuladorNeveraHTTP();
  
  try {
    // Verificar si se debe ejecutar en modo bucle
    const modoBucle = process.argv.includes('--bucle') || process.argv.includes('--loop');
    
    if (modoBucle) {
      // Ejecutar en bucle continuo
      await simulador.ejecutarEnBucle();
    } else {
      // Ejecutar una sola secuencia
      await simulador.ejecutarSecuencia();
      
      console.log('\n✅ Simulador HTTP finalizado');
    }
    
  } catch (error) {
    console.error('❌ Error en la aplicación:', error);
    process.exit(1);
  }
}

// Manejar señales de terminación
process.on('SIGINT', () => {
  console.log('\n🛑 Deteniendo simulador HTTP...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Deteniendo simulador HTTP...');
  process.exit(0);
});

// Ejecutar la aplicación
if (require.main === module) {
  main();
}

module.exports = SimuladorNeveraHTTP;
