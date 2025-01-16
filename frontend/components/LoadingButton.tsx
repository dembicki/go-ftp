interface LoadingButtonProps {
  isLoading?: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
}

const LoadingButton = ({
  isLoading = false,
  onClick,
  children,
}: LoadingButtonProps) => {
  return (
    <button
      className="group inline-flex items-center justify-center h-[38px] px-6 rounded-l-md text-sm font-medium bg-[#18202F] hover:bg-[#1E2937] text-white relative min-w-[120px]"
      onClick={onClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
      ) : (
        children
      )}
    </button>
  );
};

export default LoadingButton;
