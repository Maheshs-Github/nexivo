import { useEffect, useState } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold, Code, Heading2, Heading3, ImageIcon, Italic, Link2, List, ListOrdered, Minus, Quote, Redo2, SquareCode, Undo2, Unlink,
} from "lucide-react";
import { Toggle } from "./Toggle";
import { MediaPicker } from "./MediaPicker";

function Toolbar({ editor }: { editor: Editor }) {
  const [picker, setPicker] = useState(false);
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      h2: e.isActive("heading", { level: 2 }), h3: e.isActive("heading", { level: 3 }), bold: e.isActive("bold"), italic: e.isActive("italic"),
      code: e.isActive("code"), bullet: e.isActive("bulletList"), ordered: e.isActive("orderedList"), quote: e.isActive("blockquote"),
      codeBlock: e.isActive("codeBlock"), link: e.isActive("link"), canUndo: e.can().undo(), canRedo: e.can().redo(),
    }),
  });

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL (https://… or /path)", prev ?? "https://");
    if (url === null) return;
    if (!url.trim()) { editor.chain().focus().extendMarkRange("link").unsetLink().run(); return; }
    if (!/^(https?:\/\/|\/|mailto:)/.test(url.trim())) { window.alert("Use a full https:// URL, a /path or mailto:"); return; }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  const c = () => editor.chain().focus();
  return (
    <div role="toolbar" aria-label="Formatting" className="sticky top-14 z-10 flex flex-wrap items-center gap-0.5 border-b border-line bg-bg-elevated/95 p-1.5 backdrop-blur">
      <Toggle label="Heading 2" active={s.h2} onClick={() => c().toggleHeading({ level: 2 }).run()}><Heading2 /></Toggle>
      <Toggle label="Heading 3" active={s.h3} onClick={() => c().toggleHeading({ level: 3 }).run()}><Heading3 /></Toggle>
      <span className="mx-1 h-5 w-px bg-line" aria-hidden />
      <Toggle label="Bold" shortcut="Ctrl+B" active={s.bold} onClick={() => c().toggleBold().run()}><Bold /></Toggle>
      <Toggle label="Italic" shortcut="Ctrl+I" active={s.italic} onClick={() => c().toggleItalic().run()}><Italic /></Toggle>
      <Toggle label="Inline code" active={s.code} onClick={() => c().toggleCode().run()}><Code /></Toggle>
      <span className="mx-1 h-5 w-px bg-line" aria-hidden />
      <Toggle label="Bullet list" active={s.bullet} onClick={() => c().toggleBulletList().run()}><List /></Toggle>
      <Toggle label="Numbered list" active={s.ordered} onClick={() => c().toggleOrderedList().run()}><ListOrdered /></Toggle>
      <Toggle label="Quote" active={s.quote} onClick={() => c().toggleBlockquote().run()}><Quote /></Toggle>
      <Toggle label="Code block" active={s.codeBlock} onClick={() => c().toggleCodeBlock().run()}><SquareCode /></Toggle>
      <Toggle label="Divider" onClick={() => c().setHorizontalRule().run()}><Minus /></Toggle>
      <span className="mx-1 h-5 w-px bg-line" aria-hidden />
      <Toggle label={s.link ? "Edit link" : "Add link"} active={s.link} onClick={setLink}><Link2 /></Toggle>
      {s.link && <Toggle label="Remove link" onClick={() => c().unsetLink().run()}><Unlink /></Toggle>}
      <Toggle label="Insert image" onClick={() => setPicker(true)}><ImageIcon /></Toggle>
      <span className="ml-auto" />
      <Toggle label="Undo" shortcut="Ctrl+Z" disabled={!s.canUndo} onClick={() => c().undo().run()}><Undo2 /></Toggle>
      <Toggle label="Redo" shortcut="Ctrl+Shift+Z" disabled={!s.canRedo} onClick={() => c().redo().run()}><Redo2 /></Toggle>
      <MediaPicker open={picker} onOpenChange={setPicker} onSelect={(url, m) => c().setImage({ src: url, alt: m?.alt ?? "" }).run()} />
    </div>
  );
}

/** TipTap editor. Output HTML is sanitized again on the server before saving. */
export function RichEditor({ value, onChange, placeholder = "Start writing…", minHeight = "min-h-[22rem]", id }: {
  value: string; onChange: (html: string) => void; placeholder?: string; minHeight?: string; id?: string;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, link: { openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer" } } }),
      Image.configure({ HTMLAttributes: { loading: "lazy" } }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    editorProps: { attributes: { class: `prose-nexivo max-w-none px-5 py-4 focus:outline-none ${minHeight}`, ...(id ? { id } : {}), "aria-label": "Content editor" } },
    onUpdate: ({ editor: e }) => onChange(e.isEmpty ? "" : e.getHTML()),
  });

  // Load new content when the form is reset (e.g. after fetching the post), without fighting the user's typing.
  useEffect(() => {
    if (editor && !editor.isFocused && value !== editor.getHTML()) editor.commands.setContent(value || "", { emitUpdate: false });
  }, [editor, value]);

  if (!editor) return <div className={`rounded-lg border border-line ${minHeight}`} />;
  return (
    <div className="rounded-lg border border-line-strong bg-surface/40 focus-within:border-brand">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
