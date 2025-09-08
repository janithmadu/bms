"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Plus, MapPin, Edit, Trash2, DoorOpen } from "lucide-react";
import { LocationDialog } from "@/components/admin/location-dialog";
import { toast } from "sonner";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface Location {
  id: string;
  name: string;
  address: string;
  description?: string;
  imageUrl?: string;
  boardrooms: { id: string; name: string }[];
  createdAt: string;
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const { data: session, status } = useSession();

  const fetchLocations = async () => {
    try {
      const response = await fetch(
        `/api/locations?userId=${session?.user.id}&role=${session?.user.role}`
      );
      const data = await response.json();
      setLocations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching locations:", error);
      toast.error("Failed to fetch locations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [session?.user.id,fetchLocations]);

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this location? This will also delete all associated boardrooms."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/locations/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Location deleted successfully");
        fetchLocations();
      } else {
        throw new Error("Failed to delete location");
      }
    } catch (error) {
      console.error("Error deleting location:", error);
      toast.error("Failed to delete location");
    }
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingLocation(null);
  };

  const handleSave = () => {
    fetchLocations();
    handleCloseDialog();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Locations"
          description="Manage your office locations"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-slate-200 rounded mb-4"></div>
                <div className="h-8 bg-slate-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Locations"
          description="Manage your office locations"
        >
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Location
          </Button>
        </PageHeader>

        {locations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <MapPin className="h-16 w-16 text-slate-300 mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">
                No locations yet
              </h3>
              <p className="text-slate-500 text-center mb-6 max-w-md">
                Get started by adding your first office location. You can then
                add boardrooms to each location.
              </p>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Location
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {locations?.map((location) => (
              <Card
                key={location.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{location.name}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {location.address}
                      </CardDescription>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(location)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(location.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {location.imageUrl && (
                    <img
                      src={location.imageUrl}
                      alt={location.name}
                      className="w-full h-32 object-cover rounded-lg mb-4"
                    />
                  )}
                  {location.description && (
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                      {location.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-slate-500">
                      <DoorOpen className="h-4 w-4 mr-1" />
                      {location.boardrooms.length} boardroom
                      {location.boardrooms.length !== 1 ? "s" : ""}
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/locations/${location.id}/boardrooms`}>
                        View Rooms
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <LocationDialog
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        location={editingLocation}
        onSave={handleSave}
      />
    </>
  );
}
