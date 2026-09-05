import {
  useEffect,
  useRef,
  useState,
} from "react";

import "./ScrollReveal.css";

function ScrollReveal({
  children,
  className = "",
  delay = 0,
  as: Tag = "div",
  variant = "fade-up",
  repeat = true,
}) {
  const ref = useRef(null);

  const [visible, setVisible] =
    useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    const observer =
      new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisible(true);

            if (!repeat) {
              observer.unobserve(element);
            }
          } else if (repeat) {
            setVisible(false);
          }
        },
        {
          threshold: 0.12,
          rootMargin:
            "0px 0px -30px 0px",
        }
      );

    observer.observe(element);

    return () =>
      observer.disconnect();
  }, [repeat]);

  return (
    <Tag
      ref={ref}
      className={[
        "scroll-reveal",
        variant,
        visible ? "is-visible" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        "--reveal-delay": `${delay}ms`,
      }}
    >
      {children}
    </Tag>
  );
}

export default ScrollReveal;