# Hypergolic logo

`hypergolic-logo.png` is the project logo supplied on 14 September 2026, preserved
byte-for-byte. It is a 1254 × 1254 PNG with transparency; the dark surround visible
in some image viewers is not an opaque background in the file.

SHA-256: `16fcc05023863f81bbc74395fb039b59f9634fef0930f370541a979979b92448`.

The mark belongs in the minimal shell header, beside the focused napplet name. The
logo has no tap action in v1. Keep its square canvas and aspect ratio, and use the
original colours without cropping or adding a surrounding shape.

A static browser comparison at 24, 32 and 40 CSS pixels on warm-dark and white
surfaces was inspected. **32 logical pixels is the confirmed starting size**,
accepted on 14 September 2026 and subject to native header/device validation. The four-point silhouette remains recognisable, while fine glow
and texture recede at small sizes.

The original file is wired into the native shell header and first-entry screen.
The three derived 1024 × 1024 launcher assets in this directory preserve its
original colors and aspect ratio while satisfying platform packaging:

- `app-icon.png` is opaque on the shell's `#140f0b` background for iOS and
  legacy Android launchers. The original canvas was scaled to 800 pixels and
  centered with no crop or added mark.
- `app-icon-foreground.png` is transparent; the original canvas was scaled to
  620 pixels and centered so its visible pixels stay inside Android's adaptive
  launcher safe zone. Expo supplies the same dark color as the background layer.
- `app-icon-monochrome.png` uses the foreground's alpha as a white monochrome
  layer for themed Android launchers.

The original `hypergolic-logo.png` remains byte-identical to the supplied file.
`app.json` owns the platform icon configuration; Expo prebuild regenerates native
icon resources from these assets. No splash-screen design has been selected.

The native asset sizes follow [Expo's app icon configuration](https://docs.expo.dev/develop/user-interface/splash-screen-and-app-icon/),
[Apple's 1024-pixel icon guidance](https://developer.apple.com/design/human-interface-guidelines/app-icons),
and [Android's 66/108 adaptive safe zone](https://developer.android.com/develop/ui/compose/system/icon_design_adaptive).
