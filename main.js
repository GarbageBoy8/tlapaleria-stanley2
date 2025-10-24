const slides = document.querySelectorAll('.producto-slide');
const sliderContainer = document.querySelector('.slider-container');
let current = 0;
let intervalTime = 3000; // tiempo entre cambios (ms)
let slideWidth = slides[0].offsetWidth + 32; // incluye el gap (2rem ≈ 32px)

function moveSlider() {
    // quitar clase activa actual
    slides[current].classList.remove('active');

    // avanzar al siguiente
    current = (current + 1) % slides.length;
    slides[current].classList.add('active');

    // mover el contenedor
    sliderContainer.style.transform = `translateX(-${current * slideWidth}px)`;
}

// reiniciar cálculo en caso de redimensionar la pantalla
window.addEventListener('resize', () => {
    slideWidth = slides[0].offsetWidth + 32;
});

// ejecutar cada 3 segundos
setInterval(moveSlider, intervalTime);
