import { cn } from "@/lib/utils";

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const LoadingSpinner = ({ className, ...props }: LoadingSpinnerProps) => {
  return (
    <div 
      className={cn(
        "animate-spin rounded-full border-4 border-solid border-current border-r-transparent",
        "h-8 w-8",
        className
      )}
      role="status"
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
