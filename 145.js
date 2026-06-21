const fs = require('fs');

const { exec } = require('child_process');

// Esta es la función que ejecuta el comando de Windows
ejecutarVentana = (xsize, ysize, wname) => {
    // Escapamos el nombre para que PowerShell no se confunda
    // Si wname viene como 'a', esto lo convierte en 'a' (con comillas simples)
    const psCommand = `Add-Type -AssemblyName System.Windows.Forms; $form = New-Object System.Windows.Forms.Form; $form.Text = '${wname.replace(/'/g, "''")}'; $form.Size = New-Object System.Drawing.Size(${xsize},${ysize}); $form.ShowDialog()`;
    
    // Usamos spawn en lugar de exec para evitar problemas de longitud de comando
    const { spawn } = require('child_process');
    spawn('powershell', ['-Command', psCommand]);
}

function transformarSintaxis(codigo) {
    let dentroDeFuncion = false;

    return codigo.split('\n').map(linea => {
        let l = linea.trim();
        if (!l) return "";

        // Si el motor encuentra la palabra "window", llama a la función
        if (l.startsWith("window")) {
            return l.replace(/window(?:\s+(\d+)\s+(\d+)\s+(.+))?/, (match, ancho, alto, nombre) => {
                const w = ancho || 400;
                const h = alto || 400;
                // Limpiamos comillas dobles si el usuario puso "nombre"
                const n = (nombre || "DefaultWindow").replace(/"/g, ''); 
                
                return `ejecutarVentana(${w}, ${h}, '${n}');`;
            });
        }

        // 0. LIMPIEZA INMEDIATA: Convertimos int() antes de nada
        l = l.replace(/int\((.+?)\)/g, "parseInt($1)");

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
window 200 200 "hola mundo"

write "listo"
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