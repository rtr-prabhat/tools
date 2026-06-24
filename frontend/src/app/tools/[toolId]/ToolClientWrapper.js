'use client';

import dynamic from 'next/dynamic';

const CompressImage       = dynamic(() => import('../../components/tools/CompressImage'));
const ResizeImage         = dynamic(() => import('../../components/tools/ResizeImage'));
const ConvertImage        = dynamic(() => import('../../components/tools/ConvertImage'));
const ImageToPdf          = dynamic(() => import('../../components/tools/ImageToPdf'));
const CompressPdf         = dynamic(() => import('../../components/tools/CompressPdf'));
const MergePdf            = dynamic(() => import('../../components/tools/MergePdf'));
const QrGenerator         = dynamic(() => import('../../components/tools/QrGenerator'));
const Base64Tool          = dynamic(() => import('../../components/tools/Base64Tool'));
const WordCounter         = dynamic(() => import('../../components/tools/WordCounter'));
const PasswordGenerator   = dynamic(() => import('../../components/tools/PasswordGenerator'));
const JsonFormatter       = dynamic(() => import('../../components/tools/JsonFormatter'));
const ColorConverter      = dynamic(() => import('../../components/tools/ColorConverter'));
const UnitConverter       = dynamic(() => import('../../components/tools/UnitConverter'));
const AgeCalculator       = dynamic(() => import('../../components/tools/AgeCalculator'));
const GstCalculator       = dynamic(() => import('../../components/tools/GstCalculator'));
const EmiCalculator       = dynamic(() => import('../../components/tools/EmiCalculator'));
const SipCalculator       = dynamic(() => import('../../components/tools/SipCalculator'));
const FdCalculator        = dynamic(() => import('../../components/tools/FdCalculator'));
const BmiCalculator       = dynamic(() => import('../../components/tools/BmiCalculator'));
const InvoiceGenerator    = dynamic(() => import('../../components/tools/InvoiceGenerator'));
const SignatureMaker       = dynamic(() => import('../../components/tools/SignatureMaker'));
const TypingSpeedTest     = dynamic(() => import('../../components/tools/TypingSpeedTest'));
const PomodoroTimer       = dynamic(() => import('../../components/tools/PomodoroTimer'));
const TextToSpeech        = dynamic(() => import('../../components/tools/TextToSpeech'));
const NumberToWords       = dynamic(() => import('../../components/tools/NumberToWords'));
const UrlEncoder          = dynamic(() => import('../../components/tools/UrlEncoder'));
const CurrencyConverter   = dynamic(() => import('../../components/tools/CurrencyConverter'));
const OcrTool             = dynamic(() => import('../../components/tools/OcrTool'));
const IncomeTaxCalculator = dynamic(() => import('../../components/tools/IncomeTaxCalculator'));
const PpfCalculator       = dynamic(() => import('../../components/tools/PpfCalculator'));
const HraCalculator       = dynamic(() => import('../../components/tools/HraCalculator'));
const ImageCropper        = dynamic(() => import('../../components/tools/ImageCropper'));
const WatermarkAdder      = dynamic(() => import('../../components/tools/WatermarkAdder'));
const HashGenerator       = dynamic(() => import('../../components/tools/HashGenerator'));
const CsvJsonConverter    = dynamic(() => import('../../components/tools/CsvJsonConverter'));
const RegexTester         = dynamic(() => import('../../components/tools/RegexTester'));
const LoremIpsum          = dynamic(() => import('../../components/tools/LoremIpsum'));
const JwtDecoder          = dynamic(() => import('../../components/tools/JwtDecoder'));
const MarkdownPreview     = dynamic(() => import('../../components/tools/MarkdownPreview'));

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
