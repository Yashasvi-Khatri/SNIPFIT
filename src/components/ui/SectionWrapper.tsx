import { ReactNode } from 'react';

export interface SectionWrapperProps {
  children: ReactNode;
  id?: string;
  className?: string;
  variant?: 'dark' | 'darker' | 'card';
}

const variantStyles: Record<NonNullable<SectionWrapperProps['variant']>, string> = {
  dark: 'bg-dark-bg',
  darker: 'bg-[#0D0D0D]',
  card: 'bg-dark-surface',
};

export default function SectionWrapper({
  children,
  id,
  className = '',
  variant = 'dark',
}: SectionWrapperProps) {
  return (
    <section id={id} className={`section-padding ${variantStyles[variant]} ${className}`}>
      <div className="container-max">{children}</div>
    </section>
  );
}
