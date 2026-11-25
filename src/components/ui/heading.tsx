interface HeadingProps {
  title: string;
  description: string;
}

export const Heading: React.FC<HeadingProps> = ({ title, description }) => {
  return (
    <div>
      <h2 className='text-lg md:text-xl font-medium tracking-tight '>{title}</h2>
      <p className='text-sm text-muted-foreground'>{description}</p>
    </div>
  );
};
