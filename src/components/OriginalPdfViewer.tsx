import React from 'react';
import { FileText, ExternalLink, Download } from 'lucide-react';

interface Props {
  pdfUrl: string;
  fileName: string;
  language: 'gu' | 'en';
}

export const OriginalPdfViewer: React.FC<Props> = ({ pdfUrl, fileName, language }) => {
  const isGu = language === 'gu';

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col h-[850px]">
      <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-rose-600" />
          <span className="text-xs font-bold text-slate-800 truncate max-w-xs md:max-w-md">
            {fileName || '31109260232375_a8a8e1dc.pdf'}
          </span>
          <span className="text-[11px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-medium">
            {isGu ? 'મૂળ પીડીએફ દસ્તાવેજ' : 'Original PDF Document'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-blue-700 hover:text-blue-900 bg-white border border-slate-300 px-2.5 py-1 rounded-md font-medium transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{isGu ? 'નવી ટેબમાં ખોલો' : 'Open in New Tab'}</span>
          </a>
          <a
            href={pdfUrl}
            download={fileName}
            className="flex items-center gap-1 text-xs text-slate-700 hover:text-slate-900 bg-white border border-slate-300 px-2.5 py-1 rounded-md font-medium transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isGu ? 'ડાઉનલોડ' : 'Download'}</span>
          </a>
        </div>
      </div>

      <div className="flex-1 bg-slate-200 p-2">
        <iframe
          src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
          className="w-full h-full rounded border border-slate-300 bg-white shadow-inner"
          title="PDF Document Viewer"
        />
      </div>
    </div>
  );
};
