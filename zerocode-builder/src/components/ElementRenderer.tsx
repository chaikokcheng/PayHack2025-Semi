import React, { useState } from "react";
import { Colors } from "../constants/colors";

export type ElementType =
  | "text-input"
  | "grouped-menu"
  | "tabs"
  | "button"
  | "image-banner"
  | "dropdown"
  | "dashboard"
  | "text-header"
  | "file-upload"
  | "divider"
  | "text-description";

interface ElementRendererProps {
  type: ElementType;
  id?: string;
  initialValue?: string;
  initialImage?: string;
}

const darkBorder = "#BDBDBD";
const darkText = "#212121";
const secondaryText = "#757575";

export const ElementRenderer: React.FC<ElementRendererProps> = ({ type, initialValue, initialImage }) => {
  const baseClass = "w-full mb-4 flex flex-col items-center px-2 py-1";

  // Editable state for text-header and text-description
  const [headerValue, setHeaderValue] = useState(type === 'text-header' && initialValue ? initialValue : "Header Title");
  const [headerEdit, setHeaderEdit] = useState(false);
  const [descValue, setDescValue] = useState(type === 'text-description' && initialValue ? initialValue : "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.");
  const [descEdit, setDescEdit] = useState(false);

  // State for image banner upload
  const [bannerImg, setBannerImg] = useState<string | null>(type === 'image-banner' && initialImage ? initialImage : null);

  switch (type) {
    case "text-input":
      return (
        <div className={baseClass}>
          <input
            className="w-full px-3 py-2 border rounded focus:outline-none"
            style={{ borderColor: darkBorder, color: darkText }}
            placeholder="Text Input"
            disabled
          />
        </div>
      );
    case "grouped-menu":
      return (
        <div className={baseClass}>
          <div className="w-full">
            <div className="font-semibold mb-2" style={{ color: darkText }}>
              Menu Group
            </div>
            <ul className="divide-y" style={{ borderColor: Colors.divider }}>
              <li className="py-2" style={{ color: darkText }}>
                Menu Item 1
              </li>
              <li className="py-2" style={{ color: darkText }}>
                Menu Item 2
              </li>
              <li className="py-2" style={{ color: darkText }}>
                Menu Item 3
              </li>
            </ul>
          </div>
        </div>
      );
    case "tabs":
      return (
        <div className={baseClass}>
          <div className="flex w-full mb-2">
            <button
              className="flex-1 py-2 rounded-t bg-gray-100 font-medium border-b-2"
              style={{ color: Colors.primary, borderColor: darkBorder }}
            >
              Tab 1
            </button>
            <button
              className="flex-1 py-2 rounded-t bg-gray-200 font-medium border-b-2"
              style={{ color: secondaryText, borderColor: darkBorder }}
            >
              Tab 2
            </button>
          </div>
          <div
            className="w-full p-2 bg-gray-50 rounded-b"
            style={{ color: darkText }}
          >
            Tab content here...
          </div>
        </div>
      );
    case "button":
      return (
        <div className={baseClass}>
          <button
            className="w-full bg-pink-500 text-white py-2 rounded font-medium shadow"
            style={{ background: Colors.primary }}
          >
            Button
          </button>
        </div>
      );
    case "image-banner":
      return (
        <div className={baseClass + " p-0 w-full"}>
          <label className="w-full h- block cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (ev) =>
                    setBannerImg(ev.target?.result as string);
                  reader.readAsDataURL(file);
                }
              }}
            />
            {bannerImg ? (
              <img
                src={bannerImg}
                alt="Banner Preview"
                className="w-full h-32 object-cover rounded"
                style={{ minHeight: 128, maxHeight: 128 }}
              />
            ) : (
              <div className="w-full h-32 bg-gradient-to-r from-pink-400 to-pink-200 rounded flex h-32">
                <span className="text-white font-bold text-base flex-1 flex items-center justify-center text-center break-words px-2">
                  Banner Image (Click to upload)
                </span>
              </div>
            )}
          </label>
        </div>
      );
    case "dropdown":
      return (
        <div className={baseClass}>
          <select
            className="w-full px-3 py-2 border rounded"
            style={{ borderColor: darkBorder, color: darkText }}
            disabled
          >
            <option>Dropdown Option 1</option>
            <option>Dropdown Option 2</option>
          </select>
        </div>
      );
    case "dashboard":
      return (
        <div className={baseClass}>
          <div className="w-full flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full mb-2 flex items-center justify-center">
              <span className="text-2xl text-gray-400">📊</span>
            </div>
            <div className="font-semibold" style={{ color: darkText }}>
              Dashboard Widget
            </div>
            <div className="text-xs" style={{ color: secondaryText }}>
              (Mocked chart)
            </div>
          </div>
        </div>
      );
    case "text-header":
      return (
        <div className={baseClass + " items-start"}>
          {headerEdit ? (
            <input
              className="text-xl font-bold text-left w-full border-b outline-none"
              style={{ color: Colors.primary, borderColor: darkBorder }}
              value={headerValue}
              onChange={(e) => setHeaderValue(e.target.value)}
              onBlur={() => setHeaderEdit(false)}
              autoFocus
            />
          ) : (
            <h2
              className="text-xl font-bold text-left w-full cursor-pointer"
              style={{ color: Colors.primary }}
              onClick={() => setHeaderEdit(true)}
              tabIndex={0}
            >
              {headerValue}
            </h2>
          )}
        </div>
      );
    case "text-description":
      return (
        <div className={baseClass + " items-start"}>
          {descEdit ? (
            <textarea
              className="text-sm font text-left w-full border-b outline-none resize-none"
              style={{ color: Colors.textSecondary, borderColor: darkBorder }}
              value={descValue}
              onChange={(e) => setDescValue(e.target.value)}
              onBlur={() => setDescEdit(false)}
              rows={2}
              autoFocus
            />
          ) : (
            <p
              className="text-sm font text-left w-full cursor-pointer"
              style={{ color: Colors.textSecondary }}
              onClick={() => setDescEdit(true)}
              tabIndex={0}
            >
              {descValue}
            </p>
          )}
        </div>
      );
    case "file-upload":
      return (
        <div className={baseClass}>
          <label
            className="w-full flex flex-col items-center justify-center border-2 border-dashed rounded p-4 cursor-not-allowed"
            style={{ borderColor: darkBorder, color: darkText }}
          >
            <span className="text-2xl mb-2">📤</span>
            <span className="text-sm">File Upload</span>
          </label>
        </div>
      );
    case "divider":
      return (
        <div className="w-full flex items-center my-4">
          <div className="flex-1 h-px" style={{ background: darkBorder }} />
        </div>
      );
    default:
      return (
        <div className={baseClass}>
          <div className="w-12 h-12 bg-gray-200 rounded mb-2 flex items-center justify-center">
            <span className="text-gray-400 text-xl">Img</span>
          </div>
          <div
            className="font-semibold text-base mb-1"
            style={{ color: darkText }}
          >
            {String(type).replace("-", " ")}
          </div>
        </div>
      );
  }
};
