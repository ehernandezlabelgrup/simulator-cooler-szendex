<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Simulador MQTT de Nevera - Instrucciones de Proyecto

## Resumen del Proyecto
Este es un simulador de nevera IoT que envía mensajes MQTT con diferentes estados operacionales:
- **preparado**: Estado inicial
- **en transito**: Movimiento con coordenadas GPS (se repite 6 veces con diferentes ubicaciones)
- **en extraccion**: Proceso de descarga
- **en introduccion**: Proceso de carga

## Lista de Verificación del Proyecto
- [x] Verify that the copilot-instructions.md file in the .github directory is created.
- [x] Clarify Project Requirements
- [x] Scaffold the Project
- [x] Customize the Project
- [x] Install Required Extensions
- [x] Compile the Project
- [x] Create and Run Task
- [x] Launch the Project
- [x] Ensure Documentation is Complete

## Estructura del Proyecto
```
simulador-nevera-mqtt/
├── .env                    # Variables de entorno
├── .env.example           # Ejemplo de configuración
├── .gitignore            # Archivos ignorados por Git
├── index.js              # Archivo principal del simulador
├── package.json          # Dependencias y scripts
├── README.md             # Documentación completa
├── .vscode/
│   └── tasks.json        # Tareas de VS Code
└── .github/
    └── copilot-instructions.md
```

## Comandos Principales
- `npm start`: Ejecuta una secuencia completa de mensajes
- `npm start -- --bucle`: Ejecuta en modo bucle continuo
- `npm run dev`: Ejecuta con nodemon para desarrollo

## Configuración MQTT
- **Broker**: mqtt://localhost:1883 (configurable)
- **Tópico**: nevera/evento (configurable)
- **Intervalo**: 5 segundos entre mensajes (configurable)

## Notas Técnicas
- Usa la librería `mqtt` para conectividad
- Variables de entorno con `dotenv`
- Coordenadas GPS simuladas para el estado "en tránsito"
- Datos aleatorios realistas para temperatura (-5°C a 5°C) y batería (1% a 100%)
