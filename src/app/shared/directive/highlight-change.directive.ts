import { 
Directive, 
ElementRef, 
input, 
effect,
Renderer2 
} from '@angular/core';


//Definimos la directiva con el decorador

@Directive({
selector: '[appHighlightChange]', // definimos el selector para usar la directiva en el HTML (Directiva de atributo)
standalone: true  // Permite usar esta directiva sin necesidad de declararla en un módulo específico
})

export class HighlightChangeDirective {

    // input que recibe el precio actual de la criptomoneda para comparar con el precio anterior y determinar si subió o bajó
appHighlightChange = input<number>(0);

private previousPrice = 0;


constructor(
private el: ElementRef, // Permite acceder al elemento DOM al que se aplica la directiva para manipular su estilo o clases
private renderer: Renderer2 // Permite manipular el DOM de manera segura, como agregar o quitar clases CSS para animaciones
) {


    // Usamos un efecto para detectar cambios en el precio y aplicar la animación correspondiente
    //Es una especie de observaodor que se ejecuta cuando cambia el valor de appHighlightChange
effect(() => {
    const currentPrice = this.appHighlightChange();

    if (this.previousPrice !== 0) {
    if (currentPrice > this.previousPrice) {
        this.animateChange('price-up');
    } else if (currentPrice < this.previousPrice) {
        this.animateChange('price-down');
    }
    }
    this.previousPrice = currentPrice;
});
}


private animateChange(className: string): void {
const element = this.el.nativeElement;


// Agregamos la clase CSS para la animación (subida o bajada de precio)
this.renderer.addClass(element, className);


//Despues de 500 ms que es el tiempo de la animación, removemos la clase para que vuelva a su estado normal y pueda volver a animar en el próximo cambio de precio
setTimeout(() => {
    this.renderer.removeClass(element, className);
}, 500);
}
}