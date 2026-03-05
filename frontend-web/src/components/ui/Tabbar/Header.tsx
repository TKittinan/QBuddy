interface HeaderProps {
  title?: string;
  rightContent?: React.ReactNode;
}

const Header = ({ title, rightContent }: HeaderProps) => {
  return (
    <div className="bg-white px-6 py-4 flex justify-between items-center shadow-sm">
      <h1 className="text-xl font-semibold">{title}</h1>
      {rightContent}
    </div>
  );
};

export default Header;