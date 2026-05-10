
interface ButtonProps {
    text?: string;
    children?: React.ReactNode;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    type?: "button" | "submit" | "reset";
    loading?: boolean;
    disabled?: boolean;
    variant?: "primary" | "secondary" | "danger" | "success";
    fullWidth?: boolean;
    size?: "sm" | "md" | "lg";
    className?: string;
}

export default function Button({
    text,
    children,
    onClick,
    type = "submit",
    loading = false,
    disabled = false,
    variant = "primary",
    fullWidth = true,
    size = "md",
    className = "",
}: ButtonProps) {
    const baseStyles =
        "rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2";

    const sizeStyles = {
        sm: "py-2 px-4 text-xs",
        md: "py-3.5 px-6 text-sm",
        lg: "py-6 px-8 text-base",
    };

    const variantStyles = {
        primary:
            "bg-primary text-primary-foreground hover:opacity-90 disabled:bg-primary/40 disabled:cursor-not-allowed",
        secondary:
            "bg-neutral-200 text-neutral-800 hover:bg-neutral-300 disabled:bg-neutral-100 disabled:cursor-not-allowed",
        danger:
            "bg-danger text-white hover:bg-danger/90 disabled:bg-danger/30 disabled:cursor-not-allowed",
        success:
            "bg-success text-white hover:opacity-90 disabled:bg-success/30 disabled:cursor-not-allowed",
    };

    const widthStyle = fullWidth ? "w-full" : "";

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${className}`}
        >
            {loading && (
                <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
            )}
            {loading ? "Loading..." : (children || text)}
        </button>
    );
}
