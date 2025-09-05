#!/bin/bash

# Scripts de utilidad para el simulador MQTT de nevera

echo "🔧 Scripts de Utilidad - Simulador MQTT Nevera"
echo "=============================================="

# Función para mostrar el menú
show_menu() {
    echo ""
    echo "Selecciona una opción:"
    echo "1) Monitorear mensajes MQTT"
    echo "2) Enviar mensaje de prueba"
    echo "3) Verificar estado de Mosquitto"
    echo "4) Iniciar Mosquitto"
    echo "5) Detener Mosquitto"
    echo "6) Ejecutar simulador una vez"
    echo "7) Ejecutar simulador en bucle"
    echo "8) Salir"
    echo ""
}

# Función para monitorear mensajes
monitor_messages() {
    echo "📡 Monitoreando mensajes en tópico 'nevera/evento'..."
    echo "Presiona Ctrl+C para detener"
    mosquitto_sub -h localhost -t "nevera/evento" -v
}

# Función para enviar mensaje de prueba
send_test_message() {
    echo "📤 Enviando mensaje de prueba..."
    mosquitto_pub -h localhost -t "nevera/evento" -m '{"imei":"TEST123","mensaje":"test","temperatura":0.0,"bateria":50,"timestamp":"'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'"}'
    echo "✅ Mensaje de prueba enviado"
}

# Función para verificar estado de Mosquitto
check_mosquitto() {
    echo "🔍 Verificando estado de Mosquitto..."
    if brew services list | grep mosquitto | grep started > /dev/null; then
        echo "✅ Mosquitto está ejecutándose"
    else
        echo "❌ Mosquitto no está ejecutándose"
    fi
}

# Función para iniciar Mosquitto
start_mosquitto() {
    echo "🚀 Iniciando Mosquitto..."
    brew services start mosquitto
    echo "✅ Mosquitto iniciado"
}

# Función para detener Mosquitto
stop_mosquitto() {
    echo "🛑 Deteniendo Mosquitto..."
    brew services stop mosquitto
    echo "✅ Mosquitto detenido"
}

# Función para ejecutar simulador
run_simulator() {
    echo "🚀 Ejecutando simulador una vez..."
    npm start
}

# Función para ejecutar simulador en bucle
run_simulator_loop() {
    echo "🔄 Ejecutando simulador en bucle..."
    echo "Presiona Ctrl+C para detener"
    npm start -- --bucle
}

# Bucle principal del menú
while true; do
    show_menu
    read -p "Opción: " choice
    
    case $choice in
        1)
            monitor_messages
            ;;
        2)
            send_test_message
            ;;
        3)
            check_mosquitto
            ;;
        4)
            start_mosquitto
            ;;
        5)
            stop_mosquitto
            ;;
        6)
            run_simulator
            ;;
        7)
            run_simulator_loop
            ;;
        8)
            echo "👋 ¡Hasta luego!"
            exit 0
            ;;
        *)
            echo "❌ Opción inválida. Por favor, selecciona 1-8."
            ;;
    esac
done
