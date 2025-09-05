# Simulador HTTP de Nevera - Instrucciones de Proyecto

## Resumen del Proyecto
Este es un simulador de nevera IoT que envía peticiones HTTP POST con diferentes estados operacionales:
- **preparado**: Estado inicial
- **en transito**: Movimiento con coordenadas GPS (se repite 6 veces con diferentes ubicaciones)
- **en extraccion**: Proceso de descarga
- **en introduccion**: Proceso de carga

## Diferencias con el simulador MQTT
- Usa **HTTP POST** en lugar de MQTT
- Envía peticiones a un endpoint REST
- No requiere broker MQTT
- Usa la librería **axios** para HTTP
- Manejo de errores de conexión HTTP

## Estructura del Proyecto
```
simulador-nevera-http/
├── .env                    # Variables de entorno
├── .env.example           # Ejemplo de configuración
├── .gitignore            # Archivos ignorados por Git
├── index.js              # Archivo principal del simulador
├── configurar-ruta.js    # Script para configurar rutas predefinidas
├── generar-ids.js        # Script para generar UUIDs e IDs de operación
├── package.json          # Dependencias y scripts
├── README.md             # Documentación completa
└── .github/
    └── copilot-instructions.md
```

## Comandos Principales
- `npm start`: Ejecuta una secuencia completa de mensajes
- `npm start -- --bucle`: Ejecuta en modo bucle continuo
- `npm run dev`: Ejecuta con nodemon para desarrollo
- `npm run configurar`: Configurar rutas interactivamente
- `npm run generar-ids`: Generar nuevos UUIDs e IDs

## Configuración HTTP
- **Endpoint**: http://localhost:8000/api/nevera/eventos (configurable)
- **Timeout**: 5000ms (configurable)
- **Intervalo**: 5 segundos entre mensajes (configurable)

## Notas Técnicas
- Usa la librería `axios` para peticiones HTTP
- Variables de entorno con `dotenv`
- Coordenadas GPS simuladas para el estado "en tránsito"
- Datos aleatorios realistas para temperatura (-5°C a 5°C) y batería (1% a 100%)
- Manejo robusto de errores HTTP (conexión rechazada, timeout, etc.)
- Formato JSON idéntico al simulador MQTT
