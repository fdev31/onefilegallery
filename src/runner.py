#!/usr/bin/env python
from __future__ import print_function
import os
import sys
import ctypes
from PIL import Image

TMP='/tmp/'

class ImageHandler:

    TN_SZ = (200, 200) # pixels

    def __init__(self):
        C="""{{{C_CODE}}}"""

        SO_FILE = TMP + 'getex.so'
        if not os.path.exists(SO_FILE):
            open(TMP+'e.c', 'w').write(C)
            os.system('gcc ' + TMP + 'e.c -std=c99 -W -Wall -lexif -fPIC -shared -o ' + SO_FILE)

        exif = ctypes.CDLL(SO_FILE)
        fn_sign = ctypes.CFUNCTYPE( ctypes.c_int, ctypes.c_char_p )

        self.fn = fn_sign(exif.get_rotation)
        self.current_img_name = ''

    def _get_image(self, filename):
        if not isinstance(filename, str):
            return filename
        if self.current_img_name != filename:
            self.current_img = Image.open( filename )
            self.current_img_name = filename
        return self.current_img


    def auto_rotate(self, filename):
        img = self._get_image(filename)
        r = self.get_rotation(filename)
        if r != 0:
            img = img.rotate(r)
        return img

    def get_rotation(self, filename):
        return self.fn(filename.encode('latin1'))

    def minify(self, filename, size=None):
        img = self._get_image(filename)
        img.thumbnail( size or self.TN_SZ, Image.ANTIALIAS )


class FatalError(SystemExit): pass

def progress_maker(cur, maxi):
    return '%5.1f%%'%((cur*100.0/maxi))

class ImageList:

    filenames = []
    infos = []

    def __init__(self, path, overwrite=False):
        files = [fname for fname in os.listdir(path) if fname.rsplit('.')[-1].lower() in ('jpg', 'png', 'jpeg')]
        filenames = []
        infos = []
        for i, name in enumerate(files):
            print('\r' + progress_maker(i, len(files)), end='')
            fullpath = os.path.join(path, name)
            filenames.append(fullpath)
            infos.append(dict(t='tn/'+name, f=name))
        self.filenames = filenames
        self.infos = infos
        self.overwrite = overwrite

    def __len__(self):
        return len(self.filenames)

    def make_thumbs(self, out):
        tn_path = os.path.join(out.path, 'tn')
        img_mgr = ImageHandler()
        if not os.path.isdir(tn_path):
            try:
                os.makedirs( tn_path )
            except OSError:
                print('%s must be a valid folder'%tn_path)
                raise FatalError()
        for i, fullpath in enumerate(self.filenames):
            print('\r' + progress_maker(i, len(self.filenames)), end='')
            name = os.path.basename(fullpath)
            t_tn_path = os.path.join( tn_path, name )
            if self.overwrite or not os.path.exists(t_tn_path):
                img_mgr.minify( fullpath )
                src_img = img_mgr.auto_rotate( fullpath )
                src_img.save( t_tn_path , quality=60, progressive=True, optimize=True)

class Output:
    path = None
    def __init__(self, path):
        self.path = path
    def open_file(self, name, mode='w'):
        return open(os.path.join(self.path, name), mode)

class Writer:
    def __init__(self, images, out):
        self.out = out
        self.images = images

class JSONWriter(Writer):
    def write(self, index='images.js'):
        import json
        json.dump(self.images.infos, self.out.open_file(index))

class HTMLWriter(Writer):

    def write(self, index='index.html'):
        tn_path = os.path.join(self.out.path, 'tn')
        fd = open(os.path.join(self.out.path, index), 'w')

        fd.write("""<!DOCTYPE HTML>
            <html>
            <head>
            <title>Gallery</title>
            </head>
            <body>
            <a href="package.zip">Download all files</a><br/>
            <div id="container">
        """)

        for i in self.images.infos:
            fd.write('<a href="%(f)s"><img src="%(t)s" /></a>\n'%i)

        fd.write("</div></body></html>")

INDEX = """{{{HTML_FILE}}}"""

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description='Make HTML5 Photo gallery.')
    parser.add_argument('input', metavar='FOLDER', type=str, help='folder with original images')
    parser.add_argument('-o', '--output', metavar='FOLDER', type=str, help='destination folder')
    parser.add_argument('-f', '--overwrite', action='store_true', help='overwrite files', default=False)
    parser.add_argument('-c', '--copy', action='store_true', help='copy original images', default=False)
    parser.add_argument('-s', '--resize', metavar='SIZE', action='store', help='resize original images when copying (give a maximum width or height in pixels, i.e: "1280") -- Implies "-c"', default=False)
    parser.add_argument('-q', '--quality', metavar='QUALITY', action='store', type=int, help='Output image quality in range [0-100] -- Useless with "-s"', default=90)
    args = parser.parse_args()

    if args.resize and not args.copy:
        args.copy = True

    print("Listing...")
    images  = ImageList(args.input, overwrite=args.overwrite)
    out = Output(args.output or args.input)
    print("\nMaking thumbnails...")
    images.make_thumbs(out)
    print("\nHTML")
    w = HTMLWriter(images, out)
    w.write()
    print("\nJSON")
    w = JSONWriter(images, out)
    w.write()
    package_files = []
    if args.copy:
        if args.resize:
            print("\nResizing...")
            img_mgr = ImageHandler()
            sz = (int(args.resize), int(args.resize))
            for i, fname in enumerate(images.filenames):
                print('\r' + progress_maker(i, len(images.filenames)), end='')
                p = os.path.join(out.path, os.path.basename(fname))
                package_files.append( p )
                if os.path.exists(p) and not args.overwrite:
                    continue
                img_mgr.minify( fname , sz )
                src_img = img_mgr.auto_rotate( fname )
                src_img.save( p , quality=args.quality, progressive=True, optimize=True)
        else:
            print("\nCopying...")
            for i, fname in enumerate(images.filenames):
                print('\r' + progress_maker(i, len(images.filenames)), end='')
                out_fname = os.path.join(out.path, os.path.basename(fname))
                open(out_fname, 'wb').write( open(fname, 'rb').read() )

    zfname = os.path.join(out.path, 'package.zip')

    if not os.path.exists(zfname) or args.overwrite:
        print("\nZipping...")
        import zipfile
        z = zipfile.ZipFile( zfname, 'w')
        for i, fname in enumerate(package_files or images.filenames):
            print('\r' + progress_maker(i, len(images.filenames)), end='')
            z.write( fname, os.path.basename(fname) )
        z.close()

    print("\n%d files processed."%len(images))
    open(os.path.join(out.path, os.path.pardir, 'index.html'), 'w').write(INDEX)

