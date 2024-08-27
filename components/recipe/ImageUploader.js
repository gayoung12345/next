"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ImageUploader = function () {
    var _a = __read((0, react_1.useState)([]), 2), images = _a[0], setImages = _a[1];
    var handleFileChange = function (event) {
        var e_1, _a;
        var files = event.target.files;
        if (files) {
            var newImages_1 = [];
            try {
                for (var files_1 = __values(files), files_1_1 = files_1.next(); !files_1_1.done; files_1_1 = files_1.next()) {
                    var file = files_1_1.value;
                    if (file && file.type.startsWith('image/')) {
                        var reader = new FileReader();
                        reader.onload = function (e) {
                            var _a;
                            if ((_a = e.target) === null || _a === void 0 ? void 0 : _a.result) {
                                newImages_1.push(e.target.result);
                                setImages(function (prevImages) { return __spreadArray(__spreadArray([], __read(prevImages), false), [
                                    e.target.result,
                                ], false); });
                            }
                        };
                        reader.readAsDataURL(file);
                    }
                    else {
                        alert('Please select only image files.');
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (files_1_1 && !files_1_1.done && (_a = files_1.return)) _a.call(files_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
    };
    return (<div className='p-4'>
            {/* Custom file input styling */}
            <label htmlFor='fileInput' className='block mb-4 cursor-pointer flex items-center justify-center' style={{ width: '200px', height: '200px' }}>
                <span className='flex items-center justify-center w-full h-full text-black bg-white border border-spacing-1 hover:bg-slate-300 focus:outline-none focus:ring-2 focus:bg-slate-500 focus:ring-offset-2'>
                    Select Images
                </span>
                <input id='fileInput' type='file' multiple accept='image/*' onChange={handleFileChange} className='hidden' // Hide the default file input
    />
            </label>
            <div className='flex flex-wrap gap-4'>
                {images.map(function (src, index) { return (<img key={index} src={src} alt={"Preview ".concat(index)} className='w-52 h-52 object-cover border border-gray-300 rounded'/>); })}
            </div>
        </div>);
};
exports.default = ImageUploader;
