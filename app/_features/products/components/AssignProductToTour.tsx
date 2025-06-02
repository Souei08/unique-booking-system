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
import { removeProductFromTour } from "../api/removeProductFromTour";
import { Product } from "../types/product-types";
import { Loader2, Plus, Info } from "lucide-react";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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

      // Get the current assignments from the backend
      const currentAssignments = await getAssignedToursByProductId(product.id);
      const currentTourIds = currentAssignments.map((tour) => tour.id);

      // Find tours to add and remove
      const toursToAdd = selectedTourIds.filter(
        (id) => !currentTourIds.includes(id)
      );
      const toursToRemove = currentTourIds.filter(
        (id) => !selectedTourIds.includes(id)
      );

      // Remove tours that are no longer selected
      await Promise.all(
        toursToRemove.map((tourId) =>
          removeProductFromTour({
            tour_id: tourId,
            product_id: product.id,
          })
        )
      );

      // Add new tours
      await Promise.all(
        toursToAdd.map((tourId) =>
          assignProductToTour({
            tour_id: tourId,
            product_id: product.id,
          })
        )
      );

      toast.success("Tour assignments updated successfully");
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error updating tour assignments:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update tour assignments"
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

  const removeTour = async (tourId: string) => {
    try {
      setIsLoading(true);
      await removeProductFromTour({
        tour_id: tourId,
        product_id: product.id,
      });
      setSelectedTourIds(selectedTourIds.filter((id) => id !== tourId));
      toast.success("Tour removed successfully");
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error removing tour:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to remove tour"
      );
    } finally {
      setIsLoading(false);
    }
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Assign Product to Tours
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Select the tours where you want to make this product available.
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {isFetchingAssigned ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Available Tours</CardTitle>
                  <CardDescription>
                    Select tours from the dropdown to assign this product
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {tours.filter((tour) => !selectedTourIds.includes(tour.id))
                    .length > 0 ? (
                    <Select onValueChange={handleTourSelect}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a tour to assign" />
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
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                      <Info className="h-4 w-4" />
                      <span>All available tours have been selected</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Assigned Tours</CardTitle>
                  <CardDescription>
                    Tours where this product is currently available
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedTourIds.length > 0 ? (
                    <div className="space-y-3">
                      {selectedTourIds.map((tourId) => {
                        const tour = tours.find((t) => t.id === tourId);
                        return (
                          <div
                            key={tourId}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                          >
                            <span className="font-medium">{tour?.title}</span>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeTour(tourId)}
                              disabled={isLoading}
                              className="h-8"
                            >
                              {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Remove"
                              )}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                      <Info className="h-4 w-4" />
                      <span>
                        No tours selected. Select tours from above to assign
                        this product.
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          <Separator />

          <div className="flex justify-end space-x-2 pt-2">
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
            <Button
              onClick={handleAssign}
              disabled={isLoading || selectedTourIds.length === 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignProductToTour;
