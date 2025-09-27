"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar, Search, Filter, User, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { DailyNotesService, DailyNoteResponse } from "../../../../../../client";
import { toast } from "sonner";

interface AllNotesTabProps {
  refreshKey: number;
}

export default function AllNotesTab({ refreshKey }: AllNotesTabProps) {
  const [notes, setNotes] = useState<DailyNoteResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedNote, setSelectedNote] = useState<DailyNoteResponse | null>(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const response = await DailyNotesService.dailyNoteControllerFindAll({
        startDate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
        endDate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
        page: "1",
        limit: "50"
      });
      setNotes(response.data || []);
    } catch (error) {
      console.error("Failed to fetch notes:", error);
      toast.error("Failed to fetch notes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [refreshKey, startDate, endDate]);

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy 'at' HH:mm");
  };

  const openImageDialog = (note: DailyNoteResponse) => {
    setSelectedNote(note);
    setIsImageDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick end date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex gap-2">
              <Button onClick={fetchNotes} disabled={loading}>
                <Search className="mr-2 h-4 w-4" />
                {loading ? "Searching..." : "Search"}
              </Button>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            Notes ({notes.length})
          </h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : notes.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground">No notes found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your date filters or create a new note
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {notes.map((note) => (
              <Card key={note.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Note Header */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {note.createdBy.name}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {formatDate(note.createdAt)}
                        </Badge>
                      </div>
                      {note.images && note.images.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openImageDialog(note)}
                          className="gap-2"
                        >
                          <ImageIcon className="h-4 w-4" />
                          {note.images.length} image{note.images.length !== 1 ? 's' : ''}
                        </Button>
                      )}
                    </div>

                    {/* Note Content */}
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap">{note.note}</p>
                    </div>

                    {/* Images Preview */}
                    {note.images && note.images.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {note.images.slice(0, 3).map((image, index) => (
                          <img
                            key={image.id}
                            src={`/api/proxy/image?key=${image.key}`}
                            alt={`Note image ${index + 1}`}
                            className="w-16 h-16 object-cover rounded-md border cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => openImageDialog(note)}
                            onError={(e) => {
                              console.error('Failed to load image:', image.key, e);
                              const target = e.target as HTMLImageElement;
                              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyNEgyNFY0NEgyMFYyNFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHA+dGggZD0iTTQwIDI0SDQ0VjQ0SDQwVjI0WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                            }}
                          />
                        ))}
                        {note.images.length > 3 && (
                          <div 
                            className="w-16 h-16 bg-gray-100 rounded-md border flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                            onClick={() => openImageDialog(note)}
                          >
                            <span className="text-xs text-gray-600">
                              +{note.images.length - 3}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Image Dialog */}
      {selectedNote && isImageDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Note Images</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsImageDialogOpen(false)}
                >
                  ×
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                By {selectedNote.createdBy.name} • {formatDate(selectedNote.createdAt)}
              </p>
            </div>
            <div className="p-4">
              <div className="prose prose-sm max-w-none mb-4">
                <p className="whitespace-pre-wrap">{selectedNote.note}</p>
              </div>
              {selectedNote.images && selectedNote.images.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedNote.images.map((image, index) => (
                    <img
                      key={image.id}
                      src={`/api/proxy/image?key=${image.key}`}
                      alt={`Note image ${index + 1}`}
                      className="w-full h-auto rounded-md border"
                      onError={(e) => {
                        console.error('Failed to load modal image:', image.key, e);
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCA4MEg5MFYxMjBIODBWODBaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0xMTAgODBIMTIwVjEyMEgxMTBWODBaIiBmaWxsPSIjOUNBM0FGIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUNBM0FGIiBmb250LXNpemU9IjEyIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+Cjwvc3ZnPgo=';
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}