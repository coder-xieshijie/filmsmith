# NOTICE

Generated from each brick's `brick.json`; do not edit by hand. Paths are relative to this folder.

Bricks in this folder marked `licence: Apache-2.0` in their `brick.json` are adapted from **video-shotcraft** by
Vincent Wei, <https://github.com/Vincentwei1021/video-shotcraft>, commit `1266a3ec4831289c4d893d42dd5102723658039a`,
licensed under the Apache License 2.0 (full text: `LICENSE-video-shotcraft`). Each adapted file starts with the
upstream demo path, its shot card and a line on what was changed (Apache-2.0 section 4(b)). Upstream has no NOTICE
file, so there is no upstream NOTICE text to carry (section 4(d)). Upstream's references/shots/ATTRIBUTION.md lists the
films upstream studied; those are sources of technique, not of licence, and are not repeated here.

Everything else here (own bricks, the shared brick runtime) and the runtime modules whose options are listed below
as ideas from upstream are Filmsmith's own, MIT.

## Adapted files

| File | Adapted from (video-shotcraft @ 1266a3e) | Changes |
|---|---|---|
| `ease.js` | `demos/_fixtures/Polish.tsx` (`EASE`: the seven named cubic-bezier curves) | the curves rebuilt on runtime `motion.js` `bez`; `portal` added |
| `sample.js` | layouts of `demos/transition/shot-transitions/PortalWipeV2.tsx` and `demos/camera/overhead-camera-moves/TiltReveal.tsx` | redrawn in Canvas2D from roles; neutral copy; no brand |
| `motion/attention-hop/brick.js` | `demos/effects/icon-performance-moves/AttentionBounce.tsx` | see the file header |
| `motion/axis-rescale/brick.js` | `demos/data/chart-live-moves/AxisRescaleShockV2.tsx` | see the file header |
| `motion/brace-open/brick.js` | `demos/typography/brace-expand/BraceExpand.tsx` | see the file header |
| `motion/card-conjure/brick.js` | `demos/opening/magician-card-flourish/MagicianCardFlourish.tsx` | see the file header |
| `motion/card-portal/brick.js` | `demos/transition/shot-transitions/PortalWipeV2.tsx` | see the file header |
| `motion/chapter-push/brick.js` | `demos/transition/bottom-push-stack-wipe/BottomPushStackWipe.tsx` | see the file header |
| `motion/clone-echo/brick.js` | `demos/ui-entrance/cloner-depth-echo/ClonerDepthEcho.tsx` | see the file header |
| `motion/crop-cuts/brick.js` | `demos/rhythm/rhythm-interrupt-moves/JumpCutPunchIn.tsx`, `demos/rhythm/beat-cut-moves/PaparazziFlash.tsx` | see the file header |
| `motion/cursor-glide/brick.js` | `demos/interaction/segmented-thumb-hero/SegmentedThumbHero.tsx`, `demos/interaction/canvas-materialize-moves/PanelToCanvasMaterialize.tsx` | see the file header |
| `motion/dial-sweep/brick.js` | `demos/typography/countdown-arc-scatter/CountdownArcScatter.tsx` | see the file header |
| `motion/digit-roll/brick.js` | `assets/lib/DigitRoll.tsx` | see the file header |
| `motion/explode-z/brick.js` | `demos/camera/space-camera-moves/ExplodedView.tsx` | see the file header |
| `motion/float-land/brick.js` | `demos/camera/graze-face-tour/GrazeFaceTour.tsx`, `demos/ui-entrance/element-body-moves/ContactShadowLift.tsx` | see the file header |
| `motion/frame-snap/brick.js` | `demos/effects/brand-frame-snap/BrandFrameSnap.tsx` | see the file header |
| `motion/glitch-tear/brick.js` | `demos/transition/tear-streak-transitions/GlitchDisplace.tsx` | see the file header |
| `motion/gradient-drift/brick.js` | `demos/transition/gradient-transition/GradientTransition.tsx` | see the file header |
| `motion/grain-condense/brick.js` | `demos/outro/grain-dissolve/GrainDissolve.tsx` | see the file header |
| `motion/ground-flip/brick.js` | `demos/effects/aurora-bloom-bg-flip/AuroraBloomBgFlip.tsx` | see the file header |
| `motion/impact-frame/brick.js` | `demos/effects/impact-feedback/AnimeImpact.tsx` | see the file header |
| `motion/isolate/brick.js` | `demos/camera/tension-camera-moves/PullBackIsolation.tsx` | see the file header |
| `motion/lamp-reveal/brick.js` | `demos/effects/light-play-moves/SpotlightSweepReveal.tsx`, `demos/effects/spotlight-sweep-moves/CornerSpotlightReveal.tsx`, `demos/effects/spotlight-sweep-moves/GlowWakeSleepPanel.tsx`, `demos/effects/spotlight-sweep-moves/SlideSpotlightPan.tsx` | see the file header |
| `motion/layout-morph/brick.js` | `demos/transition/mosaic-reframe/MosaicReframe.tsx` | see the file header |
| `motion/lead-word/brick.js` | `demos/typography/lead-word-zoom-assemble/LeadWordZoomAssemble.tsx` | see the file header |
| `motion/light-leak/brick.js` | `demos/transition/transition-hidden-cut/LightLeakBurn.tsx` | see the file header |
| `motion/line-carry/brick.js` | `demos/transition/line-carry-transition/LineCarryTransition.tsx` | see the file header |
| `motion/live-trace/brick.js` | `demos/data/chart-live-moves/OscilloscopeStreamV2.tsx` | see the file header |
| `motion/marker-stroke/brick.js` | `demos/typography/marker-underline-title/MarkerUnderlineTitle.tsx`, `demos/typography/typewriter-moves/TypewriterErrorRetype.tsx`, `demos/typography/paper-title-card/PaperTitleCard.tsx` | see the file header |
| `motion/needle-sweep/brick.js` | `demos/data/gauge-readout-moves/NeedleSweepSelftest.tsx` | see the file header |
| `motion/on-threes/brick.js` | `demos/rhythm/sakuga-timing-shift/SakugaTimingShift.tsx` | see the file header |
| `motion/outline-trace/brick.js` | `demos/ui-entrance/draw-svg-trace/DrawSvgTrace.tsx`, `demos/ui-entrance/wall-reveal-moves/BentoLightUp.tsx`, `demos/ui-entrance/neon-frame-forerun/NeonFrameForerun.tsx` | see the file header |
| `motion/outline-write/brick.js` | `demos/opening/letterspace-materialize/LetterspaceMaterialize.tsx` | see the file header |
| `motion/panel-carve/brick.js` | `demos/rhythm/panel-grid-moves/ComicPanelSplit.tsx` | see the file header |
| `motion/path-flow/brick.js` | `demos/ui-entrance/bezier-source-converge-merge/BezierSourceConvergeMerge.tsx`, `demos/ui-entrance/integration-hub-map/IntegrationHubMap.tsx` | see the file header |
| `motion/perspective-fling/brick.js` | `demos/effects/slam-entrance-moves/KanadaPerspectiveSnap.tsx` | see the file header |
| `motion/perspective-glide/brick.js` | `demos/camera/steep-tilt-glide/SteepTiltGlide.tsx` | see the file header |
| `motion/picker-snap/brick.js` | `demos/interaction/picker-carousel-feature-cycle/PickerCarouselFeatureCycle.tsx` | see the file header |
| `motion/plate-slip/brick.js` | `demos/effects/riso-print-hits/RisoMisregistrationHit.tsx` | see the file header |
| `motion/pose-fly/brick.js` | `demos/camera/basic-3d-scene/Basic3DScene.tsx` | see the file header |
| `motion/reticle-lock/brick.js` | `demos/effects/fui-hud-moves/ReticleLockOn.tsx`, `demos/data/scroll-brake-moves/BrakeReticleLock.tsx` | see the file header |
| `motion/row-to-card/brick.js` | `demos/interaction/canvas-materialize-moves/PanelToCanvasMaterialize.tsx` | see the file header |
| `motion/scan-line/brick.js` | `demos/effects/scan-bracket-sweep/ScanBracketSweep.tsx`, `demos/effects/scanline-annotate-focus/ScanlineAnnotateFocus.tsx`, `demos/effects/scanline-assemble-flyin/ScanlineAssembleFlyin.tsx`, `demos/ui-entrance/wall-reveal-moves/WireframeDrawOn.tsx` | see the file header |
| `motion/segment-reveal/brick.js` | `demos/opening/stroke-segment-build/StrokeSegmentBuild.tsx` | see the file header |
| `motion/shard-gather/brick.js` | `demos/opening/fracture/Fracture.tsx` | see the file header |
| `motion/sheen-sweep/brick.js` | `demos/effects/light-play-moves/SheenSweepRetry.tsx` | see the file header |
| `motion/slam-drop/brick.js` | `demos/effects/slam-entrance-moves/ScoreSlam.tsx`, `demos/effects/slam-entrance-moves/ImpactBurstKit.tsx`, `demos/effects/impact-feedback/HitCounter.tsx` | see the file header |
| `motion/stagger-in/brick.js` | `demos/ui-entrance/list-reveal/ListReveal.tsx`, `demos/ui-entrance/value-stagger-gradient/ValueStaggerGradient.tsx`, `demos/ui-entrance/radial-wave/RadialWave.tsx` | see the file header |
| `motion/tape-run/brick.js` | `demos/data/gauge-readout-moves/TapeScrollFixedPointer.tsx` | see the file header |
| `motion/theme-reveal/brick.js` | `demos/interaction/theme-switch-moves/PaletteThemeRipple.tsx`, `demos/interaction/theme-switch-moves/ThemeSweepToggle.tsx` | see the file header |
| `motion/tilt-camera/brick.js` | `demos/camera/overhead-camera-moves/TiltReveal.tsx`, `demos/camera/overhead-camera-moves/OverheadTabletopDrop.tsx`, `demos/camera/space-camera-moves/DroneDiveLanding.tsx` | see the file header |
| `motion/time-freeze/brick.js` | `demos/camera/tension-camera-moves/BulletTimeFreezeOrbit.tsx`, `demos/effects/impact-feedback/HitCounter.tsx` | see the file header |
| `motion/title-demote/brick.js` | `demos/typography/title-demote-to-label/TitleDemoteToLabel.tsx` | see the file header |
| `motion/tumble-stair/brick.js` | `demos/transition/card-flock-tumble/CardFlockTumble.tsx` | see the file header |
| `motion/type-enter/brick.js` | `demos/typography/blur-slide/BlurSlide.tsx`, `demos/typography/type-assembly-moves/SplitTextStagger.tsx`, `demos/typography/paper-title-card/PaperTitleCard.tsx`, `demos/typography/type-assembly-moves/LetterformDriftAssembly.tsx`, `demos/typography/type-entrance-moves/LetterDropPhysics.tsx`, `demos/typography/type-assembly-moves/TextOnPath.tsx`, `demos/effects/assemble-then-type-flyin/AssembleThenTypeFlyin.tsx` | see the file header |
| `motion/type-retype/brick.js` | `demos/typography/typewriter-moves/TypewriterErrorRetype.tsx` | see the file header |
| `motion/type-sync/brick.js` | `demos/typography/type-rhythm-sync/KaraokeFillSync.tsx`, `demos/typography/type-rhythm-sync/FontWeightPump.tsx` | see the file header |
| `motion/unit-regroup/brick.js` | `demos/data/chart-live-moves/UnitDotSwarmRegroupV2.tsx` | see the file header |
| `motion/word-ignite/brick.js` | `demos/typography/gradient-word-sweep/GradientWordSweep.tsx`, `demos/typography/outline-word-fill/OutlineWordFill.tsx` | see the file header |
| `motion/word-to-chip/brick.js` | `demos/interaction/hashtag-to-pill-materialize/HashtagToPillMaterialize.tsx` | see the file header |
| `motion/write-on/brick.js` | `demos/ui-entrance/document-typewriter-reveal/DocumentTypewriterReveal.tsx` | see the file header |
| `scene/beat-list/brick.js` | `demos/rhythm/beat-step-list-theme-cycle/BeatStepListThemeCycle.tsx` | see the file header |
| `scene/bento-wall/brick.js` | `demos/ui-entrance/wall-reveal-moves/BentoLightUp.tsx` | see the file header |
| `scene/blueprint-build/brick.js` | `demos/effects/scanline-assemble-flyin/ScanlineAssembleFlyin.tsx`, `demos/effects/assemble-then-type-flyin/AssembleThenTypeFlyin.tsx` | see the file header |
| `scene/card-pile/brick.js` | `demos/ui-entrance/card-stack/CardStack.tsx`, `demos/ui-entrance/research-card-stack-scroll/ResearchCardStackScroll.tsx` | see the file header |
| `scene/chip-select/brick.js` | `demos/interaction/chip-grid-single-select-blackout/ChipGridSingleSelectBlackout.tsx` | see the file header |
| `scene/combo-hits/brick.js` | `demos/effects/impact-feedback/HitCounter.tsx` | see the file header |
| `scene/crane-reveal/brick.js` | `demos/opening/crane-rise-reveal/CraneRiseReveal.tsx` | see the file header |
| `scene/cursor-crowd/brick.js` | `demos/interaction/collab-cursor-moves/CursorCastEnsemble.tsx` | see the file header |
| `scene/cursor-tour/brick.js` | `demos/camera/cursor-flyover/CursorFlyover.tsx` | see the file header |
| `scene/deck-deal/brick.js` | `demos/ui-entrance/deck-deal-flyin/DeckDealFlyin.tsx` | see the file header |
| `scene/doc-findings/brick.js` | `demos/ui-entrance/doc-park-left-pill-deal/DocParkLeftPillDeal.tsx` | see the file header |
| `scene/emblem-relay/brick.js` | `demos/typography/word-relay-geometry/WordRelayGeometry.tsx` | see the file header |
| `scene/evidence-relay/brick.js` | `demos/typography/word-relay-filmstrip/WordRelayFilmstrip.tsx` | see the file header |
| `scene/field-fill/brick.js` | `demos/ui-entrance/product-card-progressive-assemble/ProductCardProgressiveAssemble.tsx` | see the file header |
| `scene/flip-row/brick.js` | `demos/transition/card-flip-reveal/CardFlipReveal.tsx` | see the file header |
| `scene/flock-finale/brick.js` | `demos/transition/card-flock-tumble/CardFlockTumble.tsx` | see the file header |
| `scene/flow-landscape/brick.js` | `demos/opening/dataviz-landscape-open/DatavizLandscapeOpen.tsx` | see the file header |
| `scene/frame-forerun/brick.js` | `demos/ui-entrance/neon-frame-forerun/NeonFrameForerun.tsx`, `demos/ui-entrance/neon-frame-orbit-drop/NeonFrameForerunOrbit.tsx` | see the file header |
| `scene/gallery-reframe/brick.js` | `demos/transition/mosaic-reframe/MosaicReframe.tsx` | see the file header |
| `scene/graze-tour/brick.js` | `demos/camera/graze-face-tour/GrazeFaceTour.tsx` | see the file header |
| `scene/group-photo/brick.js` | `demos/outro/outro-group-photo-launch/OutroGroupPhotoLaunch.tsx` | see the file header |
| `scene/hero-spotlight/brick.js` | `demos/opening/spotlight-hero-card/SpotlightHeroCard.tsx` | see the file header |
| `scene/hub-links/brick.js` | `demos/ui-entrance/bezier-source-converge-merge/BezierSourceConvergeMerge.tsx`, `demos/ui-entrance/integration-hub-map/IntegrationHubMap.tsx` | see the file header |
| `scene/icon-field/brick.js` | `demos/opening/icon-field-colorize/IconFieldColorize.tsx` | see the file header |
| `scene/list-fill/brick.js` | `demos/ui-entrance/list-stack-press/ListStackPress.tsx`, `demos/ui-entrance/row-embed/RowEmbed.tsx` | see the file header |
| `scene/mark-lockup/brick.js` | `demos/outro/logo-shrink-wordmark-lockup/LogoShrinkWordmarkLockup.tsx`, `demos/outro/ui-to-brand-morph/IconFlipBloomLogo.tsx`, `demos/outro/ui-to-brand-morph/InputMorphsIntoLogo.tsx` | see the file header |
| `scene/milestone-run/brick.js` | `demos/data/timeline-travel/TimelineTravel.tsx` | see the file header |
| `scene/name-stamp/brick.js` | `demos/typography/brand-ink-open/BrandInkOpen.tsx` | see the file header |
| `scene/neon-marquee/brick.js` | `demos/outro/neon-triple-marquee/NeonTripleMarquee.tsx` | see the file header |
| `scene/orbit-title/brick.js` | `demos/opening/orbit-ring-title-open/OrbitRingTitleOpen.tsx` | see the file header |
| `scene/param-dial/brick.js` | `demos/interaction/autolayout-gap-dial/AutolayoutGapDial.tsx` | see the file header |
| `scene/phone-hero/brick.js` | `demos/effects/radial-ripple-phone-chips/RadialRipplePhoneChips.tsx` | see the file header |
| `scene/pill-dictate/brick.js` | `demos/interaction/glass-pill-dictation-typing/GlassPillDictationTyping.tsx` | see the file header |
| `scene/quad-montage/brick.js` | `demos/rhythm/quad-split-parallel-scenes/QuadSplitParallelScenes.tsx` | see the file header |
| `scene/ring-gallery/brick.js` | `demos/ui-entrance/carousel-3d/Carousel3D.tsx` | see the file header |
| `scene/scan-read/brick.js` | `demos/effects/scanline-annotate-focus/ScanlineAnnotateFocus.tsx` | see the file header |
| `scene/scroll-wall/brick.js` | `demos/ui-entrance/page-waterfall-wall/PageWaterfallWall.tsx` | see the file header |
| `scene/slot-sentence/brick.js` | `demos/typography/pill-slot-cycle/PillSlotCycle.tsx`, `demos/typography/pill-chip-slot-cycle-handled/PillChipSlotCycleHandled.tsx`, `demos/typography/vertical-word-roll-blur-cycle/VerticalWordRollBlurCycle.tsx`, `demos/typography/text-column-converge/TextColumnConverge.tsx`, `demos/ui-entrance/avatar-bracket-carousel/AvatarBracketCarousel.tsx` | see the file header |
| `scene/space-steps/brick.js` | `demos/camera/basic-3d-scene/Basic3DScene.tsx` | see the file header |
| `scene/strip-away/brick.js` | `demos/outro/ui-strip-away-outro/UiStripAwayOutro.tsx` | see the file header |
| `scene/terminal-stations/brick.js` | `demos/camera/terminal-3d/Terminal3D.tsx` | see the file header |
| `scene/three-angles/brick.js` | `demos/rhythm/panel-grid-moves/ComicPanelSplit.tsx` | see the file header |
| `scene/tree-cascade/brick.js` | `demos/interaction/canvas-materialize-moves/DiagramCascadeBuild.tsx` | see the file header |
| `scene/type-filter/brick.js` | `demos/interaction/type-and-filter/TypeAndFilter.tsx` | see the file header |
| `scene/versus/brick.js` | `demos/transition/transition-hidden-cut/VersusSlam.tsx` | see the file header |
| `scene/voice-listen/brick.js` | `demos/interaction/voice-waveform-live/VoiceWaveformLive.tsx` | see the file header |
| `scene/word-tunnel/brick.js` | `demos/typography/flying-words/FlyingWords.tsx` | see the file header |
| `scene/word-window/brick.js` | `demos/opening/text-as-mask/TextAsMask.tsx` | see the file header |
| `prop/choice-chip/brick.js` | `demos/interaction/chip-grid-single-select-blackout/ChipGridSingleSelectBlackout.tsx`, `demos/interaction/hashtag-to-pill-materialize/HashtagToPillMaterialize.tsx` | see the file header |
| `prop/cursor/brick.js` | `demos/interaction/segmented-thumb-hero/SegmentedThumbHero.tsx`, `demos/interaction/collab-cursor-moves/CursorCastEnsemble.tsx`, `demos/interaction/type-and-filter/TypeAndFilter.tsx` | see the file header |
| `prop/doc-page/brick.js` | `demos/ui-entrance/doc-park-left-pill-deal/DocParkLeftPillDeal.tsx` | see the file header |
| `prop/input-field/brick.js` | `demos/interaction/glass-pill-dictation-typing/GlassPillDictationTyping.tsx`, `demos/interaction/theme-switch-moves/PaletteThemeRipple.tsx`, `demos/interaction/type-and-filter/TypeAndFilter.tsx`, `demos/interaction/canvas-materialize-moves/DiagramCascadeBuild.tsx` | see the file header |
| `prop/mode-switch/brick.js` | `demos/interaction/segmented-thumb-hero/SegmentedThumbHero.tsx`, `demos/interaction/theme-switch-moves/ThemeSweepToggle.tsx` | see the file header |
| `prop/terminal-window/brick.js` | `demos/camera/terminal-3d/Terminal3D.tsx` | see the file header |
| `prop/tile-card/brick.js` | `demos/ui-entrance/card-stack/CardStack.tsx`, `demos/ui-entrance/carousel-3d/Carousel3D.tsx` | see the file header |
| `look/afterglow/brick.js` | `demos/effects/glow-flyline-moves/GlowOrbAmbient.tsx`, `demos/effects/radial-ripple-phone-chips/RadialRipplePhoneChips.tsx`, `demos/effects/aurora-bloom-bg-flip/AuroraBloomBgFlip.tsx`, `demos/effects/glow-flyline-moves/OrbFlylineRelay.tsx` | see the file header |
| `arc/cold-open/brick.js` | `demos/rhythm/trailer-grammar-moves/TrailerBumper.tsx` | see the file header |
| `../handoffs/camera-truck.js` | idea from `demos/data/timeline-travel/TimelineTravel.tsx` | see the file header (a variant of Filmsmith's own module) |
| `../handoffs/counter-portal.js` | idea from `demos/transition/transition-travel/LetterformZoom.tsx` | see the file header (a variant of Filmsmith's own module) |
| `../handoffs/device-flip.js` | idea from `demos/transition/card-flip-reveal/CardFlipReveal.tsx` | see the file header (a variant of Filmsmith's own module) |
| `../handoffs/diff-slider.js` | idea from `demos/data/before-after-slider-scrub/BeforeAfterSliderScrub.tsx` | see the file header (a variant of Filmsmith's own module) |
| `../transitions/ink.js` | idea from `demos/transition/print-texture-transitions/InkBleedReveal.tsx`, `demos/transition/circle-match-iris/CircleMatchIris.tsx` | see the file header (a variant of Filmsmith's own module) |
| `../handoffs/louvre.js` | idea from `demos/transition/wipe-transitions/BlindsSlice.tsx` | see the file header (a variant of Filmsmith's own module) |
| `../transitions/occluder-pass.js` | idea from `demos/transition/transition-hidden-cut/InvisibleCut.tsx` | see the file header (a variant of Filmsmith's own module) |
| `../handoffs/parallax-slide.js` | idea from `demos/camera/depth-layer-moves/MultiplaneReal.tsx` | see the file header (a variant of Filmsmith's own module) |
| `../handoffs/scramble-resolve.js` | idea from `demos/typography/glitch-cycle/GlitchCycle.tsx` | see the file header (a variant of Filmsmith's own module) |
| `../handoffs/split-open.js` | idea from `demos/transition/page-turn-transitions/BarnDoorSplit.tsx`, `demos/transition/transition-hidden-cut/VersusSlam.tsx` | see the file header (a variant of Filmsmith's own module) |
| `../handoffs/stream-brake.js` | idea from `demos/data/scroll-brake-moves/ChangelogScrollBrake.tsx`, `demos/data/scroll-brake-moves/BrakeReticleLock.tsx` | see the file header (a variant of Filmsmith's own module) |
| `../handoffs/tether-link.js` | idea from `demos/effects/glow-flyline-moves/FlylineArc.tsx` | see the file header (a variant of Filmsmith's own module) |
| `../handoffs/viewport-push.js` | idea from `demos/camera/crash-zoom-punch/CrashZoomReal.tsx`, `demos/camera/crash-zoom-punch/CrashImpactReal.tsx` | see the file header (a variant of Filmsmith's own module) |
| `../transitions/whip-push.js` | idea from `demos/transition/shot-transitions/WhipBrakeReal.tsx` | see the file header (a variant of Filmsmith's own module) |
| `../transitions/whiteout-slam.js` | idea from `demos/transition/white-flash-logo-simplify-cut/WhiteFlashLogoSimplifyCut.tsx` | see the file header (a variant of Filmsmith's own module) |
