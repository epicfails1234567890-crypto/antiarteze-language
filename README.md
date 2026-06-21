# antiarteze-language

Ejemplos:

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
