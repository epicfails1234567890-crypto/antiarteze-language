# antiarteze-language

Lenguaje mas sencillo q JS, PY y GML juntos:



El objetivo es q sea usado con poco esfuerzo y más empatía este script.

En vez de hacer `for(i=0;i<5;i++){}`, solo se limita a: `for i=0 i<5 i++ {}` para q sea mas facil de leer.



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
