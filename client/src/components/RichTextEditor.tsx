import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  editorRef?: React.RefObject<HTMLDivElement>;
}

export function RichTextEditor({ content, onChange, editorRef }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm md:prose-base dark:prose-invert max-w-none focus:outline-none min-h-[500px] p-8",
      },
    },
  });

  if (!editor) {
    return <div className="h-[500px] flex items-center justify-center border rounded-xl bg-card">Loading editor...</div>;
  }

  const toggleStyle = (command: () => void) => {
    command();
    editor.chain().focus().run();
  };

  return (
    <div className="border border-border rounded-xl bg-card shadow-sm overflow-hidden flex flex-col">
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-muted/30">
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${editor.isActive("bold") ? "bg-accent text-accent-foreground" : ""}`}
          onClick={() => toggleStyle(() => editor.chain().focus().toggleBold().run())}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${editor.isActive("italic") ? "bg-accent text-accent-foreground" : ""}`}
          onClick={() => toggleStyle(() => editor.chain().focus().toggleItalic().run())}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <div className="w-px h-4 bg-border mx-1" />
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${editor.isActive("heading", { level: 1 }) ? "bg-accent text-accent-foreground" : ""}`}
          onClick={() => toggleStyle(() => editor.chain().focus().toggleHeading({ level: 1 }).run())}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${editor.isActive("heading", { level: 2 }) ? "bg-accent text-accent-foreground" : ""}`}
          onClick={() => toggleStyle(() => editor.chain().focus().toggleHeading({ level: 2 }).run())}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <div className="w-px h-4 bg-border mx-1" />
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${editor.isActive("bulletList") ? "bg-accent text-accent-foreground" : ""}`}
          onClick={() => toggleStyle(() => editor.chain().focus().toggleBulletList().run())}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${editor.isActive("orderedList") ? "bg-accent text-accent-foreground" : ""}`}
          onClick={() => toggleStyle(() => editor.chain().focus().toggleOrderedList().run())}
          title="Ordered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${editor.isActive("blockquote") ? "bg-accent text-accent-foreground" : ""}`}
          onClick={() => toggleStyle(() => editor.chain().focus().toggleBlockquote().run())}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 bg-background" ref={editorRef}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
