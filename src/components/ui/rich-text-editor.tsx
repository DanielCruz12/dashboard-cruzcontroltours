"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Baseline,
  Bold,
  Eraser,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Indent,
  Italic,
  Link2,
  Link2Off,
  List,
  ListOrdered,
  Minus,
  Outdent,
  Pilcrow,
  Quote,
  Strikethrough,
  Underline,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type RichTextEditorProps = {
  id?: string;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

type BlockTag = "p" | "h1" | "h2" | "h3" | "blockquote";

const TOP_BLOCK_RE = /^(P|H1|H2|H3|BLOCKQUOTE|UL|OL|PRE|HR|LI)$/;
const ANY_BLOCK_RE = /^(P|H1|H2|H3|DIV|BLOCKQUOTE|LI|PRE)$/;
const SPLITTABLE_BLOCK_RE = /^(P|H1|H2|H3|DIV|BLOCKQUOTE)$/;

/** Convierte texto plano heredado (sin HTML) a párrafos. */
function toHtml(value: string): string {
  if (!value) return "";
  if (/<[a-z][\s\S]*>/i.test(value)) return value;
  return value
    .split(/\n{2,}/)
    .map((block) => `<p>${block.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function isEmptyHtml(html: string): boolean {
  const text = html
    .replace(/<br\s*\/?>/gi, "")
    .replace(/<\/p>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
  return text.length === 0;
}

function copyAttributes(from: Element, to: Element) {
  for (const attribute of Array.from(from.attributes)) {
    if (attribute.name.toLowerCase() === "id") continue;
    to.setAttribute(attribute.name, attribute.value);
  }
}

/**
 * Estructura el contenido en bloques (<p>, títulos, listas…).
 * - Convierte los <div> que genera el navegador al pulsar Enter en <p>.
 * - Envuelve texto suelto o elementos en línea de nivel superior en <p>.
 * Solo mueve nodos (sin re-serializar), así que la selección se conserva.
 */
function normalizeEditor(root: HTMLElement) {
  for (let pass = 0; pass < 5; pass++) {
    let changed = false;
    for (const child of Array.from(root.children)) {
      const element = child as HTMLElement;
      if (element.tagName !== "DIV") continue;
      const kids = Array.from(element.childNodes);
      const hasBlock = kids.some(
        (node) =>
          node.nodeType === Node.ELEMENT_NODE &&
          (TOP_BLOCK_RE.test((node as HTMLElement).tagName) ||
            (node as HTMLElement).tagName === "DIV"),
      );
      if (hasBlock) {
        kids.forEach((kid) => root.insertBefore(kid, element));
        element.remove();
      } else {
        const paragraph = document.createElement("p");
        copyAttributes(element, paragraph);
        kids.forEach((kid) => paragraph.appendChild(kid));
        root.replaceChild(paragraph, element);
      }
      changed = true;
    }
    if (!changed) break;
  }

  let wrapper: HTMLParagraphElement | null = null;
  for (const child of Array.from(root.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      if (!child.textContent || !child.textContent.trim()) {
        child.remove();
        continue;
      }
      if (!wrapper) {
        wrapper = document.createElement("p");
        root.insertBefore(wrapper, child);
      }
      wrapper.appendChild(child);
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const element = child as HTMLElement;
      if (TOP_BLOCK_RE.test(element.tagName)) {
        wrapper = null;
      } else {
        if (!wrapper) {
          wrapper = document.createElement("p");
          root.insertBefore(wrapper, element);
        }
        wrapper.appendChild(element);
      }
    } else {
      wrapper = null;
    }
  }
}

function closestBlock(node: Node | null, root: HTMLElement): HTMLElement | null {
  let element: HTMLElement | null =
    node?.nodeType === Node.TEXT_NODE
      ? (node.parentElement as HTMLElement | null)
      : (node as HTMLElement | null);
  while (element && element !== root) {
    if (ANY_BLOCK_RE.test(element.tagName)) return element;
    element = element.parentElement;
  }
  return null;
}

/**
 * Parte los ancestros entre el punto (container/offset) y `block` para que
 * la segunda mitad empiece en un hijo directo de `block`.
 * Devuelve ese hijo directo (o null si el punto está al final).
 */
function splitBlockAtPoint(
  block: HTMLElement,
  container: Node,
  offset: number,
): Node | null {
  let current: Node | null;
  let cut: Node | null;
  if (container.nodeType === Node.TEXT_NODE) {
    const text = container as Text;
    const index = Math.max(0, Math.min(offset, text.length));
    if (index <= 0) {
      cut = text;
    } else if (index >= text.length) {
      cut = text.nextSibling;
    } else {
      cut = text.splitText(index);
    }
    current = text.parentNode;
  } else {
    current = container;
    cut = container.childNodes[offset] ?? null;
  }

  while (current && current !== block) {
    const parent = current.parentNode;
    if (!parent) return cut;
    if (cut) {
      const clone = current.cloneNode(false);
      const moving: Node[] = [];
      let sibling: Node | null = cut;
      while (sibling) {
        moving.push(sibling);
        sibling = sibling.nextSibling;
      }
      moving.forEach((node) => clone.appendChild(node));
      parent.insertBefore(clone, current.nextSibling);
      cut = clone;
    } else {
      cut = current.nextSibling;
    }
    current = parent;
  }
  return cut;
}

function isBlockEmpty(block: HTMLElement): boolean {
  const text = (block.textContent ?? "").replace(/[\s\u200B]/g, "");
  return text.length === 0;
}

function ToolbarButton({
  title,
  active,
  disabled,
  onAction,
  children,
}: {
  title: string;
  active?: boolean;
  disabled?: boolean;
  onAction: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      title={title}
      aria-label={title}
      disabled={disabled}
      className={cn("h-8 w-8 shrink-0", active && "bg-muted")}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onAction}
    >
      {children}
    </Button>
  );
}

function Separator() {
  return <span className="mx-1 h-6 w-px shrink-0 bg-border" aria-hidden />;
}

const TEXT_COLORS = [
  "#000000",
  "#374151",
  "#6b7280",
  "#9ca3af",
  "#b91c1c",
  "#c2410c",
  "#b45309",
  "#15803d",
  "#0e7490",
  "#1d4ed8",
  "#6d28d9",
  "#be185d",
];

const HIGHLIGHT_COLORS = [
  "#fef08a",
  "#bbf7d0",
  "#bae6fd",
  "#fecdd3",
  "#fed7aa",
  "#e9d5ff",
  "#d9f99d",
  "#fde68a",
  "#c7d2fe",
  "#fbcfe8",
  "#a7f3d0",
  "#e5e7eb",
];

function ColorPicker({
  title,
  colors,
  defaultCustom,
  currentColor,
  onPick,
  onClear,
  children,
}: {
  title: string;
  colors: string[];
  defaultCustom: string;
  currentColor: string;
  onPick: (color: string) => void;
  onClear: () => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState(defaultCustom);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title={title}
          aria-label={title}
          className="h-8 w-8 shrink-0 flex-col gap-0.5"
          onMouseDown={(event) => event.preventDefault()}
        >
          {children}
          <span
            className="h-1 w-4 shrink-0 rounded-sm border border-border"
            style={{ backgroundColor: currentColor }}
            aria-hidden
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <div className="grid grid-cols-6 gap-1.5">
          {colors.map((color) => (
            <button
              key={color}
              type="button"
              title={color}
              aria-label={`Color ${color}`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onPick(color);
                setOpen(false);
              }}
              className="h-6 w-6 rounded border border-border transition-transform hover:scale-110"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <div className="mt-2.5 flex items-center justify-between gap-3 border-t pt-2.5">
          <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
            Otro
            <input
              type="color"
              value={custom}
              aria-label="Color personalizado"
              onChange={(event) => {
                setCustom(event.target.value);
                onPick(event.target.value);
              }}
              className="h-6 w-8 cursor-pointer rounded border border-border bg-background p-0.5"
            />
          </label>
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              onClear();
              setOpen(false);
            }}
            className="text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            Quitar
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function RichTextEditor({
  id,
  value,
  onChange,
  placeholder = "Escribe aquí… Usa títulos, listas y párrafos para organizar el contenido.",
  disabled,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const [, forceRender] = useState(0);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("https://");
  const [linkError, setLinkError] = useState<string | null>(null);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const template = document.createElement("div");
    template.innerHTML = toHtml(value);
    normalizeEditor(template);
    if (editor.innerHTML !== template.innerHTML) {
      editor.innerHTML = template.innerHTML;
    }
  }, [value]);

  const emit = useCallback(() => {
    const html = editorRef.current?.innerHTML ?? "";
    onChange(isEmptyHtml(html) ? "" : html);
  }, [onChange]);

  const exec = useCallback(
    (command: string, argument?: string) => {
      editorRef.current?.focus({ preventScroll: true });
      document.execCommand("styleWithCSS", false, "false");
      document.execCommand("defaultParagraphSeparator", false, "p");
      document.execCommand(command, false, argument);
      emit();
      forceRender((n) => n + 1);
    },
    [emit],
  );

  /**
   * Aplica un bloque (título, párrafo, cita). Si la selección cubre solo
   * parte de un bloque, lo parte para que el formato afecte únicamente
   * al texto seleccionado en vez de a todo el contenido.
   */
  const applyBlock = useCallback(
    (tag: BlockTag) => {
      const editor = editorRef.current;
      if (!editor || disabled) return;
      editor.focus({ preventScroll: true });
      document.execCommand("styleWithCSS", false, "false");
      document.execCommand("defaultParagraphSeparator", false, "p");

      try {
        normalizeEditor(editor);
        const selection = window.getSelection();
        const range =
          selection && selection.rangeCount > 0
            ? selection.getRangeAt(0)
            : null;
        if (
          range &&
          !range.collapsed &&
          editor.contains(range.commonAncestorContainer)
        ) {
          const startBlock = closestBlock(range.startContainer, editor);
          const endBlock = closestBlock(range.endContainer, editor);
          if (
            startBlock &&
            startBlock === endBlock &&
            SPLITTABLE_BLOCK_RE.test(startBlock.tagName)
          ) {
            const selectedText = range
              .toString()
              .replace(/\s+/g, " ")
              .trim();
            const blockText = (startBlock.textContent ?? "")
              .replace(/\s+/g, " ")
              .trim();
            if (selectedText && selectedText !== blockText) {
              const fragment = range.extractContents();
              const element = document.createElement(tag);
              element.appendChild(fragment);
              const afterStart = splitBlockAtPoint(
                startBlock,
                range.startContainer,
                range.startOffset,
              );
              const parent = startBlock.parentNode ?? editor;
              const afterBlock = startBlock.cloneNode(false) as HTMLElement;
              if (afterStart) {
                const moving: Node[] = [];
                let sibling: Node | null = afterStart;
                while (sibling) {
                  moving.push(sibling);
                  sibling = sibling.nextSibling;
                }
                moving.forEach((node) => afterBlock.appendChild(node));
              }
              parent.insertBefore(element, startBlock.nextSibling);
              parent.insertBefore(afterBlock, element.nextSibling);
              if (isBlockEmpty(startBlock)) startBlock.remove();
              if (isBlockEmpty(afterBlock)) afterBlock.remove();
              const next = document.createRange();
              next.selectNodeContents(element);
              selection?.removeAllRanges();
              selection?.addRange(next);
              editor.focus({ preventScroll: true });
              emit();
              forceRender((n) => n + 1);
              return;
            }
          }
        }
      } catch {
        // Ante cualquier rareza del DOM, usar el comportamiento nativo.
      }
      document.execCommand("formatBlock", false, `<${tag}>`);
      emit();
      forceRender((n) => n + 1);
    },
    [disabled, emit],
  );

  /**
   * Aplica color de texto o resaltado. Usa <span style> (no <font>)
   * para que el HTML sea limpio y sobreviva al saneado de la vista.
   */
  const applyColor = useCallback(
    (command: "foreColor" | "hiliteColor", color: string) => {
      const editor = editorRef.current;
      if (!editor || disabled) return;
      editor.focus({ preventScroll: true });
      document.execCommand("styleWithCSS", false, "true");
      const applied = document.execCommand(command, false, color);
      if (!applied && command === "hiliteColor") {
        document.execCommand("backColor", false, color);
      }
      emit();
      forceRender((n) => n + 1);
    },
    [disabled, emit],
  );

  /**
   * Quita solo el color (de texto o de fondo) de la selección,
   * sin tocar negritas, cursivas ni el resto del formato.
   */
  const clearInk = useCallback(
    (property: "color" | "background-color") => {
      const editor = editorRef.current;
      if (!editor || disabled) return;
      const selection = window.getSelection();
      const range =
        selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
      if (
        !range ||
        range.collapsed ||
        !editor.contains(range.commonAncestorContainer)
      ) {
        return;
      }
      try {
        const fragment = range.extractContents();
        const walker = document.createTreeWalker(
          fragment,
          NodeFilter.SHOW_ELEMENT,
        );
        const elements: HTMLElement[] = [];
        let node: Node | null = walker.nextNode();
        while (node) {
          elements.push(node as HTMLElement);
          node = walker.nextNode();
        }
        elements.forEach((element) => {
          element.style.removeProperty(property);
          if (element.tagName === "FONT") {
            if (property === "color") element.removeAttribute("color");
            if (property === "background-color") {
              element.removeAttribute("bgcolor");
            }
          }
          if (
            (element.tagName === "SPAN" || element.tagName === "FONT") &&
            element.attributes.length === 0
          ) {
            element.replaceWith(...Array.from(element.childNodes));
          }
        });
        range.insertNode(fragment);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
        editor.focus({ preventScroll: true });
        emit();
        forceRender((n) => n + 1);
      } catch {
        // Si la selección es rara, no se toca nada.
      }
    },
    [disabled, emit],
  );

  const handleInput = useCallback(() => {
    emit();
  }, [emit]);

  const handleFocus = useCallback(() => {
    document.execCommand("defaultParagraphSeparator", false, "p");
  }, []);

  const handlePaste = useCallback(() => {
    window.setTimeout(() => {
      const editor = editorRef.current;
      if (!editor) return;
      try {
        normalizeEditor(editor);
      } catch {
        // Si el pegado trae una estructura rara, se deja como está.
      }
      emit();
    }, 0);
  }, [emit]);

  const refreshActive = useCallback(() => {
    forceRender((n) => n + 1);
  }, []);

  useEffect(() => {
    document.addEventListener("selectionchange", refreshActive);
    return () => {
      document.removeEventListener("selectionchange", refreshActive);
    };
  }, [refreshActive]);

  const queryState = (command: string): boolean => {
    try {
      return document.queryCommandState(command);
    } catch {
      return false;
    }
  };

  const queryBlock = (): string => {
    try {
      return String(document.queryCommandValue("formatBlock")).toLowerCase();
    } catch {
      return "";
    }
  };

  const queryColor = (command: "foreColor" | "hiliteColor"): string => {
    try {
      const value = String(document.queryCommandValue(command));
      if (
        !value ||
        value === "transparent" ||
        /^rgba?\(\s*0\s*,\s*0\s*,\s*0\s*(,\s*0\s*)?\)$/.test(value)
      ) {
        return command === "foreColor" ? "#000000" : "transparent";
      }
      return value;
    } catch {
      return command === "foreColor" ? "#000000" : "transparent";
    }
  };

  const handleLink = () => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    const range =
      selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    savedRangeRef.current =
      range && editor && editor.contains(range.commonAncestorContainer)
        ? range.cloneRange()
        : null;
    setLinkUrl("https://");
    setLinkError(null);
    setLinkOpen(true);
  };

  const handleConfirmLink = (event: React.FormEvent) => {
    event.preventDefault();
    const url = linkUrl.trim();
    if (!url || url === "https://") {
      setLinkError("Escribe la URL del enlace.");
      return;
    }
    const normalized =
      /^[a-z][a-z0-9+.-]*:/i.test(url) ||
      url.startsWith("#") ||
      url.startsWith("/")
        ? url
        : `https://${url}`;
    setLinkOpen(false);
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (editor && selection && savedRangeRef.current) {
      try {
        selection.removeAllRanges();
        selection.addRange(savedRangeRef.current);
      } catch {
        // Si el rango ya no es válido, se aplica donde esté el cursor.
      }
    }
    exec("createLink", normalized);
  };

  const block = queryBlock();

  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border bg-background",
        disabled && "pointer-events-none opacity-60",
      )}
    >
      <div
        role="toolbar"
        aria-label="Formato del texto"
        className="flex flex-wrap items-center gap-0.5 border-b bg-muted/40 p-1.5"
      >
        <ToolbarButton
          title="Título 1"
          active={block === "h1"}
          onAction={() => applyBlock("h1")}
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Título 2"
          active={block === "h2"}
          onAction={() => applyBlock("h2")}
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Título 3"
          active={block === "h3"}
          onAction={() => applyBlock("h3")}
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Párrafo"
          active={block === "p" || block === ""}
          onAction={() => applyBlock("p")}
        >
          <Pilcrow className="h-4 w-4" />
        </ToolbarButton>
        <Separator />
        <ToolbarButton
          title="Negrita"
          active={queryState("bold")}
          onAction={() => exec("bold")}
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Cursiva"
          active={queryState("italic")}
          onAction={() => exec("italic")}
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Subrayado"
          active={queryState("underline")}
          onAction={() => exec("underline")}
        >
          <Underline className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Tachado"
          active={queryState("strikeThrough")}
          onAction={() => exec("strikeThrough")}
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        <ColorPicker
          title="Color del texto"
          colors={TEXT_COLORS}
          defaultCustom="#b91c1c"
          currentColor={queryColor("foreColor")}
          onPick={(color) => applyColor("foreColor", color)}
          onClear={() => clearInk("color")}
        >
          <Baseline className="h-4 w-4" />
        </ColorPicker>
        <ColorPicker
          title="Resaltado"
          colors={HIGHLIGHT_COLORS}
          defaultCustom="#fef08a"
          currentColor={queryColor("hiliteColor")}
          onPick={(color) => applyColor("hiliteColor", color)}
          onClear={() => clearInk("background-color")}
        >
          <Highlighter className="h-4 w-4" />
        </ColorPicker>
        <Separator />
        <ToolbarButton
          title="Lista con viñetas"
          active={queryState("insertUnorderedList")}
          onAction={() => exec("insertUnorderedList")}
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Lista numerada"
          active={queryState("insertOrderedList")}
          onAction={() => exec("insertOrderedList")}
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Reducir sangría" onAction={() => exec("outdent")}>
          <Outdent className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Aumentar sangría" onAction={() => exec("indent")}>
          <Indent className="h-4 w-4" />
        </ToolbarButton>
        <Separator />
        <ToolbarButton
          title="Alinear a la izquierda"
          active={queryState("justifyLeft")}
          onAction={() => exec("justifyLeft")}
        >
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Centrar"
          active={queryState("justifyCenter")}
          onAction={() => exec("justifyCenter")}
        >
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Alinear a la derecha"
          active={queryState("justifyRight")}
          onAction={() => exec("justifyRight")}
        >
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Justificar"
          active={queryState("justifyFull")}
          onAction={() => exec("justifyFull")}
        >
          <AlignJustify className="h-4 w-4" />
        </ToolbarButton>
        <Separator />
        <ToolbarButton
          title="Cita"
          active={block === "blockquote"}
          onAction={() => applyBlock("blockquote")}
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Línea separadora"
          onAction={() => exec("insertHorizontalRule")}
        >
          <Minus className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Insertar enlace" onAction={handleLink}>
          <Link2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Quitar enlace" onAction={() => exec("unlink")}>
          <Link2Off className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Limpiar formato"
          onAction={() => exec("removeFormat")}
        >
          <Eraser className="h-4 w-4" />
        </ToolbarButton>
      </div>
      <div
        id={id}
        ref={editorRef}
        role="textbox"
        aria-multiline
        aria-label="Descripción del protocolo"
        contentEditable={!disabled}
        suppressContentEditableWarning
        onInput={handleInput}
        onFocus={handleFocus}
        onPaste={handlePaste}
        onKeyUp={refreshActive}
        onMouseUp={refreshActive}
        data-placeholder={placeholder}
        className="rich-text-content min-h-[280px] px-4 py-3 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring empty:before:pointer-events-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]"
      />
      <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insertar enlace</DialogTitle>
            <DialogDescription>
              Escribe la URL para el texto seleccionado.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleConfirmLink} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="editor-link-url">URL</Label>
              <Input
                id="editor-link-url"
                value={linkUrl}
                onChange={(event) => {
                  setLinkUrl(event.target.value);
                  setLinkError(null);
                }}
                placeholder="https://ejemplo.com"
                inputMode="url"
                className={linkError ? "border-red-500" : ""}
              />
              {linkError && (
                <p className="text-xs text-red-600">{linkError}</p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setLinkOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Insertar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
