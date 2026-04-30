import colorsys

def hsl_to_rgb(h, s, l):
    return colorsys.hls_to_rgb(h/360, l/100, s/100)

def rgb_to_oklch(r, g, b):
    # Simplified conversion for estimation or use a library if available
    # But since I don't have a library, I'll use a standard formula
    # Reference: https://bottosson.github.io/posts/oklab/
    
    # Linearize RGB
    def lin(c):
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    
    rl, gl, bl = lin(r), lin(g), lin(b)
    
    # OKLab
    L = 0.4122214708 * rl + 0.5363325363 * gl + 0.0514459929 * bl
    a = 0.2119034982 * rl - 0.4510957146 * gl + 0.2391922164 * bl
    b_lab = 0.0883024619 * rl - 0.0544105167 * gl - 0.0338919452 * bl
    
    # OKLCH
    import math
    C = math.sqrt(a**2 + b_lab**2)
    h_rad = math.atan2(b_lab, a)
    h_deg = math.degrees(h_rad) % 360
    
    return L, C, h_deg

colors = {
    "latte_base": (220, 23.076923191547394, 94.90196108818054),
    "latte_text": (234, 16.022099554538727, 35.49019694328308),
    "latte_surface0": (223, 15.909090638160706, 82.74509906768799),
    "latte_surface1": (225, 13.55932205915451, 76.86274647712708),
    "latte_teal": (183, 73.86363744735718, 34.50980484485626),
    "latte_red": (347, 86.66666746139526, 44.11764740943909),
    "latte_blue": (220, 91.4893627166748, 53.921568393707275),
    "latte_yellow": (35, 76.98412537574768, 49.41176474094391),
    "latte_green": (109, 57.63546824455261, 39.803922176361084),
    "latte_orange": (22, 99, 52),
    
    "mocha_base": (240, 21.052631735801697, 14.901961386203766),
    "mocha_text": (226, 63.9344274997712, 88.03921341896057),
    "mocha_surface0": (237, 16.239316761493683, 22.94117659330368),
    "mocha_surface1": (234, 13.20754736661911, 31.176471710205078),
    "mocha_teal": (170, 57.35294222831726, 73.33333492279053),
    "mocha_red": (343, 81.25, 74.90196228027344),
    "mocha_blue": (217, 91.86992049217224, 75.88235139846802),
    "mocha_yellow": (41, 86.04651093482971, 83.13725590705872),
    "mocha_green": (115, 54.09836173057556, 76.07843279838562),
    "mocha_orange": (23, 92, 75)
}

for name, (h, s, l) in colors.items():
    r, g, b = hsl_to_rgb(h, s, l)
    L, C, h_ok = rgb_to_oklch(r, g, b)
    print(f"{name}: oklch({L:.3f} {C:.3f} {h_ok:.3f})")
