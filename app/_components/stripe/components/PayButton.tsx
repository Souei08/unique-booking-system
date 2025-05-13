import { LoadingSpinner } from "./LoadingSpinner";

export const PayButton = ({
  loading,
  disabled,
  onClick,
}: {
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors
      ${
        disabled
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
      }`}
  >
    {loading ? <LoadingSpinner /> : "Pay Now"}
  </button>
);
