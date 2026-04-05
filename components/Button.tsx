type ButtonProps = {
  text: string;
}

const Button = ({ text }: ButtonProps ) => {
  return (
    <div className="bg-white text-black/80 rounded-2xl py-4 px-16 flex-center cursor-pointer
      hover:bg-white/70 transition-all duration-300">
      <p className="text-lg font-bold">{text}</p>
    </div>
  );
};

export default Button;