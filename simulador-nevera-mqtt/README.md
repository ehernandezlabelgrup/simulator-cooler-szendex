# Simulador de Nevera MQTT

Este proyecto es un simulador de nevera que envía mensajes MQTT con diferentes estados operacionales. Simula el comportamiento de una nevera IoT que reporta su estado, ubicación, temperatura y nivel de batería a través del protocolo MQTT.

## 📋 Características

- **Estados simulados**: preparado, en tránsito, en extracción, en introducción
- **Formato de datos**: Claves en inglés y mayúsculas (TEMP, BAT, LAT, LNG, etc.)
- **Serial UUID**: Identificador único de la nevera en formato UUID
- **IDs de operación**: IDs únicos para preparación y extracción
- **Protocolo**: MQTT con broker Mosquitto
- **Configuración flexible**: Variables de entorno para personalización
- **Modo bucle**: Ejecución continua para pruebas prolongadas

## 🚀 Instalación

### Prerrequisitos

1. **Node.js** (versión 14 o superior)
2. **Broker MQTT Mosquitto**

#### Instalar Mosquitto en macOS
```bash
brew install mosquitto
brew services start mosquitto
```

#### Instalar Mosquitto en Ubuntu/Debian
```bash
sudo apt update
sudo apt install mosquitto mosquitto-clients
sudo systemctl start mosquitto
sudo systemctl enable mosquitto
```

### Instalar dependencias del proyecto

```bash
npm install
```

## ⚙️ Configuración

Copia el archivo de ejemplo y modifica las variables según tu entorno:

```bash
cp .env.example .env
```

### Personalizar la ruta de origen y destino

Para simular una ruta específica, modifica las variables en el archivo `.env`:

```bash
# Ejemplo: Ruta Madrid → Barcelona
ORIGEN_NOMBRE=Almacén Central Madrid
ORIGEN_LAT=40.4168
ORIGEN_LNG=-3.7038
DESTINO_NOMBRE=Centro Comercial Barcelona
DESTINO_LAT=41.3851
DESTINO_LNG=2.1734

# Ejemplo: Ruta Valencia → Sevilla  
ORIGEN_NOMBRE=Depósito Valencia
ORIGEN_LAT=39.4699
ORIGEN_LNG=-0.3763
DESTINO_NOMBRE=Centro Logístico Sevilla
DESTINO_LAT=37.3891
DESTINO_LNG=-5.9845
```

El simulador calculará automáticamente 6 puntos intermedios en la ruta entre estos dos puntos.

### Variables de entorno disponibles

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `MQTT_BROKER` | URL del broker MQTT | `mqtt://localhost:1883` |
| `MQTT_TOPIC` | Tópico MQTT donde se publican los mensajes | `nevera/evento` |
| `SERIAL_NEVERA` | Serial UUID único de la nevera | `550e8400-e29b-41d4-a716-446655440000` |
| `ID_PREPARACION` | ID único para operación de preparación | `PREP-2024-001` |
| `ID_EXTRACCION` | ID único para operación de extracción | `EXTR-2024-001` |
| `INTERVALO_MENSAJES` | Tiempo entre mensajes en milisegundos | `5000` (5 segundos) |
| `ORIGEN_NOMBRE` | Nombre del punto de origen | `Almacén Central Madrid` |
| `ORIGEN_LAT` | Latitud del punto de origen | `40.4168` |
| `ORIGEN_LNG` | Longitud del punto de origen | `-3.7038` |
| `DESTINO_NOMBRE` | Nombre del punto de destino | `Centro Comercial Barcelona` |
| `DESTINO_LAT` | Latitud del punto de destino | `41.3851` |
| `DESTINO_LNG` | Longitud del punto de destino | `2.1734` |

## 🏃‍♂️ Uso

### Configurar una ruta rápidamente

Usa el configurador interactivo para seleccionar rutas predefinidas:

```bash
npm run configurar
```

### Generar nuevos IDs

Usa el generador de IDs para crear nuevos seriales UUID e IDs de operación:

```bash
npm run generar-ids
```

Rutas disponibles:
- **Madrid → Barcelona**: Ruta principal de España
- **Valencia → Sevilla**: Costa Este a Andalucía  
- **Bilbao → Madrid**: Norte a Centro
- **Zaragoza → Valencia**: Aragón a Levante
- **Test Local**: Coordenadas de prueba
- **Personalizada**: Ingresa tus propias coordenadas

### Ejecutar el simulador

```bash
# Ejecutar una secuencia única
npm start

# Ejecutar en modo bucle continuo
npm start -- --bucle

# Ejecutar en modo desarrollo (con nodemon)
npm run dev
```

## 📊 Secuencia de Mensajes

El simulador envía los mensajes en el siguiente orden:

1. **Preparado** - Estado inicial en el origen
2. **En tránsito** (6 mensajes) - Ruta calculada entre origen y destino con coordenadas intermedias
3. **En extracción** - Proceso de descarga en el destino
4. **En introducción** - Proceso de carga completado en el destino

### Cálculo de Ruta

El simulador calcula automáticamente una ruta entre el origen y destino configurados:
- **Interpolación lineal**: Calcula puntos intermedios entre origen y destino
- **Variación realista**: Añade pequeñas desviaciones para simular carreteras reales
- **Información de progreso**: Cada mensaje incluye el porcentaje de progreso del viaje

### Formato de Mensajes

Todos los mensajes usan claves en **inglés y MAYÚSCULAS**:
- `SERIAL`: Serial UUID único de la nevera
- `TEMP`: Temperatura en grados Celsius
- `BAT`: Nivel de batería en porcentaje
- `LAT`/`LNG`: Coordenadas GPS
- `MESSAGE`: Estado actual ("preparado", "en transito", "en extraccion", "en introduccion")
- `ORIGIN`/`DESTINATION`: Nombres de origen y destino
- `TIMESTAMP`: Fecha y hora en formato ISO
- `ID`: ID único de operación (solo en preparación y extracción)
- `progreso`: Porcentaje de progreso del viaje (solo en tránsito)

### Estructura de los mensajes

#### Mensaje "preparado"
```json
{
  "SERIAL": "550e8400-e29b-41d4-a716-446655440000",
  "TEMP": -2.3,
  "BAT": 85,
  "TIMESTAMP": "2024-01-15T10:30:00.000Z",
  "MESSAGE": "preparado",
  "ORIGIN": "Almacén Central Madrid",
  "DESTINATION": "Centro Comercial Barcelona",
  "LAT": 40.4168,
  "LNG": -3.7038,
  "ID": "PREP-2024-001"
}
```

#### Mensaje "en tránsito"
```json
{
  "SERIAL": "550e8400-e29b-41d4-a716-446655440000",
  "TEMP": 1.7,
  "BAT": 82,
  "TIMESTAMP": "2024-01-15T10:30:05.000Z",
  "MESSAGE": "en transito",
  "ORIGIN": "Almacén Central Madrid",
  "DESTINATION": "Centro Comercial Barcelona",
  "LAT": 40.5289,
  "LNG": -2.8945,
  "progreso": 17
}
```

#### Mensaje "en extracción"
```json
{
  "SERIAL": "550e8400-e29b-41d4-a716-446655440000",
  "TEMP": -1.2,
  "BAT": 80,
  "TIMESTAMP": "2024-01-15T10:30:35.000Z",
  "MESSAGE": "en extraccion",
  "ORIGIN": "Almacén Central Madrid",
  "DESTINATION": "Centro Comercial Barcelona",
  "LAT": 41.3851,
  "LNG": 2.1734,
  "ID": "EXTR-2024-001"
}
```

#### Mensaje "en introducción"
```json
{
  "SERIAL": "550e8400-e29b-41d4-a716-446655440000",
  "TEMP": 0.5,
  "BAT": 78,
  "TIMESTAMP": "2024-01-15T10:30:40.000Z",
  "MESSAGE": "en introduccion",
  "ORIGIN": "Almacén Central Madrid",
  "DESTINATION": "Centro Comercial Barcelona",
  "LAT": 41.3851,
  "LNG": 2.1734
}
```

## 🧪 Pruebas

### Verificar mensajes MQTT

Para monitorear los mensajes en tiempo real, puedes usar el cliente mosquitto:

```bash
mosquitto_sub -h localhost -t "nevera/evento" -v
```

### Verificar broker MQTT

Para probar si el broker está funcionando:

```bash
# Terminal 1: Suscribirse al tópico
mosquitto_sub -h localhost -t "test/topic"

# Terminal 2: Publicar un mensaje de prueba
mosquitto_pub -h localhost -t "test/topic" -m "Mensaje de prueba"
```

## 🔧 Desarrollo

### Estructura del proyecto

```
simulador-nevera-mqtt/
├── .env                    # Variables de entorno
├── .env.example           # Ejemplo de configuración
├── .gitignore            # Archivos ignorados por Git
├── index.js              # Archivo principal del simulador
├── configurar-ruta.js    # Script para configurar rutas predefinidas
├── generar-ids.js        # Script para generar UUIDs e IDs de operación
├── scripts.sh            # Utilidades para gestión del proyecto
├── package.json          # Dependencias y scripts
├── README.md             # Documentación
└── .github/
    └── copilot-instructions.md
```

### Scripts disponibles

- `npm start`: Ejecuta el simulador una vez
- `npm run dev`: Ejecuta con nodemon para desarrollo
- `npm run configurar`: Abre el configurador interactivo de rutas
- `npm run generar-ids`: Genera nuevos UUIDs e IDs de operación
- `npm test`: Placeholder para pruebas

## 🐛 Solución de problemas

### Error de conexión MQTT

Si obtienes errores de conexión:

1. Verifica que Mosquitto esté ejecutándose:
   ```bash
   brew services list | grep mosquitto  # macOS
   sudo systemctl status mosquitto      # Linux
   ```

2. Verifica la configuración en `.env`
3. Prueba la conexión manual con mosquitto_pub/sub

### Puerto ocupado

Si el puerto 1883 está ocupado, puedes cambiar la configuración:

```bash
# En .env
MQTT_BROKER=mqtt://localhost:1884
```

## 📝 Logs

El simulador muestra logs detallados de cada operación:

- ✅ Conexión exitosa
- 📤 Mensajes enviados
- ❌ Errores de conexión
- 🔄 Estado del bucle

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🔗 Referencias

- [Protocolo MQTT](https://mqtt.org/)
- [Mosquitto Broker](https://mosquitto.org/)
- [Node.js MQTT Client](https://github.com/mqttjs/MQTT.js)
