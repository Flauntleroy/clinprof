import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const modules = {
    toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ color: [] }, { background: [] }],
        ["blockquote", "code-block"],
        ["link", "image"],
        [{ align: [] }],
        ["clean"],
    ],
};

const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "color",
    "background",
    "blockquote",
    "code-block",
    "link",
    "image",
    "align",
];

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    return (
        <div className="rich-text-editor">
            <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                className="bg-white dark:bg-gray-800 rounded-lg"
            />
            <style>{`
                .rich-text-editor .ql-toolbar {
                    border-top-left-radius: 0.5rem;
                    border-top-right-radius: 0.5rem;
                    border-color: rgb(209 213 219);
                    background: rgb(249 250 251);
                }
                .dark .rich-text-editor .ql-toolbar {
                    border-color: rgb(55 65 81);
                    background: rgb(31 41 55);
                }
                .rich-text-editor .ql-container {
                    border-bottom-left-radius: 0.5rem;
                    border-bottom-right-radius: 0.5rem;
                    border-color: rgb(209 213 219);
                    min-height: 300px;
                    font-size: 1rem;
                }
                .dark .rich-text-editor .ql-container {
                    border-color: rgb(55 65 81);
                }
                .rich-text-editor .ql-editor {
                    min-height: 280px;
                }
                .dark .rich-text-editor .ql-editor {
                    color: white;
                }
                .dark .rich-text-editor .ql-editor.ql-blank::before {
                    color: rgb(156 163 175);
                }
                .dark .rich-text-editor .ql-stroke {
                    stroke: rgb(156 163 175);
                }
                .dark .rich-text-editor .ql-fill {
                    fill: rgb(156 163 175);
                }
                .dark .rich-text-editor .ql-picker-label {
                    color: rgb(156 163 175);
                }
                .rich-text-editor .ql-toolbar button:hover .ql-stroke,
                .rich-text-editor .ql-toolbar button.ql-active .ql-stroke {
                    stroke: rgb(59 130 246);
                }
                .rich-text-editor .ql-toolbar button:hover .ql-fill,
                .rich-text-editor .ql-toolbar button.ql-active .ql-fill {
                    fill: rgb(59 130 246);
                }
            `}</style>
        </div>
    );
}
