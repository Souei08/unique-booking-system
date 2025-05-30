import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { assignProductToTour } from "../api/assignProductToTour";
import { getAssignedToursByProductId } from "../api/getAssignedToursByProductId";
import { Product } from "../types/product-types";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface AssignProductToTourProps {
  product: Product;
  tours?: { id: string; title: string }[];
}

const AssignProductToTour: React.FC<AssignProductToTourProps> = ({
  product,
  tours = [],
}) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTourIds, setSelectedTourIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [assignedTours, setAssignedTours] = useState<
    { id: string; title: string }[]
  >([]);
  const [isFetchingAssigned, setIsFetchingAssigned] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAssignedTours();
    }
  }, [isOpen, product.id]);

  const fetchAssignedTours = async () => {
    try {
      setIsFetchingAssigned(true);
      const assigned = await getAssignedToursByProductId(product.id);
      setAssignedTours(assigned);
      setSelectedTourIds(assigned.map((tour) => tour.id));
    } catch (error) {
      console.error("Error fetching assigned tours:", error);
      toast.error("Failed to fetch assigned tours");
    } finally {
      setIsFetchingAssigned(false);
    }
  };

  const handleAssign = async () => {
    if (selectedTourIds.length === 0) {
      toast.error("Please select at least one tour");
      return;
    }

    try {
      setIsLoading(true);
      // Assign to all selected tours
      await Promise.all(
        selectedTourIds.map((tourId) =>
          assignProductToTour({
            tour_id: tourId,
            product_id: product.id,
          })
        )
      );
      toast.success("Product assigned to tours successfully");
      setIsOpen(false);
      setSelectedTourIds([]); // Reset selections
      router.refresh();
    } catch (error) {
      console.error("Error assigning product to tours:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to assign product to tours"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleTourSelect = (tourId: string) => {
    if (!selectedTourIds.includes(tourId)) {
      setSelectedTourIds([...selectedTourIds, tourId]);
    }
  };

  const removeTour = (tourId: string) => {
    setSelectedTourIds(selectedTourIds.filter((id) => id !== tourId));
  };

  if (!tours || tours.length === 0) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Plus className="h-4 w-4 mr-2" />
        No Tours Available
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Assign to Tours
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Product to Tours</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {isFetchingAssigned ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Tours</label>
                {tours.filter((tour) => !selectedTourIds.includes(tour.id))
                  .length > 0 ? (
                  <Select onValueChange={handleTourSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tours" />
                    </SelectTrigger>
                    <SelectContent>
                      {tours
                        .filter((tour) => !selectedTourIds.includes(tour.id))
                        .map((tour) => (
                          <SelectItem key={tour.id} value={tour.id}>
                            {tour.title}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-sm text-muted-foreground italic">
                    All available tours have been selected.
                  </div>
                )}
              </div>

              {/* Selected Tours */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Selected Tours</label>
                {selectedTourIds.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedTourIds.map((tourId) => {
                      const tour = tours.find((t) => t.id === tourId);
                      return (
                        <Badge
                          key={tourId}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {tour?.title}
                          <button
                            onClick={() => removeTour(tourId)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground italic">
                    No tours selected. Please select at least one tour from the
                    dropdown above.
                  </div>
                )}
              </div>
            </>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                setSelectedTourIds([]);
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                "Assign"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignProductToTour;
