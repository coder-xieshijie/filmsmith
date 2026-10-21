// tools/ocr.swift — print every text line macOS Vision reads in an image, with its box in image pixels
// (x y w h, origin top left) — used by tools/check-assets.mjs. Usage: swift tools/ocr.swift <image> [x y w h]
// The optional crop limits recognition to the region the film shows. OCR_LANGS=zh-Hans,en-US reads Chinese too
// (used only to detect non-English text: with Chinese first, English and digits read worse).
import Foundation
import Vision
import AppKit

let args = CommandLine.arguments
guard args.count >= 2, let img = NSImage(contentsOfFile: args[1]),
      var cg = img.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
  FileHandle.standardError.write("usage: ocr.swift <image> [x y w h]\n".data(using: .utf8)!); exit(2)
}
var ox = 0.0, oy = 0.0
if args.count >= 6, let x = Double(args[2]), let y = Double(args[3]), let w = Double(args[4]), let h = Double(args[5]) {
  if let c = cg.cropping(to: CGRect(x: x, y: y, width: w, height: h)) { cg = c; ox = x; oy = y }
}
let W = Double(cg.width), H = Double(cg.height)
let req = VNRecognizeTextRequest()
req.recognitionLevel = .accurate
req.usesLanguageCorrection = false
req.recognitionLanguages = (ProcessInfo.processInfo.environment["OCR_LANGS"] ?? "en-US").split(separator: ",").map(String.init)
try VNImageRequestHandler(cgImage: cg, options: [:]).perform([req])
for o in (req.results ?? []) {
  guard let t = o.topCandidates(1).first else { continue }
  let b = o.boundingBox
  let x = ox + b.minX * W, y = oy + (1 - b.maxY) * H
  print(String(format: "%.0f\t%.0f\t%.0f\t%.0f\t%@", x, y, b.width * W, b.height * H, t.string))
}
