const lightbox = document.querySelector('#lightbox');
const lightboxImage = lightbox.querySelector('img');
const lightboxCaption = lightbox.querySelector('p');

document.querySelectorAll('[data-zoom]').forEach((figure) => {
  figure.addEventListener('click', () => {
    const image = figure.querySelector('img');
    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;
    lightboxCaption.textContent = figure.querySelector('figcaption').innerText.replace(/\s*(点击)?查看大图\s*↗?/, '');
    lightbox.showModal();
  });
});

lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox) lightbox.close();
});

const sections = [...document.querySelectorAll('main section[id]')];
const links = [...document.querySelectorAll('.topbar nav a')];
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    links.forEach((link) => link.classList.toggle('active', link.hash === `#${entry.target.id}`));
  });
}, { rootMargin: '-25% 0px -65% 0px' });

sections.forEach((section) => observer.observe(section));
