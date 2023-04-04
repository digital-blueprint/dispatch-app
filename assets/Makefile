WHITE_SOURCE=dbp_logo_small_on_white.svg
BLACK_SOURCE=dbp_logo_small_on_black.svg

all: icon-192.png icon-512.png

icon-192.png: $(WHITE_SOURCE) $(BLACK_SOURCE)
	inkscape $(WHITE_SOURCE) --export-png $@ -w 192 -h 192
	inkscape $(BLACK_SOURCE) --export-png $@ -w 192 -h 192

icon-512.png: $(WHITE_SOURCE) $(BLACK_SOURCE)
	inkscape $(WHITE_SOURCE) --export-png $@ -w 512 -h 512
	inkscape $(BLACK_SOURCE) --export-png $@ -w 512 -h 512
