const fs = require('fs');

function transformarSintaxis(codigo) {
    let dentroDeFuncion = false;

    return codigo.split('\n').map(linea => {
        let l = linea.trim();
        if (!l) return "";

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
        if (l.startsWith("if ")) {
            l = l.replace(/(\w+)\s*=\s*(\w+)/g, "$1 === $2");
            return l.replace(/if\s+(.+?)\s*\{/g, "if ($1) {");
        }
        if (l.startsWith("while ")) return l.replace(/while\s+(.+?)\s*\{/g, "while ($1) {");

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

const codigoOriginal5 = `
load a
write a
save int(a+1)
`;

const codigoOriginal4 = `
func saludar persona {
    write "Hola," persona
}

write "Dime tu nombre:"
read nombre
write nombre
`;

const codigoOriginal3 = `
read a
func mayor5 x {
    if 5<x{
        return "yes"
    }else{
        return "no"
    }
}
console.log(mayor5 a)
`;
const codigoOriginal2 = `
read a
func mayor5 x {
    if 5<x{
        return "yes"
    }else{
        return "no"
    }
}
console.log(mayor5 a)
`;
const codigoOriginal = `
read a
func mayor5 x {
    val = int(x)
    if 5=val{
        return "yes"
    }else{
        return "no"
    }
}
console.log(mayor5 a)
`;

console.log("--- CÓDIGO EN BRUTO ---");
console.log(codigoOriginal)

const codigoFinal = transformarSintaxis(codigoOriginal);

console.log("--- CÓDIGO GENERADO ---");
console.log(codigoFinal);

// Ejecución
try {
    new Function('require', codigoFinal)(require);
} catch (e) {
    console.error("Error al ejecutar:", e);
}