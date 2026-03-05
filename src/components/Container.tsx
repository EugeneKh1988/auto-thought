
interface ContainerProps {
    children: React.ReactNode,
    className?: string,
}


const Container: React.FC<ContainerProps> = ({ children, className, }) => {
  const classNameValue = className ? `${className}` : "";
  return (
    <div
      className={`container px-16 2xl:px-80 3xl:px-162 mx-auto ${classNameValue}`}
    >
      {children}
    </div>
  );
};

export default Container;