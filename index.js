'use strict';

var fs = require('fs');
var gm = require('gm');
var Q = require('q');

var spriteGenerator = function(options){
    this.options = options;
    this.filesArrayForSCSSFile = [];
}

spriteGenerator.prototype.start = function(){

    var self = this;

    this.getImages().then(function(files){
        self.files = files;
        self.firstSpriteImage(files[0]).then(function(sprite){
            self.filesArrayForSCSSFile.push(self.files[0]);
            self.addImageToSprite(sprite, 1).then(function(){

            });
        });
    });
}

spriteGenerator.prototype.addImageToSprite = function(sprite, id){
    var self = this;
    var deferred = Q.defer();

    if (typeof this.files[id] !== 'undefined'){
        gm(sprite)
          .append( this.options.imagesForSpritePath+self.files[id], true)
          .write( self.options.out + '/sprite'+id+'.png', function (err) {
                var sprite = self.options.out + '/sprite'+id+'.png';
                self.filesArrayForSCSSFile.push(self.files[id]);
                self.addImageToSprite(sprite, ++id);
                var lastId = id-2;
                fs.unlink(self.options.out + '/sprite'+lastId+'.png');
          });
    }else{
        gm(sprite)
            .resize(self.options.size[0]*self.files, self.options.size[1])
            .write(self.options.out +self.options.spriteImgName, function (err) {
                fs.unlink(sprite);

                var scss = '$icon-list: ('+self.filesArrayForSCSSFile.toString()+');'+
                    '$icon-width: '+self.options.size[0]+'px;'+
                    '$icon-height: '+self.options.size[1]+'px;'

                fs.writeFile(self.options.spriteCssPath, scss, function (err) {
                    if (err) throw err;
                    console.log('It\'s saved!');
                });
            });



        deferred.resolve(self.options.out +self.options.spriteImgName);
        return deferred.promise;
    }

    return deferred.promise;
}

spriteGenerator.prototype.getImages = function(){
  var deferred = Q.defer();
  var dir= this.options.imagesForSpritePath;

  fs.readdir(dir,function(err,files){
    deferred.resolve(files);
  });

  return deferred.promise;
}

spriteGenerator.prototype.firstSpriteImage = function(imageName){
    var deferred = Q.defer();
    var sprite = this.options.out + '/sprite0.png';

    gm(this.options.imagesForSpritePath + '/'+imageName)
        .write(sprite, function (err) {
           if (!err){
               deferred.resolve(sprite);
           }
        });

    return deferred.promise;
}



module.exports = spriteGenerator;
