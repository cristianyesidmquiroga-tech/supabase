import { useEffect, useRef, useState } from 'react';

/**
 * Marca un elemento como visible mientras esta en pantalla, para animar
 * secciones/tarjetas al hacer scroll. Por defecto se repite tanto al
 * bajar como al subir (sale y vuelve a entrar), para que la pagina se
 * sienta viva en todo el recorrido; pasar `once: true` para que quede
 * fija despues de la primera aparicion.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  threshold = 0.05,
  options?: { once?: boolean }
) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);
  const once = options?.once ?? true;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const checkVisibility = () => {
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight + 100 && rect.bottom > -100) {
          setVisible(true);
        }
      }
    };

    // Immediate check in case element is already in or near viewport
    checkVisibility();

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold, rootMargin: '100px 0px 100px 0px' }
    );

    observer.observe(el);

    // Backup check after brief delay for smooth page loads and hash link navigations
    const timer = setTimeout(checkVisibility, 150);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [threshold, once]);

  return { ref, visible };
}
