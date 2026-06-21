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
func igual5 x {
    if 5=int(x){
        return "yes"
    }else{
        return "no"
    }
}
console.log(igual5 a)
`;
const codigoOriginal1 = `
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
const codigoOriginal = `
for i=0 i<10 i++{
    write i
}
`;
const codigoOriginal11 = `
a=["a",0]
func vec2 a {
    return a
}
console.log(vec2 a)
`;
const codigoOriginal10 = `
write "1"
write "2"
write "3"
`;


console.log("--- CÓDIGO ---");
console.log(codigoOriginal2)

const codigoFinal = transformarSintaxis(codigoOriginal2);

// Ejecución
try {
    new Function('require', codigoFinal)(require);
} catch (e) {
    console.error("Error al ejecutar:", e);
}