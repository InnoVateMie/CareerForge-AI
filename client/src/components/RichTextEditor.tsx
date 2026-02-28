import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import {
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered,
  Heading1, Heading2, Heading3, Quote, AlignLeft, AlignCenter,
  AlignRight, AlignJustify, Highlighter, Palette, Link as LinkIcon,
  Type, Strikethrough, Subscript, Superscript
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  editorRef?: React.RefObject<HTMLDivElement>;
}

export function RichTextEditor({ content, onChange, editorRef }: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "premium-resume prose prose-sm md:prose-base dark:prose-invert max-w-none focus:outline-none min-h-[500px] p-8",
      },
      handleDOMEvents: {
        copy: (view, event) => {
          const selection = window.getSelection();
          if (selection && selection.toString()) {
            const rawText = selection.toString();
            // Scatter the text by inserting random "UNLOCK PREMIUM EXPORT" messages and extra newlines
            const scatteredText = rawText.split('\n').map(line =>
              line + "\n\n[UNLOCK PREMIUM PDF EXPORT TO REMOVE WATERMARK]\n"
            ).join('\n---\n');

            event.preventDefault();
            event.clipboardData?.setData('text/plain', `CareerForge AI Preview - Upgrade for professional export!\n\n${scatteredText}`);
            event.clipboardData?.setData('text/html', `<div style="color: red; font-weight: bold;">CareerForge AI Preview - Upgrade for professional export!</div><br/>${scatteredText.replace(/\n/g, '<br/>')}`);
            return true;
          }
          return false;
        },
        cut: (view, event) => {
          event.preventDefault();
          event.clipboardData?.setData('text/plain', "Cutting text is disabled to protect premium document formatting.");
          return true;
        }
      }
    },
  });

  // Sync content if it changes from outside
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return <div className="h-[500px] flex items-center justify-center border rounded-xl bg-card">Loading editor...</div>;
  }

  const setLink = () => {
    if (linkUrl) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
      setLinkUrl("");
    } else {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    }
  };

  return (
    <div className="border border-border rounded-xl bg-card shadow-sm overflow-hidden flex flex-col">
      {/* Word-style Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-muted/30">
        {/* Text Style Group */}
        <div className="flex items-center gap-0.5 mr-2">
          <Button
            variant="ghost" size="sm" className={`h-8 w-8 p-0 ${editor.isActive("bold") ? "bg-accent text-accent-foreground" : ""}`}
            onClick={() => editor.chain().focus().toggleBold().run()} title="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost" size="sm" className={`h-8 w-8 p-0 ${editor.isActive("italic") ? "bg-accent text-accent-foreground" : ""}`}
            onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost" size="sm" className={`h-8 w-8 p-0 ${editor.isActive("underline") ? "bg-accent text-accent-foreground" : ""}`}
            onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline"
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost" size="sm" className={`h-8 w-8 p-0 ${editor.isActive("strike") ? "bg-accent text-accent-foreground" : ""}`}
            onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Alignment Group */}
        <div className="flex items-center gap-0.5 mr-2">
          <Button
            variant="ghost" size="sm" className={`h-8 w-8 p-0 ${editor.isActive({ textAlign: "left" }) ? "bg-accent text-accent-foreground" : ""}`}
            onClick={() => editor.chain().focus().setTextAlign("left").run()} title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost" size="sm" className={`h-8 w-8 p-0 ${editor.isActive({ textAlign: "center" }) ? "bg-accent text-accent-foreground" : ""}`}
            onClick={() => editor.chain().focus().setTextAlign("center").run()} title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost" size="sm" className={`h-8 w-8 p-0 ${editor.isActive({ textAlign: "right" }) ? "bg-accent text-accent-foreground" : ""}`}
            onClick={() => editor.chain().focus().setTextAlign("right").run()} title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost" size="sm" className={`h-8 w-8 p-0 ${editor.isActive({ textAlign: "justify" }) ? "bg-accent text-accent-foreground" : ""}`}
            onClick={() => editor.chain().focus().setTextAlign("justify").run()} title="Justify"
          >
            <AlignJustify className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Structure Group */}
        <div className="flex items-center gap-0.5 mr-2">
          <Button
            variant="ghost" size="sm" className={`h-8 w-8 p-0 ${editor.isActive("heading", { level: 1 }) ? "bg-accent text-accent-foreground" : ""}`}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost" size="sm" className={`h-8 w-8 p-0 ${editor.isActive("heading", { level: 2 }) ? "bg-accent text-accent-foreground" : ""}`}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost" size="sm" className={`h-8 w-8 p-0 ${editor.isActive("heading", { level: 3 }) ? "bg-accent text-accent-foreground" : ""}`}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Lists & Blocks */}
        <div className="flex items-center gap-0.5 mr-2">
          <Button
            variant="ghost" size="sm" className={`h-8 w-8 p-0 ${editor.isActive("bulletList") ? "bg-accent text-accent-foreground" : ""}`}
            onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost" size="sm" className={`h-8 w-8 p-0 ${editor.isActive("orderedList") ? "bg-accent text-accent-foreground" : ""}`}
            onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Ordered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost" size="sm" className={`h-8 w-8 p-0 ${editor.isActive("blockquote") ? "bg-accent text-accent-foreground" : ""}`}
            onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Quote"
          >
            <Quote className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Aesthetics & Links */}
        <div className="flex items-center gap-0.5">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Text Color">
                <Palette className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-2">
              <div className="grid grid-cols-4 gap-1">
                {["#000000", "#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#6366f1", "#8b5cf6", "#ec4899"].map(c => (
                  <button key={c} className="h-6 w-6 rounded border border-border" style={{ backgroundColor: c }} onClick={() => editor.chain().focus().setColor(c).run()} />
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Highlight">
                <Highlighter className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-2">
              <div className="grid grid-cols-4 gap-1">
                {["#ffff00", "#00ffff", "#00ff00", "#ff00ff", "#ff0000", "#0000ff", "#ffffff", "transparent"].map(c => (
                  <button key={c} className="h-6 w-6 rounded border border-border" style={{ backgroundColor: c }} onClick={() => c === "transparent" ? editor.chain().focus().unsetHighlight().run() : editor.chain().focus().setHighlight({ color: c }).run()} />
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className={`h-8 w-8 p-0 ${editor.isActive("link") ? "bg-accent text-accent-foreground" : ""}`} title="Insert Link">
                <LinkIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3 border border-border shadow-xl">
              <div className="flex gap-2">
                <Input placeholder="https://..." value={linkUrl} onChange={e => setLinkUrl(e.target.value)} />
                <Button size="sm" onClick={setLink}>Set</Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div
        className="flex-1 bg-background"
        ref={editorRef}
        onContextMenu={(e) => { e.preventDefault(); }}
        onDragStart={(e) => { e.preventDefault(); }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
