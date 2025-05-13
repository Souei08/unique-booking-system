export const ErrorDisplay = ({ message }: { message: string }) => (
  <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
    {message}
  </div>
);
