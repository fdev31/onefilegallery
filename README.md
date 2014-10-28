# A (faked) single file HTML5 image gallery

Get [the file](./1ftn)

## Requirements

- Python3
- PIL / Imaging

### Also using

- Isotope
- jQuery

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
- drop jQuery
