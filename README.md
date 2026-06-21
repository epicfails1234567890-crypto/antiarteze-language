# antiarteze-language

Lenguaje mas sencillo q JS, PY y GML juntos:

El objetivo es q sea usado con poco esfuerzo y más empatía este script.

Recuerden descargar el archivo .js de esta página, el de mayor número detrás de ".js", y una vez descargarlo irle con la terminal a la carpeta donde este el archivo, la de descarga, y meter el comando `node 70.js` (En caso de q 70.js sea la maxima version del script, y si les salta error instalar los paquetes q vienen.) y finalmente podrán ejecutarlo, q yo recuerde por el momento tengo solo 1 paquete q es el prompt de consola de nodejs, na mas.

En vez de hacer `for(i=0;i<5;i++){}`, solo se limita a: `for i=0 i<5 i++ {}` para q sea mas facil de leer (Cuidado con los espacios).



Ejemplos de uso:

Código base:
```
write "Hello world!"
```


Escribir una pregunta:
```
write "Hi! What's your name?:"
read a
write "Hello "+a
```

Escribir con el comando write tres cadenas de texto.
```
write "1"
write "2"
write "3"
```

Escribir con el for:
```
for i=0 i<10 i++{
    write i
}
```

Escribir con func:
```
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
```

Escribir con el if:
```
read a
func mayor5 x {
    if 5<x{
        return "yes"
    }else{
        return "no"
    }
}
console.log(mayor5 a)
```

Escribir con el if para ver si es igual:
```
read a
func igual5 x {
    if 5=int(x){
        return "yes"
    }else{
        return "no"
    }
}
console.log(igual5 a)
```

Contar hacia arriba con la variable permanente 'a':
```
load a
a=a+1
write a
save a
```

Y por supuesto, mucho mejor q el sujashcript de arteze, q es un boraita q de a poco le llega a lo de slender: 0 creatividad 100000000000 visión abstracta y pachango pachango y bla bla bla... 🤡🤡🤡😈😈😈
