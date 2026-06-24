'use client';

import dynamic from 'next/dynamic';

const CompressImage       = dynamic(() => import('../../components/tools/CompressImage'), { ssr: false });
const ResizeImage         = dynamic(() => import('../../components/tools/ResizeImage'), { ssr: false });
const ConvertImage        = dynamic(() => import('../../components/tools/ConvertImage'), { ssr: false });
const ImageToPdf          = dynamic(() => import('../../components/tools/ImageToPdf'), { ssr: false });
const CompressPdf         = dynamic(() => import('../../components/tools/CompressPdf'), { ssr: false });
const MergePdf            = dynamic(() => import('../../components/tools/MergePdf'), { ssr: false });
const QrGenerator         = dynamic(() => import('../../components/tools/QrGenerator'), { ssr: false });
const Base64Tool          = dynamic(() => import('../../components/tools/Base64Tool'), { ssr: false });
const WordCounter         = dynamic(() => import('../../components/tools/WordCounter'), { ssr: false });
const PasswordGenerator   = dynamic(() => import('../../components/tools/PasswordGenerator'), { ssr: false });
const JsonFormatter       = dynamic(() => import('../../components/tools/JsonFormatter'), { ssr: false });
const ColorConverter      = dynamic(() => import('../../components/tools/ColorConverter'), { ssr: false });
const UnitConverter       = dynamic(() => import('../../components/tools/UnitConverter'), { ssr: false });
const AgeCalculator       = dynamic(() => import('../../components/tools/AgeCalculator'), { ssr: false });
const GstCalculator       = dynamic(() => import('../../components/tools/GstCalculator'), { ssr: false });
const EmiCalculator       = dynamic(() => import('../../components/tools/EmiCalculator'), { ssr: false });
const SipCalculator       = dynamic(() => import('../../components/tools/SipCalculator'), { ssr: false });
const FdCalculator        = dynamic(() => import('../../components/tools/FdCalculator'), { ssr: false });
const BmiCalculator       = dynamic(() => import('../../components/tools/BmiCalculator'), { ssr: false });
const InvoiceGenerator    = dynamic(() => import('../../components/tools/InvoiceGenerator'), { ssr: false });
const SignatureMaker       = dynamic(() => import('../../components/tools/SignatureMaker'), { ssr: false });
const TypingSpeedTest     = dynamic(() => import('../../components/tools/TypingSpeedTest'), { ssr: false });
const PomodoroTimer       = dynamic(() => import('../../components/tools/PomodoroTimer'), { ssr: false });
const TextToSpeech        = dynamic(() => import('../../components/tools/TextToSpeech'), { ssr: false });
const NumberToWords       = dynamic(() => import('../../components/tools/NumberToWords'), { ssr: false });
const UrlEncoder          = dynamic(() => import('../../components/tools/UrlEncoder'), { ssr: false });
const CurrencyConverter   = dynamic(() => import('../../components/tools/CurrencyConverter'), { ssr: false });
const OcrTool             = dynamic(() => import('../../components/tools/OcrTool'), { ssr: false });
const IncomeTaxCalculator = dynamic(() => import('../../components/tools/IncomeTaxCalculator'), { ssr: false });
const PpfCalculator       = dynamic(() => import('../../components/tools/PpfCalculator'), { ssr: false });
const HraCalculator       = dynamic(() => import('../../components/tools/HraCalculator'), { ssr: false });
const ImageCropper        = dynamic(() => import('../../components/tools/ImageCropper'), { ssr: false });
const WatermarkAdder      = dynamic(() => import('../../components/tools/WatermarkAdder'), { ssr: false });
const HashGenerator       = dynamic(() => import('../../components/tools/HashGenerator'), { ssr: false });
const CsvJsonConverter    = dynamic(() => import('../../components/tools/CsvJsonConverter'), { ssr: false });
const RegexTester         = dynamic(() => import('../../components/tools/RegexTester'), { ssr: false });
const LoremIpsum          = dynamic(() => import('../../components/tools/LoremIpsum'), { ssr: false });
const JwtDecoder          = dynamic(() => import('../../components/tools/JwtDecoder'), { ssr: false });
const MarkdownPreview     = dynamic(() => import('../../components/tools/MarkdownPreview'), { ssr: false });

const TOOLS = {
  'compress-image':        CompressImage,
  'resize-image':          ResizeImage,
  'convert-image':         ConvertImage,
  'image-to-pdf':          ImageToPdf,
  'compress-pdf':          CompressPdf,
  'merge-pdf':             MergePdf,
  'qr-generator':          QrGenerator,
  'base64-encode':         Base64Tool,
  'word-counter':          WordCounter,
  'password-generator':    PasswordGenerator,
  'json-formatter':        JsonFormatter,
  'color-converter':       ColorConverter,
  'unit-converter':        UnitConverter,
  'age-calculator':        AgeCalculator,
  'gst-calculator':        GstCalculator,
  'emi-calculator':        EmiCalculator,
  'sip-calculator':        SipCalculator,
  'fd-calculator':         FdCalculator,
  'bmi-calculator':        BmiCalculator,
  'invoice-generator':     InvoiceGenerator,
  'signature-maker':       SignatureMaker,
  'typing-speed-test':     TypingSpeedTest,
  'pomodoro-timer':        PomodoroTimer,
  'text-to-speech':        TextToSpeech,
  'number-to-words':       NumberToWords,
  'url-encoder':           UrlEncoder,
  'currency-converter':    CurrencyConverter,
  'ocr-tool':              OcrTool,
  'income-tax-calculator': IncomeTaxCalculator,
  'ppf-calculator':        PpfCalculator,
  'hra-calculator':        HraCalculator,
  'image-cropper':         ImageCropper,
  'watermark-adder':       WatermarkAdder,
  'hash-generator':        HashGenerator,
  'csv-json-converter':    CsvJsonConverter,
  'regex-tester':          RegexTester,
  'lorem-ipsum':           LoremIpsum,
  'jwt-decoder':           JwtDecoder,
  'markdown-preview':      MarkdownPreview,
};

export default function ToolClientWrapper({ toolId }) {
  const Tool = TOOLS[toolId];
  if (!Tool) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center shadow-sm">
        <p className="text-4xl mb-3">🔧</p>
        <p className="text-slate-600 font-medium">This tool is coming soon!</p>
        <p className="text-slate-400 text-sm mt-1">Check back later or explore other tools.</p>
      </div>
    );
  }
  return <Tool />;
}
