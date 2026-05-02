import React, { useRef, useEffect } from 'react';
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

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder, className }) => {
    const quillRef = useRef<ReactQuill>(null);
    // Track the last value we set programmatically, to avoid cursor jumps on every keystroke
    const lastSetValue = useRef<string>('');

    // Restore useEffect but with a guard: only update if the user is NOT typing
    // this prevents focus loss and keyboard closure while allowing the editor
    // to load the content correctly when it opens.
    useEffect(() => {
        const editor = quillRef.current?.getEditor();
        if (!editor) return;

        // ONLY update if the editor is NOT focused. If it's focused, the user is typing
        // and we should NOT touch the internal state to avoid keyboard dismissal.
        if (!editor.hasFocus()) {
            const currentHtml = editor.root.innerHTML;
            if (value !== currentHtml) {
                editor.clipboard.dangerouslyPasteHTML(value || '');
            }
        }
    }, [value]);

    return (
        <div className={`rich-text-editor ${className || ''}`}>
            <ReactQuill
                ref={quillRef}
                theme="snow"
                defaultValue={value}
                onChange={(html) => {
                    lastSetValue.current = html;
                    onChange(html);
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
