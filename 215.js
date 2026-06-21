const fs = require('fs');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { exec } = require('child_process');






function iniciarServidor(puerto) {
    const app = express();
    const server = http.createServer(app);
    const io = socketIo(server);

    app.use(express.static('public'));

    let x = 0;
    setInterval(() => {
        x = (x + 2) % 640;
        io.emit('posicion', { x });
    }, 16);

    server.listen(puerto, () => {
        console.log(`Servidor en línea en http://localhost:${puerto}`);
        exec(`start http://localhost:${puerto}`);
    });
}






function transformarSintaxis(codigo) {
    let dentroDeFuncion = false;

    return codigo.split('\n').map(linea => {
        let l = linea.trim();
        if (!l) return "";

        // 0. LIMPIEZA INMEDIATA: Convertimos int() antes de nada
        l = l.replace(/int\((.+?)\)/g, "parseInt($1)");

        // Dentro de tu transformador:
        if (l.startsWith("listen ")) {
            const partes = l.split(' ');
            const puerto = partes[1];
            const variable = partes[2]; // Esto será 'txt'

            return `
            (function() {
                const http = require('http');
                const server = http.createServer();
                const io = require('socket.io')(server, { cors: { origin: "*" } });

                io.on('connection', (socket) => {
                    console.log('Cliente conectado');
                    
                    // Enviamos el contenido de la variable (el paquete inicial)
                    socket.emit('data', ${variable});

                    // Aquí procesamos los "paquetes" que envíe el cliente
                    socket.on('paquete', (msg) => {
                        console.log('Paquete recibido del cliente:', msg);
                        // Aquí puedes añadir lógica para procesar ese paquete
                    });
                });

                server.listen(${puerto}, () => console.log('Escuchando en ${puerto}'));
            })();`;
        }

        // 8. COMANDO PUBLISH (Prioridad máxima)
        if (l.startsWith("publish ")) {
            const partes = l.split(' ');
            const puerto = partes[1];
            
            // Unimos todo lo que viene después del puerto
            const contenido = partes.slice(2).join(' ');
            
            // JSON.stringify convierte "hola mundo 2" en '"hola mundo 2"' 
            // y maneja los caracteres especiales automáticamente.
            const respuestaSegura = JSON.stringify(contenido.replace(/['"]/g, ''));

            return `require('http').createServer((req, res) => { 
                res.setHeader('Content-Type', 'text/html');
                res.end(${respuestaSegura}); 
            }).listen(${puerto}, () => console.log('Servidor en puerto ${puerto}'));`;
        }

        // 1. Detectar inicio de función
        if (l.startsWith("func ")) {
            dentroDeFuncion = true;
            return l.replace(/func\s+(\w+)\s+(.*?)\s*\{/g, "function $1($2) {");
        }

        // 2. Detectar fin de bloque
        if (l === "}") {
            dentroDeFuncion = false;
            return "}";
        }

        // 3. Persistencia
        if (l.startsWith("save ")) return `require('fs').writeFileSync('estado.json', JSON.stringify({ 'datos': ${l.substring(5)} }))`;
        if (l.startsWith("load ")) return `${l.split(' ')[1]} = JSON.parse(require('fs').readFileSync('estado.json', 'utf8')).datos`;

        // 4. Control (if, while)
        // Esta pequeña función "limpia" la condición antes de que JS la vea
        const normalizarCondicion = (cond) => {
            // 1. Cambia '=' por '===' (evitando el caso de asignaciones)
            let c = cond.replace(/(\w+)\s*=\s*(\w+)/g, "$1 === $2");
            // 2. Envuelve en paréntesis para que sea sintaxis válida de JS
            return `(${c})`;
        };

        // --- Dentro de tu map ---

        // IF: Ahora usa la normalización
        if (l.startsWith("if ")) {
            return l.replace(/if\s+(.+?)\s*\{/g, (m, cond) => `if ${normalizarCondicion(cond)} {`);
        }

        // WHILE: Ahora usa la normalización (sin paréntesis ni comas manuales)
        if (l.startsWith("while ")) {
            return l.replace(/while\s+(.+?)\s*\{/g, (m, cond) => `while ${normalizarCondicion(cond)} {`);
        }

        // FOR: Adaptado para tu sintaxis minimalista (ej: for i 1 10 { )
        if (l.startsWith("for ")) {
            // Busca: for i=0 i<10 i++{
            // Separa por espacios y mapea a la estructura de JS
            return l.replace(/for\s+(.+?)\s+(.+?)\s+(.+?)\s*\{/g, "for (let $1; $2; $3) {");
        }

        // 5. E/S
        if (l.startsWith("write ")) return l.replace(/write\s+(.+)/g, (m, args) => `console.log(${args.trim().split(/\s+/).join(', ')})`);
        if (l.startsWith("read ")) return l.replace(/read\s+(\w+)/g, "$1 = require('readline-sync').question()");

        // 6. Asignaciones
        if (l.includes(" = ")) return l.replace(/^(\w+)\s*=\s*(.+)/g, "var $1 = $2");

        // 7. Llamadas a funciones
        return l.replace(/([a-zA-Z_]\w*)\s+([\w\d\s"'.+]+)/g, (m, nombre, args) => {
            return `${nombre}(${args.trim().split(/\s+/).join(', ')})`;
        });

    }).join('\n');
}

// Ejemplo de uso para probar todo el flujo:

const codigoOriginal = `
// 1. Iniciar servidor en el puerto 8880
listen 8880 

// 2. Definir lo que se publica (usa comillas)
txt = "<h1>A</h1>"

// 3. Publicar (usando la instancia del listen anterior)
publish 9990 txt
`;
console.log("--- CÓDIGO ---");
console.log(codigoOriginal)

const codigoFinal = transformarSintaxis(codigoOriginal);

console.log("--- RESULTADO ---");
// Ejecución
try {
    new Function('require', codigoFinal)(require);
} catch (e) {
    console.error("Error al ejecutar:", e);
}