"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import {
  ArrowLeft,
  Plus,
  Users,
  Maximize2,
  Edit,
  Trash2,
  Calendar,
  Building2,
} from "lucide-react";
import { BoardroomDialog } from "@/components/admin/boardroom-dialog";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface Boardroom {
  id: string;
  name: string;
  description?: string;
  dimensions?: string;
  capacity: number;
  imageUrl?: string;
  facilities: string[];
  createdAt: string;
}

interface Location {
  id: string;
  name: string;
  address: string;
  boardrooms: Boardroom[];
  error: string;
}

export default function LocationBoardroomsPage() {
  const params = useParams();
  const locationId = params.id as string;
  const [location, setLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBoardroom, setEditingBoardroom] = useState<Boardroom | null>(
    null
  );

  const { data: session, status } = useSession();

  const fetchLocation = async () => {
    try {
      const response = await fetch(
        `/api/locations/${locationId}?userId=${session?.user.id}&role=${session?.user.role}`
      );
      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
      }

      setLocation(data);
    } catch (error) {
      console.error("Error fetching location:", error);
      toast.error("Failed to fetch location data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === "loading") {
      return;
    } else {
      fetchLocation();
    }
  }, [locationId, status]);

  const handleDelete = async (boardroomId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this boardroom? This will also cancel all associated bookings."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/boardrooms/${boardroomId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Boardroom deleted successfully");
        fetchLocation();
      } else {
        throw new Error("Failed to delete boardroom");
      }
    } catch (error) {
      console.error("Error deleting boardroom:", error);
      toast.error("Failed to delete boardroom");
    }
  };

  const handleEdit = (boardroom: Boardroom) => {
    setEditingBoardroom(boardroom);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingBoardroom(null);
  };

  const handleSave = () => {
    fetchLocation();
    handleCloseDialog();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-10 w-20 bg-slate-200 rounded animate-pulse"></div>
          <div className="h-8 w-64 bg-slate-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-slate-200 rounded-t-lg"></div>
              <CardHeader>
                <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-slate-200 rounded mb-4"></div>
                <div className="h-10 bg-slate-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link href="/admin/locations" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Locations
          </Link>
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Building2 className="h-16 w-16 text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">
              Location Not Found
            </h3>
            <p className="text-slate-500 text-center">
              The location you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="ghost" asChild>
          <Link href="/admin/locations" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Locations
          </Link>
        </Button>

        {/* Page Header */}
        <PageHeader
          title={`${
            location.name === undefined
              ? "No Boardrooms Found"
              : location.name + `- Boardrooms`
          } `}
          description={
            !location.error
              ? `Manage boardrooms at ${location.address} `
              : "No Boardrooms Found"
          }
        >
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Boardroom
          </Button>
        </PageHeader>

        {/* Boardrooms Grid */}
        {location?.boardrooms?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Calendar className="h-16 w-16 text-slate-300 mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">
                No boardrooms yet
              </h3>
              <p className="text-slate-500 text-center mb-6 max-w-md">
                Get started by adding your first boardroom to this location. You
                can then manage bookings and availability.
              </p>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Boardroom
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(location.boardrooms) &&
              location.boardrooms.map((boardroom) => (
                <Card
                  key={boardroom.id}
                  className="hover:shadow-lg transition-shadow overflow-hidden"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200">
                    {boardroom.imageUrl ? (
                      <Image
                        src={boardroom.imageUrl}
                        alt={boardroom.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Calendar className="h-16 w-16 text-slate-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex space-x-1">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEdit(boardroom)}
                        className="bg-white/90 hover:bg-white"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(boardroom.id)}
                        className="bg-red-500/90 hover:bg-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <CardHeader>
                    <CardTitle className="text-lg">{boardroom.name}</CardTitle>
                    {boardroom.description && (
                      <CardDescription className="line-clamp-2">
                        {boardroom.description}
                      </CardDescription>
                    )}
                  </CardHeader>

                  <CardContent>
                    {/* Room Details */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-slate-600">
                          <Users className="h-4 w-4 mr-2" />
                          {boardroom.capacity} people
                        </div>
                        {boardroom.dimensions && (
                          <div className="flex items-center text-sm text-slate-600">
                            <Maximize2 className="h-4 w-4 mr-2" />
                            {boardroom.dimensions}
                          </div>
                        )}
                      </div>

                      {/* Facilities */}
                      {boardroom.facilities?.length > 0 && (
                        <div>
                          <div className="flex flex-wrap gap-1">
                            {boardroom.facilities
                              .slice(0, 3)
                              .map((facility, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {facility}
                                </Badge>
                              ))}
                            {boardroom.facilities.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{boardroom.facilities.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(boardroom)}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="flex-1"
                      >
                        <Link href={`/booking/${location.id}`}>
                          <Calendar className="h-4 w-4 mr-1" />
                          Book
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>

      <BoardroomDialog
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        boardroom={editingBoardroom}
        locationId={locationId}
        onSave={handleSave}
      />
    </>
  );
}