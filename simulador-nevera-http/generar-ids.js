#!/usr/bin/env node

// Script para generar nuevos UUIDs e IDs para el simulador
const crypto = require('crypto');

function generarUUID() {
  return crypto.randomUUID();
}

function generarIDOperacion(tipo, fecha = new Date()) {
  const año = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  const hora = String(fecha.getHours()).padStart(2, '0');
  const minuto = String(fecha.getMinutes()).padStart(2, '0');
  
  const timestamp = `${año}${mes}${dia}${hora}${minuto}`;
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `${tipo}-${timestamp}-${random}`;
}

function mostrarMenu() {
  console.log('\n🆔 Generador de IDs - Simulador HTTP Nevera');
  console.log('='.repeat(45));
  console.log('\nOpciones disponibles:');
  console.log('1) Generar nuevo Serial UUID');
  console.log('2) Generar nuevo ID de Preparación');
  console.log('3) Generar nuevo ID de Extracción');
  console.log('4) Generar todos los IDs');
  console.log('5) Salir');
}

function main() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  mostrarMenu();

  rl.question('\nSelecciona una opción: ', (opcion) => {
    const numero = parseInt(opcion);
    
    switch (numero) {
      case 1:
        console.log('\n📱 Nuevo Serial UUID:');
        console.log(`SERIAL_NEVERA=${generarUUID()}`);
        break;
        
      case 2:
        console.log('\n🎯 Nuevo ID de Preparación:');
        console.log(`ID_PREPARACION=${generarIDOperacion('PREP')}`);
        break;
        
      case 3:
        console.log('\n📤 Nuevo ID de Extracción:');
        console.log(`ID_EXTRACCION=${generarIDOperacion('EXTR')}`);
        break;
        
      case 4:
        console.log('\n🔄 Todos los IDs nuevos:');
        console.log(`SERIAL_NEVERA=${generarUUID()}`);
        console.log(`ID_PREPARACION=${generarIDOperacion('PREP')}`);
        console.log(`ID_EXTRACCION=${generarIDOperacion('EXTR')}`);
        break;
        
      case 5:
        console.log('👋 ¡Hasta luego!');
        break;
        
      default:
        console.log('❌ Opción inválida');
    }
    
    if (numero >= 1 && numero <= 4) {
      console.log('\n💡 Copia las líneas anteriores en tu archivo .env');
    }
    
    rl.close();
  });
}

if (require.main === module) {
  main();
}
