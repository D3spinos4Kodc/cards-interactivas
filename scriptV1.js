//SCRIPT CON LANZAMIENTO DE CARTA AL CENTRO SIN RETORNO A LA POSICION ORIGINAL
document.addEventListener("DOMContentLoaded", function () {
    const cartas = document.querySelectorAll('.carta');
    const container = document.querySelector('.container');

    // Dividir las cartas en conjuntos de 7 cartas cada uno
    const cardSets = [];
    for (let i = 0; i < 4; i++) {
        cardSets.push(Array.from(cartas).slice(i * 7, (i + 1) * 7));
    }

    // Función para dispersar las cartas alrededor del centro
function dispersarCartas(setIndex) {
    const cartasVisibles = cardSets[setIndex];
    const isMobile = window.innerWidth <= 767; // Detección de vista móvil
    const centroX = container.offsetWidth / 2;
    const centroY = container.offsetHeight / 2;
    
    // Variables para ajustar el radio de dispersión
    const radioXEscritorio = 480; // Radio de dispersión horizontal en escritorio
    const radioYEscritorio = 240; // Radio de dispersión vertical en escritorio
    const radioXMovil = 150; // Radio de dispersión horizontal en móvil
    const radioYMovil = 250; // Radio de dispersión vertical en móvil
    const ajusteX = isMobile ? 0 : 0; // Ajuste horizontal adicional en escritorio ( modificar este valor)
    const ajusteY = isMobile ? 0 : 0; // Ajuste vertical adicional en escritorio (modificar este valor)

    const dispersion = gsap.timeline({
        onComplete: () => {
            interactionBlocked = false; // Habilitar interacciones después de la dispersión
        }
    });

    cartasVisibles.forEach((carta, indiceCarta) => {
        let posX, posY;

        if (isMobile && indiceCarta === 0) {
            // en móvil la carta principal, se colócala en el centro
            posX = centroX - carta.offsetWidth / 2;
            posY = centroY - carta.offsetHeight / 2;
        } else {
            // Para pantallas grandes o las demás cartas en móvil
            const radioX = isMobile ? radioXMovil : radioXEscritorio;
            const radioY = isMobile ? radioYMovil : radioYEscritorio;
            const angulo = (indiceCarta / (cartasVisibles.length - (isMobile ? 1 : 0))) * 2 * Math.PI;
            posX = centroX + radioX * Math.cos(angulo) - carta.offsetWidth / 2 + ajusteX;
            posY = centroY + radioY * Math.sin(angulo) - carta.offsetHeight / 2 + ajusteY;
        }

        const rotacionAleatoria = carta.dataset.rotation || gsap.utils.random(-40, 40);
        carta.dataset.rotation = rotacionAleatoria;

        dispersion.to(carta, {
            x: posX - (container.offsetWidth / 13 - carta.offsetWidth / 2),
            y: posY - (container.offsetHeight / 6 - carta.offsetHeight / 2),
            opacity: 1,
            scale: 1,
            rotation: rotacionAleatoria,
            duration: 0.2,
            ease: "bounce.out",
            delay: indiceCarta * 0.1
        }, 0);
    });

    dispersion.play();
}

    // Función para animar la carta central
    function animarCartaCentral(carta, setIndex) {
        gsap.fromTo(carta, {
            y: -carta.offsetHeight,
            opacity: 0,
            scale: 20,
        }, {
            y: container.offsetHeight / 2 - carta.offsetHeight / 2,
            x: container.offsetWidth / 2 - carta.offsetWidth / 2,
            opacity: 1,
            scale: 1.6,
            duration: 0.3,
            ease: "bounce.inOut",
            onComplete: () => {
                gsap.delayedCall(1.5, () => {
                    dispersarCartas(setIndex);
                    gsap.to(cartas, {
                        x: (index, target) => target.dataset.originalX,
                        y: (index, target) => target.dataset.originalY,
                        scale: 1,
                        duration: 0.6,
                        ease: "power2.inOut",
                        delay: 1.5
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
                ease: "power2.inOut",
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
        gsap.set(carta, { zIndex: 100 });

        // Animar la carta clickeada hacia el centro
        gsap.to(carta, {
            x: container.offsetWidth / 2 - carta.offsetWidth / 2,
            y: container.offsetHeight / 2 - carta.offsetHeight / 2,
            scale: 1.6,  
            duration: 0.2,
            ease: "linear",
            zIndex: 100,
            onComplete: () => {
                gsap.delayedCall(0.4, () => {
                    gsap.to(carta, {
                        x: carta.dataset.originalX,
                        y: carta.dataset.originalY,
                        scale: 1.6,
                        duration: 0.1,
                        ease: "linear",
                        zIndex: 100
                    });
                });
            }
        });
    }

    // Función para manejar el mouse enter en una carta Hover
    function handleCartaMouseEnter() {
        if (interactionBlocked) return;

        const carta = this;
        if (!carta.classList.contains('dragging') && !carta.classList.contains('flipped')) {
            gsap.killTweensOf(carta);
            gsap.to(carta, {
                scale: 1.4,
                duration: 0.1,
                ease: "linear",
                zIndex: 102
            });
        }
    }

    // Función para manejar el mouse leave en una carta
    function handleCartaMouseLeave() {
        if (interactionBlocked) return;

        const carta = this;
        if (!carta.classList.contains('dragging') && !carta.classList.contains('flipped')) {
            gsap.killTweensOf(carta);
            const rotation = carta.dataset.rotation || 0;
            gsap.to(carta, {
                scale: 1,
                rotation: rotation,
                duration: 0.2,
                ease: "linear",
                zIndex: 1
            });
        }
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
    let interactionBlocked = false;

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
                interactionBlocked = false;
            }
        }

        cartasVisibles.forEach((carta, indiceCarta) => {
            salirCarta(carta, indiceCarta, onCartaSalida);
        });
    }

    // Inicializar el primer conjunto de cartas
    inicializarCartas(currentSetIndex);

    // Configurar el intervalo para cambiar de conjunto cada 10.5 segundos
    intervalId = setInterval(nextSet, 7500);

    // Reiniciar el intervalo cuando una carta es clickeada
    cartas.forEach((carta) => {
        carta.addEventListener('click', () => {
            clearInterval(intervalId);
            intervalId = setInterval(nextSet, 7500);
        });
    });
});
