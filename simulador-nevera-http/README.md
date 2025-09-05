# Simulador de Nevera HTTP

Este proyecto es un simulador de nevera que envía peticiones HTTP POST con diferentes estados operacionales. Simula el comportamiento de una nevera IoT que reporta su estado, ubicación, temperatura y nivel de batería a través de peticiones HTTP a un endpoint REST.

## 📋 Características

- **Estados simulados**: preparado, en tránsito, en extracción, en introducción
- **Formato de datos**: Claves en inglés y mayúsculas (TEMP, BAT, LAT, LNG, etc.)
- **Serial UUID**: Identificador único de la nevera en formato UUID
- **IDs de operación**: IDs únicos para preparación y extracción
- **Protocolo**: HTTP POST sin esperar respuesta
- **Configuración flexible**: Variables de entorno para personalización
- **Modo bucle**: Ejecución continua para pruebas prolongadas

## 🚀 Instalación

### Prerrequisitos

1. **Node.js** (versión 14 o superior)
2. **Servidor HTTP** que reciba las peticiones POST

### Instalar dependencias del proyecto

```bash
npm install
```

## ⚙️ Configuración

Copia el archivo de ejemplo y modifica las variables según tu entorno:

```bash
cp .env.example .env
```

### Personalizar el endpoint y la ruta

Para configurar el endpoint donde se envían las peticiones y la ruta de origen y destino, modifica las variables en el archivo `.env`:

```bash
# Endpoint HTTP (tu backend Laravel)
HTTP_ENDPOINT=http://localhost:8000/api/nevera/eventos
HTTP_TIMEOUT=5000

# Ejemplo: Ruta Madrid → Barcelona
ORIGEN_NOMBRE=Almacén Central Madrid
ORIGEN_LAT=40.4168
ORIGEN_LNG=-3.7038
DESTINO_NOMBRE=Centro Comercial Barcelona
DESTINO_LAT=41.3851
DESTINO_LNG=2.1734
```

### Variables de entorno disponibles

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `HTTP_ENDPOINT` | URL del endpoint HTTP donde enviar las peticiones | `http://localhost:8000/api/nevera/eventos` |
| `HTTP_TIMEOUT` | Timeout para las peticiones HTTP en milisegundos | `5000` |
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

El simulador envía las peticiones HTTP POST en el siguiente orden:

1. **Preparado** - Estado inicial en el origen
2. **En tránsito** (6 peticiones) - Ruta calculada entre origen y destino con coordenadas intermedias
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

### Verificar peticiones HTTP

Para monitorear las peticiones que llegan a tu servidor, puedes usar herramientas como:

- **Postman Echo**: `https://postman-echo.com/post`
- **httpbin**: `https://httpbin.org/post`
- **RequestBin**: Para capturar y inspeccionar peticiones

Ejemplo de configuración temporal para pruebas:
```bash
# En tu .env
HTTP_ENDPOINT=https://postman-echo.com/post
```

### Verificar conectividad

Para probar si el endpoint está disponible:

```bash
curl -X POST http://localhost:8000/api/nevera/eventos \
  -H "Content-Type: application/json" \
  -d '{"test": "mensaje de prueba"}'
```

## 🔧 Desarrollo

### Estructura del proyecto

```
simulador-nevera-http/
├── .env                    # Variables de entorno
├── .env.example           # Ejemplo de configuración
├── .gitignore            # Archivos ignorados por Git
├── index.js              # Archivo principal del simulador
├── configurar-ruta.js    # Script para configurar rutas predefinidas
├── generar-ids.js        # Script para generar UUIDs e IDs de operación
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

### Error de conexión HTTP

Si obtienes errores de conexión:

1. Verifica que el endpoint esté disponible:
   ```bash
   curl -I http://localhost:8000/api/nevera/eventos
   ```

2. Verifica la configuración en `.env`
3. Revisa los logs del servidor para ver si las peticiones están llegando

### Timeout de peticiones

Si las peticiones tardan demasiado:

```bash
# En .env, aumenta el timeout
HTTP_TIMEOUT=10000
```

### Endpoint no encontrado

Si el dominio no se encuentra:

1. Verifica que la URL sea correcta
2. Asegúrate de incluir el protocolo (http:// o https://)
3. Verifica que el servidor esté ejecutándose

## 📝 Logs

El simulador muestra logs detallados de cada operación:

- ✅ Peticiones enviadas exitosamente
- ❌ Errores de conexión HTTP
- 🔄 Estado del bucle
- 📊 Información de progreso de la ruta

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🔗 Referencias

- [Axios HTTP Client](https://axios-http.com/)
- [Node.js HTTP](https://nodejs.org/api/http.html)
- [REST API Best Practices](https://restfulapi.net/)
