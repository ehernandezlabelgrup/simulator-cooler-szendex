#!/bin/bash

# Scripts de utilidad para el simulador HTTP de nevera

echo "🔧 Scripts de Utilidad - Simulador HTTP Nevera"
echo "============================================="

# Función para mostrar el menú
show_menu() {
    echo ""
    echo "Selecciona una opción:"
    echo "1) Probar con httpbin.org (endpoint de prueba)"
    echo "2) Probar con postman-echo.com"
    echo "3) Probar con endpoint local Laravel (puerto 8000)"
    echo "4) Probar con endpoint local Laravel (puerto 80)"
    echo "5) Ejecutar simulador con endpoint actual (.env)"
    echo "6) Ejecutar simulador en bucle"
    echo "7) Configurar nueva ruta"
    echo "8) Generar nuevos IDs"
    echo "9) Salir"
    echo ""
}

# Función para probar con httpbin
test_httpbin() {
    echo "🌐 Probando con httpbin.org..."
    HTTP_ENDPOINT=https://httpbin.org/post npm start
}

# Función para probar con postman-echo
test_postman() {
    echo "🌐 Probando con postman-echo.com..."
    HTTP_ENDPOINT=https://postman-echo.com/post npm start
}

# Función para probar con Laravel local puerto 8000
test_laravel_8000() {
    echo "🌐 Probando con Laravel local (puerto 8000)..."
    HTTP_ENDPOINT=http://localhost:8000/api/nevera/eventos npm start
}

# Función para probar con Laravel local puerto 80
test_laravel_80() {
    echo "🌐 Probando con Laravel local (puerto 80)..."
    HTTP_ENDPOINT=http://localhost/api/nevera/eventos npm start
}

# Función para ejecutar simulador normal
run_simulator() {
    echo "🚀 Ejecutando simulador con configuración actual..."
    npm start
}

# Función para ejecutar simulador en bucle
run_simulator_loop() {
    echo "🔄 Ejecutando simulador en bucle..."
    echo "Presiona Ctrl+C para detener"
    npm start -- --bucle
}

# Función para configurar ruta
configure_route() {
    echo "🗺️  Configurando nueva ruta..."
    npm run configurar
}

# Función para generar IDs
generate_ids() {
    echo "🆔 Generando nuevos IDs..."
    npm run generar-ids
}

# Bucle principal del menú
while true; do
    show_menu
    read -p "Opción: " choice
    
    case $choice in
        1)
            test_httpbin
            ;;
        2)
            test_postman
            ;;
        3)
            test_laravel_8000
            ;;
        4)
            test_laravel_80
            ;;
        5)
            run_simulator
            ;;
        6)
            run_simulator_loop
            ;;
        7)
            configure_route
            ;;
        8)
            generate_ids
            ;;
        9)
            echo "👋 ¡Hasta luego!"
            exit 0
            ;;
        *)
            echo "❌ Opción inválida. Por favor, selecciona 1-9."
            ;;
    esac
done
