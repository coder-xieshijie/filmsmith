// tools/vision.swift — what the OS's own vision framework sees in a region of an image: every text line (with its box)
// and every face. Used by tools/check-assets.mjs on macOS; elsewhere those checks are skipped with a warning.
//   swift tools/vision.swift <image> [x y w h]
// prints one line per finding, boxes in image px with the origin top left:
//   T <tab> x <tab> y <tab> w <tab> h <tab> text
//   F <tab> x <tab> y <tab> w <tab> h
// VISION_LANGS (default en-US) sets the recognition languages, e.g. VISION_LANGS=zh-Hans,en-US.
import Foundation
import Vision
import AppKit

let args = CommandLine.arguments
guard args.count >= 2, let img = NSImage(contentsOfFile: args[1]),
      var cg = img.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
  FileHandle.standardError.write("usage: vision.swift <image> [x y w h]\n".data(using: .utf8)!); exit(2)
}
var ox = 0.0, oy = 0.0
if args.count >= 6, let x = Double(args[2]), let y = Double(args[3]), let w = Double(args[4]), let h = Double(args[5]) {
  if let c = cg.cropping(to: CGRect(x: x, y: y, width: w, height: h)) { cg = c; ox = x; oy = y }
}
let W = Double(cg.width), H = Double(cg.height)
let text = VNRecognizeTextRequest()
text.recognitionLevel = .accurate
text.usesLanguageCorrection = false
text.recognitionLanguages = (ProcessInfo.processInfo.environment["VISION_LANGS"] ?? "en-US").split(separator: ",").map(String.init)
let faces = VNDetectFaceRectanglesRequest()
try VNImageRequestHandler(cgImage: cg, options: [:]).perform([text, faces])
func box(_ b: CGRect) -> String {
  return String(format: "%.0f\t%.0f\t%.0f\t%.0f", ox + b.minX * W, oy + (1 - b.maxY) * H, b.width * W, b.height * H)
}
for o in (text.results ?? []) {
  guard let t = o.topCandidates(1).first else { continue }
  print("T\t\(box(o.boundingBox))\t\(t.string)")
}
for f in (faces.results ?? []) { print("F\t\(box(f.boundingBox))") }
