/**
 * Accordion component — Reemplaza @material-tailwind/react Accordion.
 * Controla apertura/cierre externamente a través de las props `open` y `onClick`.
 */
function AccordionHeader({ children, onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between py-3 text-left font-medium border-b border-gray-200 transition-colors ${className}`}
    >
      {children}
    </button>
  );
}

function AccordionBody({ children, open }) {
  return (
    <div
      className={`overflow-hidden transition-all duration-300 ease-in-out ${
        open ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
      }`}
    >
      <div className="py-2">{children}</div>
    </div>
  );
}

function Accordion({ children, open, icon }) {
  // Clona los children inyectando la prop `open` al AccordionBody si lo detecta
  const childrenWithProps = Array.isArray(children)
    ? children.map((child) => {
        if (child?.type === AccordionBody) {
          return { ...child, props: { ...child.props, open } };
        }
        if (child?.type === AccordionHeader && icon) {
          return {
            ...child,
            props: {
              ...child.props,
              children: (
                <>
                  {child.props.children}
                  <span className={`ml-2 shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>
                    {icon}
                  </span>
                </>
              ),
            },
          };
        }
        return child;
      })
    : children;

  return <div className="w-full">{childrenWithProps}</div>;
}

export { Accordion, AccordionHeader, AccordionBody };
