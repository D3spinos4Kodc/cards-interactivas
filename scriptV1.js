//SCRIPT CON LANZAMIENTO DE CARTA AL CENTRO SIN RETORNO A LA POSICION ORIGINAL
document.addEventListener("DOMContentLoaded", function () {
    const cartas = document.querySelectorAll('.carta');
    const container = document.querySelector('.container');

    // Dividir las cartas en conjuntos de 7 cartas cada uno
    const cardSets = [];
    for (let i = 0; i < 4; i++) {
        cardSets.push(Array.from(cartas).slice(i * 7, (i + 1) * 7));
    }

      
// Función para obtener el tamaño de pantalla y definir el radio de dispersión según el tamaño de pantalla
function obtenerRadioDeDispersión() {
    const anchoPantalla = window.innerWidth;
    
    // Breakpoints similares a media queries
    if (anchoPantalla >= 2560) {
        // Pantallas grandes de escritorio 2560
        return { radioX: 650, radioY: 350, ajusteX: 0, ajusteY: -100, escala: 1.4 };
    } else if (anchoPantalla >= 1920) {
        // Pantallas estándar de escritorio 1920
        return { radioX: 550, radioY: 290, ajusteX: -30, ajusteY: 60, escala: 1.3 };
    } else if (anchoPantalla >= 1700) {
        // Pantallas estándar de escritorio 1700
        return { radioX: 550, radioY: 200, ajusteX: -30, ajusteY: 60, escala: 1.15 };
    } else if (anchoPantalla >= 1440) {
        // Pantallas medianas de escritorio 1440
        return { radioX: 500, radioY: 200, ajusteX: -30, ajusteY: -20, escala: 1.1 };
    } else if (anchoPantalla >= 1280) {
        // Pantallas más pequeñas de escritorio 1280
        return { radioX: 420, radioY: 200, ajusteX: -10, ajusteY: -50, escala: 1 };
    } else if (anchoPantalla >= 1024) {
        // Pantallas de tablet en horizontal 1024
        return { radioX: 250, radioY: 150, ajusteX: 10, ajusteY: 10, escala: 1 };
    } else if (anchoPantalla >= 800) {
        // Pantallas de tablet en vertical 800
        return { radioX: 180, radioY: 120, ajusteX: 5, ajusteY: 5, escala: 0.9 };
    } else {
        // Pantallas de móvil
        return { radioX: 144, radioY: 190, ajusteX: 0, ajusteY: 0, escala: 0.8 };
    }
}

// Función para dispersar las cartas alrededor del centro
function dispersarCartas(setIndex) {
    const cartasVisibles = cardSets[setIndex];
    const isMobile = window.innerWidth <= 800; // Detección de vista móvil
    const centroX = container.offsetWidth / 2; // Centro horizontal del contenedor
    const centroY = container.offsetHeight / 2; // Centro vertical del contenedor
    
    // Obtener el radio de dispersión, ajustes y escala dinámicos según el tamaño de la pantalla
    const { radioX, radioY, ajusteX, ajusteY, escala } = obtenerRadioDeDispersión();

    // Crear la animación de dispersión
    const dispersion = gsap.timeline({
        onComplete: () => {
            interactionBlocked = false; // Habilitar interacciones después de la dispersión
        }
    });

    // Iterar sobre las cartas visibles
    cartasVisibles.forEach((carta, indiceCarta) => {
        let posX, posY;

        // Si es móvil y la carta es la primera, se coloca en el centro
        if (isMobile && indiceCarta === 0) {
            posX = centroX - carta.offsetWidth / 2;
            posY = centroY - carta.offsetHeight / 2;
        } else {
            // Cálculo del ángulo de dispersión
            const angulo = (indiceCarta / cartasVisibles.length) * 2 * Math.PI;
            
            // Calcular la posición X y Y de cada carta
            posX = centroX + (radioX * Math.cos(angulo)) + ajusteX - carta.offsetWidth / 2;
            posY = centroY + (radioY * Math.sin(angulo)) + ajusteY - carta.offsetHeight / 2;
        }

        // Rotación aleatoria para cada carta
        const rotacionAleatoria = carta.dataset.rotation || gsap.utils.random(-40, 40);
        carta.dataset.rotation = rotacionAleatoria;

        // Añadir la animación de dispersión para cada carta
        dispersion.to(carta, {
            x: posX, // Posición horizontal calculada
            y: posY, // Posición vertical calculada
            opacity: 1, // Asegurar visibilidad
            scale: escala, // Escala dinámica según la resolución
            rotation: rotacionAleatoria, // Rotación aleatoria
            duration: 0.2, // Duración de la animación
            ease: "bounce.out", // Efecto de rebote
            delay: indiceCarta * 0.1, // Retraso basado en la posición de la carta
            zIndex: 5
        }, 0);
    });

    // Ejecutar la animación de dispersión
    dispersion.play();
}

// Llamar a dispersarCartas cuando se detecte un cambio de tamaño de pantalla
window.addEventListener('resize', () => {
    dispersarCartas(currentSetIndex);
});

// Función para animar la carta central
function animarCartaCentral(carta, setIndex) {
    gsap.fromTo(carta, {
        y: -carta.offsetHeight,
        opacity: 0.6,
        scale: 24,
        ease: "bounce.out"
    }, {
        y: container.offsetHeight / 2 - carta.offsetHeight / 2,
        x: container.offsetWidth / 2 - carta.offsetWidth / 2,
        opacity: 1,
        scale: 1.7,
        duration: 0.3,
        ease: "bounce.out",
        onComplete: () => {
            gsap.delayedCall(1.5, () => {
                dispersarCartas(setIndex);
                gsap.to(cartas, {
                    x: (index, target) => target.dataset.originalX,
                    y: (index, target) => target.dataset.originalY,
                    scale: 0.97,
                    duration: 0.2,
                    ease: "bounce.out",
                    delay: 1
                });
            });
        }
    });
}

// Función para hacer que una carta salga de la vista
function salirCarta(carta, indiceCarta, onComplete) {
    const destinoX = Math.random() * (container.offsetWidth - carta.offsetWidth);
    const destinoY = Math.random() * (container.offsetHeight - carta.offsetHeight);

    gsap.to(carta, {
        x: destinoX,
        y: destinoY,
        scale: 2.3,
        opacity: 0,
        duration: 0.6,
        ease: "elastic.in",
        delay: indiceCarta * 0.1,
        onComplete: onComplete,
    });
}

// Función para inicializar las cartas en una posición central
function inicializarCartas(setIndex) {
    container.innerHTML = '';

    cardSets[setIndex].forEach((carta, cartaIndex) => {
        container.appendChild(carta);

        if (cartaIndex === 0) {
            animarCartaCentral(carta, setIndex);
        } else {
            const initialRotation = carta.dataset.rotation || gsap.utils.random(-30, 30);
            carta.dataset.rotation = initialRotation;
            gsap.set(carta, {
                x: container.offsetWidth / 2 - carta.offsetWidth / 2,
                y: container.offsetHeight / 2 - carta.offsetHeight / 2,
                opacity: 0,
                scale: 0.8,
                rotation: initialRotation
            });
        }

        carta.addEventListener('click', handleCartaClick);
        carta.addEventListener('mouseenter', handleCartaMouseEnter);
        carta.addEventListener('mouseleave', handleCartaMouseLeave);
        makeDraggable(carta);
    });
}

// Función para resetear todas las cartas
function resetearCartas() {
    cartas.forEach(carta => {
        carta.classList.remove('flipped');
        const initialRotation = carta.dataset.rotation || 0;
        gsap.to(carta, {
            scale: 1,
            rotation: initialRotation,
            duration: 0.2,
            ease: "bounce.out",
            zIndex: 1
        });
    });
}

// Función para manejar el click en una carta
function handleCartaClick() {
    if (interactionBlocked) return;

    const carta = this;
    resetearCartas();

    carta.classList.toggle('flipped');

    // Coloca la carta en la parte superior antes de iniciar la animación
    gsap.set(carta, { zIndex: 104 });

    // Animar la carta clickeada hacia el centro
    gsap.to(carta, {
        x: container.offsetWidth / 2 - carta.offsetWidth / 2,
        y: container.offsetHeight / 2 - carta.offsetHeight / 2,
        scale: 1.6,
        duration: 0.2,
        ease: "linear",
        zIndex: 200,
        onComplete: () => {
            gsap.delayedCall(0.4, () => {
                gsap.to(carta, {
                    x: carta.dataset.originalX,
                    y: carta.dataset.originalY,
                    scale: 1.65,
                    duration: 0.1,
                    ease: "linear",
                    zIndex: 103
                });
            });
        }
    });
}

// Función para manejar el mouse enter en una carta Hover
function handleCartaMouseEnter() {
    if (interactionBlocked) return;

    const carta = this;
    gsap.to(carta, {
        scale: 1.4,
        duration: 0.2,
        ease: "linear",
        zIndex: 105
    });
}

// Función para manejar el mouse leave en una carta
function handleCartaMouseLeave() {
    if (interactionBlocked) return;

    const carta = this;
    const initialRotation = carta.dataset.rotation || 0;
    gsap.to(carta, {
        scale: 1.2,
        rotation: initialRotation,
        duration: 0.2,
        ease: "linear",
        zIndex: 104
    });
}


    // Función para hacer una carta arrastrable
    function makeDraggable(carta) {
        Draggable.create(carta, {
            type: "x,y",
            bounds: container,
            onPress() {
                carta.classList.add('dragging');
                cartas.forEach(c => c.classList.add('dragging'));
                gsap.to(carta, { zIndex: 20, scale: 1.3, duration: 0 });
            },
            onRelease() {
                carta.classList.remove('dragging');
                cartas.forEach(c => c.classList.remove('dragging'));
                const rotation = carta.dataset.rotation || 0;
                gsap.to(carta, {
                    scale: 1,
                    rotation: rotation,
                    duration: 0.15,
                    ease: "linear",
                    zIndex: 1
                });
            }
        });
    }

    // Inicializar el índice del conjunto actual y el ID del intervalo
    let currentSetIndex = 0;
    let intervalId = null;

    // Función para pasar al siguiente conjunto de cartas
    function nextSet() {
        if (interactionBlocked) return;

        interactionBlocked = true;
        const cartasVisibles = cardSets[currentSetIndex];
        let cartasSalidas = 0;

        function onCartaSalida() {
            cartasSalidas++;
            if (cartasSalidas === cartasVisibles.length) {
                currentSetIndex = (currentSetIndex + 1) % cardSets.length;
                resetearCartas();
                inicializarCartas(currentSetIndex);
            }
        }

        cartasVisibles.forEach((carta, indiceCarta) => {
            salirCarta(carta, indiceCarta, onCartaSalida);
        });
    }

    // Inicializar el primer conjunto de cartas
    inicializarCartas(currentSetIndex);

    // Configurar el intervalo para cambiar de conjunto en segundos
    intervalId = setInterval(nextSet, 10500);

    // Reiniciar el intervalo cuando una carta es clickeada
    cartas.forEach((carta) => {
        carta.addEventListener('click', () => {
            clearInterval(intervalId);
            intervalId = setInterval(nextSet, 10500);
        });
    });
});
