const mqtt = require('mqtt');
require('dotenv').config();

// Configuración del broker MQTT
const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://localhost:1883';

// Configuración del simulador
const SERIAL_NEVERA = parseInt(process.env.SERIAL_NEVERA) || 123456789;
const ORIGEN_SERVICIO = parseInt(process.env.ORIGEN_SERVICIO) || 1;
const DESTINO_SERVICIO = parseInt(process.env.DESTINO_SERVICIO) || 2;
const TIPO_SERVICIO = parseInt(process.env.TIPO_SERVICIO) || 1; // 1: vacunas, 2: muestras, 3: medicamentos, 4: no servicio
const INTERVALO_MENSAJES = 5000; // Fijo a 5 segundos como solicitaste
const VERSION_FIRMWARE = process.env.VERSION_FIRMWARE || "1.2.3";
const VERSION_PARAMETROS = process.env.VERSION_PARAMETROS || "2.1.0";

// Configuración de ruta GPS
const ORIGEN_LAT = parseFloat(process.env.ORIGEN_LAT) || 40.4168;
const ORIGEN_LNG = parseFloat(process.env.ORIGEN_LNG) || -3.7038;
const DESTINO_LAT = parseFloat(process.env.DESTINO_LAT) || 41.3851;
const DESTINO_LNG = parseFloat(process.env.DESTINO_LNG) || 2.1734;

// Total de mensajes a enviar
const TOTAL_MENSAJES = 15;

class SimuladorNeveraMQTT {
  constructor() {
    this.client = null;
    this.rutaGPS = this.calcularRutaCompleta();
    this.temperaturasViaje = this.generarTemperaturasViaje();
    this.tiempoInicioServicio = Math.floor(Date.now() / 1000);
    this.ultimaConexionGPS = Math.floor(Date.now() / 1000);
    this.bootCounter = Math.floor(Math.random() * 1000) + 1;
    this.numeroImpactos = 0;
    this.topic = `cooler_${SERIAL_NEVERA}`;
  }

  // Calcular ruta completa de 15 puntos GPS
  calcularRutaCompleta() {
    const puntos = [];
    
    console.log(`🗺️  Calculando ruta de ${TOTAL_MENSAJES} puntos`);
    console.log(`📍 Origen: ${ORIGEN_LAT}, ${ORIGEN_LNG}`);
    console.log(`🎯 Destino: ${DESTINO_LAT}, ${DESTINO_LNG}`);
    
    for (let i = 0; i < TOTAL_MENSAJES; i++) {
      const progreso = i / (TOTAL_MENSAJES - 1); // De 0 a 1
      
      // Interpolación lineal entre origen y destino
      const lat = ORIGEN_LAT + (DESTINO_LAT - ORIGEN_LAT) * progreso;
      const lng = ORIGEN_LNG + (DESTINO_LNG - ORIGEN_LNG) * progreso;
      
      // Añadir variación realista para simular carreteras
      const variacionLat = (Math.random() - 0.5) * 0.01; // ±0.01 grados
      const variacionLng = (Math.random() - 0.5) * 0.01; // ±0.01 grados
      
      puntos.push({
        lat: parseFloat((lat + variacionLat).toFixed(6)),
        lng: parseFloat((lng + variacionLng).toFixed(6)),
        progreso: Math.round(progreso * 100),
        mensaje: i + 1
      });
    }
    
    return puntos;
  }

  // Generar temperaturas variables durante el viaje
  generarTemperaturasViaje() {
    const temperaturas = [];
    
    // Temperatura inicial
    let tempActual = Math.random() * 6 - 3; // Entre -3°C y 3°C
    
    for (let i = 0; i < TOTAL_MENSAJES; i++) {
      // Pequeñas variaciones durante el viaje
      const variacion = (Math.random() - 0.5) * 2; // ±1°C
      tempActual += variacion;
      
      // Mantener en rango realista
      tempActual = Math.max(-5, Math.min(5, tempActual));
      
      temperaturas.push(parseFloat(tempActual.toFixed(1)));
    }
    
    return temperaturas;
  }

  // Conectar al broker MQTT
  async conectar() {
    return new Promise((resolve, reject) => {
      console.log(`🔌 Conectando al broker MQTT: ${MQTT_BROKER}`);
      
      this.client = mqtt.connect(MQTT_BROKER);
      
      this.client.on('connect', () => {
        console.log('✅ Conectado al broker MQTT exitosamente');
        console.log(`📡 Topic: ${this.topic}`);
        resolve();
      });
      
      this.client.on('error', (error) => {
        console.error('❌ Error de conexión MQTT:', error);
        reject(error);
      });
    });
  }

  // Generar datos de alarmas simulados
  generarAlarmas() {
    return {
      MEMORY_FULL: Math.random() < 0.02, // 2% probabilidad
      DOOR_OPEN_TOO_LONG: Math.random() < 0.01, // 1% probabilidad
      COOLER_RESET: Math.random() < 0.01, // 1% probabilidad
      EMPTYING_TIME_EXCEEDED: Math.random() < 0.02, // 2% probabilidad
      NO_BATTERY_DURING_SERVICE: Math.random() < 0.005, // 0.5% probabilidad
      LOW_BATTERY_DURING_SERVICE: Math.random() < 0.05, // 5% probabilidad
      TILTED: Math.random() < 0.01, // 1% probabilidad
      IMPACT_COUNT: this.numeroImpactos,
      HIGH_TEMPERATURE: Math.random() < 0.03, // 3% probabilidad
      LOW_TEMPERATURE: Math.random() < 0.02, // 2% probabilidad
      SERVICE_TIME_EXCEEDED: Math.random() < 0.01, // 1% probabilidad
      COOLER_CLOSED_DURING_EMPTYING: Math.random() < 0.01, // 1% probabilidad
      WRONG_NFC_CARD: Math.random() < 0.01, // 1% probabilidad
      SERVICE_START_WITHOUT_NFC: Math.random() < 0.005, // 0.5% probabilidad
      COULD_NOT_OPEN_LID: Math.random() < 0.005 // 0.5% probabilidad
    };
  }

  // Crear mensaje para un punto específico del viaje
  crearMensajeViaje(indicePunto) {
    const ahora = Math.floor(Date.now() / 1000);
    const puntoGPS = this.rutaGPS[indicePunto];
    const temperatura = this.temperaturasViaje[indicePunto];
    
    // Simular degradación gradual de batería durante el viaje
    const porcentajeBateriaInicial = 95;
    const degradacionBateria = (indicePunto / (TOTAL_MENSAJES - 1)) * 20; // Hasta 20% de degradación
    const porcentajeBateria = Math.floor(porcentajeBateriaInicial - degradacionBateria);
    const voltajeBateria = parseFloat((4.2 - (degradacionBateria * 0.02)).toFixed(2)); // De 4.2V a 3.8V
    
    // RSSI variable (señal puede variar durante el viaje)
    const rssi = -40 - Math.floor(Math.random() * 50); // -40 a -90 dBm
    
    // Tiempo de servicio acumulado
    const tiempoServicio = (indicePunto * INTERVALO_MENSAJES) / 1000; // En segundos
    
    // Simular impactos ocasionales
    if (Math.random() < 0.1) { // 10% probabilidad de impacto por mensaje
      this.numeroImpactos++;
    }
    
    // Actualizar tiempo de GPS ocasionalmente
    if (Math.random() < 0.4) { // 40% probabilidad de actualizar GPS
      this.ultimaConexionGPS = ahora;
    }
    
    const mensaje = {
      SERIAL_NUMBER: SERIAL_NEVERA,
      TIMESTAMP: ahora,
      GPS_LONGITUDE: puntoGPS.lng,
      GPS_LATITUDE: puntoGPS.lat,
      SERVICE_ORIGIN: ORIGEN_SERVICIO,
      SERVICE_DESTINATION: DESTINO_SERVICIO,
      SERVICE_TYPE: TIPO_SERVICIO,
      TEMPERATURE: temperatura,
      BATTERY_VOLTAGE: voltajeBateria,
      BATTERY_PERCENTAGE: porcentajeBateria,
      SERVICE_TIME: tiempoServicio,
      ALARMS: this.generarAlarmas(),
      RSSI: rssi,
      BOOT_COUNTER: this.bootCounter,
      LAST_GPS_CONNECTION_TIME: ahora - this.ultimaConexionGPS,
      FIRMWARE_VERSION: VERSION_FIRMWARE,
      FIRMWARE_UPDATE_RESULT: indicePunto === 0 ? 0 : Math.floor(Math.random() * 3), // Primer mensaje siempre exitoso
      PARAMETERS_VERSION: VERSION_PARAMETROS,
      PARAMETERS_UPDATE_RESULT: indicePunto === 0 ? 0 : Math.floor(Math.random() * 3)
    };
    
    return mensaje;
  }

  // Publicar mensaje en el tópico MQTT
  async publicarMensaje(mensaje, indicePunto) {
    return new Promise((resolve, reject) => {
      const mensajeJson = JSON.stringify(mensaje, null, 2);
      const puntoGPS = this.rutaGPS[indicePunto];
      
      console.log(`📤 Mensaje ${indicePunto + 1}/${TOTAL_MENSAJES} - Progreso: ${puntoGPS.progreso}%`);
      console.log(`📍 GPS: ${mensaje.GPS_LATITUDE}, ${mensaje.GPS_LONGITUDE}`);
      console.log(`🌡️  Temperatura: ${mensaje.TEMPERATURE}°C`);
      console.log(`🔋 Batería: ${mensaje.BATTERY_PERCENTAGE}% (${mensaje.BATTERY_VOLTAGE}V)`);
      console.log(`📡 Topic: ${this.topic}`);
      console.log('─'.repeat(60));
      
      this.client.publish(this.topic, mensajeJson, { qos: 1 }, (error) => {
        if (error) {
          console.error('❌ Error al publicar mensaje:', error);
          reject(error);
        } else {
          console.log('✅ Mensaje enviado exitosamente\n');
          resolve();
        }
      });
    });
  }

  // Esperar un intervalo de tiempo
  async esperar(milisegundos) {
    return new Promise(resolve => setTimeout(resolve, milisegundos));
  }

  // Ejecutar secuencia completa de viaje
  async ejecutarViaje() {
    console.log('🚀 Iniciando simulación de viaje de nevera IoT...');
    console.log(`🆔 Serial nevera: ${SERIAL_NEVERA}`);
    console.log(`📡 Topic MQTT: ${this.topic}`);
    console.log(`🏠 Origen servicio: ${ORIGEN_SERVICIO}`);
    console.log(`🎯 Destino servicio: ${DESTINO_SERVICIO}`);
    console.log(`🔧 Tipo servicio: ${TIPO_SERVICIO} (1:vacunas, 2:muestras, 3:medicamentos, 4:no servicio)`);
    console.log(`📦 Total mensajes: ${TOTAL_MENSAJES}`);
    console.log(`⏱️  Intervalo: ${INTERVALO_MENSAJES / 1000} segundos`);
    console.log(`🕐 Duración total: ${(TOTAL_MENSAJES * INTERVALO_MENSAJES) / 1000} segundos`);
    console.log('═'.repeat(70));
    
    try {
      for (let i = 0; i < TOTAL_MENSAJES; i++) {
        const mensaje = this.crearMensajeViaje(i);
        await this.publicarMensaje(mensaje, i);
        
        // Esperar antes del siguiente mensaje (excepto en el último)
        if (i < TOTAL_MENSAJES - 1) {
          console.log(`⏰ Esperando ${INTERVALO_MENSAJES / 1000} segundos hasta el próximo mensaje...\n`);
          await this.esperar(INTERVALO_MENSAJES);
        }
      }
      
      console.log('═'.repeat(70));
      console.log('🎉 ¡Viaje de nevera completado exitosamente!');
      console.log(`📍 Nevera llegó de ${ORIGEN_LAT},${ORIGEN_LNG} a ${DESTINO_LAT},${DESTINO_LNG}`);
      console.log(`📦 Total de ${TOTAL_MENSAJES} mensajes enviados`);
      console.log('═'.repeat(70));
      
    } catch (error) {
      console.error('❌ Error durante el viaje:', error);
      throw error;
    }
  }

  // Desconectar del broker
  desconectar() {
    if (this.client) {
      this.client.end();
      console.log('👋 Desconectado del broker MQTT');
    }
  }
}

// Función principal
async function main() {
  const simulador = new SimuladorNeveraMQTT();
  
  try {
    // Conectar al broker
    await simulador.conectar();
    
    // Ejecutar viaje completo
    await simulador.ejecutarViaje();
    
    // Esperar un momento antes de desconectar
    await new Promise(resolve => setTimeout(resolve, 2000));
    simulador.desconectar();
    
  } catch (error) {
    console.error('❌ Error en la aplicación:', error);
    simulador.desconectar();
    process.exit(1);
  }
}

// Manejar señales de terminación
process.on('SIGINT', () => {
  console.log('\n🛑 Deteniendo simulador...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Deteniendo simulador...');
  process.exit(0);
});

// Ejecutar la aplicación
if (require.main === module) {
  main();
}

module.exports = SimuladorNeveraMQTT;
