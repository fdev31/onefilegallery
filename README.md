# A (faked) single file HTML5 image gallery

* Test the [quick demo](http://devaux.fabien.free.fr/gal/) (code: "demo1")
* Get [the file](./1ftn) (or [here](https://raw.githubusercontent.com/fdev31/onefilegallery/master/1ftn))
* Execute the file ! (`python 1ftn` or `chmod +x 1ftn` and then you can use `1ftn` directly)

## Features

- Generate simple & beautiful but **static** image galleries (no PHP, no CGI, ...)
- Auto-rotates pictures according to **EXIF** metadata
- Generates **thumbnails** for a faster display
- Configurable **slideshow**
- Images are **preloaded** for smoother slideshow
- **Protected**, you need to know a code to display the gallery
- No installation required, copy the **single file** on your disk and run
- Optionally resizes your images (e.g. scale down you digital camera pictures)
- Small ! (<50k uncompressed, ~15k GZipped)

## TODO

- Cutomizable image per page

## Requirements

- Python (2 or 3)
- PIL (Imaging) or Pillow
- [jpegtran](https://github.com/jbaiter/jpegtran-cffi) (optional, may enable a faster, lossless rescaling)

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

# Sharing

If you copied **index.html** and **mygallery** folder to some webserver (in the *prefix* folder), you can share two links:

    http://myserver.com/prefix/

or

    http://myserver.com/prefix/#code=mygallery


The first example will ask for the code while the second one won't.

# Customizing

1. Download [the code](../../archive/master.zip)
1. Edit the [default.theme](./default.theme) file
1. Type `make reskin` (you don't need any optional dependency to do this)
1.  Enjoy your new **1ftn** program ! If you'r unhappy, jump to step 2 !


# File hierarchy

    index.html <-- the main application
    mygallery/
             image1.jpg
             image2.jpg
             image3.jpg
             ...
             package.zip
             images.js
             .tn/
                 index.html <-- a failsafe page
                 image1.jpg
                 image2.jpg
                 image3.jpg
                 ...

# Roadmap

- use same loop for thumbnails & copy (will run slightly faster)

# Troubleshooting

## I can't compile it

If `make` fails, try changing a few lines in the *Makefile*:

    # uncomment to ease debug:
    jsmin=cat < $1 > $2

(remove the leading `# ` in the jsmin line)

## I can't run it

Install Imaging or Pillow (python package) in your distribution, example:

    yum install python-imaging # fedora
    pacman -Syu python-pillow # archlinux
    apt-get install imaging # debian / ubuntu

