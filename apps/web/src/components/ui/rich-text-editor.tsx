"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Placeholder from "@tiptap/extension-placeholder";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({
  content,
  onChange,
  onSubmit,
  placeholder = "Add description...",
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: "list-disc pl-4",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal pl-4",
          },
        },
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: "task-list-editor",
        },
      }),
      TaskItem.configure({
        nested: true,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm prose-invert max-w-none focus:outline-none min-h-[40px] text-xs text-zinc-300",
      },
      handleKeyDown: (view, event) => {
        if (event.key === "Enter" && event.metaKey && onSubmit) {
          event.preventDefault();
          onSubmit();
          return true;
        }
        return false;
      },
    },
  });

  // Sync content from parent
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className={className}>
      <EditorContent editor={editor} />
    </div>
  );
}

// Read-only renderer for displaying rich text content
export function RichTextContent({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  if (!content || content === "<p></p>") return null;

  return (
    <div
      className={cn("text-xs text-muted-foreground", className)}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
