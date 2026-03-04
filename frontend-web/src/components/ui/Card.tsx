type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`
        w-full
        max-w-lg
        bg-white
        rounded-2xl
        shadow-xl
        overflow-hidden
        ${className}
      `}
    >
      {children}
    </div>
  );
}