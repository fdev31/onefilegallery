# A (faked) single file HTML5 image gallery

* Test the [quick demo](http://devaux.fabien.free.fr/gal/) (code: "demo1")
* Get [the file](./1ftn) (or [here](https://raw.githubusercontent.com/fdev31/onefilegallery/master/1ftn), save with ".py" extension)


## Requirements

- Python3
- PIL (Imaging) or Pillow
- jpegtran (optional, may enable a faster, lossless rescaling)

### Also using

- Isotope

## Usage

    usage: 1ftn [-h] [-o FOLDER] [-f] [-c] [-s SIZE] [-q QUALITY] FOLDER

    Make HTML5 Photo gallery.

    positional arguments:
      FOLDER                folder with original images

    optional arguments:
      -h, --help            show this help message and exit
      -o FOLDER, --output FOLDER
                            destination folder
      -f, --overwrite       overwrite files
      -c, --copy            copy original images
      -s SIZE, --resize SIZE
                            resize original images when copying (give a maximum
                            width or height in pixels, i.e: "1280") -- Implies
                            "-c"
      -q QUALITY, --quality QUALITY
                            Output image quality in range [0-100] -- Unused without "-s"

The program takes a FOLDER containing all the images you want to make the gallery from.
Optionally specify another output (-o) folder and copy (-c) the images of the gallery eventually with a different size (-s).

- A *.tn/* folder will be created + .js file + zip file + an *index.html* html file used as failsafe. 
- The real gallery application is saved in the parent folder as *index.html* as well.

## Example

    foo% ./1ftn ~/Images/last_weekend -o /tmp/mygallery
    Listing...
     99.8%
    Making thumbnails...
     99.8%
    HTML

    JSON

    Zipping...
     99.8%
    405 files processed.

Now copy the */tmp/mygallery* folder and the */tmp/index.html* file to a webserver to enjoy your static HTML5 gallery.

You will be prompted for a password, it must match the folder name.

# Roadmap

- use same loop for thumbnails & copy (will run slightly faster)
