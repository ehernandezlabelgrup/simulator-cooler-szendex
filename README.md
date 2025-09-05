# 🧊 Simulador de Neveras IoT - Szendex

Este proyecto contiene simuladores para neveras IoT que permiten generar datos de transporte y ubicación en tiempo real. Puedes elegir entre dos versiones según tus necesidades de integración.

## 📦 Opciones Disponibles

### 🔌 **simulador-nevera-mqtt**
Simulador basado en protocolo MQTT ideal para arquitecturas pub/sub y tiempo real.

**Características:**
- ✅ Protocolo MQTT con broker Mosquitto
- ✅ Publicación en topic `nevera/evento`
- ✅ Ideal para sistemas distribuidos
- ✅ Bajo consumo de ancho de banda

### 🌐 **simulador-nevera-http**
Simulador basado en peticiones HTTP POST ideal para APIs REST.

**Características:**
- ✅ Peticiones HTTP POST
- ✅ Compatible con APIs REST estándar
- ✅ Fácil integración con Laravel/PHP
- ✅ Endpoint configurable

## 🚀 Inicio Rápido

### Opción 1: MQTT
```bash
cd simulador-nevera-mqtt
npm install
npm start
```

### Opción 2: HTTP
```bash
cd simulador-nevera-http
npm install
npm start
```

## 📋 Datos Generados

Ambos simuladores generan la misma estructura de datos con timestamps Unix:

```json
{
  "SERIAL": "550e8400-e29b-41d4-a716-446655440000",
  "TEMP": 2.5,
  "BAT": 87,
  "TIMESTAMP": 1757072661,
  "MESSAGE": "en transito",
  "ORIGIN": "Almacén Central Madrid",
  "DESTINATION": "Centro Comercial Barcelona",
  "LAT": 40.692557,
  "LNG": -2.029582,
  "progreso": 29
}
```

## 🗺️ Estados del Proceso

1. **PREPARADO** - Nevera lista en el origen
2. **EN_TRANSITO** - Nevera en movimiento (6 puntos GPS)
3. **EN_EXTRACCION** - Nevera siendo extraída en destino
4. **EN_INTRODUCCION** - Nevera introducida en ubicación final

## ⚙️ Configuración

Ambos proyectos incluyen:
- 📝 Archivo `.env` para configuración
- 🗺️ Script `configurar-ruta.js` para rutas personalizadas
- 🆔 Script `generar-ids.js` para nuevos identificadores
- 📋 Tareas de VS Code preconfiguradas

## 📖 Documentación Detallada

Consulta los README individuales de cada proyecto para instrucciones específicas:
- [📋 simulador-nevera-mqtt/README.md](./simulador-nevera-mqtt/README.md)
- [📋 simulador-nevera-http/README.md](./simulador-nevera-http/README.md)

---

**💡 Recomendación:** Elige MQTT para sistemas en tiempo real distribuidos, o HTTP para integraciones simples con APIs REST.
