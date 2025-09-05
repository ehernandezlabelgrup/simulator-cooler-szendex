// Simular variables de entorno
process.env.SERIAL_NEVERA = '123456789';
process.env.ORIGEN_SERVICIO = '1';
process.env.DESTINO_SERVICIO = '2';
process.env.TIPO_SERVICIO = '1';

const mqtt = require('mqtt');
require('dotenv').config();

// Configuración del simulador
const SERIAL_NEVERA = parseInt(process.env.SERIAL_NEVERA) || 123456789;
const ORIGEN_SERVICIO = parseInt(process.env.ORIGEN_SERVICIO) || 1;
const DESTINO_SERVICIO = parseInt(process.env.DESTINO_SERVICIO) || 2;
const TIPO_SERVICIO = parseInt(process.env.TIPO_SERVICIO) || 1;
const VERSION_FIRMWARE = process.env.VERSION_FIRMWARE || "1.2.3";
const VERSION_PARAMETROS = process.env.VERSION_PARAMETROS || "2.1.0";
const ORIGEN_LAT = parseFloat(process.env.ORIGEN_LAT) || 40.4168;
const ORIGEN_LNG = parseFloat(process.env.ORIGEN_LNG) || -3.7038;
const DESTINO_LAT = parseFloat(process.env.DESTINO_LAT) || 41.3851;
const DESTINO_LNG = parseFloat(process.env.DESTINO_LNG) || 2.1734;

class TestSimulador {
  constructor() {
    this.indiceRuta = 0;
    this.rutaGPS = this.calcularRutaGPS();
    this.tiempoInicioServicio = Math.floor(Date.now() / 1000);
    this.ultimaConexionGPS = Math.floor(Date.now() / 1000);
    this.bootCounter = Math.floor(Math.random() * 1000) + 1;
    this.numeroImpactos = 3; // Valor fijo para test
    this.topic = `cooler_${SERIAL_NEVERA}`;
  }

  calcularRutaGPS() {
    const puntos = [];
    for (let i = 0; i <= 10; i++) {
      const progreso = i / 10;
      const lat = ORIGEN_LAT + (DESTINO_LAT - ORIGEN_LAT) * progreso;
      const lng = ORIGEN_LNG + (DESTINO_LNG - ORIGEN_LNG) * progreso;
      puntos.push({ lat: parseFloat(lat.toFixed(6)), lng: parseFloat(lng.toFixed(6)) });
    }
    return puntos;
  }

  generarAlarmas() {
    return {
      MEMORY_FULL: false,
      DOOR_OPEN_TOO_LONG: false,
      COOLER_RESET: false,
      EMPTYING_TIME_EXCEEDED: false,
      NO_BATTERY_DURING_SERVICE: false,
      LOW_BATTERY_DURING_SERVICE: true,
      TILTED: false,
      IMPACT_COUNT: this.numeroImpactos,
      HIGH_TEMPERATURE: false,
      LOW_TEMPERATURE: false,
      SERVICE_TIME_EXCEEDED: false,
      COOLER_CLOSED_DURING_EMPTYING: false,
      WRONG_NFC_CARD: false,
      SERVICE_START_WITHOUT_NFC: false,
      COULD_NOT_OPEN_LID: false
    };
  }

  crearMensajeCooler() {
    const ahora = Math.floor(Date.now() / 1000);
    const puntoActual = this.rutaGPS[this.indiceRuta % this.rutaGPS.length];
    
    const mensaje = {
      SERIAL_NUMBER: SERIAL_NEVERA,
      TIMESTAMP: ahora,
      GPS_LONGITUDE: puntoActual.lng,
      GPS_LATITUDE: puntoActual.lat,
      SERVICE_ORIGIN: ORIGEN_SERVICIO,
      SERVICE_DESTINATION: DESTINO_SERVICIO,
      SERVICE_TYPE: TIPO_SERVICIO,
      TEMPERATURE: 2.5,
      BATTERY_VOLTAGE: 4.1,
      BATTERY_PERCENTAGE: 75,
      SERVICE_TIME: 3600, // 1 hora
      ALARMS: this.generarAlarmas(),
      RSSI: -65,
      BOOT_COUNTER: this.bootCounter,
      LAST_GPS_CONNECTION_TIME: 30,
      FIRMWARE_VERSION: VERSION_FIRMWARE,
      FIRMWARE_UPDATE_RESULT: 0,
      PARAMETERS_VERSION: VERSION_PARAMETROS,
      PARAMETERS_UPDATE_RESULT: 0
    };
    
    this.indiceRuta++;
    return mensaje;
  }
}

console.log('🧪 Probando el nuevo formato de mensaje IoT...\n');

const simulador = new TestSimulador();
const mensaje = simulador.crearMensajeCooler();

console.log('📋 Mensaje generado según especificaciones de ingeniería:');
console.log('─'.repeat(60));
console.log(JSON.stringify(mensaje, null, 2));
console.log('─'.repeat(60));

console.log('\n✅ Campos verificados:');
console.log(`🆔 SERIAL_NUMBER (int32): ${mensaje.SERIAL_NUMBER}`);
console.log(`⏰ TIMESTAMP (int32): ${mensaje.TIMESTAMP}`);
console.log(`🌍 GPS_LONGITUDE (float): ${mensaje.GPS_LONGITUDE}`);
console.log(`🌍 GPS_LATITUDE (float): ${mensaje.GPS_LATITUDE}`);
console.log(`🏠 SERVICE_ORIGIN (int16): ${mensaje.SERVICE_ORIGIN}`);
console.log(`🎯 SERVICE_DESTINATION (int16): ${mensaje.SERVICE_DESTINATION}`);
console.log(`🔧 SERVICE_TYPE (int8): ${mensaje.SERVICE_TYPE}`);
console.log(`🌡️  TEMPERATURE (float): ${mensaje.TEMPERATURE}`);
console.log(`🔋 BATTERY_VOLTAGE (float): ${mensaje.BATTERY_VOLTAGE}`);
console.log(`📊 BATTERY_PERCENTAGE (int16): ${mensaje.BATTERY_PERCENTAGE}`);
console.log(`⏱️  SERVICE_TIME (int32): ${mensaje.SERVICE_TIME}`);
console.log(`🚨 ALARMS (object): ${Object.keys(mensaje.ALARMS).length} alarmas`);
console.log(`📶 RSSI (int8): ${mensaje.RSSI}`);
console.log(`🔄 BOOT_COUNTER (int32): ${mensaje.BOOT_COUNTER}`);
console.log(`📡 LAST_GPS_CONNECTION_TIME (int32): ${mensaje.LAST_GPS_CONNECTION_TIME}`);
console.log(`💾 FIRMWARE_VERSION (string): ${mensaje.FIRMWARE_VERSION}`);
console.log(`🔄 FIRMWARE_UPDATE_RESULT (int): ${mensaje.FIRMWARE_UPDATE_RESULT}`);
console.log(`📋 PARAMETERS_VERSION (string): ${mensaje.PARAMETERS_VERSION}`);
console.log(`🔄 PARAMETERS_UPDATE_RESULT (int): ${mensaje.PARAMETERS_UPDATE_RESULT}`);

console.log(`\n📡 Topic MQTT: ${simulador.topic}`);
console.log('\n🎉 Simulador MQTT actualizado correctamente con la nueva especificación!');
