"use client";

import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

interface ProjectDescriptionProps {
  projectId: string;
  description: string | null;
  onUpdate: (description: string | null) => void;
}

export function ProjectDescription({
  projectId,
  description,
  onUpdate,
}: ProjectDescriptionProps) {
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Add a description...",
      }),
    ],
    content: description || "",
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none focus:outline-none min-h-[40px] prose-invert",
          "prose-h1:text-[#e05555] prose-h1:font-semibold prose-h1:mb-1 prose-h1:mt-3 first:prose-h1:mt-0",
          "prose-h2:text-[#e0a555] prose-h2:font-semibold prose-h2:mb-1 prose-h2:mt-3 first:prose-h2:mt-0",
          "prose-h3:text-[#55b5e0] prose-h3:font-semibold prose-h3:mb-1 prose-h3:mt-3 first:prose-h3:mt-0",
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
      // Debounced auto-save
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        const html = editor.getHTML();
        const isEmpty = editor.isEmpty;
        const content = isEmpty ? null : html;

        try {
          await api.projects.update(projectId, { description: content });
          onUpdate(content);
        } catch (error) {
          console.error("Failed to save:", error);
        }
      }, 500);
    },
  });

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  if (!editor) {
    return null;
  }

  return (
    <div className="mb-6">
      <EditorContent editor={editor} />
    </div>
  );
}
