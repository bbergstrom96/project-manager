"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { usePlanningNoteStore } from "@/stores/planningNoteStore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, MoreHorizontal, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

interface PlanningNotesProps {
  hideHeader?: boolean;
}

export function PlanningNotes({ hideHeader = false }: PlanningNotesProps) {
  const {
    notes,
    currentQuarter,
    activeNoteId,
    isLoading,
    setCurrentQuarter,
    setActiveNoteId,
    fetchNotes,
    addNote,
    updateNote,
    deleteNote,
  } = usePlanningNoteStore();

  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [titleValue, setTitleValue] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const activeNote = notes.find((n) => n.id === activeNoteId);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleQuarterChange = (direction: "prev" | "next") => {
    const [year, qStr] = currentQuarter.split("-Q");
    const q = parseInt(qStr);
    let newYear = parseInt(year);
    let newQ = q;

    if (direction === "prev") {
      if (q === 1) {
        newYear--;
        newQ = 4;
      } else {
        newQ--;
      }
    } else {
      if (q === 4) {
        newYear++;
        newQ = 1;
      } else {
        newQ++;
      }
    }

    setCurrentQuarter(`${newYear}-Q${newQ}`);
  };

  const handleAddNote = async () => {
    await addNote({ title: "New Note" });
  };

  const handleStartEditTitle = (noteId: string, currentTitle: string) => {
    setEditingTitle(noteId);
    setTitleValue(currentTitle);
  };

  const handleSaveTitle = async (noteId: string) => {
    if (titleValue.trim()) {
      await updateNote(noteId, { title: titleValue.trim() });
    }
    setEditingTitle(null);
  };

  const handleDeleteNote = async () => {
    if (noteToDelete) {
      await deleteNote(noteToDelete);
      setNoteToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Write your planning notes here...",
      }),
    ],
    content: activeNote?.content || "",
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none focus:outline-none min-h-[200px] prose-invert",
          "prose-h1:text-white prose-h1:font-semibold prose-h1:mb-1 prose-h1:mt-3 first:prose-h1:mt-0",
          "prose-h2:text-[#e05555] prose-h2:font-semibold prose-h2:mb-1 prose-h2:mt-3 first:prose-h2:mt-0",
          "prose-h3:text-[#e0a555] prose-h3:font-semibold prose-h3:mb-1 prose-h3:mt-3 first:prose-h3:mt-0",
          "prose-h4:text-[#e0e055] prose-h4:font-semibold prose-h4:mb-1 prose-h4:mt-3 first:prose-h4:mt-0",
          "prose-p:text-foreground prose-p:leading-normal prose-p:my-1",
          "prose-ul:text-foreground prose-ol:text-foreground prose-ul:my-1 prose-ol:my-1",
          "prose-li:my-0",
          "prose-strong:text-[#55b5e0] prose-em:text-foreground",
          "prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none",
          "prose-pre:bg-muted prose-pre:text-foreground prose-pre:my-1",
          "prose-blockquote:border-l-2 prose-blockquote:border-muted-foreground prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:my-1"
        ),
      },
    },
    onUpdate: ({ editor }) => {
      if (!activeNoteId) return;

      // Debounced auto-save
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        const html = editor.getHTML();
        const isEmpty = editor.isEmpty;
        const content = isEmpty ? "" : html;

        try {
          await updateNote(activeNoteId, { content });
        } catch (error) {
          console.error("Failed to save note:", error);
        }
      }, 500);
    },
  });

  // Update editor content when active note changes
  useEffect(() => {
    if (editor && activeNote) {
      if (activeNote.content !== editor.getHTML()) {
        editor.commands.setContent(activeNote.content || "");
      }
    } else if (editor && !activeNote) {
      editor.commands.setContent("");
    }
  }, [activeNoteId, activeNote, editor]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Header with quarter selector - hidden when used with external drag handle */}
      {!hideHeader && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Planning Notes
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleQuarterChange("prev")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[70px] text-center">
                {currentQuarter}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleQuarterChange("next")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddNote}
            className="h-7 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            New Note
          </Button>
        </div>
      )}

      {/* Tabs bar with quarter selector when header is hidden */}
      <div className="flex items-center gap-1 px-2 py-1 border-b border-border bg-background">
        {/* Quarter selector - shown when header is hidden */}
        {hideHeader && (
          <div className="flex items-center gap-1 mr-2 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => handleQuarterChange("prev")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium min-w-[60px] text-center text-muted-foreground">
              {currentQuarter}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => handleQuarterChange("next")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <div className="w-px h-4 bg-border mx-1" />
          </div>
        )}

        {/* Note tabs */}
        <div className="flex items-center gap-1 overflow-x-auto flex-1">
          {notes.map((note) => (
            <div
              key={note.id}
              className={cn(
                "group flex items-center gap-1 px-3 py-1 rounded-md text-sm cursor-pointer shrink-0",
                note.id === activeNoteId
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/50"
              )}
              onClick={() => setActiveNoteId(note.id)}
            >
              {editingTitle === note.id ? (
                <Input
                  value={titleValue}
                  onChange={(e) => setTitleValue(e.target.value)}
                  onBlur={() => handleSaveTitle(note.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveTitle(note.id);
                    if (e.key === "Escape") setEditingTitle(null);
                  }}
                  className="h-5 w-24 text-xs px-1"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    handleStartEditTitle(note.id, note.title);
                  }}
                >
                  {note.title}
                </span>
              )}
              {note.id === activeNoteId && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 opacity-0 group-hover:opacity-100"
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEditTitle(note.id, note.title);
                      }}
                    >
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setNoteToDelete(note.id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-3 w-3 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          ))}
        </div>

        {/* New note button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddNote}
          className="h-6 text-xs shrink-0 ml-1"
        >
          <Plus className="h-3 w-3 mr-1" />
          New
        </Button>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-4 w-3/4 bg-muted rounded" />
            <div className="h-4 w-1/2 bg-muted rounded" />
          </div>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-muted-foreground text-sm mb-4">
              No planning notes for {currentQuarter}
            </p>
            <Button variant="outline" size="sm" onClick={handleAddNote}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Note
            </Button>
          </div>
        ) : activeNote ? (
          <EditorContent editor={editor} />
        ) : null}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this note? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteNote}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
