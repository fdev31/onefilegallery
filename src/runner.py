#!/usr/bin/env python
from __future__ import print_function
import os
import sys

TMP='/tmp/'

class FatalError(SystemExit): pass

def progress_maker(cur, maxi):
    if cur == maxi:
        return ' Done!'
    return '%5.1f%%'%((cur*100.0/maxi))


def dontloadtwice(decorated):
    def _decorator(self, img=None, *args, **kw):
        if isinstance(img, str):
            if self.current_img_name != img:
                self.current_img_name = img
                img = self.current_img = self._load(img)
            else:
                img = self.current_img
        img = decorated(self, img or self.current_img, *args, **kw )
        return img
    return _decorator


class BaseImageHandler:

    MAX_SZ = 200 # pixels

    _rot_map = {
            6: 270,
            8: 90,
            1: 0,
        }

    def __init__(self):
        self.current_img_name = ''

    @dontloadtwice
    def get_rotation(self, img):
        r = self._exif_rot(img)
        if r:
            return self._rot_map[r]
        return 0

class JpegTranHandler(BaseImageHandler):

    _rot_map = {
            6: 270,
            8: -90,
            1: 0,
        }

    def _load(self, img):
        return jpegtran.JPEGImage( img )

    def _exif_rot(self, img):
        return img.exif_orientation

    @dontloadtwice
    def minify(self, img, size=None):
        w, h = img.width, img.height
        size = size or self.MAX_SZ
        if w > h:
            aspect = h/w
            nw = size
            nh = int(aspect * size)
        else:
            aspect = w/h
            nh = size
            wh = int(aspect * size)
        img = img.downscale(nw, nh)
        return img

    @dontloadtwice
    def save(self, img, path, quality):
        return img.save(path)

    @dontloadtwice
    def rotate(self, img, angle):
        if angle:
            return img.rotate(angle)
        return img


class PILHandler(BaseImageHandler):
    def _load(self, img):
        return Image.open( img )

    def _exif_rot(self, img):
        e = img._getexif()
        if e and 274 in e:
            return e[274]

    @dontloadtwice
    def rotate(self, img, angle):
        if angle:
            return img.rotate(angle)
        return img


    @dontloadtwice
    def minify(self, img, size=None):
        sz = size or self.MAX_SZ
        imgcopy = img
#        imgcopy = img.copy() # XXX: commenting this is a bug that is a speed boost
        imgcopy.thumbnail( (sz, sz), Image.ANTIALIAS )
        return imgcopy

    @dontloadtwice
    def save(self,img , path, quality):
        img = img.save( path, quality=quality, progressive=True, optimize=True)
        return img

try:
    import jpegtran
    ImageHandler = JpegTranHandler
except:
    from PIL import Image
    ImageHandler = PILHandler

class ImageList:

    filenames = []
    infos = []

    def __init__(self, path, overwrite=False):
        files = [fname for fname in os.listdir(path) if fname.rsplit('.')[-1].lower() in ('jpg', 'jpeg')]
        files.sort()
        filenames = []
        infos = []
        for i, name in enumerate(files):
            print('\r' + progress_maker(i, len(files)), end='')
            fullpath = os.path.join(path, name)
            filenames.append(fullpath)
            infos.append(dict(t='tn/'+name, f=name, s=os.stat(fullpath).st_size)) # more info to come ?
        print('\r' + progress_maker(len(files), len(files)), end='')
        self.filenames = filenames
        self.infos = infos
        self.overwrite = overwrite

    def __len__(self):
        return len(self.filenames)

    def make_thumbs(self, out, tn_size):
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
                rot = img_mgr.get_rotation( fullpath )
                src_img = img_mgr.minify( fullpath, tn_size)
                src_img = img_mgr.rotate( src_img, rot)
                img_mgr.save(src_img, t_tn_path, quality=60 )
        print('\r' + progress_maker(len(self.filenames), len(self.filenames)), end='')

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
        c = list(self.images.infos[0].keys())
        r = [list(i.values()) for i in self.images.infos]
        json.dump({'c': c, 'r': r, 'version': 1}, self.out.open_file(index))

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
            <div id="container">""")

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
    parser.add_argument('-t', '--thumb-size', metavar='SIZE', action='store', help='size of the generated thumbnails (give a maximum width or height in pixels, i.e: "200")', default=False)
    parser.add_argument('-q', '--quality', metavar='QUALITY', action='store', type=int, help='Output image quality in range [0-100]', default=90)
    args = parser.parse_args()

    if args.resize and not args.copy:
        args.copy = True

    print("Listing...")
    images  = ImageList(args.input, overwrite=args.overwrite)
    if len(images) == 0:
        print('\nError: No image found.')
        raise SystemExit(1)
    out = Output(args.output or args.input)
    if not os.path.exists(out.path):
        os.makedirs(out.path)
    print("\nWriting web page")
    w = HTMLWriter(images, out)
    w.write()
    w = JSONWriter(images, out)
    w.write()
    package_files = []
    if args.copy:
        noop = args.input == args.output
        img_mgr = ImageHandler()
        print("\nCopying...")
        sz = int(args.resize)
        for i, fname in enumerate(images.filenames):
            print('\r' + progress_maker(i, len(images.filenames)), end='')
            out_fname = os.path.join(out.path, os.path.basename(fname))
            package_files.append( out_fname )
            if noop or ( os.path.exists(out_fname) and not args.overwrite):
                continue
            rot = img_mgr.get_rotation(fname)
            if args.resize:
                src_img = img_mgr.minify( fname , sz )
                img_mgr.current_img = src_img
            src_img = img_mgr.rotate( fname, rot )
            img_mgr.save( src_img, out_fname, quality=args.quality)


    print("\nMaking thumbnails...")
    images.make_thumbs(out,args.thumb_size and int(args.thumb_size)) # TODO: re-use scaled+rotated images instead of originals

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

