
interface ContainerProps {
    children: React.ReactNode,
    className?: string,
}


const Container: React.FC<ContainerProps> = ({ children, className, }) => {
  const classNameValue = className ? `${className}` : "";
  return (
    <div
      className={`container px-4 2xl:px-20 3xl:px-40 mx-auto ${classNameValue}`}
    >
      {children}
    </div>
  );
};

export default Container;