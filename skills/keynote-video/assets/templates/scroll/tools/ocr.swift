// tools/ocr.swift — what macOS Vision reads in an image region: every text line with its box (x y w h in image px,
// origin top left), and, with FACES=1, every face it detects as a line "FACE x y w h". Used by
// tools/check-assets.mjs (number consistency and the no-people check). macOS only; elsewhere the checks that need it
// report INFO and the manifest's own declarations stand.
//   swift tools/ocr.swift <image> [x y w h]
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
var reqs: [VNRequest] = [req]
let faces = VNDetectFaceRectanglesRequest()
if ProcessInfo.processInfo.environment["FACES"] == "1" { reqs.append(faces) }
try VNImageRequestHandler(cgImage: cg, options: [:]).perform(reqs)
for o in (req.results ?? []) {
  guard let t = o.topCandidates(1).first else { continue }
  let b = o.boundingBox
  print(String(format: "%.0f\t%.0f\t%.0f\t%.0f\t%@", ox + b.minX * W, oy + (1 - b.maxY) * H, b.width * W, b.height * H, t.string))
}
for f in (faces.results ?? []) {
  let b = f.boundingBox
  print(String(format: "FACE\t%.0f\t%.0f\t%.0f\t%.0f\t%.2f", ox + b.minX * W, oy + (1 - b.maxY) * H, b.width * W, b.height * H, f.confidence))
}
