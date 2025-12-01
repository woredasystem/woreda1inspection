"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { HiQrCode, HiArrowDownTray, HiCheckCircle, HiArrowPath } from "react-icons/hi2";

export default function QrGeneratorPage() {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [qrCode, setQrCode] = useState<string>("");
  const [requestUrl, setRequestUrl] = useState<string>("");

  const generateQR = () => {
    // Generate a unique QR code
    const code = `WRD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    setQrCode(code);
    
    // Create the request URL
    const url = typeof window !== "undefined" 
      ? `${window.location.origin}/request-access?code=${code}`
      : "";
    setRequestUrl(url);
    
    if (url) {
      // Generate QR code
      QRCode.toDataURL(url, {
        width: 600,
        margin: 2,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
      })
        .then((dataUrl) => {
          setQrDataUrl(dataUrl);
        })
        .catch((err) => {
          console.error("Error generating QR code:", err);
        });
    }
  };

  useEffect(() => {
    generateQR();
  }, []);

  const handleDownload = () => {
    if (qrDataUrl) {
      const link = document.createElement("a");
      link.download = `woreda-qr-${qrCode}.png`;
      link.href = qrDataUrl;
      link.click();
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 text-sm text-slate-200 shadow-[0_30px_60px_rgba(15,23,42,0.5)]">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
            <HiQrCode className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-white">
              QR Code Generator
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Generate QR codes for document access requests. Download and print these codes for physical distribution.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white/90 p-8 shadow-[0_30px_90px_rgba(15,23,42,0.08)]">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
              <HiCheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Generate New QR Code
            </h2>
          </div>
          <button
            onClick={generateQR}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <HiArrowPath className="h-4 w-4" />
            Generate New
          </button>
        </div>
        
        <p className="mb-6 text-sm leading-relaxed text-slate-600">
          This QR code can be printed and distributed. When scanned, it will automatically request document access.
        </p>

        {qrDataUrl ? (
          <div className="flex flex-col items-center gap-6">
            <div className="rounded-2xl border-4 border-slate-200 bg-white p-8 shadow-lg">
              <img
                src={qrDataUrl}
                alt="QR Code for document access request"
                className="h-auto w-full max-w-md"
              />
            </div>
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                Request Code
              </p>
              <p className="font-mono text-lg font-semibold text-slate-900">
                {qrCode}
              </p>
              <p className="mt-2 max-w-md break-all text-center text-xs text-slate-500">
                {requestUrl}
              </p>
            </div>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-900 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-slate-800"
            >
              <HiArrowDownTray className="h-4 w-4" />
              Download QR Code
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-600"></div>
              <p className="text-sm text-slate-600">Generating QR code...</p>
            </div>
          </div>
        )}

        <div className="mt-8 rounded-xl bg-blue-50 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.4em] text-blue-700">
            Print this QR code and distribute it. When scanned, users will automatically request document access.
          </p>
        </div>
      </section>
    </div>
  );
}

