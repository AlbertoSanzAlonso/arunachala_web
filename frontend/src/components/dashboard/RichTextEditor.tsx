import React, { useRef, useEffect, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import 'quill-emoji/dist/quill-emoji.css';
import * as Emoji from 'quill-emoji';

// Register emoji module
ReactQuill.Quill.register('modules/emoji', Emoji);

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

const modules = {
    toolbar: {
        container: [
            [{ 'header': [1, 2, 3, false] }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            ['link', 'image'],
            ['emoji'],
            ['clean']
        ]
    },
    'emoji-toolbar': true,
    'emoji-textarea': false,
    'emoji-shortname': true,
};

const formats = [
    'header', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'color', 'background',
    'list', 'bullet', 'indent',
    'link', 'image',
    'emoji'
];

type ScrollSnapshot = {
    modalTop: number;
    editorTop: number;
    modalEl: HTMLElement | null;
    selection: { index: number; length: number } | null;
    fromToolbar: boolean;
};

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder, className }) => {
    const quillRef = useRef<ReactQuill>(null);
    const snapshotRef = useRef<ScrollSnapshot | null>(null);

    const captureScroll = useCallback((fromToolbar: boolean) => {
        const editor = quillRef.current?.getEditor();
        if (!editor) return;
        const modalEl = editor.root.closest('.overflow-y-auto') as HTMLElement | null;
        const selection = editor.getSelection() || snapshotRef.current?.selection || null;
        snapshotRef.current = {
            modalTop: modalEl?.scrollTop ?? 0,
            editorTop: editor.root.scrollTop,
            modalEl,
            selection,
            fromToolbar,
        };
    }, []);

    const restoreScroll = useCallback(() => {
        const editor = quillRef.current?.getEditor();
        const snap = snapshotRef.current;
        if (!editor || !snap) return;

        const apply = () => {
            editor.root.scrollTop = snap.editorTop;
            if (snap.modalEl) snap.modalEl.scrollTop = snap.modalTop;
            // Only re-apply selection after toolbar formats (heading/bold/…).
            // Restoring on every keystroke breaks normal typing.
            if (snap.fromToolbar && snap.selection) {
                try {
                    const length = editor.getLength();
                    const index = Math.min(snap.selection.index, Math.max(length - 1, 0));
                    editor.setSelection(index, snap.selection.length);
                } catch {
                    // ignore invalid selection after format
                }
            }
        };

        apply();
        requestAnimationFrame(apply);
        setTimeout(apply, 0);
        snapshotRef.current = { ...snap, fromToolbar: false };
    }, []);

    // Uncontrolled Quill: content loads via defaultValue + parent `key` remount.
    // Do NOT re-paste HTML on value changes — that jumps caret/scroll to the top,
    // especially when the toolbar steals focus (headers, size picker, etc.).
    useEffect(() => {
        const editor = quillRef.current?.getEditor();
        if (!editor) return;

        const toolbar = editor.getModule('toolbar') as {
            container?: HTMLElement;
            addHandler?: (name: string, handler: (value: unknown) => void) => void;
        } | null;
        const toolbarEl = toolbar?.container;
        const savedRangeRef = { current: null as { index: number; length: number } | null };

        const onToolbarPointer = (event: Event) => {
            // Keep selection when clicking toolbar/pickers (header, size, …).
            // Do not overwrite a good range with null when opening a dropdown item.
            event.preventDefault();
            const sel = editor.getSelection();
            if (sel) savedRangeRef.current = sel;
            captureScroll(true);
        };
        toolbarEl?.addEventListener('mousedown', onToolbarPointer, true);
        toolbarEl?.addEventListener('touchstart', onToolbarPointer, true);

        const withPreservedSelection = (formatName: string) => (value: unknown) => {
            const range = savedRangeRef.current || editor.getSelection();
            if (range) editor.setSelection(range.index, range.length, 'silent');
            editor.format(formatName, value);
            restoreScroll();
        };

        // Picker formats lose the caret unless we restore the range first.
        toolbar?.addHandler?.('header', withPreservedSelection('header'));
        toolbar?.addHandler?.('size', withPreservedSelection('size'));
        toolbar?.addHandler?.('color', withPreservedSelection('color'));
        toolbar?.addHandler?.('background', withPreservedSelection('background'));
        toolbar?.addHandler?.('align', withPreservedSelection('align'));

        const onTextChange = (_delta: unknown, _old: unknown, source: string) => {
            // Block formats (h2/h3) resize content and the modal scroll jumps to top.
            if (source === 'user' && snapshotRef.current?.fromToolbar) {
                restoreScroll();
            }
        };
        editor.on('text-change', onTextChange);

        return () => {
            toolbarEl?.removeEventListener('mousedown', onToolbarPointer, true);
            toolbarEl?.removeEventListener('touchstart', onToolbarPointer, true);
            editor.off('text-change', onTextChange);
        };
    }, [captureScroll, restoreScroll]);

    return (
        <div className={`rich-text-editor ${className || ''}`}>
            <ReactQuill
                ref={quillRef}
                theme="snow"
                defaultValue={value}
                onChange={(html) => {
                    // Keep modal scroll stable across React re-renders from parent state.
                    const editor = quillRef.current?.getEditor();
                    const modalEl = editor?.root.closest('.overflow-y-auto') as HTMLElement | null;
                    const modalTop = modalEl?.scrollTop ?? 0;
                    const editorTop = editor?.root.scrollTop ?? 0;
                    onChange(html);
                    requestAnimationFrame(() => {
                        if (modalEl) modalEl.scrollTop = modalTop;
                        if (editor) editor.root.scrollTop = editorTop;
                    });
                }}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                className="bg-white rounded-md"
            />
            <style>{`
                .ql-container {
                    border-bottom-left-radius: 0.375rem;
                    border-bottom-right-radius: 0.375rem;
                    min-height: 200px;
                }
                .ql-toolbar {
                    border-top-left-radius: 0.375rem;
                    border-top-right-radius: 0.375rem;
                    position: sticky;
                    top: -24px; /* Compensate p-6 padding */
                    z-index: 40;
                    background: white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }
                @media (min-width: 640px) {
                    .ql-toolbar {
                        top: -32px; /* Compensate sm:p-8 padding */
                    }
                }
                .ql-editor {
                    min-height: 200px;
                    font-family: "Mulish", sans-serif;
                    font-size: 1.125rem;
                    line-height: 1.8;
                    color: #5D4037; /* bark color */
                    white-space: pre-wrap !important; /* Safety fallback for missing <p> tags */
                    overflow-anchor: none;
                }
                /* Match public blog styles exactly */
                .ql-editor h1 { font-size: 2.5rem !important; line-height: 1.2 !important; margin-top: 2rem !important; margin-bottom: 1.25rem !important; font-weight: 700 !important; color: #2F4F4F !important; font-family: "Cormorant Garamond", serif !important; }
                .ql-editor h2 { font-size: 2rem !important; line-height: 1.3 !important; margin-top: 1.75rem !important; margin-bottom: 1rem !important; font-weight: 700 !important; color: #2F4F4F !important; font-family: "Cormorant Garamond", serif !important; }
                .ql-editor h3 { font-size: 1.75rem !important; line-height: 1.4 !important; margin-top: 1.5rem !important; margin-bottom: 0.75rem !important; font-weight: 600 !important; color: #2F4F4F !important; font-family: "Cormorant Garamond", serif !important; }
                .ql-editor p { margin-bottom: 1.25rem !important; }
                .ql-editor blockquote { 
                    border-left: 4px solid #8FBC8F !important; 
                    padding-left: 1.5rem !important; 
                    font-style: italic !important; 
                    margin: 2rem 0 !important; 
                    color: #5D4037 !important;
                    background: transparent !important;
                }
                .ql-editor p { 
                    margin-bottom: 1.5rem !important; 
                    display: block !important;
                }
                .ql-editor ul { 
                    list-style-type: disc !important; 
                    padding-left: 2rem !important; 
                    margin-bottom: 1.5rem !important;
                    display: block !important;
                }
                .ql-editor ol { 
                    list-style-type: decimal !important; 
                    padding-left: 2rem !important; 
                    margin-bottom: 1.5rem !important;
                    display: block !important;
                }
                .ql-editor li { 
                    margin-bottom: 0.75rem !important;
                    display: list-item !important;
                }
                .ql-editor strong { font-weight: 700 !important; color: #2F4F4F !important; }
                
                /* Quill internal list fix */
                .ql-editor ul[data-checked] { list-style-type: none !important; }
                
                /* Fix for missing emoji icon */
                .ql-snow .ql-picker.ql-emoji {
                    width: 28px;
                }
                button.ql-emoji svg {
                    display: none;
                }
                button.ql-emoji::before {
                    content: "😀";
                    font-size: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    height: 100%;
                    margin-top: -2px;
                }
                button.ql-emoji:hover::before {
                    content: "😃";
                }
            `}</style>
        </div>
    );
};

export default RichTextEditor;
