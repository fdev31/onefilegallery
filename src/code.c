#include <stdio.h>
#include <string.h>

#include <libexif/exif-data.h>

/* gcc -std=c99 -W -Wall e.c -ggdb3 -lexif -fPIC -shared -o getex.so */

int get_rotation(char *filename) {
    ExifData *image;
    ExifEntry *info;
    char message[1024];

    image = exif_data_new_from_file( filename );
    info = exif_data_get_entry(image, EXIF_TAG_ORIENTATION);
    exif_entry_get_value(info, message, 1024);
    if( strcmp(message, "Left-bottom") == 0) return 90;
    return 0;
}

/*
   int main(int argc, char **argv) {

   for (int i=1; i<argc; i++) {
   printf("%s %d\n", argv[1], get_rotation(argv[1]));
   }
   return 0;
   }
   */
