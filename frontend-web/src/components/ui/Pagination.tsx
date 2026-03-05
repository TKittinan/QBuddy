import { Button } from "./Button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onChange,
}) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        disabled={currentPage === 1}
        onClick={() => onChange(currentPage - 1)}
      >
        Prev
      </Button>

      <span className="text-sm">
        Page {currentPage} of {totalPages}
      </span>

      <Button
        variant="outline"
        disabled={currentPage === totalPages}
        onClick={() => onChange(currentPage + 1)}
      >
        Next
      </Button>
    </div>
  );
};